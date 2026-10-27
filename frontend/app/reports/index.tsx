import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { Button } from '../../src/components/buttons/Button';
import { formatINR } from '../../src/utils/currency';
import { getMonthName } from '../../src/utils/date';
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react-native';
import { downloadCsvFile } from '../../src/utils/export';

export default function ReportsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();

  const { data: report } = useQuery({
    queryKey: ['monthly-report'],
    queryFn: () => apiClient.get('/exports/monthly-report'),
  });

  const handleDownloadCsv = async () => {
    try {
      const csvData = await apiClient.get<string>('/exports/transactions.csv');
      await downloadCsvFile(csvData, 'finly_monthly_statement');
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export CSV file.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Monthly Statement
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={[
            styles.statementCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.statementHeader}>
            <FileSpreadsheet size={24} color={theme.colors.primary} />
            <Text style={[styles.statementTitle, { color: theme.colors.textPrimary }]}>
              {getMonthName()} Financial Summary
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>Total Income</Text>
            <Text style={[styles.rowVal, { color: theme.colors.income }]}>
              +{formatINR(report?.overview?.income || 0, false)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>Total Expenses</Text>
            <Text style={[styles.rowVal, { color: theme.colors.expense }]}>
              -{formatINR(report?.overview?.expense || 0, false)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>Net Savings</Text>
            <Text style={[styles.rowVal, { color: theme.colors.primary, fontWeight: '800' }]}>
              {formatINR(report?.overview?.netFlow || 0, false)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>Savings Rate</Text>
            <Text style={[styles.rowVal, { color: theme.colors.textPrimary }]}>
              {report?.overview?.savingsRate || 0}%
            </Text>
          </View>
        </View>

        <Button
          title="Export CSV (All Transactions)"
          icon={<Download size={18} color="#FFF" />}
          size="lg"
          onPress={handleDownloadCsv}
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  statementCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  statementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  statementTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowVal: {
    fontSize: 15,
    fontWeight: '600',
  },
});
