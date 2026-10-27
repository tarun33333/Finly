export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Finly API Documentation',
    version: '1.0.0',
    description: 'REST API for Finly AI Personal Finance Tracker — Every Rupee Counts.',
    contact: {
      name: 'Finly Engineering Team',
      email: 'support@finly.app',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check endpoint',
        responses: { 200: { description: 'Application status and database connectivity' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: { 201: { description: 'User registered' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'User authenticated' } },
      },
    },
    '/auth/google': {
      post: {
        summary: 'Login or signup via Google ID token',
        responses: { 200: { description: 'User authenticated' } },
      },
    },
    '/transactions': {
      get: {
        summary: 'Get paginated transactions with filters',
        responses: { 200: { description: 'List of transactions' } },
      },
      post: {
        summary: 'Create a transaction',
        responses: { 201: { description: 'Transaction created' } },
      },
    },
    '/transactions/summary': {
      get: {
        summary: 'Get income, expense, and net balance summary',
        responses: { 200: { description: 'Financial summary' } },
      },
    },
    '/uploads/upi-screenshot': {
      post: {
        summary: 'Upload UPI screenshot for AI extraction',
        responses: { 200: { description: 'Extracted transaction details' } },
      },
    },
    '/uploads/receipt': {
      post: {
        summary: 'Upload receipt/bill for AI extraction',
        responses: { 200: { description: 'Extracted bill details' } },
      },
    },
    '/analytics/overview': {
      get: {
        summary: 'Get analytics monthly overview',
        responses: { 200: { description: 'Overview figures' } },
      },
    },
    '/budgets': {
      get: { summary: 'Get all user budgets with progress' },
      post: { summary: 'Create a budget' },
    },
    '/insights': {
      get: { summary: 'Get active AI financial insights' },
    },
    '/exports/transactions.csv': {
      get: { summary: 'Download CSV of transactions' },
    },
  },
};

