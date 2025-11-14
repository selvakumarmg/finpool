import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, DollarSign, Check, PlusCircle, X } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addLoan, Loan, EMI } from '@/store/slices/loanSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { addLoanType, defaultLoanTypes } from '@/store/slices/settingsSlice';
import { useTranslation } from '@/locale/LocaleProvider';
import StatusModal from '@/components/ui/StatusModal';

const AddLoan = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const loanTypesFromStore = useAppSelector((state) => state.settings.loanTypes);
  const loanTypes = loanTypesFromStore && loanTypesFromStore.length > 0 ? loanTypesFromStore : defaultLoanTypes;
  
  const [lenderName, setLenderName] = useState('');
  const [loanType, setLoanType] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const getToday = () => new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(getToday());
  const [description, setDescription] = useState('');
  const [calculatedEMI, setCalculatedEMI] = useState<number>(0);
  const [isLoanTypeModalVisible, setIsLoanTypeModalVisible] = useState(false);
  const [newLoanType, setNewLoanType] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  // Calculate EMI when values change
  useEffect(() => {
    if (principalAmount && interestRate && tenureMonths) {
      const P = parseFloat(principalAmount);
      const r = parseFloat(interestRate) / (12 * 100); // Monthly interest rate
      const n = parseFloat(tenureMonths);
      
      if (P > 0 && r >= 0 && n > 0) {
        let emi: number;
        if (r === 0) {
          // No interest case
          emi = P / n;
        } else {
          // EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1)
          const numerator = P * r * Math.pow(1 + r, n);
          const denominator = Math.pow(1 + r, n) - 1;
          emi = numerator / denominator;
        }
        setCalculatedEMI(Math.round(emi));
      } else {
        setCalculatedEMI(0);
      }
    } else {
      setCalculatedEMI(0);
    }
  }, [principalAmount, interestRate, tenureMonths]);

  useEffect(() => {
    if (!loanType && loanTypes.length > 0) {
      setLoanType(loanTypes[0]);
    }
  }, [loanTypes, loanType]);

  const isFormValid = useMemo(() => {
    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate);
    const tenure = parseFloat(tenureMonths);
    return (
      lenderName.trim().length > 0 &&
      !!loanType &&
      Number.isFinite(principal) &&
      principal > 0 &&
      Number.isFinite(rate) &&
      rate >= 0 &&
      Number.isFinite(tenure) &&
      tenure > 0
    );
  }, [lenderName, loanType, principalAmount, interestRate, tenureMonths]);

  const resetForm = () => {
    setLenderName('');
    setLoanType(loanTypes[0] ?? '');
    setPrincipalAmount('');
    setInterestRate('');
    setTenureMonths('');
    setStartDate(getToday());
    setDescription('');
    setCalculatedEMI(0);
  };

  const handleAddLoan = () => {
    if (!lenderName.trim()) {
      Alert.alert(t('loans.addTitle'), t('loans.validation.lenderRequired'));
      return;
    }

    if (!loanType) {
      Alert.alert(t('loans.addTitle'), t('loans.validation.typeRequired'));
      return;
    }

    if (!principalAmount || parseFloat(principalAmount) <= 0) {
      Alert.alert(t('loans.addTitle'), t('loans.validation.amountRequired'));
      return;
    }

    if (!interestRate || parseFloat(interestRate) < 0) {
      Alert.alert(t('loans.addTitle'), t('loans.validation.rateRequired'));
      return;
    }

    if (!tenureMonths || parseFloat(tenureMonths) <= 0) {
      Alert.alert(t('loans.addTitle'), t('loans.validation.tenureRequired'));
      return;
    }

    const principal = parseFloat(principalAmount);
    const tenure = Math.max(1, Math.round(parseFloat(tenureMonths)));
    const totalAmount = calculatedEMI * tenure;

    // Generate EMI schedule
    const emis: EMI[] = [];
    const loanStartDate = new Date(startDate);
    
    for (let i = 1; i <= tenure; i++) {
      const dueDate = new Date(loanStartDate);
      dueDate.setMonth(loanStartDate.getMonth() + i);
      
      emis.push({
        month: i,
        amount: calculatedEMI,
        dueDate: dueDate.toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        }),
        isPaid: false,
      });
    }

    const loan: Loan = {
      id: Date.now().toString(),
      lenderName: lenderName.trim(),
      loanType,
      principalAmount: principal,
      interestRate: parseFloat(interestRate),
      tenureMonths: tenure,
      emiAmount: calculatedEMI,
      startDate: new Date(startDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      remainingAmount: totalAmount,
      paidAmount: 0,
      emis,
      status: 'active',
      description: description.trim(),
      timestamp: Date.now(),
    };

    dispatch(addLoan(loan));

    // Add notification
    const notification = {
      id: Date.now().toString(),
      title: t('loans.notificationTitle'),
      message: t('loans.notificationMessage', {
        type: loanType,
        lender: lenderName.trim(),
        amount: principal.toLocaleString('en-IN'),
      }),
      type: 'success' as const,
      read: false,
      timestamp: Date.now(),
      date: new Date().toLocaleString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    dispatch(addNotification(notification));

    resetForm();

    setStatusModalVisible(true);
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
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('loans.addTitle')}</Text>
            <TouchableOpacity
              style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
              onPress={handleAddLoan}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Check size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.inputSection}>
              <Text style={styles.label}>{t('loans.lenderName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('loans.lenderPlaceholder')}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={lenderName}
                onChangeText={setLenderName}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>{t('loans.loanType')}</Text>
              <View style={styles.loanTypesGrid}>
                {loanTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      loanType === type && styles.typeChipActive
                    ]}
                    onPress={() => setLoanType(type)}
                  >
                    <Text style={[
                      styles.typeChipText,
                      loanType === type && styles.typeChipTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.typeChip, styles.typeChipAdd]}
                  onPress={() => {
                    setNewLoanType('');
                    setIsLoanTypeModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <PlusCircle size={18} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>{t('loans.loanAmount')}</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="decimal-pad"
                  value={principalAmount}
                  onChangeText={(text) =>
                    setPrincipalAmount(text.replace(/[^0-9.]/g, ''))
                  }
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputSection, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>{t('loans.interestRate')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="decimal-pad"
                  value={interestRate}
                  onChangeText={(text) =>
                    setInterestRate(text.replace(/[^0-9.]/g, ''))
                  }
                />
              </View>

              <View style={[styles.inputSection, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>{t('loans.tenureMonths')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="decimal-pad"
                  value={tenureMonths}
                  onChangeText={(text) =>
                    setTenureMonths(text.replace(/[^0-9.]/g, ''))
                  }
                />
              </View>
            </View>

            {/* Calculated EMI Display */}
            {calculatedEMI > 0 && (
              <View style={styles.emiCard}>
                <View style={styles.emiIconContainer}>
                  <DollarSign size={24} color="#10B981" />
                </View>
                <View style={styles.emiDetails}>
                  <Text style={styles.emiLabel}>{t('loans.emiLabel')}</Text>
                  <Text style={styles.emiAmount}>
                    ₹{calculatedEMI.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.totalDetails}>
                  <Text style={styles.totalLabel}>{t('loans.totalPayment')}</Text>
                  <Text style={styles.totalAmount}>
                    ₹{(calculatedEMI * parseInt(tenureMonths || '0')).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.inputSection}>
              <Text style={styles.label}>{t('loans.description')}</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder={t('loans.descriptionPlaceholder')}
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
            {/* Bottom Padding */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <Modal
        transparent
        visible={isLoanTypeModalVisible}
        animationType="fade"
        onRequestClose={() => setIsLoanTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('loans.addLoanType')}</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setIsLoanTypeModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder={t('loans.addLoanType')}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={newLoanType}
              onChangeText={setNewLoanType}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                const normalized = newLoanType.trim();
                if (!normalized) {
                  Alert.alert(t('loans.addLoanType'), t('loans.validation.typeRequired'));
                  return;
                }
                dispatch(addLoanType(normalized));
                setLoanType(normalized);
                setNewLoanType('');
                setIsLoanTypeModalVisible(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusModal
        visible={statusModalVisible}
        type="created"
        message={t('loans.success')}
        onClose={() => {
          setStatusModalVisible(false);
          router.back();
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
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loanTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeChipActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    borderColor: '#7C3AED',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  typeChipAdd: {
    width: 56,
    height: 48,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderColor: 'rgba(124, 58, 237, 0.5)',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingVertical: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  emiCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emiIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emiDetails: {
    flex: 1,
  },
  emiLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  emiAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  totalDetails: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 100,
    textAlignVertical: 'top',
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
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  modalButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddLoan;

