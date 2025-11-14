import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAppSelector } from '@/store/hooks';

const formatPaymentMethod = (method?: string) => {
  switch (method) {
    case 'account':
      return 'Account';
    case 'card':
      return 'Card';
    case 'upi':
      return 'UPI';
    case 'cash':
    default:
      return 'Cash';
  }
};

const AllActivities = () => {
  const router = useRouter();
  const { activities } = useAppSelector((state) => state.activities);

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
            <Text style={styles.headerTitle}>All Activities</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.activitiesList}>
              {activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  onPress={() => router.push(`/(tabs)/activityDetail?id=${activity.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.activityHeader}>
                    <View style={styles.activityTitleContainer}>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <View style={styles.activityMeta}>
                          <Text style={styles.activityCategory}>{activity.category}</Text>
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
                        {activity.subitems.length} items
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 100 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  activitiesList: { gap: 12 },
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
  activityTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityCategory: {
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
});

export default AllActivities;

