import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Linking, Animated, Easing, Modal } from 'react-native';
import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { User, LogOut, ChevronLeft, Crown, ArrowRightCircle, Pencil } from 'lucide-react-native';
import Constants from 'expo-constants';
import Svg, { Circle } from 'react-native-svg';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import StatusModal, { StatusType } from '@/components/ui/StatusModal';
import { useLocale } from '@/locale/LocaleProvider';
import { languageOptions } from '@/locale/translations';
import appConfig from '@/config/appConfig';
import { useTranslation } from '@/locale/LocaleProvider';

const Profile = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const { language, setLanguage } = useLocale();
  const user = useAppSelector((state) => state.auth.user);
  const { userPlan, premiumPriceMonthly, featureFlags } = useAppSelector((state) => state.settings);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [monthlyReportEnabled, setMonthlyReportEnabled] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [statusModal, setStatusModal] = useState<{ visible: boolean; type: StatusType; message: string }>({
    visible: false,
    type: 'updated',
    message: '',
  });
  const completionFields = useMemo(() => {
    const genderValue =
      user?.gender && user?.gender !== 'prefer_not_to_say' ? user.gender : '';
    return [
      user?.name ?? '',
      user?.email ?? '',
      user?.phone ?? '',
      genderValue ?? '',
      user?.dob ?? '',
    ];
  }, [user?.name, user?.email, user?.phone, user?.gender, user?.dob]);
  const completedCount = completionFields.filter(
    (value) => value && String(value).trim().length > 0
  ).length;
  const completionPercent =
    completionFields.length > 0
      ? Math.round((completedCount / completionFields.length) * 100)
      : 0;

  const handleLogout = () => {
    setStatusModal({
      visible: true,
      type: 'logout',
      message: t('modal.loggedOut'),
    });
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    setExportModalVisible(false);
    Alert.alert(t('profile.export'), `${format.toUpperCase()} export will be available soon.`);
  };

  const handleSelvaLink = () => {
    Linking.openURL('https://www.selvakumar.dev/');
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const currentLanguageLabel = languageOptions[language].label;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - completionPercent / 100);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#6B46C1', '#4C2F7C', '#2D1B4E', '#1a0b2e']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBarBack} onPress={() => router.back()} activeOpacity={0.7}>
              <ChevronLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>{t('profile.title')}</Text>
            <TouchableOpacity
              style={styles.topBarAction}
              onPress={() => router.push('/(tabs)/editProfile')}
              activeOpacity={0.8}
            >
              <Pencil size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={40} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || t('profile.name')}</Text>
                <Text style={styles.userEmail}>{user?.email || t('profile.email')}</Text>
                <View style={[styles.planBadge, userPlan === 'premium' ? styles.planBadgePremium : styles.planBadgeFree]}>
                  <Text style={styles.planBadgeText}>
                    {userPlan === 'premium' ? t('profile.planPremium') : t('profile.planFree')}
                  </Text>
                </View>
              </View>
            </View>



            <View style={styles.divider} />

            <View style={styles.optionList}>
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>{t('profile.notifications')}</Text>
                <IOSSwitch value={notificationEnabled} onValueChange={setNotificationEnabled} />
              </View>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setLanguageModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{t('profile.language')}</Text>
                <Text style={styles.optionValue}>{currentLanguageLabel}</Text>
              </TouchableOpacity>

              {featureFlags.enableExports && (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => setExportModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionLabel}>{t('profile.export')}</Text>
                  <Text style={styles.optionAction}>{t('profile.export')}</Text>
                </TouchableOpacity>
              )}

              <View style={[styles.optionRow,{borderBottomWidth: 0}]}>
                <Text style={styles.optionLabel}>{t('profile.monthlyReport')}</Text>
                <IOSSwitch value={monthlyReportEnabled} onValueChange={setMonthlyReportEnabled} />
              </View>
            </View>

            
            {userPlan === 'free' && featureFlags.enablePremiumUpsell && (
              <View style={styles.premiumCard}>
                <View style={styles.premiumHeader}>
                  <View style={styles.premiumIcon}>
                    <Crown size={20} color="#FACC15" />
                  </View>
                  <Text style={styles.premiumTitle}>{t('profile.goPremium')}</Text>
                </View>
                <Text style={styles.premiumDescription}>
                  {t('profile.premiumFeatures')}
                </Text>
                <View style={styles.premiumFooter}>
                  <Text style={styles.premiumPrice}>
                    {t('profile.premiumPrice', { amount: premiumPriceMonthly })}
                  </Text>
                  
                </View>
                <TouchableOpacity style={styles.premiumButton} activeOpacity={0.8}>
                    <ArrowRightCircle size={18} color="#FFFFFF" />
                    <Text style={styles.premiumButtonText}>{t('profile.goPremium')}</Text>
                  </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#EF4444" />
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSelvaLink} activeOpacity={0.7}>
              <Text style={styles.footerLink}>{t('profile.developedBy')}</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>
              {t('profile.appVersion')}: {appVersion}
            </Text>

            <View style={{ height: 100 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <Modal
        transparent
        animationType="fade"
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.languageSheetTitle')}</Text>
            {Object.values(languageOptions).map((option) => (
              <TouchableOpacity
                key={option.code}
                style={[
                  styles.languageOption,
                  language === option.code && styles.languageOptionActive,
                ]}
                onPress={() => {
                  setLanguage(option.code);
                  setLanguageModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    language === option.code && styles.languageOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.exportSheetTitle')}</Text>
            <TouchableOpacity
              style={styles.languageOption}
              onPress={() => handleExport('pdf')}
            >
              <Text style={styles.languageOptionText}>{t('profile.exportPdf')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageOption}
              onPress={() => handleExport('csv')}
            >
              <Text style={styles.languageOptionText}>{t('profile.exportCsv')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        message={statusModal.message}
        onClose={() => {
          const shouldLogout = statusModal.type === 'logout';
          setStatusModal((prev) => ({ ...prev, visible: false }));
          if (shouldLogout) {
            dispatch(logout());
            router.replace('/auth/login');
          }
        }}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topBarBack: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarAction: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  profileCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  planBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  planBadgeFree: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  planBadgePremium: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    marginTop: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  optionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  optionAction: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footerLink: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 16,
  },
  switchTouchable: {
    width: 52,
    height: 32,
  },
  switchTrack: {
    flex: 1,
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  completionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
    alignItems: 'center',
  },
  completionChart: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  completionPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completionSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  completionHint: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  premiumCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
    marginBottom: 24,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(250,204,21,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
  premiumFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FACC15',
    marginVertical:15,
    textAlign:'center',
    alignContent:'center'
  },
  premiumButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent:'center'
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#1F1B2E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.4)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  languageOption: {
    paddingVertical: 12,
  },
  languageOptionActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  languageOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  languageOptionTextActive: {
    color: '#FFFFFF',
  },
});

export default Profile;

type IOSSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const IOSSwitch: React.FC<IOSSwitchProps> = ({ value, onValueChange }) => {
  const animatedValue = useMemo(() => new Animated.Value(value ? 1 : 0), []);

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.15)', '#7C3AED'],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onValueChange(!value)}
      style={styles.switchTouchable}
    >
      <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
        <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};
