import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft, DollarSign } from 'lucide-react-native';
import { useAppDispatch } from '@/store/hooks';
import { addLoan, Loan, EMI } from '@/store/slices/loanSlice';
import { addNotification } from '@/store/slices/notificationSlice';

const AddLoan = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [lenderName, setLenderName] = useState('');
  const [loanType, setLoanType] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [calculatedEMI, setCalculatedEMI] = useState<number>(0);

  const loanTypes = ['Personal', 'Home', 'Car', 'Education', 'Business', 'Other'];

  // Calculate EMI when values change
  useEffect(() => {
    if (principalAmount && interestRate && tenureMonths) {
      const P = parseFloat(principalAmount);
      const r = parseFloat(interestRate) / (12 * 100); // Monthly interest rate
      const n = parseInt(tenureMonths);
      
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

  const handleAddLoan = () => {
    if (!lenderName.trim()) {
      Alert.alert('Error', 'Please enter lender name');
      return;
    }

    if (!loanType) {
      Alert.alert('Error', 'Please select loan type');
      return;
    }

    if (!principalAmount || parseFloat(principalAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid loan amount');
      return;
    }

    if (!interestRate || parseFloat(interestRate) < 0) {
      Alert.alert('Error', 'Please enter a valid interest rate');
      return;
    }

    if (!tenureMonths || parseInt(tenureMonths) <= 0) {
      Alert.alert('Error', 'Please enter a valid tenure');
      return;
    }

    const principal = parseFloat(principalAmount);
    const tenure = parseInt(tenureMonths);
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
      title: 'Loan Added',
      message: `${loanType} loan from ${lenderName} - ₹${principal.toLocaleString('en-IN')} added`,
      type: 'success' as const,
      read: false,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit',
        minute: '2-digit'
      }),
    };

    dispatch(addNotification(notification));

    Alert.alert(
      'Success', 
      'Loan added successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
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
            <Text style={styles.headerTitle}>Add Loan</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Lender Name */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Lender Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., HDFC Bank, ABC Finance"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={lenderName}
                onChangeText={setLenderName}
              />
            </View>

            {/* Loan Type */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Loan Type</Text>
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
              </View>
            </View>

            {/* Principal Amount */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Loan Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="numeric"
                  value={principalAmount}
                  onChangeText={setPrincipalAmount}
                />
              </View>
            </View>

            {/* Interest Rate and Tenure */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputSection, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Interest Rate (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="numeric"
                  value={interestRate}
                  onChangeText={setInterestRate}
                />
              </View>

              <View style={[styles.inputSection, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Tenure (Months)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  keyboardType="numeric"
                  value={tenureMonths}
                  onChangeText={setTenureMonths}
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
                  <Text style={styles.emiLabel}>Monthly EMI</Text>
                  <Text style={styles.emiAmount}>
                    ₹{calculatedEMI.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.totalDetails}>
                  <Text style={styles.totalLabel}>Total Payment</Text>
                  <Text style={styles.totalAmount}>
                    ₹{(calculatedEMI * parseInt(tenureMonths || '0')).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            {/* Description */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Add notes about this loan..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Add Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddLoan}
            >
              <Text style={styles.addButtonText}>Add Loan</Text>
            </TouchableOpacity>

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
  addButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddLoan;

