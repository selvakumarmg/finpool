import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { useTranslation } from '@/locale/LocaleProvider';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconWrapper}>
            <AlertTriangle size={32} color="#FACC15" />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                {cancelLabel ?? t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {confirmLabel ?? t('common.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    backgroundColor: '#1F1B2E',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  iconWrapper: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: 'rgba(250, 204, 21, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 22,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  secondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConfirmModal;


