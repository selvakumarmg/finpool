import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Check, ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StatusModal, { StatusType } from '@/components/ui/StatusModal';
import { SupportedLanguage } from '@/config/appConfig';
import { useLocale, useTranslation } from '@/locale/LocaleProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';
import { addSavingsTarget, SavingsReminderGap, updateSavingsTarget } from '@/store/slices/savingsSlice';
import { useResponsive } from '@/hooks/useResponsive';

const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ka: 'kn-IN',
};

type ReminderOption = {
  value: SavingsReminderGap;
  label: string;
  description: string;
};

const AddSavingsTarget = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ id?: string }>();
  const { language } = useLocale();
  const t = useTranslation();
  const { getFontSize, getSpacing } = useResponsive();
  const localeCode = LANGUAGE_LOCALE_MAP[language] ?? 'en-IN';
  const targetId = typeof params.id === 'string' ? params.id : undefined;
  const existingTarget = useAppSelector((state) =>
    targetId ? state.savings.targets.find((target) => target.id === targetId) : undefined
  );
  const isEditing = Boolean(targetId);
  const notFoundAlertShown = useRef(false);

  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [reminderGap, setReminderGap] = useState<SavingsReminderGap>(1);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const headerTitle = isEditing ? t('savings.form.editTitle') : t('savings.form.addTitle');
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: StatusType;
    title?: string;
    message?: string;
    onComplete?: () => void;
    confirmLabel?: string;
  }>({
    visible: false,
    type: 'custom',
  });

  const reminderOptions = useMemo<ReminderOption[]>(
    () => [
      {
        value: 1,
        label: t('savings.form.reminderOptions.daily'),
        description: t('savings.form.reminderOptions.dailyDescription'),
      },
      {
        value: 2,
        label: t('savings.form.reminderOptions.twoDays'),
        description: t('savings.form.reminderOptions.twoDaysDescription'),
      },
    ],
    [t],
  );

  const closeStatusModal = () => {
    setStatusModal((prev) => {
      prev.onComplete?.();
      return { visible: false, type: 'custom' };
    });
  };

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const weekdays = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat(localeCode, { weekday: 'short' });
      const reference = Date.UTC(2023, 0, 1); // Sunday
      return Array.from({ length: 7 }, (_, index) =>
        formatter.format(new Date(reference + index * 24 * 60 * 60 * 1000))
      );
    } catch {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }
  }, [localeCode]);

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
    if (!isEditing || !existingTarget) {
      return;
    }

    setPurpose(existingTarget.purpose);
    setAmount(existingTarget.amount.toString());
    setReminderGap(existingTarget.reminderGapDays);

    const parsed = new Date(existingTarget.targetDate);
    if (!Number.isNaN(parsed.getTime())) {
      setSelectedDate(parsed);
      setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    }
  }, [existingTarget, isEditing]);

  useEffect(() => {
    if (isEditing && !existingTarget && !notFoundAlertShown.current) {
      notFoundAlertShown.current = true;
      setStatusModal({
        visible: true,
        type: 'failed',
        title: t('savings.form.notFoundTitle'),
        message: t('savings.form.notFoundMessage'),
        confirmLabel: t('common.ok'),
        onComplete: () => router.back(),
      });
    }
  }, [existingTarget, isEditing, router, t]);

  const resetForm = () => {
    setPurpose('');
    setAmount('');
    setReminderGap(1);
    setSelectedDate(null);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const openCalendar = () => {
    const base = selectedDate ?? today;
    setCalendarMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setIsCalendarVisible(true);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const isPrevMonthDisabled = useMemo(() => {
    const firstOfCurrentMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const firstOfTodayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstOfCurrentMonth <= firstOfTodayMonth;
  }, [calendarMonth, today]);

  const handleSelectDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    if (normalized <= today) {
      return;
    }

    setSelectedDate(normalized);
    setIsCalendarVisible(false);
  };

  const formatSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return t('savings.form.targetDatePlaceholder');
    }
    return selectedDate.toLocaleDateString(localeCode, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [localeCode, selectedDate, t]);

  const handleSave = async () => {
    const trimmedPurpose = purpose.trim();
    if (!trimmedPurpose) {
      setStatusModal({
        visible: true,
        type: 'failed',
        title: t('common.failure'),
        message: t('savings.form.validation.missingPurpose'),
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatusModal({
        visible: true,
        type: 'failed',
        title: t('common.failure'),
        message: t('savings.form.validation.invalidAmount'),
      });
      return;
    }

    if (!selectedDate) {
      setStatusModal({
        visible: true,
        type: 'failed',
        title: t('common.failure'),
        message: t('savings.form.validation.missingDate'),
      });
      return;
    }

    const parsedDate = new Date(selectedDate);
    const now = Date.now();
    const reminderSeconds = reminderGap * 24 * 60 * 60;

    setIsScheduling(true);
    try {
      if (isEditing && existingTarget?.notificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(existingTarget.notificationId);
        } catch (cancelError) {
          console.warn('Failed to cancel previous reminder', cancelError);
        }
      }

      let scheduledNotificationId: string | undefined = existingTarget?.notificationId;

      try {
        const trigger: Notifications.TimeIntervalTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: reminderSeconds,
          repeats: false,
          channelId: Platform.OS === 'android' ? 'savings-reminders' : undefined,
        };

        scheduledNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: t('savings.form.reminderNotificationTitle'),
            body: t('savings.form.reminderNotificationBody', { name: trimmedPurpose }),
            sound: 'default',
          },
          trigger,
        });
      } catch (notificationError) {
        console.warn('Failed to schedule reminder', notificationError);
      }

      const baseTarget = {
        id: isEditing && existingTarget ? existingTarget.id : now.toString(),
        purpose: trimmedPurpose,
        amount: parsedAmount,
        targetDate: parsedDate.toISOString(),
        reminderGapDays: reminderGap,
        lastUpdated: isEditing && existingTarget ? existingTarget.lastUpdated : now,
        notificationId: scheduledNotificationId,
        lastReminderScheduledAt: now,
      };

      if (isEditing && existingTarget) {
        dispatch(updateSavingsTarget(baseTarget));
      } else {
        dispatch(addSavingsTarget(baseTarget));
      }

      const formattedAmount = parsedAmount.toLocaleString(localeCode, {
        minimumFractionDigits: 0,
      });
      const formattedTargetDate = parsedDate.toLocaleDateString(localeCode, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      dispatch(
        addNotification({
          id: `${now}-savings`,
          title: isEditing
            ? t('savings.form.notificationUpdateTitle')
            : t('savings.form.notificationCreateTitle'),
          message: isEditing
            ? t('savings.form.notificationUpdateMessage', { name: trimmedPurpose })
            : t('savings.form.notificationCreateMessage', {
                name: trimmedPurpose,
                amount: formattedAmount,
                date: formattedTargetDate,
              }),
          type: 'success',
          read: false,
          timestamp: now,
          date: new Date().toLocaleString(localeCode, {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }),
      );

      const successTitle = isEditing
        ? t('savings.form.successUpdateTitle')
        : t('savings.form.successCreateTitle');
      const successMessage = isEditing
        ? t('savings.form.successUpdateMessage')
        : t('savings.form.successCreateMessage');

      setStatusModal({
        visible: true,
        type: isEditing ? 'updated' : 'created',
        title: successTitle,
        message: successMessage,
        confirmLabel: t('common.ok'),
        onComplete: () => {
          if (!isEditing) {
            resetForm();
          }
          router.back();
        },
      });
    } catch (error) {
      console.error(error);
      setStatusModal({
        visible: true,
        type: 'failed',
        title: t('savings.form.errorTitle'),
        message: t('savings.form.errorMessage'),
        confirmLabel: t('common.ok'),
      });
    } finally {
      setIsScheduling(false);
    }
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text 
              style={styles.headerTitle} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {headerTitle}
            </Text>
            <TouchableOpacity
              style={[styles.saveButton, isScheduling && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isScheduling}
              activeOpacity={0.7}
            >
              <Check size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('savings.form.savingPurpose')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('savings.form.purposePlaceholder')}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={purpose}
                onChangeText={setPurpose}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('savings.form.amount')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('savings.form.amountPlaceholder')}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('savings.form.targetDate')}</Text>
              <TouchableOpacity
                style={styles.dateInputButton}
                onPress={openCalendar}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dateInputText,
                    !selectedDate && styles.dateInputPlaceholder,
                  ]}
                >
                  {formatSelectedDate}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>{t('savings.form.dateHint')}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('savings.form.reminderFrequency')}</Text>
              <View style={styles.reminderOptions}>
                {reminderOptions.map((option) => {
                  const selected = option.value === reminderGap;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.reminderCard, selected && styles.reminderCardActive]}
                      onPress={() => setReminderGap(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.reminderLabel, selected && styles.reminderLabelActive]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.reminderDescription, selected && styles.reminderDescriptionActive]}>
                        {option.description}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      <Modal
        transparent
        animationType="fade"
        visible={isCalendarVisible}
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={[
                  styles.calendarNavButton,
                  isPrevMonthDisabled && styles.calendarNavButtonDisabled,
                ]}
                onPress={() => !isPrevMonthDisabled && handleMonthChange('prev')}
                activeOpacity={isPrevMonthDisabled ? 1 : 0.7}
              >
                <Text style={styles.calendarNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>
                {calendarMonth.toLocaleDateString(localeCode, { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => handleMonthChange('next')}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarNavText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekRow}>
              {weekdays.map((day) => (
                <Text key={day} style={styles.calendarWeekday}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarDaysGrid}>
              {(() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const startWeekday = firstDay.getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const totalCells = Math.ceil((startWeekday + daysInMonth) / 7) * 7;
                const cells = [];

                for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
                  const dayNumber = cellIndex - startWeekday + 1;
                  if (cellIndex < startWeekday || dayNumber > daysInMonth) {
                    cells.push(<View key={`empty-${cellIndex}`} style={styles.calendarDayPlaceholder} />);
                    continue;
                  }

                  const date = new Date(year, month, dayNumber);
                  date.setHours(0, 0, 0, 0);

                  const isDisabled = date <= today;
                  const isSelected =
                    selectedDate !== null && selectedDate.getTime() === date.getTime();

                  cells.push(
                    <TouchableOpacity
                      key={date.toISOString()}
                      style={[
                        styles.calendarDayButton,
                        isSelected && styles.calendarDaySelected,
                        isDisabled && styles.calendarDayDisabled,
                      ]}
                      onPress={() => !isDisabled && handleSelectDate(date)}
                      activeOpacity={isDisabled ? 1 : 0.7}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          isSelected && styles.calendarDayTextSelected,
                          isDisabled && styles.calendarDayTextDisabled,
                        ]}
                      >
                        {dayNumber}
                      </Text>
                    </TouchableOpacity>,
                  );
                }

                return cells;
              })()}
            </View>

            <View style={styles.calendarFooter}>
              <TouchableOpacity
                style={styles.calendarCancelButton}
                onPress={() => setIsCalendarVisible(false)}
              >
                <Text style={styles.calendarCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={closeStatusModal}
        confirmLabel={statusModal.confirmLabel}
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
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 24,
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
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  dateInputButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  dateInputText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateInputPlaceholder: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
  reminderOptions: {
    gap: 12,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reminderCardActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderColor: 'rgba(124, 58, 237, 0.6)',
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  reminderLabelActive: {
    color: '#FFFFFF',
  },
  reminderDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  reminderDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarContainer: {
    width: '100%',
    backgroundColor: 'rgba(31, 27, 46, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavButtonDisabled: {
    opacity: 0.4,
  },
  calendarNavText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarWeekday: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  calendarDayButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  calendarDaySelected: {
    backgroundColor: '#7C3AED',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  calendarDayDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
  },
  calendarDayTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  calendarDayPlaceholder: {
    width: 40,
    height: 40,
  },
  calendarFooter: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  calendarCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  calendarCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default AddSavingsTarget;


