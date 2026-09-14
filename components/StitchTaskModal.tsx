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
import { CrossPlatformDateTimePicker } from './CrossPlatformDateTimePicker';
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

const PRESET_REMINDS = [
  '15 mins before',
  '30 mins before',
  'at time of event',
  '1 day before',
];

const PRESET_RECURRINGS = [
  'daily (default)',
  'weekly',
  'does not repeat',
];

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
  
  // Date & Times (Separate Start and End times with full interactive calendar)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTimeObj, setStartTimeObj] = useState<{ hour: number; minute: number; period: 'AM' | 'PM' }>({
    hour: 9,
    minute: 0,
    period: 'AM',
  });
  const [endTimeObj, setEndTimeObj] = useState<{ hour: number; minute: number; period: 'AM' | 'PM' }>({
    hour: 10,
    minute: 30,
    period: 'AM',
  });

  const [isPickerExpanded, setIsPickerExpanded] = useState<boolean>(false);
  const [pickerActiveTab, setPickerActiveTab] = useState<'date' | 'start' | 'end'>('date');

  const [placeName, setPlaceName] = useState('design studio (room 4b)');
  const [remindWhen, setRemindWhen] = useState('15 mins before');
  const [recurring, setRecurring] = useState('daily (default)');
  const [note, setNote] = useState('');

  // Dropdown open states for remind and recurring
  const [openDropdown, setOpenDropdown] = useState<'remind' | 'recurring' | null>(null);

  // Subtasks list
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: '1', title: 'compile metrics charts', isCompleted: true },
    { id: '2', title: 'export slide deck pdf', isCompleted: false },
  ]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Subtask editing in-place
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');

  const parseTimeStr = (tStr: string) => {
    try {
      const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        return {
          hour: parseInt(match[1], 10),
          minute: parseInt(match[2], 10),
          period: (match[3]?.toUpperCase() as 'AM' | 'PM') || 'AM',
        };
      }
    } catch (e) {}
    return { hour: 9, minute: 0, period: 'AM' as const };
  };

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setPriority(editingTask.priority);
      setPlaceName(editingTask.place.name);
      setNote(editingTask.note || '');
      setSubtasks(editingTask.subtasks || []);
      
      if (editingTask.startTime) {
        setStartTimeObj(parseTimeStr(editingTask.startTime));
      }
      if (editingTask.endTime) {
        setEndTimeObj(parseTimeStr(editingTask.endTime));
      }
      if (editingTask.dateTimestamp) {
        setSelectedDate(new Date(editingTask.dateTimestamp));
      } else if (editingTask.date) {
        const parsed = new Date(editingTask.date);
        if (!isNaN(parsed.getTime())) setSelectedDate(parsed);
      }
    } else {
      setTitle('');
      setPriority(initialPriority);
      setPlaceName('design studio (room 4b)');
      setNote('');
      setStartTimeObj({ hour: 9, minute: 0, period: 'AM' });
      setEndTimeObj({ hour: 10, minute: 30, period: 'AM' });
      setSelectedDate(new Date());
      setSubtasks([
        { id: '1', title: 'compile metrics charts', isCompleted: true },
        { id: '2', title: 'export slide deck pdf', isCompleted: false },
      ]);
    }
    setOpenDropdown(null);
    setIsPickerExpanded(false);
    setEditingSubtaskId(null);
  }, [editingTask, initialPriority, visible]);

  const pColor = PriorityColors[priority];
  const isVirtualPlace = placeName.toLowerCase().includes('meet') || placeName.toLowerCase().includes('zoom');

  // Format Helpers
  const formatDateString = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimeString = (t: { hour: number; minute: number; period: 'AM' | 'PM' }) => {
    const h = t.hour < 10 ? `0${t.hour}` : t.hour;
    const m = t.minute < 10 ? `0${t.minute}` : t.minute;
    return `${h}:${m} ${t.period}`;
  };

  // Subtask Handlers
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim().toLowerCase(),
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

  const handleStartEditSubtask = (sub: Subtask) => {
    setEditingSubtaskId(sub.id);
    setEditingSubtaskText(sub.title);
  };

  const handleSaveEditSubtask = (subId: string) => {
    if (editingSubtaskText.trim()) {
      setSubtasks(
        subtasks.map((s) =>
          s.id === subId ? { ...s, title: editingSubtaskText.trim().toLowerCase() } : s
        )
      );
    }
    setEditingSubtaskId(null);
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subId));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      note: note.trim() || undefined,
      priority,
      startTime: formatTimeString(startTimeObj),
      endTime: formatTimeString(endTimeObj),
      date: formatDateString(selectedDate),
      dateTimestamp: selectedDate.getTime(),
      period: 'daily',
      place: {
        id: placeName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: placeName.trim() || 'general space',
        type: isVirtualPlace ? 'virtual' : 'physical',
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
              <Ionicons name="close" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form Scroll View */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
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

            {/* 3. Cross-Platform Interactive Date & Time Schedule Card */}
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
                  schedule & time slots
                </Text>
                <TouchableOpacity
                  onPress={() => setIsPickerExpanded(!isPickerExpanded)}
                  style={styles.expandToggle}
                >
                  <Text style={[styles.expandToggleText, { color: pColor.main }]}>
                    {isPickerExpanded ? 'collapse' : 'change date/time'}
                  </Text>
                  <Feather
                    name={isPickerExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={pColor.main}
                  />
                </TouchableOpacity>
              </View>

              {/* Summary Selector Trigger Row */}
              <View style={styles.gridSchedule}>
                {/* Date Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setPickerActiveTab('date');
                    setIsPickerExpanded(true);
                  }}
                  style={[
                    styles.scheduleTriggerBox,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                    isPickerExpanded && pickerActiveTab === 'date' && { borderColor: pColor.main },
                  ]}
                >
                  <Feather name="calendar" size={16} color={pColor.main} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[styles.microLabel, { color: theme.textMuted }]}>date</Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.scheduleTriggerText,
                        { color: theme.textPrimary, fontFamily: Typography.fontFamily.sansBold },
                      ]}
                    >
                      {formatDateString(selectedDate)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Start Time Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setPickerActiveTab('start');
                    setIsPickerExpanded(true);
                  }}
                  style={[
                    styles.scheduleTriggerBox,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                    isPickerExpanded && pickerActiveTab === 'start' && { borderColor: pColor.main },
                  ]}
                >
                  <Feather name="clock" size={16} color={pColor.main} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[styles.microLabel, { color: theme.textMuted }]}>start</Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.scheduleTriggerText,
                        { color: theme.textPrimary, fontFamily: Typography.fontFamily.sansBold },
                      ]}
                    >
                      {formatTimeString(startTimeObj)}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* End Time Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setPickerActiveTab('end');
                    setIsPickerExpanded(true);
                  }}
                  style={[
                    styles.scheduleTriggerBox,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                    isPickerExpanded && pickerActiveTab === 'end' && { borderColor: pColor.main },
                  ]}
                >
                  <Feather name="clock" size={16} color={pColor.main} />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={[styles.microLabel, { color: theme.textMuted }]}>end</Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.scheduleTriggerText,
                        { color: theme.textPrimary, fontFamily: Typography.fontFamily.sansBold },
                      ]}
                    >
                      {formatTimeString(endTimeObj)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Expandable Embedded Cross-Platform Interactive Picker */}
              {isPickerExpanded && (
                <CrossPlatformDateTimePicker
                  themeMode={themeMode}
                  selectedDate={selectedDate}
                  startTime={startTimeObj}
                  endTime={endTimeObj}
                  activeTab={pickerActiveTab}
                  onTabChange={setPickerActiveTab}
                  onDateChange={setSelectedDate}
                  onStartTimeChange={setStartTimeObj}
                  onEndTimeChange={setEndTimeObj}
                  priorityColor={pColor.main}
                />
              )}
            </View>

            {/* 4. Place / Location Direct Text Input Field */}
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
                  styles.locationInputBox,
                  { backgroundColor: theme.surface, borderColor: theme.stroke },
                ]}
              >
                {isVirtualPlace ? (
                  <Ionicons name="videocam-outline" size={20} color={pColor.main} style={styles.locationIcon} />
                ) : (
                  <Ionicons name="location-outline" size={20} color={theme.textMuted} style={styles.locationIcon} />
                )}
                <TextInput
                  value={placeName}
                  onChangeText={setPlaceName}
                  placeholder="e.g. design studio, room 4b, virtual google meet..."
                  placeholderTextColor={theme.textMuted}
                  style={[
                    styles.locationInput,
                    {
                      color: theme.textPrimary,
                      fontFamily: Typography.fontFamily.sansMedium,
                    },
                  ]}
                />
              </View>
            </View>

            {/* 5. Remind When & Recurring (Cleaned of custom recurrence) */}
            <View style={styles.gridTwo}>
              {/* Remind Dropdown */}
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
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setOpenDropdown(openDropdown === 'remind' ? null : 'remind')}
                  style={[
                    styles.selectorBoxSmall,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                  ]}
                >
                  <Text
                    numberOfLines={1}
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
                  <Feather
                    name={openDropdown === 'remind' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>

                {openDropdown === 'remind' && (
                  <View
                    style={[
                      styles.dropdownMenu,
                      { backgroundColor: theme.surface, borderColor: theme.stroke },
                    ]}
                  >
                    {PRESET_REMINDS.map((r) => (
                      <TouchableOpacity
                        key={r}
                        onPress={() => {
                          setRemindWhen(r);
                          setOpenDropdown(null);
                        }}
                        style={[
                          styles.dropdownItem,
                          remindWhen === r && { backgroundColor: theme.elevated },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            {
                              color: remindWhen === r ? pColor.main : theme.textPrimary,
                              fontFamily: Typography.fontFamily.sans,
                            },
                          ]}
                        >
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Recurring Dropdown (without custom) */}
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
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setOpenDropdown(openDropdown === 'recurring' ? null : 'recurring')}
                  style={[
                    styles.selectorBoxSmall,
                    { backgroundColor: theme.surface, borderColor: theme.stroke },
                  ]}
                >
                  <Text
                    numberOfLines={1}
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
                  <Feather
                    name={openDropdown === 'recurring' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>

                {openDropdown === 'recurring' && (
                  <View
                    style={[
                      styles.dropdownMenu,
                      { backgroundColor: theme.surface, borderColor: theme.stroke },
                    ]}
                  >
                    {PRESET_RECURRINGS.map((rc) => (
                      <TouchableOpacity
                        key={rc}
                        onPress={() => {
                          setRecurring(rc);
                          setOpenDropdown(null);
                        }}
                        style={[
                          styles.dropdownItem,
                          recurring === rc && { backgroundColor: theme.elevated },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            {
                              color: recurring === rc ? pColor.main : theme.textPrimary,
                              fontFamily: Typography.fontFamily.sans,
                            },
                          ]}
                        >
                          {rc}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* 6. Editable Subtasks List */}
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
                  subtasks <Text style={{ color: theme.textMuted, fontSize: 13 }}>(tap to edit / remove)</Text>
                </Text>
                <Text style={[styles.subtaskCountLabel, { color: pColor.main }]}>
                  {subtasks.filter((s) => s.isCompleted).length}/{subtasks.length}
                </Text>
              </View>

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
                  <Feather name="plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Subtask items with edit and delete options */}
              <View style={styles.subtaskItemsList}>
                {subtasks.map((st) => (
                  <View
                    key={st.id}
                    style={[
                      styles.subtaskItem,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.stroke,
                      },
                    ]}
                  >
                    {/* Checkbox */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleLocalSubtask(st.id)}
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
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>

                    {/* Inline Text or Edit Input */}
                    {editingSubtaskId === st.id ? (
                      <View style={styles.subtaskEditRow}>
                        <TextInput
                          value={editingSubtaskText}
                          onChangeText={setEditingSubtaskText}
                          autoFocus
                          onSubmitEditing={() => handleSaveEditSubtask(st.id)}
                          style={[
                            styles.subtaskEditInput,
                            {
                              backgroundColor: theme.elevated,
                              borderColor: theme.stroke,
                              color: theme.textPrimary,
                            },
                          ]}
                        />
                        <TouchableOpacity
                          onPress={() => handleSaveEditSubtask(st.id)}
                          style={[styles.subtaskActionBtn, { backgroundColor: PriorityColors.low.main }]}
                        >
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setEditingSubtaskId(null)}
                          style={[styles.subtaskActionBtn, { backgroundColor: theme.elevated }]}
                        >
                          <Ionicons name="close" size={16} color={theme.textMuted} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => handleStartEditSubtask(st)}
                        >
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

                        {/* Edit and Delete buttons */}
                        <View style={styles.subtaskItemActions}>
                          <TouchableOpacity
                            onPress={() => handleStartEditSubtask(st)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.subtaskSmallBtn}
                          >
                            <Feather name="edit-2" size={15} color={theme.textMuted} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteSubtask(st.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.subtaskSmallBtn}
                          >
                            <Feather name="trash" size={15} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
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
                <Feather name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    maxHeight: '92%',
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityIndicator: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 36,
  },
  fieldSection: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'lowercase',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  gridSchedule: {
    flexDirection: 'row',
    gap: 8,
  },
  scheduleTriggerBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  microLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scheduleTriggerText: {
    fontSize: 13,
    marginTop: 2,
  },
  priorityStatus: {
    fontSize: 13,
    textTransform: 'lowercase',
  },
  inputLarge: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  priorityBoxDot: {
    width: 8,
    height: 8,
    borderRadius: 3,
  },
  priorityBtnText: {
    fontSize: 15,
  },
  gridTwo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  gridCol: {
    flex: 1,
  },
  locationInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 54,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  selectorBoxSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  selectorTextSmall: {
    fontSize: 14,
  },
  dropdownMenu: {
    marginTop: 6,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    textTransform: 'lowercase',
  },
  subtaskCountLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtaskInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtaskInput: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderWidth: 1.5,
    borderRightWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  subtaskAddBtn: {
    width: 48,
    height: 48,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskItemsList: {
    gap: 10,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  subtaskCheck: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskItemTitle: {
    fontSize: 15,
  },
  subtaskItemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  subtaskSmallBtn: {
    padding: 4,
  },
  subtaskEditRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtaskEditInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  subtaskActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    fontSize: 15,
    height: 84,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  discardBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardBtnText: {
    fontSize: 16,
  },
});
