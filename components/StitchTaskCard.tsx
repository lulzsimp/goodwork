import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { PriorityColors, Themes, Typography, ThemeMode } from '../constants/theme';
import { TaskItemData, Subtask } from '../types/task';
import { Feather, Ionicons } from '@expo/vector-icons';

interface StitchTaskCardProps {
  task: TaskItemData;
  themeMode: ThemeMode;
  onPress: () => void;
  onToggleComplete: (task: TaskItemData) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDelete: (taskId: string) => void;
}

const SWIPE_THRESHOLD = 80;

export const StitchTaskCard: React.FC<StitchTaskCardProps> = ({
  task,
  themeMode,
  onPress,
  onToggleComplete,
  onToggleSubtask,
  onDelete,
}) => {
  const theme = Themes[themeMode];
  const pColor = PriorityColors[task.priority];

  const [isExpanded, setIsExpanded] = useState(true);
  const translateX = useSharedValue(0);

  // Separate and sort subtasks: Unfinished first, finished moved down
  const unfinishedSubtasks = task.subtasks.filter((s) => !s.isCompleted);
  const finishedSubtasks = task.subtasks.filter((s) => s.isCompleted);
  const sortedSubtasks: Subtask[] = [...unfinishedSubtasks, ...finishedSubtasks];

  const completedSubtasks = finishedSubtasks.length;
  const totalSubtasks = task.subtasks.length;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        runOnJS(onToggleComplete)(task);
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(onDelete)(task.id);
      }
      translateX.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.outerContainer}>
      {/* Background Action Indicators for Swipe Gesture */}
      <View style={styles.gestureBackground}>
        <View style={styles.gestureLeft}>
          <Ionicons
            name={task.isCompleted ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
            size={22}
            color={PriorityColors.low.main}
          />
          <Text style={[styles.gestureText, { color: PriorityColors.low.main }]}>
            {task.isCompleted ? 'undo' : 'complete'}
          </Text>
        </View>
        <View style={styles.gestureRight}>
          <Text style={[styles.gestureText, { color: '#EF4444' }]}>delete</Text>
          <Feather name="trash-2" size={20} color="#EF4444" />
        </View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[cardAnimatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={onPress}
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.stroke,
                opacity: task.isCompleted ? 0.6 : 1,
              },
            ]}
          >
            {/* Leftmost Continuous Railway Spine Track */}
            <View
              style={[
                styles.priorityRail,
                { backgroundColor: pColor.main },
              ]}
            />

            <View style={styles.cardContent}>
              {/* Top Main Row */}
              <View style={styles.topRow}>
                {/* Left Column: Priority Pill, Big Serif Start Time, End Time */}
                <View style={styles.leftColumn}>
                  <View
                    style={[
                      styles.priorityPill,
                      {
                        backgroundColor: pColor.tint,
                        borderColor: pColor.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: pColor.main },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: pColor.main },
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>

                  {/* Big Serif Start Time */}
                  <Text
                    style={[
                      styles.startTime,
                      {
                        color: pColor.main,
                        fontFamily: Typography.fontFamily.serif,
                      },
                    ]}
                  >
                    {task.startTime}
                  </Text>

                  {/* End Time */}
                  {task.endTime && (
                    <Text
                      style={[
                        styles.endTime,
                        {
                          color: theme.textMuted,
                          fontFamily: Typography.fontFamily.sansMedium,
                        },
                      ]}
                    >
                      {task.endTime}
                    </Text>
                  )}
                </View>

                {/* Right Column: Title, Place Tag, Subtask Count & Expand Chevron */}
                <View style={styles.rightColumn}>
                  <View style={styles.titleRow}>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.title,
                        {
                          color: theme.textPrimary,
                          fontFamily: Typography.fontFamily.sansSemiBold,
                          textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {task.title}
                    </Text>
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => setIsExpanded(!isExpanded)}
                    >
                      <Feather
                        name={isExpanded ? 'chevron-down' : 'chevron-right'}
                        size={16}
                        color={theme.textMuted}
                        style={styles.chevron}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Metadata Footer: Place & Subtask summary badge */}
                  <View style={styles.metaRow}>
                    {/* Location badge */}
                    <View
                      style={[
                        styles.placeBadge,
                        {
                          backgroundColor: theme.elevated,
                          borderColor: theme.stroke,
                        },
                      ]}
                    >
                      {task.place.type === 'virtual' ? (
                        <Ionicons
                          name="videocam-outline"
                          size={12}
                          color={pColor.main}
                          style={{ marginRight: 4 }}
                        />
                      ) : (
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color={theme.textMuted}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.placeText,
                          {
                            color: theme.textSecondary,
                            fontFamily: Typography.fontFamily.sans,
                          },
                        ]}
                      >
                        {task.place.name}
                      </Text>
                    </View>

                    {/* Subtask progress count badge */}
                    {totalSubtasks > 0 && (
                      <View
                        style={[
                          styles.subtaskBadge,
                          {
                            backgroundColor: pColor.tint,
                            borderColor: pColor.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={12}
                          color={pColor.main}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[
                            styles.subtaskText,
                            {
                              color: pColor.main,
                              fontFamily: Typography.fontFamily.sansBold,
                            },
                          ]}
                        >
                          {completedSubtasks}/{totalSubtasks}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Railway Subtasks Line Chart Tree Section */}
              {isExpanded && totalSubtasks > 0 && (
                <View
                  style={[
                    styles.railwaySection,
                    { borderTopColor: theme.strokeSubtle },
                  ]}
                >
                  {sortedSubtasks.map((subtask, index) => {
                    const isLast = index === sortedSubtasks.length - 1;
                    return (
                      <TouchableOpacity
                        key={subtask.id}
                        activeOpacity={0.75}
                        onPress={() => onToggleSubtask(task.id, subtask.id)}
                        style={styles.railwayNodeRow}
                      >
                        {/* Railway Node Visual */}
                        <View style={styles.railwayTrackContainer}>
                          {/* Vertical Connector Line */}
                          <View
                            style={[
                              styles.railwayVerticalLine,
                              {
                                backgroundColor: theme.stroke,
                                height: isLast ? '50%' : '100%',
                                top: index === 0 ? '50%' : 0,
                              },
                            ]}
                          />
                          {/* Branch Curve to Node */}
                          <View
                            style={[
                              styles.railwayBranchLine,
                              { borderColor: theme.stroke },
                            ]}
                          />
                          {/* Subtask Checkpoint Station Dot */}
                          <View
                            style={[
                              styles.railwayStationDot,
                              {
                                borderColor: subtask.isCompleted
                                  ? PriorityColors.low.main
                                  : pColor.main,
                                backgroundColor: subtask.isCompleted
                                  ? PriorityColors.low.main
                                  : theme.surface,
                              },
                            ]}
                          >
                            {subtask.isCompleted && (
                              <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                            )}
                          </View>
                        </View>

                        {/* Subtask Content */}
                        <View
                          style={[
                            styles.subtaskCard,
                            {
                              backgroundColor: theme.elevated,
                              borderColor: theme.stroke,
                              opacity: subtask.isCompleted ? 0.65 : 1,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.subtaskTitle,
                              {
                                color: subtask.isCompleted
                                  ? theme.textMuted
                                  : theme.textPrimary,
                                textDecorationLine: subtask.isCompleted
                                  ? 'line-through'
                                  : 'none',
                                fontFamily: Typography.fontFamily.sansMedium,
                              },
                            ]}
                          >
                            {subtask.title}
                          </Text>

                          {subtask.isCompleted ? (
                            <View style={styles.statusPillDone}>
                              <Text style={styles.statusPillDoneText}>done</Text>
                            </View>
                          ) : (
                            <View
                              style={[
                                styles.statusPillTodo,
                                {
                                  backgroundColor: pColor.tint,
                                  borderColor: pColor.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusPillTodoText,
                                  { color: pColor.main },
                                ]}
                              >
                                next
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    position: 'relative',
  },
  gestureBackground: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gestureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gestureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gestureText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  priorityRail: {
    width: 4.5,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  topRow: {
    flexDirection: 'row',
  },
  leftColumn: {
    width: 76,
    alignItems: 'center',
    paddingRight: 10,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  startTime: {
    fontSize: 22,
    lineHeight: 26,
    marginTop: 2,
  },
  endTime: {
    fontSize: 11,
    marginTop: 1,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    paddingRight: 8,
  },
  chevron: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: '65%',
  },
  placeText: {
    fontSize: 11,
  },
  subtaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  subtaskText: {
    fontSize: 11,
  },
  // Railway Tree Styles
  railwaySection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    paddingLeft: 4,
  },
  railwayNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  railwayTrackContainer: {
    width: 28,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 6,
  },
  railwayVerticalLine: {
    position: 'absolute',
    left: 8,
    width: 2,
  },
  railwayBranchLine: {
    position: 'absolute',
    left: 8,
    top: 18,
    width: 10,
    height: 2,
    borderTopWidth: 1.5,
  },
  railwayStationDot: {
    position: 'absolute',
    left: 14,
    top: 11,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  subtaskCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 12,
    paddingRight: 8,
  },
  statusPillDone: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillDoneText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'lowercase',
  },
  statusPillTodo: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillTodoText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
});
