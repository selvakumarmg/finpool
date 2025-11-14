import { useTranslation } from '@/locale/LocaleProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Bell,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react-native';
import React, { useEffect, useMemo } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import { recordSavingsUpdate } from '@/store/slices/savingsSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

const DashboardHome = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const { getFontSize, getSpacing } = useResponsive();
  const user = useAppSelector((state) => state.auth.user);
  const { totalIncome, totalExpense, transactions } = useAppSelector((state) => state.transactions);
  const { totalSpent: activityTotalSpent } = useAppSelector((state) => state.activities);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const savingsTargets = useAppSelector((state) => state.savings.targets);
  
  const recentTransactions = useMemo(() => transactions.slice(0, 4), [transactions]);

  const combinedExpense = totalExpense + activityTotalSpent;
  const combinedBalance = totalIncome - combinedExpense;
  useEffect(() => {
    (async () => {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('savings-reminders', {
          name: 'Savings Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!savingsTargets.length) {
      return;
    }

    const checkReminders = async () => {
      const now = Date.now();
      for (const target of savingsTargets) {
        const reminderGapMs = target.reminderGapDays * 24 * 60 * 60 * 1000;
        if (now - target.lastUpdated < reminderGapMs) {
          continue;
        }

        const lastScheduledAt = target.lastReminderScheduledAt ?? target.lastUpdated;
        if (now - lastScheduledAt < reminderGapMs) {
          continue;
        }

        try {
          const trigger: Notifications.TimeIntervalTriggerInput = {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            repeats: false,
            channelId: Platform.OS === 'android' ? 'savings-reminders' : undefined,
          };

          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Savings Reminder',
              body: `It has been ${target.reminderGapDays === 1 ? 'a day' : `${target.reminderGapDays} days`} since you updated "${target.purpose}".`,
              sound: 'default',
            },
            trigger,
          });

          dispatch(
            recordSavingsUpdate({
              id: target.id,
              lastUpdated: target.lastUpdated,
              notificationId,
              reminderScheduledAt: now,
            }),
          );
        } catch (error) {
          console.warn('Failed to schedule overdue savings reminder', error);
        }
      }
    };

    checkReminders();
  }, [dispatch, savingsTargets]);

  const handleExpensePress = () => {
    if (combinedExpense <= 0) {
      return;
    }
    router.push('/(tabs)/expenseBreakdown');
  };

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
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
                    {t('dashboard.welcome')}
                  </Text>
                  <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                    {user?.name || t('dashboard.defaultUser')}
                  </Text>
                </View>
                <View style={styles.headerActions}>
                  <TouchableOpacity 
                    style={styles.jarButton}
                    onPress={() => router.push('/(tabs)/savings')}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={require('@/assets/images/piggy-bank.png')}
                      style={styles.jarIcon}
                      resizeMode="contain"
                    />
                    <Text style={styles.jarLabel} numberOfLines={1} ellipsizeMode="tail">
                      {t('tabs.jar')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.notificationButton}
                    onPress={() => router.push('/(tabs)/notifications')}
                  >
                    <Bell size={22} color="#FFFFFF" />
                    {unreadCount > 0 && (
                      <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>{t('dashboard.totalBalance')}</Text>
                <Wallet size={20} color="rgba(255, 255, 255, 0.7)" />
              </View>
              <Text style={styles.balanceAmount}>
                ₹{combinedBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              
              {/* Income/Expense Split */}
              <View style={styles.balanceSplit}>
                <View style={styles.balanceSplitItem}>
                  <View style={styles.balanceSplitIcon}>
                    <TrendingUp size={16} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.balanceSplitLabel}>{t('dashboard.income')}</Text>
                    <Text style={styles.balanceSplitAmount}>
                      ₹{totalIncome.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <View style={styles.balanceSplitDivider} />

                <TouchableOpacity
                  style={[styles.balanceSplitItem, styles.balanceSplitButton]}
                  onPress={handleExpensePress}
                  activeOpacity={combinedExpense > 0 ? 0.8 : 1}
                  disabled={combinedExpense <= 0}
                >
                  <View style={styles.balanceSplitIcon}>
                    <TrendingDown size={16} color="#EF4444" />
                  </View>
                  <View style={styles.balanceSplitContent}>
                    <Text style={styles.balanceSplitLabel}>{t('dashboard.expense')}</Text>
                    <Text style={styles.balanceSplitAmount}>
                      ₹{combinedExpense.toLocaleString('en-IN')}
                    </Text>
        
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Transactions or Empty State */}
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Wallet size={48} color="rgba(255, 255, 255, 0.3)" />
                </View>
                <Text style={styles.emptyStateTitle}>{t('dashboard.emptyTitle')}</Text>
                <Text style={styles.emptyStateDescription}>
                  {t('dashboard.emptyDescription')}
                </Text>
              </View>
            ) : (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLeft}>
                    <Text style={styles.sectionTitle} numberOfLines={1} ellipsizeMode="tail">
                      {t('dashboard.recentTransactions')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.sectionActionButton}
                    onPress={() => router.push('/(tabs)/transactions')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.sectionActionText}>{t('dashboard.viewAllTransactions')}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.transactionsList}>
                  {recentTransactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={[
                        styles.transactionIcon,
                        { backgroundColor: transaction.type === 'income' 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(239, 68, 68, 0.2)' 
                        }
                      ]}>
                        {transaction.type === 'income' ? (
                          <TrendingUp size={20} color="#10B981" />
                        ) : (
                          <TrendingDown size={20} color="#EF4444" />
                        )}
                      </View>
                      <View style={styles.transactionDetails}>
                        <Text 
                          style={styles.transactionName} 
                          numberOfLines={1} 
                          ellipsizeMode="tail"
                        >
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionDate} numberOfLines={1}>
                          {transaction.date}
                        </Text>
                      </View>
                      <Text 
                        style={[
                          styles.transactionAmount,
                          { color: transaction.type === 'income' ? '#10B981' : '#EF4444' }
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                      >
                        {transaction.type === 'income' ? '+ ' : '- '}₹{transaction.amount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bottom Padding for Tab Bar */}
            <View style={{ height: 100 }} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#4C2F7C',
  },
  jarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.6)',
    flexShrink: 0,
  },
  jarIcon: {
    width: 20,
    height: 20,
    tintColor: 'rgba(16, 185, 129, 0.8)',
  },
  jarLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: 'rgba(16, 185, 129)',
    flexShrink: 0,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  balanceSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
  },
  balanceSplitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceSplitButton: {
    flex: 1,
  },
  balanceSplitContent: {
    flex: 1,
  },
  balanceSplitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceSplitLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  balanceSplitAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  balanceSplitSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
    fontWeight: '500',
  },
  balanceSplitDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  transactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  transactionsList: {
    gap: 12,
  },
  sectionActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    flexShrink: 0,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C4B5FD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    flexShrink: 1,
  },
  transactionDate: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DashboardHome;

