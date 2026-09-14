import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PriorityColors, Themes, Typography, ThemeMode } from '../constants/theme';
import { storageService, UserProfile } from '../services/storageService';
import { Feather, Ionicons } from '@expo/vector-icons';

interface OnboardingModalProps {
  visible: boolean;
  themeMode: ThemeMode;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  themeMode,
  onComplete,
}) => {
  const theme = Themes[themeMode];
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    const profile = await storageService.saveUserProfile(name.trim());
    onComplete(profile);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.canvas,
              borderColor: theme.stroke,
            },
          ]}
        >
          {/* Decorative Icon */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: PriorityColors.urgent.tint,
                borderColor: PriorityColors.urgent.border,
              },
            ]}
          >
            <Feather name="user-check" size={28} color={PriorityColors.urgent.main} />
          </View>

          {/* Heading */}
          <Text
            style={[
              styles.title,
              {
                color: theme.textPrimary,
                fontFamily: Typography.fontFamily.serif,
              },
            ]}
          >
            welcome to goodwork
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.textSecondary,
                fontFamily: Typography.fontFamily.sans,
              },
            ]}
          >
            What should we call you? Your last name will be used across your task boards and daily overview.
          </Text>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. Alex Rivera"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError('');
              }}
              autoFocus
              onSubmitEditing={handleContinue}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: error ? '#EF4444' : theme.stroke,
                  color: theme.textPrimary,
                  fontFamily: Typography.fontFamily.sansMedium,
                },
              ]}
            />
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinue}
            style={[
              styles.continueBtn,
              { backgroundColor: PriorityColors.urgent.main },
            ]}
          >
            <Text
              style={[
                styles.continueBtnText,
                { fontFamily: Typography.fontFamily.sansBold },
              ]}
            >
              get started
            </Text>
            <Feather name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
