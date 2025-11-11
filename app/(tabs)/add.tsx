import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const Add = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Backdrop */}
      <TouchableOpacity 
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => router.back()}
      />
      
      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <SafeAreaView edges={['bottom']}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Transaction</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Actions Grid */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#10B981' }]}>
                <View style={styles.actionIconContainer}>
                  <ArrowUpRight size={32} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.actionTitle}>Add Income</Text>
                <Text style={styles.actionDescription}>Record your earnings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#EF4444' }]}>
                <View style={styles.actionIconContainer}>
                  <ArrowDownRight size={32} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.actionTitle}>Add Expense</Text>
                <Text style={styles.actionDescription}>Track your spending</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#3B82F6' }]}>
                <View style={styles.actionIconContainer}>
                  <CreditCard size={32} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.actionTitle}>Add Card</Text>
                <Text style={styles.actionDescription}>Link new card</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F59E0B' }]}>
                <View style={styles.actionIconContainer}>
                  <Wallet size={32} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.actionTitle}>Add Wallet</Text>
                <Text style={styles.actionDescription}>Create new wallet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2D1B4E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    maxHeight: 400,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  actionCard: {
    width: '47%',
    borderRadius: 20,
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
});

export default Add;

