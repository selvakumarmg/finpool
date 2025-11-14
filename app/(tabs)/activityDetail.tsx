import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Calendar,
  ChevronLeft,
  CreditCard,
  DollarSign,
  Edit2,
  PlusCircle,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StatusModal, { StatusType } from '@/components/ui/StatusModal';
import { useTranslation } from '@/locale/LocaleProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Activity, ActivitySubitem, deleteActivity, updateActivity } from '@/store/slices/activitySlice';

const MAX_VISIBLE_ITEMS = 3;

const ActivityDetail = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = useTranslation();

  const activity = useAppSelector((state) => state.activities.activities.find((a) => a.id === id));

  const [showAllItems, setShowAllItems] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftSubitem, setDraftSubitem] = useState({
    name: '',
    price: '',
    quantity: '1',
    unit: '',
  });
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: StatusType;
    message?: string;
  }>({ visible: false, type: 'created' });

  if (!activity || !id) {
    return null;
  }

  const formatPaymentMethod = (method?: string) => {
    switch (method) {
      case 'account':
        return t('common.account');
      case 'card':
        return t('common.card');
      case 'upi':
        return t('common.upi');
      case 'cash':
      default:
        return t('common.cash');
    }
  };

  const visibleItems = useMemo(() => {
    if (showAllItems) return activity.subitems;
    return activity.subitems.slice(0, MAX_VISIBLE_ITEMS);
  }, [activity.subitems, showAllItems]);

  const toggleItemModal = (index: number | null) => {
    if (index === null) {
      setDraftSubitem({
        name: '',
        price: '',
        quantity: '1',
        unit: '',
      });
    } else {
      const item = activity.subitems[index];
      setDraftSubitem({
        name: item.name,
        price: item.price.toString(),
        quantity: item.quantity ? item.quantity.toString() : '1',
        unit: item.unit ?? '',
      });
    }
    setEditingIndex(index);
    setIsItemModalVisible(true);
  };

  const resetModal = () => {
    setIsItemModalVisible(false);
    setEditingIndex(null);
    setDraftSubitem({
      name: '',
      price: '',
      quantity: '1',
      unit: '',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      t('activity.confirmDeleteTitle'),
      t('activity.confirmDeleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            dispatch(deleteActivity(activity.id));
            setStatusModal({
              visible: true,
              type: 'deleted',
              message: t('activity.deleteSuccess'),
            });
            router.back();
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`/(tabs)/editActivity?id=${activity.id}` as any);
  };

  const handleSaveSubitem = () => {
    const name = draftSubitem.name.trim();
    const price = parseFloat(draftSubitem.price);
    const quantity = draftSubitem.quantity ? parseFloat(draftSubitem.quantity) : 1;
    const unit = draftSubitem.unit.trim();

    if (!name) {
      Alert.alert(t('activity.addItem'), t('activity.validation.nameRequired'));
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert(t('activity.addItem'), t('activity.validation.priceRequired'));
      return;
    }

    const existingSubitems = [...activity.subitems];
    let updatedSubitems: ActivitySubitem[];

    if (editingIndex === null) {
      const timestamp = Date.now();
      const newItem: ActivitySubitem = {
        id: `${activity.id}-${timestamp}`,
        name,
        price,
        quantity,
        unit: unit || undefined,
        timestamp: new Date().toISOString(),
      };
      updatedSubitems = [...existingSubitems, newItem];
    } else {
      const updated: ActivitySubitem = {
        ...existingSubitems[editingIndex],
        name,
        price,
        quantity,
        unit: unit || undefined,
      };
      updatedSubitems = existingSubitems.map((item, idx) => (idx === editingIndex ? updated : item));
    }

    const totalAmount = updatedSubitems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );

    const updatedActivity: Activity = {
      ...activity,
      subitems: updatedSubitems,
      totalAmount,
    };

    dispatch(updateActivity(updatedActivity));
    setStatusModal({
      visible: true,
      type: editingIndex === null ? 'created' : 'updated',
      message: editingIndex === null ? t('activity.addSuccess') : t('activity.updateSuccess'),
    });
    resetModal();
  };

  const handleDeleteSubitem = (index: number) => {
    const subitems = activity.subitems.filter((_, idx) => idx !== index);
    const totalAmount = subitems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

    const updatedActivity: Activity = {
      ...activity,
      subitems,
      totalAmount,
    };

    dispatch(updateActivity(updatedActivity));
    setStatusModal({
      visible: true,
      type: 'deleted',
      message: t('activity.deleteItemSuccess'),
    });
  };

  const renderItem = (subitem: ActivitySubitem, index: number) => (
    <TouchableOpacity
      key={subitem.id}
      style={styles.itemCard}
      activeOpacity={0.85}
      onPress={() => toggleItemModal(index)}
      onLongPress={() =>
        Alert.alert(
          t('activity.deleteItem'),
          `${t('activity.itemName')}: ${subitem.name}`,
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('common.delete'),
              style: 'destructive',
              onPress: () => handleDeleteSubitem(index),
            },
          ]
        )
      }
    >
      <View style={styles.itemNumber}>
        <Text style={styles.itemNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{subitem.name}</Text>
        <Text style={styles.itemDetails}>
          {subitem.quantity || 1} {subitem.unit || 'pc'} × ₹{subitem.price.toLocaleString('en-IN')}
        </Text>
      </View>
      <Text style={styles.itemTotal}>
        ₹{(subitem.price * (subitem.quantity || 1)).toLocaleString('en-IN')}
      </Text>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {activity.name}
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerIcon} onPress={handleEdit} activeOpacity={0.8}>
                <Edit2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon} onPress={handleDelete} activeOpacity={0.8}>
                <Trash2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.amount')}</Text>
                <View style={styles.detailValueRow}>
                  <DollarSign size={18} color="#7C3AED" />
                  <Text style={styles.detailValue}>₹{activity.totalAmount.toLocaleString('en-IN')}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.date')}</Text>
                <View style={styles.detailValueRow}>
                  <Calendar size={18} color="#7C3AED" />
                  <Text style={styles.detailValue}>{activity.date}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('common.paymentMethod')}</Text>
                <View style={styles.detailValueRow}>
                  <CreditCard size={18} color="#7C3AED" />
                  <Text style={styles.detailValue}>{formatPaymentMethod(activity.paymentMethod)}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('activity.description')}</Text>
                <Text style={styles.detailDescription}>{activity.description || '—'}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('common.items')}</Text>
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => toggleItemModal(null)}
                  activeOpacity={0.85}
                >
                  <PlusCircle size={18} color="#7C3AED" />
                  <Text style={styles.addItemText}>{t('activity.addItem')}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemsList}>
                {visibleItems.length === 0 ? (
                  <Text style={styles.emptyItemsText}>{t('activity.emptyItem')}</Text>
                ) : (
                  visibleItems.map((item, idx) => renderItem(item, idx))
                )}
              </View>

              {activity.subitems.length > MAX_VISIBLE_ITEMS && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllItems((prev) => !prev)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.showMoreText}>
                    {showAllItems ? t('common.showLess') : t('common.showMore')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleEdit} activeOpacity={0.85}>
                <Edit2 size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={handleDelete} activeOpacity={0.85}>
                <Trash2 size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <Modal transparent visible={isItemModalVisible} animationType="slide" onRequestClose={resetModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIndex === null ? t('activity.addItem') : t('activity.editItem')}
              </Text>
              <TouchableOpacity onPress={resetModal} style={styles.modalClose}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('activity.itemName')}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={t('activity.itemName')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={draftSubitem.name}
                  onChangeText={(text) => setDraftSubitem((prev) => ({ ...prev, name: text }))}
                />
              </View>
              <View style={styles.modalRow}>
                <View style={[styles.modalField, styles.modalFieldHalf]}>
                  <Text style={styles.modalLabel}>{t('activity.price')} (₹)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={draftSubitem.price}
                    onChangeText={(text) =>
                      setDraftSubitem((prev) => ({ ...prev, price: text.replace(/[^0-9.]/g, '') }))
                    }
                  />
                </View>
                <View style={[styles.modalField, styles.modalFieldHalf]}>
                  <Text style={styles.modalLabel}>{t('activity.quantity')}</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="1"
                    keyboardType="decimal-pad"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={draftSubitem.quantity}
                    onChangeText={(text) =>
                      setDraftSubitem((prev) => ({ ...prev, quantity: text.replace(/[^0-9.]/g, '') }))
                    }
                  />
                </View>
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>{t('activity.unit')}</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="kg, pcs"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={draftSubitem.unit}
                  onChangeText={(text) => setDraftSubitem((prev) => ({ ...prev, unit: text }))}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.modalButton} onPress={handleSaveSubitem} activeOpacity={0.85}>
              <Text style={styles.modalButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        message={statusModal.message}
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
      />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailDescription: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'right',
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.3)',
  },
  addItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C3AED',
  },
  itemsList: { gap: 12 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemNumberText: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  itemDetails: { fontSize: 13, color: 'rgba(255, 255, 255, 0.6)' },
  itemTotal: { fontSize: 16, fontWeight: '700', color: '#7C3AED', marginLeft: 12 },
  emptyItemsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingVertical: 12,
  },
  showMoreButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
  },
  dangerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: { gap: 16 },
  modalField: { gap: 8 },
  modalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  modalRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalFieldHalf: {
    flex: 1,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ActivityDetail;

