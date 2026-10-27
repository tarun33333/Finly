import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../../src/store/themeStore';
import { apiClient } from '../../src/services/api/client';
import { Insight } from '../../src/types';
import { formatINR } from '../../src/utils/currency';
import {
  ArrowLeft,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  X,
  RefreshCw,
  Lightbulb,
} from 'lucide-react-native';

export default function InsightsListScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme } = useThemeStore();

  const { data: insights, isLoading, refetch } = useQuery<Insight[]>({
    queryKey: ['insights-list'],
    queryFn: () => apiClient.get('/insights'),
  });

  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await apiClient.post('/insights/generate');
      await refetch();
    } catch (err: any) {
      Alert.alert('Insights', err.message || 'Could not refresh insights.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await apiClient.patch(`/insights/${id}/dismiss`);
      await queryClient.invalidateQueries({ queryKey: ['insights-list'] });
      await queryClient.invalidateQueries({ queryKey: ['active-insights'] });
    } catch {
      // Ignore
    }
  };

  const handleFeedback = async (id: string, feedback: 'helpful' | 'not_helpful') => {
    try {
      await apiClient.post(`/insights/${id}/feedback`, { feedback });
      Alert.alert('Feedback Received', 'Thank you! Finly will learn from your feedback.');
      await refetch();
    } catch {
      // Ignore
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>
          Finly AI Insights
        </Text>
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={generating}
          style={[styles.refreshBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          {generating ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <RefreshCw size={18} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.heroBanner, { backgroundColor: theme.colors.badgeBackground }]}>
          <Sparkles size={24} color={theme.colors.primary} />
          <Text style={[styles.heroTitle, { color: theme.colors.primary }]}>
            Grounded Financial Intelligence
          </Text>
          <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>
            All recommendations are computed from your verified transactions and contextualized with Google Gemini.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : insights && insights.length > 0 ? (
          insights.map((ins) => (
            <View
              key={ins._id}
              style={[
                styles.insightCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.badgeRow}>
                  <Lightbulb size={16} color={theme.colors.accent} />
                  <Text style={[styles.typeBadge, { color: theme.colors.primary }]}>
                    {ins.type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => handleDismiss(ins._id)} style={styles.dismissBtn}>
                  <X size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                {ins.title}
              </Text>

              <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
                {ins.explanation}
              </Text>

              {ins.estimatedSaving && ins.estimatedSaving > 0 ? (
                <View style={[styles.savingBox, { backgroundColor: 'rgba(32, 201, 151, 0.12)' }]}>
                  <Text style={[styles.savingText, { color: theme.colors.secondary }]}>
                    Potential Monthly Savings: ~{formatINR(ins.estimatedSaving, false)}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.feedbackRow, { borderTopColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.feedbackPrompt, { color: theme.colors.textMuted }]}>
                  Was this helpful?
                </Text>
                <View style={styles.thumbsGroup}>
                  <TouchableOpacity
                    onPress={() => handleFeedback(ins._id, 'helpful')}
                    style={[
                      styles.thumbBtn,
                      ins.feedback === 'helpful' && { backgroundColor: 'rgba(22, 163, 74, 0.2)' },
                    ]}
                  >
                    <ThumbsUp
                      size={14}
                      color={ins.feedback === 'helpful' ? '#16A34A' : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleFeedback(ins._id, 'not_helpful')}
                    style={[
                      styles.thumbBtn,
                      ins.feedback === 'not_helpful' && { backgroundColor: 'rgba(249, 115, 115, 0.2)' },
                    ]}
                  >
                    <ThumbsDown
                      size={14}
                      color={ins.feedback === 'not_helpful' ? '#F97373' : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
              No new recommendations
            </Text>
            <Text style={[styles.emptySub, { color: theme.colors.textSecondary }]}>
              Tap the refresh button above or record more transactions to let Finly analyze your spending habits.
            </Text>
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  heroBanner: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  insightCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  savingBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  savingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  feedbackPrompt: {
    fontSize: 12,
  },
  thumbsGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbBtn: {
    padding: 6,
    borderRadius: 6,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

