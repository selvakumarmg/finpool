import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupportedLanguage } from '@/config/appConfig';
import { useLocale, useTranslation } from '@/locale/LocaleProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeSavingsTarget, SavingsTarget } from '@/store/slices/savingsSlice';
import { useResponsive } from '@/hooks/useResponsive';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StatusModal, { StatusType } from '@/components/ui/StatusModal';

const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ka: 'kn-IN',
};

const SavingsList = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useLocale();
  const t = useTranslation();
  const { getFontSize, getSpacing } = useResponsive();
  const savingsTargets = useAppSelector((state) => state.savings.targets);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; target?: SavingsTarget }>({
    visible: false,
  });
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: StatusType;
    title?: string;
    message?: string;
  }>({
    visible: false,
    type: 'custom',
  });

  const localeCode = LANGUAGE_LOCALE_MAP[language] ?? 'en-IN';
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const totals = useMemo(() => {
    const amount = savingsTargets.reduce((sum, target) => sum + target.amount, 0);
    return {
      count: savingsTargets.length,
      amount,
    };
  }, [savingsTargets]);

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString(localeCode, { minimumFractionDigits: 0 })}`;

  const formatDate = (value: string | number) =>
    new Date(value).toLocaleDateString(localeCode, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const getRemainingLabel = (targetDate: string) => {
    const dueDate = new Date(targetDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffMs = dueDate.getTime() - today.getTime();
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    if (days > 0) {
      return t('savings.remainingDays', { count: days });
    }
    return t('savings.overdue');
  };

  const closeStatusModal = () => {
    setStatusModal({ visible: false, type: 'custom' });
  };

  const handleAdd = () => {
    router.push('/(tabs)/addSavingsTarget');
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: '/(tabs)/addSavingsTarget',
      params: { id },
    });
  };

  const handleDelete = (target: SavingsTarget) => {
    setConfirmModal({ visible: true, target });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ visible: false });
  };

  const handleConfirmDelete = async () => {
    if (!confirmModal.target) {
      setConfirmModal({ visible: false });
      return;
    }

    const target = confirmModal.target;
    setConfirmModal({ visible: false });

    if (target.notificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(target.notificationId);
      } catch (error) {
        console.warn('Failed to cancel savings reminder', error);
      }
    }

    dispatch(removeSavingsTarget(target.id));
    setStatusModal({
      visible: true,
      type: 'deleted',
      title: t('savings.actions.confirmDeleteTitle'),
      message: t('savings.actions.deleteSuccess'),
    });
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text 
              style={styles.headerTitle} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {t('savings.title')}
            </Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Plus size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>{t('savings.subtitle')}</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('savings.totalSaved')}</Text>
                <Text style={styles.summaryValue}>{totals.count}</Text>
              </View>
              <Text style={styles.summaryAmount}>{formatCurrency(totals.amount)}</Text>
            </View>

            {savingsTargets.length === 0 ? (
              <View style={styles.emptyState}>
                <Image
                  source={require('@/assets/images/piggy-bank.png')}
                  style={styles.emptyIcon}
                  resizeMode="contain"
                />
                <Text style={styles.emptyTitle}>{t('savings.emptyTitle')}</Text>
                <Text style={styles.emptyDescription}>{t('savings.emptyDescription')}</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {savingsTargets.map((target) => {
                  const reminderText = t('savings.reminderLabel', {
                    days: target.reminderGapDays,
                  });
                  const lastUpdated = t('savings.lastUpdated', {
                    relative: formatDate(target.lastUpdated),
                  });
                  const targetDate = t('savings.targetDate', {
                    date: formatDate(target.targetDate),
                  });
                  const remaining = getRemainingLabel(target.targetDate);

                  return (
                    <View key={target.id} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text 
                          style={styles.cardTitle} 
                          numberOfLines={2} 
                          ellipsizeMode="tail"
                        >
                          {target.purpose}
                        </Text>
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleEdit(target.id)}
                          >
                            <Pencil size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconButton, styles.deleteButton]}
                            onPress={() => handleDelete(target)}
                          >
                            <Trash2 size={18} color="#F87171" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.amountText}>{formatCurrency(target.amount)}</Text>
                        <Text style={styles.remainingText}>{remaining}</Text>
                      </View>
                      <View style={styles.cardMeta}>
                        <View style={styles.metaRow}>
                          <CalendarDays size={16} color="#A78BFA" />
                          <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                            {targetDate}
                          </Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Bell size={16} color="#FACC15" />
                          <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">
                            {reminderText}
                          </Text>
                        </View>
                        <Text style={styles.updatedText} numberOfLines={1} ellipsizeMode="tail">
                          {lastUpdated}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={{ height: 80 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      <ConfirmModal
        visible={confirmModal.visible}
        title={t('savings.actions.confirmDeleteTitle')}
        message={
          confirmModal.target
            ? t('savings.actions.confirmDeleteMessage', { name: confirmModal.target.purpose })
            : undefined
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatusModal}
      />
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    minWidth: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.35)',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryAmount: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    marginBottom: 16,
    tintColor: '#FFFFFF',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    paddingRight: 12,
    minWidth: 0,
    flexShrink: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.18)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(250, 204, 21, 0.9)',
  },
  cardMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  metaText: {
    fontSize: 13,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  updatedText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default SavingsList;


