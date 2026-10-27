import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { Button } from '../../src/components/buttons/Button';
import { Sparkles, ScanLine, AlertCircle } from 'lucide-react-native';

export default function ProcessingUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useThemeStore();

  const imageUri = params.imageUri as string;
  const mode = (params.mode as 'upi' | 'receipt') || 'upi';

  const [statusText, setStatusText] = useState('Uploading screenshot...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function processImage() {
      if (!imageUri) {
        setError('No image specified.');
        return;
      }

      try {
        if (!isMounted) return;
        setStatusText('Reading payment details with Gemini Vision...');

        const formData = new FormData();
        const rawFilename = imageUri.split('/').pop() || 'upload.jpg';
        const cleanFilename = rawFilename.split('?')[0];
        const match = /\.(\w+)$/.exec(cleanFilename);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const filename = cleanFilename.includes('.') ? cleanFilename : `upload.${ext}`;

        const fieldName = mode === 'upi' ? 'screenshot' : 'receipt';

        // In Expo SDK 58 / React Native 0.88, WinterCG fetch requires standard Blob or File
        let filePart: any = null;
        try {
          const res = await fetch(imageUri);
          const rawBlob = await res.blob();
          if (rawBlob) {
            filePart = rawBlob.slice(0, rawBlob.size, mimeType);
          }
        } catch (fetchErr) {
          console.warn('Fetch to blob failed, attempting File class fallback:', fetchErr);
        }

        if (filePart) {
          formData.append(fieldName, filePart, filename);
        } else {
          try {
            const { File: ExpoFile } = await import('expo-file-system');
            formData.append(fieldName, new ExpoFile(imageUri));
          } catch {
            formData.append(fieldName, {
              uri: imageUri,
              name: filename,
              type: mimeType,
            } as any);
          }
        }

        const endpoint = mode === 'upi' ? '/uploads/upi-screenshot' : '/uploads/receipt';

        if (!isMounted) return;
        setStatusText('Categorizing & checking for duplicates...');

        const response = await apiClient.post(endpoint, formData);

        if (!isMounted) return;

        // Navigate to Human Confirmation Screen
        router.replace({
          pathname: '/transactions/review-import',
          params: {
            extractedData: JSON.stringify(response.extracted || {}),
            duplicateData: JSON.stringify(response.duplicateCheck || {}),
            attachmentPath: response.attachmentPath || '',
            imageUri,
          },
        });
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to analyze the payment image.');
      }
    }

    processImage();

    return () => {
      isMounted = false;
    };
  }, [imageUri, mode]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        {/* Animated Scanning Box */}
        <View
          style={[
            styles.scannerFrame,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : null}

          <View style={styles.overlay}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primary }]}>
              {error ? (
                <AlertCircle size={32} color="#FFF" />
              ) : (
                <Sparkles size={32} color="#FFF" />
              )}
            </View>

            <ScanLine size={48} color={theme.colors.secondary} style={styles.scanLine} />
          </View>
        </View>

        {/* Status Text & Progress */}
        <View style={styles.statusContainer}>
          {error ? (
            <>
              <Text style={[styles.errorTitle, { color: theme.colors.expense }]}>
                Analysis Failed
              </Text>
              <Text style={[styles.statusSub, { color: theme.colors.textSecondary }]}>
                {error}
              </Text>
              <Button
                title="Enter Manually"
                size="md"
                onPress={() => router.replace('/transactions/add')}
                style={{ marginTop: 20 }}
              />
              <Button
                title="Try Again"
                variant="outline"
                size="md"
                onPress={() => router.back()}
                style={{ marginTop: 10 }}
              />
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginBottom: 16 }} />
              <Text style={[styles.statusTitle, { color: theme.colors.textPrimary }]}>
                {statusText}
              </Text>
              <Text style={[styles.statusSub, { color: theme.colors.textSecondary }]}>
                Finly is securely processing your payment image.
              </Text>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 380,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#635BFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  scanLine: {
    position: 'absolute',
    top: 80,
  },
  statusContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  statusSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
});

