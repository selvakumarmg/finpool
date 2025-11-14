import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteActivity } from '@/store/slices/activitySlice';
import { useTranslation } from '@/locale/LocaleProvider';
import { useResponsive } from '@/hooks/useResponsive';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Clock, Edit2, ShoppingBag, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Activities = () => {
  const router = useRouter();
  const t = useTranslation();
  const dispatch = useAppDispatch();
  const { getFontSize, getSpacing } = useResponsive();
  const { activities, totalSpent } = useAppSelector((state) => state.activities);
  const [swipedActivityId, setSwipedActivityId] = useState<string | null>(null);

  const formatPaymentMethod = useMemo(
    () => (method?: string) => {
      switch (method) {
        case 'account':
          return t('common.account');
        case 'card':
          return t('common.card');
        case 'upi':
          return t('common.upi');
        case 'cash':
        default:
          return t('common.cash');
      }
    },
    [t]
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      t('activitiesScreen.deleteTitle'),
      t('activitiesScreen.deleteMessage', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteActivity(id));
            setSwipedActivityId(null);
          },
        },
      ]
    );
  };

  const handleEdit = (id: string) => {
    setSwipedActivityId(null);
    router.push(`/(tabs)/editActivity?id=${id}` as any);
  };

  const displayActivities = activities.slice(0, 5);

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
              <View>
                <Text style={styles.headerTitle}>{t('activitiesScreen.title')}</Text>
                <Text style={styles.headerSubtitle}>{t('activitiesScreen.subtitle')}</Text>
              </View>
            </View>

            {activities.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Clock size={48} color="rgba(255, 255, 255, 0.3)" />
                </View>
                <Text style={styles.emptyStateTitle}>{t('activitiesScreen.emptyTitle')}</Text>
                <Text style={styles.emptyStateDescription}>
                  {t('activitiesScreen.emptyDescription')}
                </Text>
              </View>
            ) : (
              <>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryIconContainer}>
                    <ShoppingBag size={24} color="#7C3AED" />
                  </View>
                  <View style={styles.summaryInfo}>
                    <Text style={styles.summaryLabel}>{t('activitiesScreen.totalSpent')}</Text>
                    <Text style={styles.summaryAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.summaryBadge}>
                    <Text style={styles.summaryBadgeText}>{activities.length}</Text>
                  </View>
                </View>

                {/* Activities List */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('activitiesScreen.recentTitle')}</Text>
                    {activities.length > 5 && (
                      <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => router.push('/(tabs)/allActivities' as any)}
                      >
                        <Text style={styles.viewAllText}>{t('activitiesScreen.viewAll')}</Text>
                        <ChevronRight size={16} color="#7C3AED" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.activitiesList}>
                    {displayActivities.map((activity) => (
                      <View key={activity.id} style={styles.activityCardWrapper}>
                        <TouchableOpacity
                          style={styles.activityCard}
                          onPress={() => router.push(`/(tabs)/activityDetail?id=${activity.id}` as any)}
                          onLongPress={() => setSwipedActivityId(swipedActivityId === activity.id ? null : activity.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.activityHeader}>
                            <View style={styles.activityTitleContainer}>
                              <View style={styles.activityInfo}>
                                <Text 
                                  style={styles.activityName} 
                                  numberOfLines={1} 
                                  ellipsizeMode="tail"
                                >
                                  {activity.name}
                                </Text>
                                <View style={styles.activityMeta}>
                                  <Text 
                                    style={styles.activityCategory} 
                                    numberOfLines={1} 
                                    ellipsizeMode="tail"
                                  >
                                    {activity.category}
                                  </Text>
                                  <View style={styles.metaDot} />
                                  <Text style={styles.activityDate}>{activity.date}</Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.activityAmountContainer}>
                              <Text style={styles.activityAmount}>
                                ₹{activity.totalAmount.toLocaleString('en-IN')}
                              </Text>
                              <View style={styles.paymentMethodBadge}>
                                <Text style={styles.paymentMethodText}>
                                  {formatPaymentMethod(activity.paymentMethod)}
                                </Text>
                              </View>
                              <Text style={styles.activityItemCount}>
                                {t('activitiesScreen.itemsLabel', { count: activity.subitems.length })}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {swipedActivityId === activity.id && (
                          <View style={styles.swipeActions}>
                            <TouchableOpacity
                              style={[styles.swipeActionButton, styles.editAction]}
                              onPress={() => handleEdit(activity.id)}
                            >
                              <Edit2 size={18} color="#FFFFFF" />
                              <Text style={styles.swipeActionText}>{t('common.edit')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.swipeActionButton, styles.deleteAction]}
                              onPress={() => handleDelete(activity.id, activity.name)}
                            >
                              <Trash2 size={18} color="#FFFFFF" />
                              <Text style={styles.swipeActionText}>{t('common.delete')}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </>
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
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryInfo: { flex: 1 },
  summaryLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 4, fontWeight: '500' },
  summaryAmount: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  summaryBadge: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  summaryBadgeText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#7C3AED' },
  activitiesList: { gap: 12 },
  activityCardWrapper: {
    position: 'relative',
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitleContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  activityInfo: { 
    flex: 1,
    minWidth: 0,
  },
  activityName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    marginBottom: 4,
    flexShrink: 1,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityCategory: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    textTransform: 'capitalize',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activityDate: { fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' },
  activityAmountContainer: { alignItems: 'flex-end' },
  activityAmount: { fontSize: 18, fontWeight: '700', color: '#7C3AED', marginBottom: 2 },
  paymentMethodBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityItemCount: { fontSize: 11, color: 'rgba(255, 255, 255, 0.6)', fontWeight: '500' },
  swipeActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  swipeActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  editAction: {
    backgroundColor: '#7C3AED',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
  },
  swipeActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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

export default Activities;
