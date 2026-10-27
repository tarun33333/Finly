import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface ExtractedUpiDetails {
  amount: number;
  currency: string;
  transactionType: 'expense' | 'income';
  category: string;
  merchant: string;
  description: string;
  transactionDate: string; // YYYY-MM-DD
  transactionTime?: string | null;
  paymentMethod: 'UPI' | 'Cash' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Other';
  paymentStatus: 'success' | 'pending' | 'failed' | 'reversed';
  referenceId?: string | null;
  confidence: number;
  needsReview: boolean;
  warnings: string[];
}

export interface ExtractedReceiptDetails {
  amount: number;
  currency: string;
  transactionType: 'expense' | 'income';
  category: string;
  merchant: string;
  description: string;
  transactionDate: string;
  paymentMethod: 'Cash' | 'UPI' | 'Debit Card' | 'Credit Card' | 'Other';
  items?: Array<{ name: string; quantity?: number; price?: number }>;
  tax?: number;
  confidence: number;
  needsReview: boolean;
  warnings: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    }
  }

  private fileToGenerativePart(filePath: string, mimeType: string) {
    return {
      inlineData: {
        data: fs.readFileSync(filePath).toString('base64'),
        mimeType,
      },
    };
  }

  /**
   * Extract UPI payment transaction information from a screenshot
   */
  async extractUpiScreenshot(
    filePath: string,
    mimeType: string
  ): Promise<ExtractedUpiDetails> {
    const today = new Date().toISOString().split('T')[0];

    // If Gemini API is not configured, return safe fallback requiring review
    if (!this.genAI || !env.GEMINI_API_KEY) {
      logger.warn('Gemini API key is not configured. Returning manual review fallback.');
      return {
        amount: 0,
        currency: 'INR',
        transactionType: 'expense',
        category: 'Other',
        merchant: 'Unknown Merchant',
        description: 'UPI Transaction (Manual Review)',
        transactionDate: today,
        transactionTime: null,
        paymentMethod: 'UPI',
        paymentStatus: 'success',
        referenceId: null,
        confidence: 0.2,
        needsReview: true,
        warnings: ['Gemini API key is not configured on the backend. Please verify details manually.'],
      };
    }

    const modelNamesToTry = [env.GEMINI_MODEL, 'gemini-3.6-flash', 'gemini-flash-latest'].filter(
      (m, idx, arr) => m && arr.indexOf(m) === idx
    );

    let lastError: any = null;
    for (const modelName of modelNamesToTry) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const prompt = `
You are an expert Indian UPI payment receipt analyzer for Finly personal finance tracker.
Analyze this payment confirmation screenshot (from Google Pay, PhonePe, Paytm, BHIM, CRED, or bank UPI).
Extract the transaction details accurately.

Return ONLY a valid JSON object matching this exact structure:
{
  "amount": 250.00,
  "currency": "INR",
  "transactionType": "expense" or "income",
  "category": "Food & Dining" (or one of: Groceries, Transportation, Fuel, Shopping, Bills & Utilities, Rent & Housing, Healthcare, Education, Entertainment, Travel, Subscriptions, Personal Care, Investments, Other, Salary, Freelancing),
  "merchant": "Recipient or Merchant Name or Person Name",
  "description": "Short summary, e.g. Payment to Tea Point",
  "transactionDate": "YYYY-MM-DD",
  "transactionTime": "HH:MM" or null,
  "paymentMethod": "UPI",
  "paymentStatus": "success" or "pending" or "failed" or "reversed",
  "referenceId": "UPI Ref No / UTR / Transaction ID or null",
  "confidence": number between 0.0 and 1.0,
  "needsReview": boolean,
  "warnings": ["array of warning strings if any field is unclear or missing"]
}

Important rules:
1. In India, payments sent to someone are 'expense'. Payments received (green 'received' or '+₹') are 'income'.
2. If payment failed or is pending, set paymentStatus accordingly and add a warning.
3. If the date is not clear, use today's date "${today}" and add a warning.
4. If amount contains '₹', remove the symbol and return clean number.
`;

        const imagePart = this.fileToGenerativePart(filePath, mimeType);
        const result = await model.generateContent([prompt, imagePart]);
        let responseText = result.response.text().trim();

        // Strip Markdown code fencing if present
        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
        }

        const parsed: ExtractedUpiDetails = JSON.parse(responseText);
        // Clean and validate
        parsed.amount = Number(parsed.amount) || 0;
        parsed.currency = parsed.currency || 'INR';
        parsed.paymentMethod = 'UPI';
        parsed.transactionType = parsed.transactionType === 'income' ? 'income' : 'expense';
        parsed.transactionDate = parsed.transactionDate || today;
        parsed.warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];

        if (parsed.amount <= 0) {
          parsed.needsReview = true;
          parsed.warnings.push('Could not confidently detect payment amount.');
        }

        return parsed;
      } catch (error: any) {
        lastError = error;
        logger.warn({ model: modelName, error: error.message }, 'Gemini model attempt failed, trying next fallback');
      }
    }

    logger.error({ error: lastError?.message }, 'All Gemini UPI extraction attempts failed');
    return {
      amount: 0,
      currency: 'INR',
      transactionType: 'expense',
      category: 'Other',
      merchant: '',
      description: 'UPI Payment',
      transactionDate: today,
      paymentMethod: 'UPI',
      paymentStatus: 'success',
      referenceId: null,
      confidence: 0.1,
      needsReview: true,
      warnings: ['AI extraction failed. Please enter transaction details manually.'],
    };
  }

  /**
   * Extract physical receipt or bill details
   */
  async extractReceipt(
    filePath: string,
    mimeType: string
  ): Promise<ExtractedReceiptDetails> {
    const today = new Date().toISOString().split('T')[0];

    if (!this.genAI || !env.GEMINI_API_KEY) {
      return {
        amount: 0,
        currency: 'INR',
        transactionType: 'expense',
        category: 'Food & Dining',
        merchant: '',
        description: 'Receipt bill',
        transactionDate: today,
        paymentMethod: 'Cash',
        confidence: 0.2,
        needsReview: true,
        warnings: ['Gemini API key is not configured. Please enter details manually.'],
      };
    }

    const modelNamesToTry = [env.GEMINI_MODEL, 'gemini-3.6-flash', 'gemini-flash-latest'].filter(
      (m, idx, arr) => m && arr.indexOf(m) === idx
    );

    let lastError: any = null;
    for (const modelName of modelNamesToTry) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const prompt = `
Analyze this physical receipt or bill for Finly personal finance tracker.
Extract total amount, merchant/store name, date, items, tax, and category.

Return ONLY a valid JSON object matching:
{
  "amount": 480.00,
  "currency": "INR",
  "transactionType": "expense",
  "category": "Food & Dining" (or Groceries, Shopping, Healthcare, etc.),
  "merchant": "Store or Restaurant name",
  "description": "Short bill description",
  "transactionDate": "YYYY-MM-DD",
  "paymentMethod": "Cash" (or "UPI", "Debit Card", "Credit Card"),
  "items": [{"name": "Item Name", "quantity": 1, "price": 100}],
  "tax": 24.00,
  "confidence": 0.85,
  "needsReview": boolean,
  "warnings": []
}
`;

        const imagePart = this.fileToGenerativePart(filePath, mimeType);
        const result = await model.generateContent([prompt, imagePart]);
        let responseText = result.response.text().trim();

        if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
        }

        const parsed: ExtractedReceiptDetails = JSON.parse(responseText);
        parsed.amount = Number(parsed.amount) || 0;
        parsed.currency = parsed.currency || 'INR';
        parsed.transactionType = 'expense';
        parsed.transactionDate = parsed.transactionDate || today;
        parsed.warnings = Array.isArray(parsed.warnings) ? parsed.warnings : [];

        return parsed;
      } catch (error: any) {
        lastError = error;
        logger.warn({ model: modelName, error: error.message }, 'Gemini receipt model attempt failed, trying fallback');
      }
    }

    logger.error({ error: lastError?.message }, 'All Gemini receipt extraction attempts failed');
    return {
      amount: 0,
      currency: 'INR',
      transactionType: 'expense',
      category: 'Other',
      merchant: '',
      description: 'Bill / Receipt',
      transactionDate: today,
      paymentMethod: 'Cash',
      confidence: 0.1,
      needsReview: true,
      warnings: ['Receipt reading failed. Please verify details manually.'],
    };
  }

  /**
   * Generate contextual financial explanations using Gemini based on grounded deterministic figures
   */
  async generateInsightExplanation(
    metricType: string,
    data: Record<string, any>
  ): Promise<{ title: string; explanation: string; estimatedSaving?: number }> {
    if (!this.genAI || !env.GEMINI_API_KEY) {
      // Deterministic rule-based template
      if (metricType === 'spending_increase') {
        return {
          title: `${data.categoryName} spending increased`,
          explanation: `You spent ₹${data.difference} more on ${data.categoryName} this month compared to last month. Consider setting a weekly budget to keep it in check.`,
          estimatedSaving: Math.round(data.difference * 0.5),
        };
      }
      return {
        title: 'Spending Pattern Review',
        explanation: 'Review your recent transactions to identify potential areas where you can cut back.',
        estimatedSaving: 500,
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const prompt = `
You are Finly's friendly personal finance assistant for an Indian user.
Contextualize these calculated financial metrics:
Metric Type: ${metricType}
Data: ${JSON.stringify(data)}

Generate a friendly, nonjudgmental, empowering tip or insight.
DO NOT invent or alter the numbers. All values are in INR (₹).

Return ONLY valid JSON:
{
  "title": "Short punchy title (max 6 words)",
  "explanation": "Clear 2-sentence explanation with realistic actionable suggestion",
  "estimatedSaving": number or null
}
`;

      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch {
      return {
        title: 'Smart Spending Tip',
        explanation: `Keep an eye on your discretionary spending this week to stay within your monthly target.`,
        estimatedSaving: 300,
      };
    }
  }
}

export const geminiService = new GeminiService();

