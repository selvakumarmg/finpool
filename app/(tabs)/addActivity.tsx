import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';
import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, ChevronLeft, Plus, PlusCircle, ShoppingBag, X } from 'lucide-react-native';
import { useAppDispatch } from '@/store/hooks';
import { addActivity, Activity, ActivityPaymentMethod, ActivitySubitem } from '@/store/slices/activitySlice';
import { addNotification } from '@/store/slices/notificationSlice';

const AddActivity = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const defaultCategories = useMemo(() => ['Grocery Expense', 'Diet Planner', 'Shopping', 'Other'], []);
  const paymentMethodOptions = useMemo<{ value: ActivityPaymentMethod; label: string }[]>(() => [
    { value: 'cash', label: 'Cash' },
    { value: 'account', label: 'Account' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
  ], []);

  const [activityName, setActivityName] = useState('');
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [category, setCategory] = useState<string>(defaultCategories[0]);
  const [description, setDescription] = useState('');
  const [subitems, setSubitems] = useState<Omit<ActivitySubitem, 'id' | 'timestamp'>[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<ActivityPaymentMethod>('cash');
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Form for adding new subitem
  const [subitemName, setSubitemName] = useState('');
  const [subitemPrice, setSubitemPrice] = useState('');
  const [subitemQuantity, setSubitemQuantity] = useState('1');
  const [subitemUnit, setSubitemUnit] = useState('');

  const handleAddSubitem = () => {
    if (!subitemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!subitemPrice || parseFloat(subitemPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const newSubitem = {
      name: subitemName.trim(),
      price: parseFloat(subitemPrice),
      quantity: parseInt(subitemQuantity) || 1,
      unit: subitemUnit.trim() || undefined,
    };

    setSubitems([...subitems, newSubitem]);
    
    // Clear form
    setSubitemName('');
    setSubitemPrice('');
    setSubitemQuantity('1');
    setSubitemUnit('');
  };

  const handleRemoveSubitem = (index: number) => {
    setSubitems(subitems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return subitems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  const handleCreateCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    if (categories.some(cat => cat.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Notice', 'This category already exists');
      return;
    }

    setCategories(prev => [...prev, trimmed]);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddCategoryModalVisible(false);
  };

  const resetForm = () => {
    setActivityName('');
    setCategory(categories[0] ?? defaultCategories[0]);
    setDescription('');
    setSubitems([]);
    setPaymentMethod('cash');
    setSubitemName('');
    setSubitemPrice('');
    setSubitemQuantity('1');
    setSubitemUnit('');
    setIsAddCategoryModalVisible(false);
    setNewCategoryName('');
  };

  const handleSaveActivity = () => {
    if (!activityName.trim()) {
      Alert.alert('Error', 'Please enter activity name');
      return;
    }
    if (subitems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const totalAmount = calculateTotal();
    const timestamp = Date.now();

    const newActivity: Activity = {
      id: timestamp.toString(),
      name: activityName.trim(),
      category,
      description: description.trim() || undefined,
      subitems: subitems.map((item, index) => ({
        ...item,
        id: `${timestamp}-${index}`,
        timestamp: new Date().toISOString(),
      })),
      totalAmount,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      timestamp,
      paymentMethod,
    };

    dispatch(addActivity(newActivity));
    dispatch(addNotification({
      id: `${timestamp}-activity`,
      title: 'Activity Added',
      message: `${newActivity.name}: ₹${totalAmount.toLocaleString('en-IN')} (${subitems.length} items)`,
      type: 'success',
      read: false,
      timestamp,
      date: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    resetForm();

    Alert.alert(
      'Success',
      'Activity added successfully!',
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
            <Text style={styles.headerTitle}>Add Activity</Text>
            <TouchableOpacity
              style={styles.headerSaveButton}
              onPress={handleSaveActivity}
              activeOpacity={0.7}
            >
              <Check size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Activity Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Grocery Expense, Diet Planner"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={activityName}
                onChangeText={setActivityName}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Category</Text>
                <TouchableOpacity
                  style={styles.addCategoryButton}
                  onPress={() => setIsAddCategoryModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <PlusCircle size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.paymentMethodsRow}>
                {paymentMethodOptions.map((option) => {
                  const isSelected = paymentMethod === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.paymentChip,
                        isSelected && styles.paymentChipActive
                      ]}
                      onPress={() => setPaymentMethod(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.paymentChipText,
                        isSelected && styles.paymentChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Add a note about this activity"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            {/* Add Subitems Section */}
            <View style={styles.subitemsSection}>
              <Text style={styles.sectionTitle}>Add Items</Text>
              
              {/* Subitem Form */}
              <View style={styles.subitemForm}>
                <View style={styles.subitemRow}>
                  <View style={[styles.inputWrapper, { flex: 2 }]}>
                    <Text style={styles.smallLabel}>Item Name</Text>
                    <TextInput
                      style={styles.smallInput}
                      placeholder="e.g., Tomato, Eggs"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={subitemName}
                      onChangeText={setSubitemName}
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.smallLabel}>Price (₹)</Text>
                    <TextInput
                      style={styles.smallInput}
                      placeholder="0"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      keyboardType="numeric"
                      value={subitemPrice}
                      onChangeText={setSubitemPrice}
                    />
                  </View>
                </View>

                <View style={styles.subitemRow}>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.smallLabel}>Qty</Text>
                    <TextInput
                      style={styles.smallInput}
                      placeholder="1"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      keyboardType="numeric"
                      value={subitemQuantity}
                      onChangeText={setSubitemQuantity}
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Text style={styles.smallLabel}>Unit</Text>
                    <TextInput
                      style={styles.smallInput}
                      placeholder="kg, dz"
                      placeholderTextColor="rgba(255, 255, 255, 0.3)"
                      value={subitemUnit}
                      onChangeText={setSubitemUnit}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.addSubitemButton}
                    onPress={handleAddSubitem}
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Subitems List */}
            {subitems.length > 0 && (
              <View style={styles.subitemsList}>
                <Text style={styles.sectionTitle}>Items ({subitems.length})</Text>
                {subitems.map((item, index) => (
                  <View key={index} style={styles.subitemCard}>
                    <View style={styles.subitemInfo}>
                      <Text style={styles.subitemName}>{item.name}</Text>
                      <Text style={styles.subitemDetails}>
                        {item.quantity} {item.unit || 'pc'} × ₹{item.price.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.subitemRight}>
                      <Text style={styles.subitemTotal}>
                        ₹{((item.price * (item.quantity || 1))).toLocaleString('en-IN')}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveSubitem(index)}
                      >
                        <X size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Total Amount */}
            {subitems.length > 0 && (
              <View style={styles.totalCard}>
                <View style={styles.totalIconContainer}>
                  <ShoppingBag size={24} color="#7C3AED" />
                </View>
                <View style={styles.totalDetails}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalAmount}>
                    ₹{calculateTotal().toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}


            {/* Bottom Padding */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
        <Modal
          transparent
          animationType="fade"
          visible={isAddCategoryModalVisible}
          onRequestClose={() => {
            setIsAddCategoryModalVisible(false);
            setNewCategoryName('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Category</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Category name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => {
                    setIsAddCategoryModalVisible(false);
                    setNewCategoryName('');
                  }}
                >
                  <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleCreateCategory}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  headerSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 12, fontWeight: '500' },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addCategoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryChipActive: { backgroundColor: '#7C3AED' },
  categoryChipText: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' },
  categoryChipTextActive: { color: '#FFFFFF' },
  paymentMethodsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentChip: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  paymentChipActive: {
    backgroundColor: '#10B981',
  },
  paymentChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  paymentChipTextActive: {
    color: '#FFFFFF',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 80,
    fontSize: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
  subitemsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  subitemForm: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  subitemRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputWrapper: { flex: 1 },
  smallLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 6, fontWeight: '500' },
  smallInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addSubitemButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  subitemsList: { marginBottom: 20 },
  subitemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subitemInfo: { flex: 1 },
  subitemName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  subitemDetails: { fontSize: 13, color: 'rgba(255, 255, 255, 0.6)' },
  subitemRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subitemTotal: { fontSize: 16, fontWeight: '700', color: '#7C3AED' },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  totalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  totalDetails: { flex: 1 },
  totalLabel: { fontSize: 14, color: 'rgba(255, 255, 255, 0.7)', marginBottom: 4, fontWeight: '500' },
  totalAmount: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  saveButton: {
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
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'rgba(31, 27, 46, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonSecondaryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AddActivity;

