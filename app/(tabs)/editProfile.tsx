import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';

import StatusModal, { StatusType } from '@/components/ui/StatusModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/authSlice';
import { useTranslation } from '@/locale/LocaleProvider';

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dob: string;
};

const EditProfile = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const user = useAppSelector((state) => state.auth.user);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    gender: user?.gender ?? 'prefer_not_to_say',
    dob: user?.dob ?? '',
  });

  const [statusModal, setStatusModal] = useState<{ visible: boolean; type: StatusType; message: string }>({
    visible: false,
    type: 'updated',
    message: '',
  });
  const [dobModalVisible, setDobModalVisible] = useState(false);
  const [selectedDob, setSelectedDob] = useState<Date | null>(() => {
    if (!user?.dob) {
      return null;
    }
    const parsed = new Date(user.dob);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = selectedDob ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const weekdays = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  useEffect(() => {
    setProfileForm({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      gender: user?.gender ?? 'prefer_not_to_say',
      dob: user?.dob ?? '',
    });
    if (user?.dob) {
      const parsed = new Date(user.dob);
      setSelectedDob(Number.isNaN(parsed.getTime()) ? null : parsed);
      if (!Number.isNaN(parsed.getTime())) {
        setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      }
    } else {
      setSelectedDob(null);
      setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
  }, [today, user?.name, user?.email, user?.phone, user?.gender, user?.dob]);

  const hasChanges = useMemo(() => {
    return (
      profileForm.name !== (user?.name ?? '') ||
      profileForm.email !== (user?.email ?? '') ||
      profileForm.phone !== (user?.phone ?? '') ||
      profileForm.gender !== (user?.gender ?? 'prefer_not_to_say') ||
      profileForm.dob !== (user?.dob ?? '')
    );
  }, [profileForm, user?.name, user?.email, user?.phone, user?.gender, user?.dob]);

  const isValid = useMemo(() => {
    const hasName = profileForm.name.trim().length > 0;
    const hasEmail = profileForm.email.trim().length > 0;
    return hasName && hasEmail;
  }, [profileForm.name, profileForm.email]);

  const canSave = isValid && hasChanges;

  const handleSaveProfile = () => {
    if (!canSave) {
      return;
    }
    dispatch(updateProfile(profileForm));
    setStatusModal({
      visible: true,
      type: 'updated',
      message: t('profile.saveSuccess'),
    });
  };

  const formattedDob = useMemo(() => {
    if (!selectedDob) {
      return t('profile.dobPlaceholder');
    }
    return selectedDob.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [selectedDob, t]);

  const openDobCalendar = () => {
    const base = selectedDob ?? today;
    setCalendarMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setDobModalVisible(true);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCalendarMonth((current) => {
      const monthDelta = direction === 'next' ? 1 : -1;
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + monthDelta, 1);
      return nextMonth;
    });
  };

  const isNextMonthDisabled = useMemo(() => {
    return (
      calendarMonth.getFullYear() === today.getFullYear() &&
      calendarMonth.getMonth() === today.getMonth()
    );
  }, [calendarMonth, today]);

  const handleSelectDob = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    if (normalized > today) {
      return;
    }

    setSelectedDob(normalized);
    setProfileForm((prev) => ({
      ...prev,
      dob: normalized.toISOString().split('T')[0],
    }));
    setDobModalVisible(false);
  };

  const renderCalendarCells = () => {
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

      const isDisabled = date > today;
      const isSelected = selectedDob !== null && selectedDob.getTime() === date.getTime();

      cells.push(
        <TouchableOpacity
          key={date.toISOString()}
          style={[
            styles.calendarDayButton,
            isSelected && styles.calendarDaySelected,
            isDisabled && styles.calendarDayDisabled,
          ]}
          onPress={() => !isDisabled && handleSelectDob(date)}
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
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#6B46C1', '#4C2F7C', '#2D1B4E', '#1a0b2e']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']} >
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBarButton} onPress={() => router.back()} activeOpacity={0.7}>
              <ChevronLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>{t('profile.editProfile')}</Text>
            <TouchableOpacity
              style={[styles.topBarButton, !canSave && styles.topBarButtonDisabled]}
              onPress={handleSaveProfile}
              activeOpacity={canSave ? 0.8 : 1}
              disabled={!canSave}
            >
              <Check size={18} color="rgba(255,255,255,0.95)" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.formCard}>
                <Text style={styles.helperText}>{t('profile.editSubtitle')}</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('profile.name')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('profile.namePlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={profileForm.name}
                    onChangeText={(value) => setProfileForm((prev) => ({ ...prev, name: value }))}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('profile.email')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('profile.emailPlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={profileForm.email}
                    onChangeText={(value) => setProfileForm((prev) => ({ ...prev, email: value }))}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('profile.phone')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('profile.phonePlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="phone-pad"
                    value={profileForm.phone}
                    onChangeText={(value) => setProfileForm((prev) => ({ ...prev, phone: value }))}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('profile.gender')}</Text>
                  <View style={styles.genderRow}>
                    {[
                      { value: 'male', label: t('profile.genderMale') },
                      { value: 'female', label: t('profile.genderFemale') },
                      { value: 'other', label: t('profile.genderOther') },
                      { value: 'prefer_not_to_say', label: t('profile.genderPreferNot') },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.genderChip,
                          profileForm.gender === option.value && styles.genderChipActive,
                        ]}
                        onPress={() => setProfileForm((prev) => ({ ...prev, gender: option.value as ProfileFormState['gender'] }))}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.genderChipText,
                            profileForm.gender === option.value && styles.genderChipTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t('profile.dob')}</Text>
                  <TouchableOpacity
                    style={styles.dateInputButton}
                    onPress={openDobCalendar}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dateInputText,
                        !selectedDob && styles.dateInputPlaceholder,
                      ]}
                    >
                      {formattedDob}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                  onPress={handleSaveProfile}
                  activeOpacity={canSave ? 0.85 : 1}
                  disabled={!canSave}
                >
                  <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        message={statusModal.message}
        onClose={() => {
          setStatusModal((prev) => ({ ...prev, visible: false }));
          router.back();
        }}
      />

      <Modal
        transparent
        animationType="fade"
        visible={dobModalVisible}
        onRequestClose={() => setDobModalVisible(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                style={styles.calendarNavButton}
                onPress={() => handleMonthChange('prev')}
                activeOpacity={0.7}
              >
                <Text style={styles.calendarNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>
                {calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                style={[styles.calendarNavButton, isNextMonthDisabled && styles.calendarNavButtonDisabled]}
                onPress={() => !isNextMonthDisabled && handleMonthChange('next')}
                activeOpacity={isNextMonthDisabled ? 1 : 0.7}
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

            <View style={styles.calendarDaysGrid}>{renderCalendarCells()}</View>

            <View style={styles.calendarFooter}>
              <TouchableOpacity
                style={styles.calendarCancelButton}
                onPress={() => setDobModalVisible(false)}
              >
                <Text style={styles.calendarCancelText}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topBarButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarButtonDisabled: {
    opacity: 0.4,
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    gap: 16,
  },
  helperText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  dateInputButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  dateInputText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateInputPlaceholder: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  genderChipActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  genderChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  genderChipTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  calendarContainer: {
    width: '100%',
    backgroundColor: '#1F1B2E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
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
    backgroundColor: 'rgba(124,58,237,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavButtonDisabled: {
    opacity: 0.4,
  },
  calendarNavText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: 'rgba(255,255,255,0.6)',
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
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  calendarDaySelected: {
    backgroundColor: '#7C3AED',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  calendarDayDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    color: 'rgba(255,255,255,0.3)',
  },
  calendarDayPlaceholder: {
    width: 40,
    height: 40,
  },
  calendarFooter: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
  calendarCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  calendarCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
});

export default EditProfile;

