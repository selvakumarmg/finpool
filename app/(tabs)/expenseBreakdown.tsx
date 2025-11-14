import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Svg, Circle } from 'react-native-svg';

import { useAppSelector } from '@/store/hooks';

const size = 220;
const strokeWidth = 22;
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const COLORS = ['#7C3AED', '#F59E0B', '#6366F1', '#22C55E', '#F97316', '#EC4899', '#14B8A6'];

interface Segment {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

const ExpenseBreakdown = () => {
  const router = useRouter();
  const { transactions, totalIncome, totalExpense } = useAppSelector((state) => state.transactions);
  const { activities: activityList, totalSpent: activitiesTotal } = useAppSelector((state) => state.activities);

  const { segments, totalSpent, spendPercentage } = useMemo(() => {
    const totals: Record<string, number> = {};

    transactions
      .filter((transaction) => transaction.type === 'expense')
      .forEach((transaction) => {
        const key = transaction.category?.trim() || 'Expenses';
        totals[key] = (totals[key] || 0) + transaction.amount;
      });

    activityList.forEach((activity) => {
      const key = activity.category?.trim() || 'Activities';
      totals[key] = (totals[key] || 0) + activity.totalAmount;
    });

    const entries = Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .filter((entry) => entry.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    let processed: Segment[] = [];
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

    if (entries.length <= 5) {
      processed = entries.map((entry, index) => ({
        category: entry.category,
        amount: entry.amount,
        color: COLORS[index % COLORS.length],
        percentage: total > 0 ? (entry.amount / total) * 100 : 0,
      }));
    } else {
      const top = entries.slice(0, 4);
      const othersAmount = entries.slice(4).reduce((sum, entry) => sum + entry.amount, 0);
      processed = [
        ...top.map((entry, index) => ({
          category: entry.category,
          amount: entry.amount,
          color: COLORS[index % COLORS.length],
          percentage: total > 0 ? (entry.amount / total) * 100 : 0,
        })),
        {
          category: 'Others',
          amount: othersAmount,
          color: COLORS[4],
          percentage: total > 0 ? (othersAmount / total) * 100 : 0,
        },
      ];
    }

    const combinedExpenses = totalExpense + activitiesTotal;
    const spendPercent =
      totalIncome > 0 ? Math.min(100, Math.round((combinedExpenses / totalIncome) * 100)) : 0;

    return {
      segments: processed,
      totalSpent: total,
      spendPercentage: spendPercent,
    };
  }, [transactions, activityList, totalIncome, totalExpense, activitiesTotal]);

  if (totalSpent <= 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#6B46C1', '#4C2F7C', '#2D1B4E', '#1a0b2e']}
          locations={[0, 0.3, 0.6, 1]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Expense Breakdown</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No Expenses Yet</Text>
              <Text style={styles.emptyDescription}>
                Add expenses or activities to see category wise breakdown of your spending.
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  let cumulative = 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#6B46C1', '#4C2F7C', '#2D1B4E', '#1a0b2e']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Expense Breakdown</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.chartContainer}>
              <Svg width={size} height={size}>
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {segments.map((segment, index) => {
                  const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = circumference * cumulative;
                  cumulative += segment.percentage / 100;

                  return (
                    <Circle
                      key={segment.category}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  );
                })}
              </Svg>

              <View style={styles.chartCenter}>
                <Text style={styles.chartPercent}>{spendPercentage}%</Text>
                <Text style={styles.chartLabel}>Total Spend</Text>
                <Text style={styles.chartAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.legend}>
              {segments.map((segment) => (
                <View style={styles.legendItem} key={segment.category}>
                  <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                  <View style={styles.legendTextContainer}>
                    <Text style={styles.legendLabel}>{segment.category}</Text>
                    <Text style={styles.legendSub}>
                      ₹{segment.amount.toLocaleString('en-IN')} • {segment.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0b2e' },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPercent: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  chartAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  legend: {
    marginTop: 24,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendTextContainer: { flex: 1 },
  legendLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  legendSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ExpenseBreakdown;


