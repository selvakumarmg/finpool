import React, { useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Filter, TrendingDown, TrendingUp } from 'lucide-react-native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportedLanguage } from '@/config/appConfig';
import { useLocale, useTranslation } from '@/locale/LocaleProvider';
import { useAppSelector } from '@/store/hooks';
import { useResponsive } from '@/hooks/useResponsive';

const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ka: 'kn-IN',
};

type SortOrder = 'desc' | 'asc';
type TransactionFilter = 'all' | 'income' | 'expense';

const TransactionsScreen = () => {
  const router = useRouter();
  const t = useTranslation();
  const { language } = useLocale();
  const { getFontSize, getSpacing } = useResponsive();
  const { transactions } = useAppSelector((state) => state.transactions);

  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const localeCode = LANGUAGE_LOCALE_MAP[language] ?? 'en-IN';

  const filteredTransactions = useMemo(() => {
    const filtered =
      filter === 'all'
        ? transactions
        : transactions.filter((transaction) => transaction.type === filter);

    return [...filtered].sort((a, b) =>
      sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp,
    );
  }, [filter, sortOrder, transactions]);

  const formatAmount = (value: number) =>
    `₹${value.toLocaleString(localeCode, { minimumFractionDigits: 0 })}`;

  const formatDate = (value: string) =>
    value ||
    new Date().toLocaleDateString(localeCode, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

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
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTitles}>
              <Text 
                style={styles.headerTitle} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {t('transactionsScreen.title')}
              </Text>
              <Text 
                style={styles.headerSubtitle} 
                numberOfLines={1} 
                ellipsizeMode="tail"
              >
                {t('transactionsScreen.subtitle')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilters(!showFilters)}
              activeOpacity={0.7}
            >
              <Filter size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {showFilters && (
              <View style={styles.filtersCard}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>{t('transactionsScreen.sortLabel')}</Text>
                <View style={styles.chipRow}>
                  {([
                    { value: 'desc', label: t('transactionsScreen.sortNewest') },
                    { value: 'asc', label: t('transactionsScreen.sortOldest') },
                  ] as const).map((option) => {
                    const active = sortOrder === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setSortOrder(option.value)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>{t('transactionsScreen.filterLabel')}</Text>
                <View style={styles.chipRow}>
                  {([
                    { value: 'all', label: t('transactionsScreen.filterAll') },
                    { value: 'income', label: t('transactionsScreen.filterIncome') },
                    { value: 'expense', label: t('transactionsScreen.filterExpense') },
                  ] as const).map((option) => {
                    const active = filter === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => setFilter(option.value)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
            )}

            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{t('transactionsScreen.emptyTitle')}</Text>
                <Text style={styles.emptyDescription}>
                  {t('transactionsScreen.emptyDescription')}
                </Text>
              </View>
            ) : (
              <View style={styles.transactionsList}>
                {filteredTransactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionCard}>
                    <View style={styles.transactionCardHeader}>
                      <View
                        style={[
                          styles.transactionIcon,
                          transaction.type === 'income'
                            ? styles.incomeIconBackground
                            : styles.expenseIconBackground,
                        ]}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp size={20} color="#10B981" />
                        ) : (
                          <TrendingDown size={20} color="#EF4444" />
                        )}
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text 
                          style={styles.transactionName} 
                          numberOfLines={1} 
                          ellipsizeMode="tail"
                        >
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionMeta} numberOfLines={1}>
                          {t('transactionsScreen.amountLabel')}: {formatAmount(transaction.amount)}
                        </Text>
                        <Text style={styles.transactionMeta} numberOfLines={1}>
                          {t('transactionsScreen.dateLabel')}: {formatDate(transaction.date)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.transactionAmount,
                          transaction.type === 'income'
                            ? styles.incomeAmount
                            : styles.expenseAmount,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatAmount(transaction.amount)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 80 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b2e',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  filtersCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  chipActive: {
    backgroundColor: '#7C3AED',
    borderColor: 'rgba(124, 58, 237, 0.8)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  transactionCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeIconBackground: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  expenseIconBackground: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
    gap: 4,
  },
  transactionName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  transactionMeta: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  transactionAmount: {
    flexShrink: 0,
    fontSize: 16,
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
});

export default TransactionsScreen;


