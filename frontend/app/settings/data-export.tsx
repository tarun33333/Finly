import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { downloadCsvFile } from '../../src/utils/export';
import { Button } from '../../src/components/buttons/Button';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react-native';

export default function DataExportScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExportCsv = async () => {
    setDownloadingCsv(true);
    try {
      const csvData = await apiClient.get<string>('/exports/transactions.csv');
      const filename = `finly_transactions_${new Date().toISOString().split('T')[0]}`;
      await downloadCsvFile(csvData, filename);
      setLastExport(`Transactions CSV exported at ${new Date().toLocaleTimeString()}`);
      Alert.alert('Export Complete', 'Transactions CSV has been generated and downloaded successfully.');
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export transactions.');
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleExportJson = async () => {
    setDownloadingJson(true);
    try {
      const reportData = await apiClient.get('/exports/monthly-report');
      const jsonStr = JSON.stringify(reportData, null, 2);
      const filename = `finly_monthly_report_${new Date().toISOString().split('T')[0]}`;
      await downloadCsvFile(jsonStr, filename);
      setLastExport(`Monthly report exported at ${new Date().toLocaleTimeString()}`);
      Alert.alert('Export Complete', 'Financial report exported successfully.');
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Could not export financial report.');
    } finally {
      setDownloadingJson(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>Data Export</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: `${theme.colors.primary}12`, borderColor: `${theme.colors.primary}30` },
          ]}
        >
          <ShieldCheck size={24} color={theme.colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.infoTitle, { color: theme.colors.primary }]}>Your Data Belongs to You</Text>
            <Text style={[styles.infoSub, { color: theme.colors.textSecondary }]}>
              Export your full transaction history anytime for spreadsheets, taxation, or offline record keeping.
            </Text>
          </View>
        </View>

        {/* CSV Export Option */}
        <View
          style={[
            styles.exportCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#10B98120' }]}>
              <FileSpreadsheet size={24} color="#10B981" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Transactions Spreadsheet
              </Text>
              <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
                Full history formatted as CSV with Indian Rupee amounts, categories, payment methods, dates, and UPI notes.
              </Text>
            </View>
          </View>

          <Button
            title={downloadingCsv ? 'Preparing CSV...' : 'Download CSV'}
            size="md"
            onPress={handleExportCsv}
            loading={downloadingCsv}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Monthly Report Summary Export */}
        <View
          style={[
            styles.exportCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: '#635BFF20' }]}>
              <FileText size={24} color="#635BFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Monthly Summary Report
              </Text>
              <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
                Category-wise expense breakdown, total earnings, net savings, and budget compliance metrics.
              </Text>
            </View>
          </View>

          <Button
            title={downloadingJson ? 'Preparing Report...' : 'Download Report'}
            variant="secondary"
            size="md"
            onPress={handleExportJson}
            loading={downloadingJson}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* Last Export Status */}
        {lastExport && (
          <View style={styles.successRow}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={[styles.successText, { color: '#10B981' }]}>{lastExport}</Text>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  exportCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  successText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
