import StatusModal from '@/components/ui/StatusModal';
import { useTranslation } from '@/locale/LocaleProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addNotification } from '@/store/slices/notificationSlice';
import { addTransactionCategory, defaultTransactionCategories } from '@/store/slices/settingsSlice';
import { addTransaction, Transaction } from '@/store/slices/transactionSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Banknote, ChevronLeft, CreditCard, Minus, Plus, PlusCircle, QrCode, Wallet, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ADD_CATEGORY_KEY = '__add__';

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
};

const AddTransaction = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslation();
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'account' | 'card' | 'upi'>('cash');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [lastTransactionType, setLastTransactionType] = useState<'income' | 'expense'>('income');

  const transactionCategories = useAppSelector(
    (state) => state.settings?.transactionCategories ?? defaultTransactionCategories
  );
  const { income, expense } = transactionCategories;

  const paymentModeOptions = useMemo(() => {
    if (activeTab === 'income') {
      return [
        { value: 'cash' as const, label: t('transactions.modeCash'), icon: Banknote, accent: '#10B981' },
        { value: 'account' as const, label: t('transactions.modeAccount'), icon: Wallet, accent: '#6366F1' },
      ];
    }
    return [
      { value: 'cash' as const, label: t('transactions.modeCash'), icon: Banknote, accent: '#10B981' },
      { value: 'account' as const, label: t('transactions.modeAccount'), icon: Wallet, accent: '#6366F1' },
      { value: 'card' as const, label: t('transactions.modeCard'), icon: CreditCard, accent: '#F97316' },
      { value: 'upi' as const, label: t('transactions.modeUpi'), icon: QrCode, accent: '#3B82F6' },
    ];
  }, [activeTab, t]);
  const categoryOptions = activeTab === 'income' ? income : expense;
  useEffect(() => {
    setCategory('');
    setPaymentMode(activeTab === 'income' ? 'cash' : 'cash');
  }, [activeTab]);

  useEffect(() => {
    const options = activeTab === 'income' ? income : expense;
    if (!category && options.length > 0) {
      setCategory(options[0]);
    }
  }, [income, expense, activeTab, category]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setPaymentMode('cash');
    setActiveTab('income');
  };


  const handleAddTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('transactions.addTitle'), t('transactions.validation.amountRequired'));
      return;
    }

    if (!category) {
      Alert.alert(t('transactions.addTitle'), t('transactions.validation.categoryRequired'));
      return;
    }

    const currentType = activeTab;
    const currentPaymentMode = paymentMode;

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: currentType,
      amount: parseFloat(amount),
      category,
      description: description || category,
      date: new Date().toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      timestamp: Date.now(),
      paymentMode: currentPaymentMode,
    };

    dispatch(addTransaction(transaction));

    const modeLabel =
      paymentModeOptions.find((mode) => mode.value === currentPaymentMode)?.label ?? currentPaymentMode;

    const notification = {
      id: Date.now().toString(),
      title:
        currentType === 'income'
          ? t('transactions.notificationTitleIncome')
          : t('transactions.notificationTitleExpense'),
      message: t('transactions.notificationMessage', {
        amount: parseFloat(amount).toLocaleString('en-IN'),
        category,
        mode: modeLabel,
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

    setLastTransactionType(currentType);
    resetForm();

    setStatusModalVisible(true);
  };

  const categoryRows = chunkArray([...categoryOptions, ADD_CATEGORY_KEY], 3);
  const paymentRows = chunkArray(paymentModeOptions, 3);

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
            <Text style={styles.headerTitle}>{t('transactions.addTitle')}</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'income' && [styles.activeTab, styles.incomeTab],
                ]}
                onPress={() => setActiveTab('income')}
              >
                <Plus
                  size={20}
                  color={activeTab === 'income' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                />
                <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
                  {t('transactions.income')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'expense' && [styles.activeTab, styles.expenseTab],
                ]}
                onPress={() => setActiveTab('expense')}
              >
                <Minus
                  size={20}
                  color={activeTab === 'expense' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}
                />
                <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
                  {t('transactions.expense')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.label}>{t('transactions.amount')}</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(value) => setAmount(value.replace(/[^0-9.]/g, ''))}
                />
              </View>
            </View>

            <View style={styles.categorySection}>
              <Text style={styles.label}>{t('transactions.category')}</Text>
              <View style={styles.categoriesTable}>
                {categoryRows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.categoryRow}>
                    {row.map((item, cellIndex) => {
                      if (item === ADD_CATEGORY_KEY) {
                        return (
                          <TouchableOpacity
                            key={`add-${rowIndex}-${cellIndex}`}
                            style={[styles.categoryCell, styles.categoryCellAdd]}
                            onPress={() => {
                              setNewCategoryName('');
                              setIsCategoryModalVisible(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <PlusCircle size={18} color="#7C3AED" />
                            <Text style={styles.categoryCellAddText}>{t('common.add')}</Text>
                          </TouchableOpacity>
                        );
                      }
                      const isSelected = category === item;
                      return (
                        <TouchableOpacity
                          key={item}
                          style={[
                            styles.categoryCell,
                            isSelected && styles.categoryCellActive,
                          ]}
                          onPress={() => setCategory(item)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.categoryCellText,
                              isSelected && styles.categoryCellTextActive,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {row.length < 3 &&
                      Array.from({ length: 3 - row.length }).map((_, index) => (
                        <View key={`spacer-${rowIndex}-${index}`} style={styles.categorySpacer} />
                      ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.label}>{t('transactions.paymentMode')}</Text>
              <View style={styles.categoriesTable}>
                {paymentRows.map((row, rowIndex) => (
                  <View key={`mode-row-${rowIndex}`} style={styles.categoryRow}>
                    {row.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = paymentMode === mode.value;
                      return (
                  <TouchableOpacity
                          key={mode.value}
                          onPress={() => setPaymentMode(mode.value)}
                    style={[
                            styles.categoryCell,
                            isSelected && { borderColor: mode.accent, backgroundColor: `${mode.accent}22` },
                    ]}
                          activeOpacity={0.85}
                  >
                          <View style={[styles.paymentIcon, { backgroundColor: `${mode.accent}33` }]}>
                            <Icon size={16} color={mode.accent} />
                          </View>
                          <Text style={[styles.categoryCellText, isSelected && { color: '#FFFFFF' }]}>
                            {mode.label}
                    </Text>
                  </TouchableOpacity>
                      );
                    })}
                    {row.length < 3 &&
                      Array.from({ length: 3 - row.length }).map((_, index) => (
                        <View key={`mode-spacer-${rowIndex}-${index}`} style={styles.categorySpacer} />
                      ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.label}>{t('transactions.description')}</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Add a note..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                activeTab === 'income' ? styles.addButtonIncome : styles.addButtonExpense
              ]}
              onPress={handleAddTransaction}
            >
              <Text style={styles.addButtonText}>
                {activeTab === 'income' ? t('transactions.addIncome') : t('transactions.addExpense')}
              </Text>
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <Modal
        transparent
        animationType="fade"
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('transactions.addCategory')}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setIsCategoryModalVisible(false)}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder={t('transactions.newCategoryPlaceholder')}
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                const trimmed = newCategoryName.trim();
                if (!trimmed) {
                  Alert.alert(t('transactions.addCategory'), t('transactions.newCategoryPlaceholder'));
                  return;
                }
                const normalized = trimmed.toLowerCase();
                const existing = categoryOptions.find((cat) => cat.toLowerCase() === normalized);
                if (existing) {
                  setCategory(existing);
                } else {
                  dispatch(addTransactionCategory({ type: activeTab, label: trimmed }));
                  setCategory(trimmed);
                }
                setNewCategoryName('');
                setIsCategoryModalVisible(false);
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
        message={
          lastTransactionType === 'income'
            ? t('transactions.successIncome')
            : t('transactions.successExpense')
        }
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  incomeTab: {
    backgroundColor: '#10B981',
  },
  expenseTab: {
    backgroundColor: '#EF4444',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  amountSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    paddingVertical: 16,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoriesTable: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryCell: {
    flex: 1,
    paddingVertical: 16,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCellActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  categoryCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  categoryCellTextActive: {
    color: '#FFFFFF',
  },
  categoryCellAdd: {
    borderStyle: 'dashed',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(124, 58, 237, 0.6)',
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  categoryCellAddText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  categorySpacer: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  paymentSection: {
    marginBottom: 32,
  },
  paymentModesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  paymentChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  paymentIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionSection: {
    marginBottom: 32,
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
  addButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonIncome: {
    backgroundColor: '#10B981',
  },
  addButtonExpense: {
    backgroundColor: '#EF4444',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
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

export default AddTransaction;

