import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PriorityColors, Themes, Typography, ThemeMode } from '../constants/theme';
import { TaskItemData, PriorityLevel, Subtask } from '../types/task';
import { Feather, Ionicons } from '@expo/vector-icons';

interface StitchTaskModalProps {
  visible: boolean;
  themeMode: ThemeMode;
  initialPriority: PriorityLevel;
  editingTask?: TaskItemData | null;
  onClose: () => void;
  onSave: (task: Omit<TaskItemData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const StitchTaskModal: React.FC<StitchTaskModalProps> = ({
  visible,
  themeMode,
  initialPriority,
  editingTask,
  onClose,
  onSave,
  onToggleSubtask,
}) => {
  const theme = Themes[themeMode];

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>(initialPriority);
  const [dateStr, setDateStr] = useState('today, oct 24');
  const [timeStr, setTimeStr] = useState('03:00 pm');
  const [placeName, setPlaceName] = useState('design studio (room 4b)');
  const [remindWhen, setRemindWhen] = useState('15 mins before');
  const [recurring, setRecurring] = useState('daily (default)');
  const [note, setNote] = useState('');
  
  // Subtasks list
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'compile metrics charts', isCompleted: true },
    { id: '2', title: 'export slide deck pdf', isCompleted: false },
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setPriority(editingTask.priority);
      setDateStr(editingTask.date || 'today, oct 24');
      setTimeStr(`${editingTask.startTime}${editingTask.endTime ? ' - ' + editingTask.endTime : ''}`);
      setPlaceName(editingTask.place.name);
      setNote(editingTask.note || '');
      setSubtasks(editingTask.subtasks || []);
    } else {
      setTitle('');
      setPriority(initialPriority);
      setDateStr('today, oct 24');
      setTimeStr('03:00 pm');
      setPlaceName('design studio (room 4b)');
      setNote('');
      setSubtasks([
        { id: '1', title: 'compile metrics charts', isCompleted: true },
        { id: '2', title: 'export slide deck pdf', isCompleted: false },
      ]);
    }
  }, [editingTask, initialPriority, visible]);

  const pColor = PriorityColors[priority];

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        isCompleted: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleToggleLocalSubtask = (subId: string) => {
    if (editingTask && onToggleSubtask) {
      onToggleSubtask(editingTask.id, subId);
    }
    setSubtasks(
      subtasks.map((s) =>
        s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s
      )
    );
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const isVirtual = placeName.toLowerCase().includes('meet') || placeName.toLowerCase().includes('zoom');

    onSave({
      title: title.trim(),
      note: note.trim() || undefined,
      priority,
      startTime: timeStr.includes('-') ? timeStr.split('-')[0].trim() : '03:00',
      endTime: timeStr.includes('-') ? timeStr.split('-')[1].trim() : '04:00 pm',
      date: dateStr,
      period: 'daily',
      place: {
        id: placeName.toLowerCase().replace(/\s+/g, '-'),
        name: placeName,
        type: isVirtual ? 'virtual' : 'physical',
      },
      subtasks,
      isCompleted: editingTask ? editingTask.isCompleted : false,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View
          style={[
            styles.drawerContainer,
            {
              backgroundColor: theme.canvas,
              borderColor: theme.stroke,
            },
          ]}
        >
          {/* Drawer Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.stroke }]}>
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: pColor.main },
                ]}
              />
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: theme.textPrimary,
                    fontFamily: Typography.fontFamily.serif,
                  },
                ]}
              >
                {editingTask ? 'edit task' : 'create new task'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: theme.surface, borderColor: theme.stroke },
              ]}
            >
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form Scroll View */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Task Name Input */}
            <View style={styles.fieldSection}>
              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: theme.textSecondary,
                    fontFamily: Typography.fontFamily.sansSemiBold,
                  },
                ]}
              >
                task name
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Prepare client pitch deck"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.inputLarge,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.stroke,
                    color: theme.textPrimary,
                    fontFamily: Typography.fontFamily.sansMedium,
                  },
                ]}
              />
            </View>

            {/* 2. Priority & Urgency Selector */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color: theme.textSecondary,
                      fontFamily: Typography.fontFamily.sansSemiBold,
                    },
                  ]}
                >
                  priority & urgency
                </Text>
                <Text
                  style={[
                    styles.priorityStatus,
                    {
                      color: pColor.main,
                      fontFamily: Typography.fontFamily.sansBold,
                    },
                  ]}
                >
                  {priority} active
                </Text>
              </View>

              <View style={styles.priorityGrid}>
                {(['urgent', 'high', 'low'] as PriorityLevel[]).map((level) => {
                  const isSelected = priority === level;
                  const itemColor = PriorityColors[level];
                  return (
                    <TouchableOpacity
                      key={level}
                      activeOpacity={0.8}
                      onPress={() => setPriority(level)}
                      style={[
                        styles.priorityBtn,
                        {
                          backgroundColor: isSelected ? itemColor.main : theme.surface,
                          borderColor: isSelected ? itemColor.main : theme.stroke,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.priorityBoxDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : itemColor.main },
                        ]}
                      />
                      <Text
                        style={[
                          styles.priorityBtnText,
                          {
                            color: isSelected ? '#FFFFFF' : itemColor.main,
                            fontFamily: Typography.fontFamily.sansSemiBold,
                          },
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Date & Time Row */}
            <View style={styles.gridTwo}>
              <View style={styles.gridCol}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color: theme.textSecondary,
                      fontFamily: Typography.fontFamily.sansSemiBold,
                    },
                  ]}
                >
                  date
                </Text>
                <View
                  style={[
                    styles.selectorBox,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                  ]}
                >
                  <View style={styles.selectorLeft}>
                    <Feather name="calendar" size={14} color={theme.textMuted} />
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color: theme.textPrimary,
                          fontFamily: Typography.fontFamily.sansMedium,
                        },
                      ]}
                    >
                      {dateStr}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={14} color={theme.textMuted} />
                </View>
              </View>

              <View style={styles.gridCol}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color: theme.textSecondary,
                      fontFamily: Typography.fontFamily.sansSemiBold,
                    },
                  ]}
                >
                  time
                </Text>
                <View
                  style={[
                    styles.selectorBox,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                  ]}
                >
                  <View style={styles.selectorLeft}>
                    <Feather name="clock" size={14} color={theme.textMuted} />
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color: theme.textPrimary,
                          fontFamily: Typography.fontFamily.sansMedium,
                        },
                      ]}
                    >
                      {timeStr}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={14} color={theme.textMuted} />
                </View>
              </View>
            </View>

            {/* 4. Place / Location Selector */}
            <View style={styles.fieldSection}>
              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: theme.textSecondary,
                    fontFamily: Typography.fontFamily.sansSemiBold,
                  },
                ]}
              >
                place / location
              </Text>
              <View
                style={[
                  styles.selectorBox,
                  { backgroundColor: theme.surface, borderColor: theme.stroke },
                ]}
              >
                <View style={styles.selectorLeft}>
                  <Ionicons name="location-outline" size={16} color={theme.textMuted} />
                  <Text
                    style={[
                      styles.selectorText,
                      {
                        color: theme.textPrimary,
                        fontFamily: Typography.fontFamily.sansMedium,
                      },
                    ]}
                  >
                    {placeName}
                  </Text>
                </View>
                <Feather name="chevron-down" size={14} color={theme.textMuted} />
              </View>
            </View>

            {/* 5. Remind When & Recurring */}
            <View style={styles.gridTwo}>
              <View style={styles.gridCol}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color: theme.textSecondary,
                      fontFamily: Typography.fontFamily.sansSemiBold,
                    },
                  ]}
                >
                  remind when
                </Text>
                <View
                  style={[
                    styles.selectorBoxSmall,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectorTextSmall,
                      {
                        color: theme.textPrimary,
                        fontFamily: Typography.fontFamily.sans,
                      },
                    ]}
                  >
                    {remindWhen}
                  </Text>
                  <Feather name="chevron-down" size={12} color={theme.textMuted} />
                </View>
              </View>

              <View style={styles.gridCol}>
                <Text
                  style={[
                    styles.fieldLabel,
                    {
                      color: theme.textSecondary,
                      fontFamily: Typography.fontFamily.sansSemiBold,
                    },
                  ]}
                >
                  recurring
                </Text>
                <View
                  style={[
                    styles.selectorBoxSmall,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                  ]}
                >
                  <Text
                    style={[
                      styles.selectorTextSmall,
                      {
                        color: theme.textPrimary,
                        fontFamily: Typography.fontFamily.sans,
                      },
                    ]}
                  >
                    {recurring}
                  </Text>
                  <Feather name="chevron-down" size={12} color={theme.textMuted} />
                </View>
              </View>
            </View>

            {/* 6. Subtasks List with Quick-Add */}
            <View style={styles.fieldSection}>
              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: theme.textSecondary,
                    fontFamily: Typography.fontFamily.sansSemiBold,
                  },
                ]}
              >
                subtasks <Text style={{ color: theme.textMuted, fontSize: 11 }}>(single-level max)</Text>
              </Text>

              {/* Subtask Input Bar */}
              <View style={styles.subtaskInputBar}>
                <TextInput
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  placeholder="name of subtask..."
                  placeholderTextColor={theme.textMuted}
                  onSubmitEditing={handleAddSubtask}
                  style={[
                    styles.subtaskInput,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.stroke,
                      color: theme.textPrimary,
                    },
                  ]}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleAddSubtask}
                  style={[
                    styles.subtaskAddBtn,
                    { backgroundColor: pColor.main },
                  ]}
                >
                  <Feather name="plus" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Subtask items */}
              <View style={styles.subtaskItemsList}>
                {subtasks.map((st) => (
                  <TouchableOpacity
                    key={st.id}
                    activeOpacity={0.7}
                    onPress={() => handleToggleLocalSubtask(st.id)}
                    style={[
                      styles.subtaskItem,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.stroke,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.subtaskCheck,
                        {
                          borderColor: st.isCompleted ? PriorityColors.low.main : theme.stroke,
                          backgroundColor: st.isCompleted
                            ? PriorityColors.low.main
                            : theme.elevated,
                        },
                      ]}
                    >
                      {st.isCompleted && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.subtaskItemTitle,
                        {
                          color: st.isCompleted ? theme.textSecondary : theme.textPrimary,
                          textDecorationLine: st.isCompleted ? 'line-through' : 'none',
                          fontFamily: Typography.fontFamily.sans,
                        },
                      ]}
                    >
                      {st.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 7. Note Field */}
            <View style={styles.fieldSection}>
              <Text
                style={[
                  styles.fieldLabel,
                  {
                    color: theme.textSecondary,
                    fontFamily: Typography.fontFamily.sansSemiBold,
                  },
                ]}
              >
                note
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="add detailed notes, links, or objectives..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.stroke,
                    color: theme.textPrimary,
                    fontFamily: Typography.fontFamily.sans,
                  },
                ]}
              />
            </View>

            {/* Action Buttons: Save & Discard */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSave}
                style={[
                  styles.saveBtn,
                  { backgroundColor: pColor.main },
                ]}
              >
                <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text
                  style={[
                    styles.saveBtnText,
                    { fontFamily: Typography.fontFamily.sansBold },
                  ]}
                >
                  save task
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                style={[
                  styles.discardBtn,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.stroke,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.discardBtnText,
                    {
                      color: theme.textSecondary,
                      fontFamily: Typography.fontFamily.sansSemiBold,
                    },
                  ]}
                >
                  discard
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'lowercase',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityStatus: {
    fontSize: 11,
    textTransform: 'lowercase',
  },
  inputLarge: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  priorityBoxDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  priorityBtnText: {
    fontSize: 13,
  },
  gridTwo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
  },
  selectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorText: {
    fontSize: 13,
  },
  selectorBoxSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  selectorTextSmall: {
    fontSize: 12,
  },
  subtaskInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskInput: {
    flex: 1,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    borderWidth: 1,
    borderRightWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
  },
  subtaskAddBtn: {
    width: 44,
    height: 44,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskItemsList: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  subtaskCheck: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskItemTitle: {
    fontSize: 13,
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 13,
    height: 76,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  discardBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardBtnText: {
    fontSize: 14,
  },
});
