import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PriorityColors, Themes, Typography, ThemeMode } from '../constants/theme';
import { TaskItemData, PriorityLevel, FilterPeriod } from '../types/task';
import { taskService } from '../services/taskService';
import { storageService, UserProfile } from '../services/storageService';
import { StitchTaskCard } from '../components/StitchTaskCard';
import { StitchBottomBar } from '../components/StitchBottomBar';
import { StitchTaskModal } from '../components/StitchTaskModal';
import { OnboardingModal } from '../components/OnboardingModal';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [tasks, setTasks] = useState<TaskItemData[]>([]);
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>('daily');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<PriorityLevel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation Drawer / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>('urgent');
  const [editingTask, setEditingTask] = useState<TaskItemData | null>(null);

  const theme = Themes[themeMode];

  useEffect(() => {
    // 1. Check user profile
    storageService.getUserProfile().then((profile) => {
      if (profile) {
        setUserProfile(profile);
      } else {
        setIsOnboardingOpen(true);
      }
    });

    // 2. Subscribe to tasks
    const unsubscribe = taskService.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenDrawer = (quickTitle?: string) => {
    setEditingTask(
      quickTitle
        ? ({
            id: '',
            title: quickTitle,
            priority: selectedPriority,
            startTime: '09:00 AM',
            endTime: '10:30 AM',
            date: 'Oct 24, 2026',
            period: 'daily',
            place: { id: 'office', name: 'design studio (room 4b)', type: 'physical' },
            subtasks: [],
            isCompleted: false,
            createdAt: '',
            updatedAt: '',
          } as TaskItemData)
        : null
    );
    setIsModalOpen(true);
  };

  const handleEditTask = (task: TaskItemData) => {
    setEditingTask(task);
    setSelectedPriority(task.priority);
    setIsModalOpen(true);
  };

  const handleToggleComplete = (task: TaskItemData) => {
    taskService.toggleTaskCompletion(task.id, !task.isCompleted);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    taskService.toggleSubtask(taskId, subtaskId);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => taskService.deleteTask(taskId),
      },
    ]);
  };

  const handleSaveTask = (taskData: Omit<TaskItemData, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask && editingTask.id) {
      taskService.updateTask(editingTask.id, taskData);
    } else {
      taskService.createTask(taskData);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedPriorityFilter && task.priority !== selectedPriorityFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesPlace = task.place.name.toLowerCase().includes(q);
      return matchesTitle || matchesPlace;
    }
    return true;
  });

  const displayName = userProfile?.lastName || 'alex';

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.canvas },
      ]}
      edges={['top']}
    >
      {/* 1. Header Section */}
      <View
        style={[
          styles.headerSection,
          {
            backgroundColor: theme.canvas,
            borderBottomColor: theme.stroke,
          },
        ]}
      >
        {/* Top Row: Title with user's last name + Action Icons */}
        <View style={styles.topRow}>
          <Text
            style={[
              styles.greetingText,
              {
                color: theme.textPrimary,
                fontFamily: Typography.fontFamily.serif,
              },
            ]}
          >
            goodwork,
            <Text
              style={[
                styles.greetingSub,
                {
                  color: theme.textSecondary,
                  fontFamily: Typography.fontFamily.serifItalic,
                },
              ]}
            >
              {' '}{displayName}
            </Text>
          </Text>

          <View style={styles.headerActions}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleTheme}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.stroke,
                },
              ]}
            >
              {themeMode === 'light' ? (
                <Ionicons name="moon-outline" size={18} color={PriorityColors.high.main} />
              ) : (
                <Feather name="sun" size={18} color={PriorityColors.urgent.main} />
              )}
            </TouchableOpacity>

            {/* Profile / Edit Name Trigger */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsOnboardingOpen(true)}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.stroke,
                },
              ]}
            >
              <Feather name="user" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Segmented Control & Priority Filter Chips */}
        <View style={styles.filterRow}>
          {/* Daily / Weekly / All Segment */}
          <View
            style={[
              styles.periodSegment,
              {
                backgroundColor: theme.surface,
                borderColor: theme.stroke,
              },
            ]}
          >
            {(['daily', 'weekly', 'all'] as FilterPeriod[]).map((p) => {
              const isSelected = selectedPeriod === p;
              return (
                <TouchableOpacity
                  key={p}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPeriod(p)}
                  style={[
                    styles.periodTab,
                    isSelected && [
                      styles.periodTabActive,
                      {
                        backgroundColor: theme.elevated,
                        shadowColor: theme.shadowColor,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.periodTabText,
                      {
                        color: isSelected ? theme.textPrimary : theme.textSecondary,
                        fontFamily: isSelected
                          ? Typography.fontFamily.sansBold
                          : Typography.fontFamily.sansMedium,
                      },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Urgent / High / Low Filter Chips */}
          <View style={styles.priorityChipsRow}>
            {(['urgent', 'high', 'low'] as PriorityLevel[]).map((level) => {
              const isSelected = selectedPriorityFilter === level;
              const pColor = PriorityColors[level];
              return (
                <TouchableOpacity
                  key={level}
                  activeOpacity={0.8}
                  onPress={() =>
                    setSelectedPriorityFilter(isSelected ? null : level)
                  }
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: isSelected ? pColor.main : pColor.tint,
                      borderColor: pColor.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: isSelected ? '#FFFFFF' : pColor.main },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#FFFFFF' : pColor.main,
                        fontFamily: Typography.fontFamily.sansBold,
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.stroke,
              },
            ]}
          >
            <Feather
              name="search"
              size={18}
              color={theme.textMuted}
              style={{ marginRight: 10 }}
            />
            <TextInput
              placeholder="search &quot;keyword&quot; place:@location"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[
                styles.searchInput,
                {
                  color: theme.textPrimary,
                  fontFamily: Typography.fontFamily.sans,
                },
              ]}
            />
            <View
              style={[
                styles.comfBadge,
                {
                  backgroundColor: theme.elevated,
                  borderColor: theme.stroke,
                },
              ]}
            >
              <Text
                style={[
                  styles.comfText,
                  { color: theme.textMuted },
                ]}
              >
                comf
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Tasks Feed with Left Priority Rail & Railway Subtasks Chart */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StitchTaskCard
            task={item}
            themeMode={themeMode}
            onPress={() => handleEditTask(item)}
            onToggleComplete={handleToggleComplete}
            onToggleSubtask={handleToggleSubtask}
            onDelete={handleDeleteTask}
          />
        )}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles-outline" size={48} color={theme.textMuted} />
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.textPrimary,
                  fontFamily: Typography.fontFamily.sansSemiBold,
                },
              ]}
            >
              no tasks found
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                {
                  color: theme.textSecondary,
                  fontFamily: Typography.fontFamily.sans,
                },
              ]}
            >
              all filtered tasks completed or not yet scheduled
            </Text>
          </View>
        }
      />

      {/* 3. Persistent Bottom Quick Bar */}
      <StitchBottomBar
        themeMode={themeMode}
        selectedPriority={selectedPriority}
        onSelectPriority={setSelectedPriority}
        onOpenDrawer={handleOpenDrawer}
      />

      {/* 4. Expanded Task Modal / Drawer */}
      <StitchTaskModal
        visible={isModalOpen}
        themeMode={themeMode}
        initialPriority={selectedPriority}
        editingTask={editingTask}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onToggleSubtask={handleToggleSubtask}
      />

      {/* 5. Onboarding / Name Entry Modal */}
      <OnboardingModal
        visible={isOnboardingOpen}
        themeMode={themeMode}
        onComplete={(profile) => {
          setUserProfile(profile);
          setIsOnboardingOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: 26,
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  periodSegment: {
    flexDirection: 'row',
    padding: 3.5,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 11,
  },
  periodTabActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodTabText: {
    fontSize: 14,
    textTransform: 'lowercase',
  },
  priorityChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  chipText: {
    fontSize: 13,
    textTransform: 'lowercase',
  },
  searchContainer: {
    marginTop: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  comfBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  comfText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  feedContent: {
    paddingTop: 16,
    paddingBottom: 130,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },
});
