import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useThemeStore } from '../../src/store/themeStore';
import { Button } from '../../src/components/buttons/Button';
import { ArrowLeft, Camera, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react-native';

export default function UploadReceiptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useThemeStore();

  const [mode, setMode] = useState<'upi' | 'receipt'>(
    (params.mode as 'upi' | 'receipt') || 'upi'
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo gallery to select payment screenshots.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not open photo gallery.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera permission to take a picture of your bill or receipt.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Could not launch camera.');
    }
  };

  const handleStartProcessing = () => {
    if (!selectedImage) {
      Alert.alert('Select an Image', 'Please select or capture an image first.');
      return;
    }

    router.push({
      pathname: '/upload/processing',
      params: {
        imageUri: selectedImage,
        mode,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          {mode === 'upi' ? 'Scan UPI Screenshot' : 'Scan Physical Bill'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        {/* Mode Toggle */}
        <View
          style={[
            styles.modeToggle,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setMode('upi')}
            style={[styles.modeTab, mode === 'upi' && { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: mode === 'upi' ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              UPI Screenshot
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode('receipt')}
            style={[styles.modeTab, mode === 'receipt' && { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={[
                styles.modeTabText,
                { color: mode === 'receipt' ? '#FFF' : theme.colors.textSecondary },
              ]}
            >
              Cash Bill / Receipt
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview / Picker Box */}
        {selectedImage ? (
          <View
            style={[
              styles.previewContainer,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={[styles.replaceBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <RefreshCw size={16} color={theme.colors.primary} />
              <Text style={[styles.replaceBtnText, { color: theme.colors.primary }]}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.badgeBackground }]}>
              <Sparkles size={32} color={theme.colors.primary} />
            </View>

            <Text style={[styles.pickerTitle, { color: theme.colors.textPrimary }]}>
              {mode === 'upi'
                ? 'Upload Google Pay, PhonePe, or Paytm Screenshot'
                : 'Take a clear photo of your paper bill or receipt'}
            </Text>

            <Text style={[styles.pickerDesc, { color: theme.colors.textSecondary }]}>
              Finly Vision AI will automatically detect amount, merchant, date, and categorize the transaction.
            </Text>

            <View style={styles.pickerActions}>
              <Button
                title="Choose from Gallery"
                icon={<ImageIcon size={18} color="#FFF" />}
                onPress={pickFromGallery}
                size="md"
                style={{ flex: 1 }}
              />

              <Button
                title="Use Camera"
                icon={<Camera size={18} color={theme.colors.primary} />}
                variant="outline"
                onPress={takePhoto}
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Process Button */}
        {selectedImage && (
          <Button
            title="Analyze with Finly AI"
            icon={<Sparkles size={18} color="#FFF" />}
            size="lg"
            onPress={handleStartProcessing}
            style={{ marginTop: 24 }}
          />
        )}
      </View>
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    maxHeight: 440,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  pickerDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  previewContainer: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 440,
    padding: 12,
  },
  previewImage: {
    width: '100%',
    height: '85%',
    borderRadius: 14,
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  replaceBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

