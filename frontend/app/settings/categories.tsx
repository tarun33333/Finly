import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { Button } from '../../src/components/buttons/Button';
import { Category } from '../../src/types';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { deduplicateCategories } from '../../src/utils/category';

const PRESET_COLORS = ['#635BFF', '#20C997', '#FFB84D', '#F97373', '#EC4899', '#8B5CF6', '#10B981', '#3B82F6'];

export default function CategoriesSettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const { data: rawCategories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories-settings', activeTab],
    queryFn: () => apiClient.get(`/categories?type=${activeTab}`),
  });

  const categories = React.useMemo(() => deduplicateCategories(rawCategories), [rawCategories]);

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/categories', {
        name: newCatName.trim(),
        type: activeTab,
        color: selectedColor,
        icon: 'Tag',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories-settings'] });
      setNewCatName('');
      setShowAddForm(false);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Could not create category.');
    },
  });

  const handleCreate = () => {
    if (!newCatName.trim()) {
      Alert.alert('Required', 'Please enter a category name.');
      return;
    }
    createMutation.mutate();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Categories
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          style={[styles.iconBtn, { backgroundColor: theme.colors.primary }]}
        >
          {showAddForm ? <X size={18} color="#FFF" /> : <Plus size={18} color="#FFF" />}
        </TouchableOpacity>
      </View>

      {/* Expense / Income Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('expense')}
          style={[
            styles.tab,
            activeTab === 'expense' && { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1.5 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'expense' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            Expense Categories
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('income')}
          style={[
            styles.tab,
            activeTab === 'income' && { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1.5 },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'income' ? theme.colors.primary : theme.colors.textSecondary },
            ]}
          >
            Income Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Form */}
      {showAddForm && (
        <View
          style={[
            styles.addForm,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.formTitle, { color: theme.colors.textPrimary }]}>
            New {activeTab === 'expense' ? 'Expense' : 'Income'} Category
          </Text>

          <TextInput
            value={newCatName}
            onChangeText={setNewCatName}
            placeholder="e.g. Pet Care, House Maintenance"
            placeholderTextColor={theme.colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.textPrimary },
            ]}
          />

          <Text style={[styles.colorLabel, { color: theme.colors.textSecondary }]}>Pick a Color</Text>
          <View style={styles.colorRow}>
            {PRESET_COLORS.map((col) => (
              <TouchableOpacity
                key={col}
                onPress={() => setSelectedColor(col)}
                style={[
                  styles.colorDot,
                  { backgroundColor: col },
                  selectedColor === col && styles.selectedColorDot,
                ]}
              />
            ))}
          </View>

          <Button
            title="Create Category"
            size="md"
            onPress={handleCreate}
            loading={createMutation.isPending}
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      {/* Categories List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        <View
          style={[
            styles.categoryGroup,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {categories?.map((cat, i) => (
            <React.Fragment key={cat._id}>
              <View style={styles.catRow}>
                <View style={[styles.catCircle, { backgroundColor: `${cat.color}25` }]}>
                  <View style={[styles.catDotInner, { backgroundColor: cat.color }]} />
                </View>

                <Text style={[styles.catName, { color: theme.colors.textPrimary }]}>
                  {cat.name}
                </Text>

                {cat.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.defaultBadgeText, { color: theme.colors.textMuted }]}>
                      Default
                    </Text>
                  </View>
                )}
              </View>

              {i < (categories?.length || 0) - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  addForm: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  selectedColorDot: {
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categoryGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  catCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
});

