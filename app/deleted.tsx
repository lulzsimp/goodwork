import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PriorityColors, Themes, Typography, ThemeMode } from '../constants/theme';
import { TaskItemData } from '../types/task';
import { taskService } from '../services/taskService';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function DeletedTasksScreen() {
  const router = useRouter();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [deletedTasks, setDeletedTasks] = useState<TaskItemData[]>([]);

  const theme = Themes[themeMode];

  useEffect(() => {
    const unsubscribe = taskService.subscribeToTasks((allTasks) => {
      const deleted = allTasks.filter((t) => t.isDeleted);
      setDeletedTasks(deleted);
    });
    return () => unsubscribe();
  }, []);

  const handleRestore = (taskId: string) => {
    taskService.restoreTask(taskId);
  };

  const handlePermanentDelete = (taskId: string) => {
    Alert.alert(
      'Delete Permanently',
      'This will permanently remove the task. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => taskService.permanentlyDeleteTask(taskId),
        },
      ]
    );
  };

  const handlePurgeAll = () => {
    if (deletedTasks.length === 0) return;
    Alert.alert(
      'Empty Trash',
      'Are you sure you want to permanently delete all items in trash?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty All',
          style: 'destructive',
          onPress: () => taskService.purgeDeletedTasks(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.canvas }]} edges={['top']}>
      {/* Header Row */}
      <View style={[styles.header, { borderBottomColor: theme.stroke }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.stroke }]}
        >
          <Feather name="arrow-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.textPrimary, fontFamily: Typography.fontFamily.serif }]}>
            trash & deleted
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {deletedTasks.length} {deletedTasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        {deletedTasks.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePurgeAll}
            style={[styles.purgeBtn, { backgroundColor: '#EF4444' }]}
          >
            <Feather name="trash" size={14} color="#FFFFFF" />
            <Text style={styles.purgeBtnText}>empty</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Deleted List */}
      <FlatList
        data={deletedTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const pColor = PriorityColors[item.priority];
          return (
            <View style={[styles.taskCard, { backgroundColor: theme.surface, borderColor: theme.stroke }]}>
              {/* Priority Bar */}
              <View style={[styles.priorityRail, { backgroundColor: pColor.main }]} />

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.priorityPill, { backgroundColor: pColor.tint, borderColor: pColor.border }]}>
                    <Text style={[styles.priorityPillText, { color: pColor.main }]}>{item.priority}</Text>
                  </View>
                  <Text style={[styles.timeText, { color: theme.textMuted }]}>
                    {item.startTime} {item.endTime ? ` - ${item.endTime}` : ''}
                  </Text>
                </View>

                <Text style={[styles.taskTitle, { color: theme.textPrimary, fontFamily: Typography.fontFamily.sansSemiBold }]}>
                  {item.title}
                </Text>

                <View style={styles.footerRow}>
                  <View style={[styles.placeBadge, { backgroundColor: theme.elevated, borderColor: theme.stroke }]}>
                    <Ionicons name="location-outline" size={13} color={theme.textMuted} />
                    <Text style={[styles.placeText, { color: theme.textSecondary }]}>{item.place.name}</Text>
                  </View>

                  {/* Actions: Restore & Delete Forever */}
                  <View style={styles.actionsGroup}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleRestore(item.id)}
                      style={[styles.actionRestoreBtn, { backgroundColor: PriorityColors.low.tint, borderColor: PriorityColors.low.border }]}
                    >
                      <Ionicons name="arrow-undo-outline" size={14} color={PriorityColors.low.main} />
                      <Text style={[styles.actionRestoreText, { color: PriorityColors.low.main }]}>restore</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handlePermanentDelete(item.id)}
                      style={styles.actionDeleteBtn}
                    >
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="trash-2" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary, fontFamily: Typography.fontFamily.sansSemiBold }]}>
              trash is empty
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Deleted tasks will appear here and can be restored anytime.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  purgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  purgeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  taskCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  priorityRail: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
  timeText: {
    fontSize: 12,
  },
  taskTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  placeText: {
    fontSize: 12,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionRestoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionRestoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionDeleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
