import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { PriorityColors, Themes, Typography, ThemeMode } from '../constants/theme';
import { PriorityLevel } from '../types/task';
import { Feather, Ionicons } from '@expo/vector-icons';

interface StitchBottomBarProps {
  themeMode: ThemeMode;
  selectedPriority: PriorityLevel;
  onSelectPriority: (prio: PriorityLevel) => void;
  onOpenDrawer: (quickTitle?: string) => void;
}

export const StitchBottomBar: React.FC<StitchBottomBarProps> = ({
  themeMode,
  selectedPriority,
  onSelectPriority,
  onOpenDrawer,
}) => {
  const theme = Themes[themeMode];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');

  const pColor = PriorityColors[selectedPriority];

  const handlePrioritySelect = (p: PriorityLevel) => {
    onSelectPriority(p);
    setIsMenuOpen(false);
  };

  const handleTriggerAdd = () => {
    onOpenDrawer(quickInput);
    setQuickInput('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bottomBarBg,
          borderTopColor: theme.stroke,
        },
      ]}
    >
      {/* Priority Selection Popover Menu */}
      {isMenuOpen && (
        <View
          style={[
            styles.popoverMenu,
            { backgroundColor: theme.surface, borderColor: theme.stroke },
          ]}
        >
          {(['urgent', 'high', 'low'] as PriorityLevel[]).map((level) => {
            const itemColor = PriorityColors[level];
            return (
              <TouchableOpacity
                key={level}
                activeOpacity={0.8}
                onPress={() => handlePrioritySelect(level)}
                style={[
                  styles.popoverItem,
                  { backgroundColor: itemColor.main },
                ]}
              >
                <Text style={styles.popoverItemText}>{level[0].toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Main Integrated Toolbar Row */}
      <View style={styles.toolbarRow}>
        {/* Left: Priority Selector Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setIsMenuOpen(!isMenuOpen)}
          style={[
            styles.priorityButton,
            { backgroundColor: pColor.main },
          ]}
        >
          <Feather name="chevron-down" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Center: Inline Quick Task Input / Trigger */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleTriggerAdd}
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.stroke,
            },
          ]}
        >
          <TextInput
            placeholder="name of task..."
            placeholderTextColor={theme.textMuted}
            value={quickInput}
            onChangeText={setQuickInput}
            onSubmitEditing={handleTriggerAdd}
            style={[
              styles.input,
              {
                color: theme.textPrimary,
                fontFamily: Typography.fontFamily.sans,
              },
            ]}
          />
        </TouchableOpacity>

        {/* Right: Add '+' Action Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleTriggerAdd}
          style={[
            styles.addButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.stroke,
            },
          ]}
        >
          <Feather name="plus" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* iOS Home Indicator Pill */}
      <View
        style={[
          styles.homeIndicator,
          { backgroundColor: theme.stroke },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1.5,
    zIndex: 30,
  },
  popoverMenu: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 10,
    gap: 10,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  popoverItem: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popoverItemText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  priorityButton: {
    width: 56,
    height: 56,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    height: 56,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 17,
    paddingVertical: 0,
  },
  addButton: {
    width: 52,
    height: 56,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1.5,
    borderLeftWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 130,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
  },
});
