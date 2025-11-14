import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle, XCircle, Info, LogOut as LogoutIcon } from 'lucide-react-native';

import { useTranslation } from '@/locale/LocaleProvider';

export type StatusType = 'created' | 'updated' | 'deleted' | 'failed' | 'logout' | 'custom';

type StatusModalProps = {
  visible: boolean;
  type?: StatusType;
  title?: string;
  message?: string;
  onClose: () => void;
  confirmLabel?: string;
};

const typeToIcon = {
  created: { component: CheckCircle, color: '#10B981' },
  updated: { component: CheckCircle, color: '#38BDF8' },
  deleted: { component: CheckCircle, color: '#F97316' },
  failed: { component: XCircle, color: '#EF4444' },
  logout: { component: LogoutIcon, color: '#F59E0B' },
  custom: { component: Info, color: '#7C3AED' },
};

export const StatusModal: React.FC<StatusModalProps> = ({
  visible,
  type = 'custom',
  title,
  message,
  onClose,
  confirmLabel,
}) => {
  const t = useTranslation();

  const Icon = typeToIcon[type].component;
  const iconColor = typeToIcon[type].color;

  const defaultTitles: Record<StatusType, string> = {
    created: t('modal.created'),
    updated: t('modal.updated'),
    deleted: t('modal.deleted'),
    failed: t('modal.failed'),
    logout: t('modal.loggedOut'),
    custom: t('modal.created'),
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconWrapper, { backgroundColor: `${iconColor}20` }]}>
            <Icon size={36} color={iconColor} />
          </View>
          <Text style={styles.title}>{title ?? defaultTitles[type]}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{confirmLabel ?? t('modal.continue')}</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default StatusModal;

