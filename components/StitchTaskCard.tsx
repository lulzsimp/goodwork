import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
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

const SWIPE_THRESHOLD = 65;

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
  const pan = useRef(new Animated.Value(0)).current;

  // Separate and sort subtasks: Unfinished first, finished moved down
  const unfinishedSubtasks = task.subtasks.filter((s) => !s.isCompleted);
  const finishedSubtasks = task.subtasks.filter((s) => s.isCompleted);
  const sortedSubtasks: Subtask[] = [...unfinishedSubtasks, ...finishedSubtasks];

  const completedSubtasks = finishedSubtasks.length;
  const totalSubtasks = task.subtasks.length;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        pan.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          onToggleComplete(task);
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          onDelete(task.id);
        }
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: false,
          friction: 6,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.outerContainer}>
      {/* Background Action Indicators for Swipe Gesture */}
      <View style={styles.gestureBackground}>
        <View style={styles.gestureLeft}>
          <Ionicons
            name={task.isCompleted ? 'arrow-undo-outline' : 'checkmark-circle-outline'}
            size={24}
            color={PriorityColors.low.main}
          />
          <Text style={[styles.gestureText, { color: PriorityColors.low.main }]}>
            {task.isCompleted ? 'undo' : 'complete'}
          </Text>
        </View>
        <View style={styles.gestureRight}>
          <Text style={[styles.gestureText, { color: '#EF4444' }]}>delete</Text>
          <Feather name="trash-2" size={22} color="#EF4444" />
        </View>
      </View>

      <Animated.View
        style={{ transform: [{ translateX: pan }] }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={onPress}
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.stroke,
              opacity: task.isCompleted ? 0.65 : 1,
            },
          ]}
        >
          {/* Leftmost Continuous Railway Spine Track */}
          <View
            style={[
              styles.priorityRail,
              { backgroundColor: task.isCompleted ? PriorityColors.low.main : pColor.main },
            ]}
          />

          <View style={styles.cardContent}>
            {/* Top Main Row */}
            <View style={styles.topRow}>
              {/* Left Column: Checkbox / Priority Pill, Big Serif Start Time, End Time */}
              <View style={styles.leftColumn}>
                {/* Interactive Status Pill Button */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => onToggleComplete(task)}
                  style={[
                    styles.priorityPill,
                    {
                      backgroundColor: task.isCompleted ? PriorityColors.low.tint : pColor.tint,
                      borderColor: task.isCompleted ? PriorityColors.low.border : pColor.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: task.isCompleted ? PriorityColors.low.main : pColor.main },
                    ]}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      { color: task.isCompleted ? PriorityColors.low.main : pColor.main },
                    ]}
                  >
                    {task.isCompleted ? 'done' : task.priority}
                  </Text>
                </TouchableOpacity>

                {/* Big Serif Start Time */}
                <Text
                  style={[
                    styles.startTime,
                    {
                      color: task.isCompleted ? PriorityColors.low.main : pColor.main,
                      fontFamily: Typography.fontFamily.serif,
                    },
                  ]}
                >
                  {task.startTime}
                </Text>

                {/* End Time */}
                {task.endTime ? (
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
                ) : null}
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
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => setIsExpanded(!isExpanded)}
                  >
                    <Feather
                      name={isExpanded ? 'chevron-down' : 'chevron-right'}
                      size={18}
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
                        size={14}
                        color={pColor.main}
                        style={{ marginRight: 6 }}
                      />
                    ) : (
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={theme.textMuted}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.placeText,
                        {
                          color: theme.textSecondary,
                          fontFamily: Typography.fontFamily.sansMedium,
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
                          backgroundColor: task.isCompleted ? PriorityColors.low.tint : pColor.tint,
                          borderColor: task.isCompleted ? PriorityColors.low.border : pColor.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={14}
                        color={task.isCompleted ? PriorityColors.low.main : pColor.main}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[
                          styles.subtaskText,
                          {
                            color: task.isCompleted ? PriorityColors.low.main : pColor.main,
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
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
    position: 'relative',
  },
  gestureBackground: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  gestureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gestureRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gestureText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  priorityRail: {
    width: 5,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
  },
  leftColumn: {
    width: 86,
    alignItems: 'center',
    paddingRight: 10,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  startTime: {
    fontSize: 24,
    lineHeight: 28,
    marginTop: 2,
  },
  endTime: {
    fontSize: 13,
    marginTop: 2,
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
    fontSize: 17,
    lineHeight: 23,
    paddingRight: 8,
  },
  chevron: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  placeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: '68%',
  },
  placeText: {
    fontSize: 13,
  },
  subtaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  subtaskText: {
    fontSize: 13,
  },
  railwaySection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    paddingLeft: 4,
  },
  railwayNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  railwayTrackContainer: {
    width: 32,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 6,
  },
  railwayVerticalLine: {
    position: 'absolute',
    left: 10,
    width: 2.5,
  },
  railwayBranchLine: {
    position: 'absolute',
    left: 10,
    top: 20,
    width: 12,
    height: 2,
    borderTopWidth: 2,
  },
  railwayStationDot: {
    position: 'absolute',
    left: 16,
    top: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  subtaskTitle: {
    flex: 1,
    fontSize: 14,
    paddingRight: 10,
  },
  statusPillDone: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillDoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'lowercase',
  },
  statusPillTodo: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillTodoText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
});
