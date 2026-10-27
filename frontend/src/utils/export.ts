import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export const downloadCsvFile = async (csvData: string, filenamePrefix = 'finly_transactions'): Promise<void> => {
  const filename = `${filenamePrefix}_${Date.now()}.csv`;

  if (Platform.OS === 'web') {
    // Standard web browser download
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  try {
    const docDir = (FileSystem as any).documentDirectory || '';
    const fileUri = `${docDir}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, csvData, {
      encoding: (FileSystem as any).EncodingType?.UTF8 || 'utf8',
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export CSV',
      });
    } else {
      Alert.alert('File Saved', `Exported to ${fileUri}`);
    }
  } catch (err: any) {
    Alert.alert('Export Error', err.message || 'Failed to export file.');
  }
};

