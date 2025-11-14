import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useTranslation } from '@/locale/LocaleProvider';
import { markAsRead, markAllAsRead, clearAllNotifications } from '@/store/slices/notificationSlice';

const Notifications = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const { notifications } = useAppSelector((state) => state.notifications);

  const canClearAll = notifications.length > 10;

  const translateGroup = (group: string) => {
    switch (group) {
      case 'Today':
        return t('notifications.today');
      case 'Yesterday':
        return t('notifications.yesterday');
      case 'This Week':
        return t('notifications.thisWeek');
      case 'Last Week':
        return t('notifications.lastWeek');
      case 'Last Month':
        return t('notifications.lastMonth');
      case 'Earlier':
        return t('notifications.earlier');
      default:
        return group;
    }
  };

  const groupedNotifications = useMemo(() => {
    const now = new Date();

    const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOfWeek = (date: Date) => {
      const newDate = new Date(date);
      const day = newDate.getDay(); // 0 (Sun) - 6 (Sat)
      const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // assume week starts Monday
      newDate.setDate(diff);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };
    const startOfLastWeek = (date: Date) => {
      const currentWeekStart = startOfWeek(date);
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(currentWeekStart.getDate() - 7);
      return lastWeekStart;
    };
    const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const startOfLastMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() - 1, 1);

    const todayStart = startOfDay(now);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = startOfLastWeek(now);
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfLastMonth(now);

    const groups: Record<string, typeof notifications> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      'Last Week': [],
      'Last Month': [],
      Earlier: [],
    };

    notifications.forEach((notification) => {
      const notifDate = new Date(notification.timestamp);
      const notifStart = startOfDay(notifDate);

      if (notifStart >= todayStart) {
        groups['Today'].push(notification);
      } else if (notifStart >= yesterdayStart) {
        groups['Yesterday'].push(notification);
      } else if (notifStart >= thisWeekStart) {
        groups['This Week'].push(notification);
      } else if (notifStart >= lastWeekStart) {
        groups['Last Week'].push(notification);
      } else if (notifStart >= lastMonthStart) {
        groups['Last Month'].push(notification);
      } else {
        groups['Earlier'].push(notification);
      }
    });

    return groups;
  }, [notifications]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
            {canClearAll ? (
              <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
              <Text style={styles.clearText}>{t('notifications.clearAll')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 72 }} />
            )}
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Bell size={48} color="rgba(255, 255, 255, 0.3)" />
                </View>
                <Text style={styles.emptyStateTitle}>{t('notifications.emptyTitle')}</Text>
                <Text style={styles.emptyStateDescription}>
                  {t('notifications.emptySubtitle')}
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {Object.entries(groupedNotifications).map(([group, groupItems]) => {
                  if (groupItems.length === 0) return null;
                  return (
                    <View key={group} style={styles.groupSection}>
                      <View style={styles.groupHeader}>
                        <View style={styles.groupDivider} />
                        <Text style={styles.groupTitle}>{translateGroup(group)}</Text>
                        <View style={styles.groupDivider} />
                      </View>
                      {group !== 'Earlier' && groupItems.some(n => !n.read) && (
                        <TouchableOpacity
                          onPress={() => groupItems.forEach(n => handleMarkAsRead(n.id))}
                          style={styles.groupMarkButton}
                        >
                          <Text style={styles.groupMarkText}>{t('notifications.markGroupRead')}</Text>
                        </TouchableOpacity>
                      )}
                      {groupItems.map((notification) => (
                        <TouchableOpacity
                          key={notification.id}
                          style={[
                            styles.notificationItem,
                            !notification.read ? styles.unreadNotification : styles.readNotification
                          ]}
                          onPress={() => handleMarkAsRead(notification.id)}
                        >
                          <View style={styles.notificationContent}>
                            <View style={styles.notificationHeader}>
                              <Text style={styles.notificationTitle}>
                                {notification.title}
                              </Text>
                              {!notification.read && (
                                <View style={styles.unreadDot} />
                              )}
                            </View>
                            <Text style={styles.notificationMessage}>
                              {notification.message}
                            </Text>
                            <Text style={styles.notificationDate}>
                              {notification.date}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Bottom Padding */}
            <View style={{ height: 20 }} />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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
  notificationsList: {
    gap: 24,
  },
  groupSection: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  groupMarkButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  groupMarkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  notificationItem: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
  },
  unreadNotification: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    borderBottomColor: 'rgba(124, 58, 237, 0.2)',
  },
  readNotification: {
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default Notifications;

