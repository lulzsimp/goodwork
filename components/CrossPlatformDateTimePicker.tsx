import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { Themes, Typography, ThemeMode, PriorityColors } from '../constants/theme';
import { Feather, Ionicons } from '@expo/vector-icons';

interface CrossPlatformDateTimePickerProps {
  themeMode: ThemeMode;
  selectedDate: Date;
  startTime: { hour: number; minute: number; period: 'AM' | 'PM' };
  endTime: { hour: number; minute: number; period: 'AM' | 'PM' };
  activeTab: 'date' | 'start' | 'end';
  onTabChange: (tab: 'date' | 'start' | 'end') => void;
  onDateChange: (date: Date) => void;
  onStartTimeChange: (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => void;
  onEndTimeChange: (time: { hour: number; minute: number; period: 'AM' | 'PM' }) => void;
  priorityColor?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export const CrossPlatformDateTimePicker: React.FC<CrossPlatformDateTimePickerProps> = ({
  themeMode,
  selectedDate,
  startTime,
  endTime,
  activeTab,
  onTabChange,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
  priorityColor = PriorityColors.urgent.main,
}) => {
  const theme = Themes[themeMode];

  // Calendar month navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const prevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  // Generate days in current month grid
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= totalDays; day++) {
    calendarCells.push(new Date(year, month, day));
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => isSameDay(d, new Date());

  const activeTime = activeTab === 'start' ? startTime : endTime;
  const updateActiveTime = activeTab === 'start' ? onStartTimeChange : onEndTimeChange;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: theme.stroke,
        },
      ]}
    >
      {/* 3-Tab Segment Selector: Date | Start Time | End Time */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.elevated,
            borderColor: theme.stroke,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => onTabChange('date')}
          style={[
            styles.tabItem,
            activeTab === 'date' && [
              styles.tabItemActive,
              { backgroundColor: theme.surface, borderColor: theme.stroke },
            ],
          ]}
        >
          <Feather
            name="calendar"
            size={14}
            color={activeTab === 'date' ? priorityColor : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'date' ? theme.textPrimary : theme.textSecondary,
                fontFamily: activeTab === 'date'
                  ? Typography.fontFamily.sansBold
                  : Typography.fontFamily.sansMedium,
              },
            ]}
          >
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onTabChange('start')}
          style={[
            styles.tabItem,
            activeTab === 'start' && [
              styles.tabItemActive,
              { backgroundColor: theme.surface, borderColor: theme.stroke },
            ],
          ]}
        >
          <Feather
            name="clock"
            size={14}
            color={activeTab === 'start' ? priorityColor : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'start' ? theme.textPrimary : theme.textSecondary,
                fontFamily: activeTab === 'start'
                  ? Typography.fontFamily.sansBold
                  : Typography.fontFamily.sansMedium,
              },
            ]}
          >
            {startTime.hour}:{startTime.minute < 10 ? `0${startTime.minute}` : startTime.minute} {startTime.period}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onTabChange('end')}
          style={[
            styles.tabItem,
            activeTab === 'end' && [
              styles.tabItemActive,
              { backgroundColor: theme.surface, borderColor: theme.stroke },
            ],
          ]}
        >
          <Feather
            name="clock"
            size={14}
            color={activeTab === 'end' ? priorityColor : theme.textMuted}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'end' ? theme.textPrimary : theme.textSecondary,
                fontFamily: activeTab === 'end'
                  ? Typography.fontFamily.sansBold
                  : Typography.fontFamily.sansMedium,
              },
            ]}
          >
            {endTime.hour}:{endTime.minute < 10 ? `0${endTime.minute}` : endTime.minute} {endTime.period}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB CONTENT 1: Interactive Monthly Calendar Grid */}
      {activeTab === 'date' && (
        <View style={styles.calendarBody}>
          {/* Month Header with Prev/Next Controls */}
          <View style={styles.monthHeader}>
            <Text
              style={[
                styles.monthTitle,
                {
                  color: theme.textPrimary,
                  fontFamily: Typography.fontFamily.sansBold,
                },
              ]}
            >
              {MONTH_NAMES[month]} {year}
            </Text>

            <View style={styles.monthNav}>
              <TouchableOpacity
                onPress={prevMonth}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.navBtn, { borderColor: theme.stroke }]}
              >
                <Feather name="chevron-left" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={nextMonth}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.navBtn, { borderColor: theme.stroke }]}
              >
                <Feather name="chevron-right" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Days of Week Header */}
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((d) => (
              <Text
                key={d}
                style={[
                  styles.dayLabel,
                  { color: theme.textMuted, fontFamily: Typography.fontFamily.sansSemiBold },
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Days Grid Cells */}
          <View style={styles.gridMatrix}>
            {calendarCells.map((dateObj, idx) => {
              if (!dateObj) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }

              const isSelected = isSameDay(dateObj, selectedDate);
              const isCurr = isToday(dateObj);

              return (
                <TouchableOpacity
                  key={`day-${dateObj.toISOString()}`}
                  activeOpacity={0.7}
                  onPress={() => onDateChange(dateObj)}
                  style={[
                    styles.dayCell,
                    isSelected && [
                      styles.dayCellSelected,
                      { backgroundColor: priorityColor },
                    ],
                    !isSelected && isCurr && [
                      styles.dayCellToday,
                      { borderColor: priorityColor },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : isCurr
                          ? priorityColor
                          : theme.textPrimary,
                        fontFamily: isSelected || isCurr
                          ? Typography.fontFamily.sansBold
                          : Typography.fontFamily.sans,
                      },
                    ]}
                  >
                    {dateObj.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Preset Buttons: Today, Tomorrow, Next Week */}
          <View style={[styles.quickPresetsRow, { borderTopColor: theme.stroke }]}>
            <TouchableOpacity
              onPress={() => onDateChange(new Date())}
              style={[styles.quickDatePill, { backgroundColor: theme.elevated, borderColor: theme.stroke }]}
            >
              <Text style={[styles.quickDateText, { color: theme.textSecondary }]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                onDateChange(tomorrow);
              }}
              style={[styles.quickDatePill, { backgroundColor: theme.elevated, borderColor: theme.stroke }]}
            >
              <Text style={[styles.quickDateText, { color: theme.textSecondary }]}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const nextMon = new Date();
                nextMon.setDate(nextMon.getDate() + ((1 + 7 - nextMon.getDay()) % 7 || 7));
                onDateChange(nextMon);
              }}
              style={[styles.quickDatePill, { backgroundColor: theme.elevated, borderColor: theme.stroke }]}
            >
              <Text style={[styles.quickDateText, { color: theme.textSecondary }]}>Next Monday</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TAB CONTENT 2 & 3: Custom Exact Time Slot Picker (Start / End) */}
      {(activeTab === 'start' || activeTab === 'end') && (
        <View style={styles.timeBody}>
          <View style={styles.timeHeaderRow}>
            <Text
              style={[
                styles.timeHeaderTitle,
                {
                  color: theme.textSecondary,
                  fontFamily: Typography.fontFamily.sansSemiBold,
                },
              ]}
            >
              Set {activeTab === 'start' ? 'Start' : 'End'} Time:
            </Text>
            <Text
              style={[
                styles.timeHeaderValue,
                {
                  color: priorityColor,
                  fontFamily: Typography.fontFamily.sansBold,
                },
              ]}
            >
              {activeTime.hour}:{activeTime.minute < 10 ? `0${activeTime.minute}` : activeTime.minute} {activeTime.period}
            </Text>
          </View>

          {/* Period Toggle AM / PM */}
          <View style={styles.periodToggleRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => updateActiveTime({ ...activeTime, period: 'AM' })}
              style={[
                styles.periodBtn,
                activeTime.period === 'AM' && [
                  styles.periodBtnActive,
                  { backgroundColor: priorityColor },
                ],
                activeTime.period !== 'AM' && {
                  backgroundColor: theme.elevated,
                  borderColor: theme.stroke,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  {
                    color: activeTime.period === 'AM' ? '#FFFFFF' : theme.textSecondary,
                    fontFamily: Typography.fontFamily.sansBold,
                  },
                ]}
              >
                AM (Morning)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => updateActiveTime({ ...activeTime, period: 'PM' })}
              style={[
                styles.periodBtn,
                activeTime.period === 'PM' && [
                  styles.periodBtnActive,
                  { backgroundColor: priorityColor },
                ],
                activeTime.period !== 'PM' && {
                  backgroundColor: theme.elevated,
                  borderColor: theme.stroke,
                },
              ]}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  {
                    color: activeTime.period === 'PM' ? '#FFFFFF' : theme.textSecondary,
                    fontFamily: Typography.fontFamily.sansBold,
                  },
                ]}
              >
                PM (Afternoon / Evening)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hour Horizontal Wheel */}
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>Select Hour</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wheelScroll}
          >
            {HOURS.map((h) => {
              const isSelected = activeTime.hour === h;
              return (
                <TouchableOpacity
                  key={`hour-${h}`}
                  onPress={() => updateActiveTime({ ...activeTime, hour: h })}
                  style={[
                    styles.slotBtn,
                    isSelected && { backgroundColor: priorityColor, borderColor: priorityColor },
                    !isSelected && { backgroundColor: theme.elevated, borderColor: theme.stroke },
                  ]}
                >
                  <Text
                    style={[
                      styles.slotBtnText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        fontFamily: isSelected
                          ? Typography.fontFamily.sansBold
                          : Typography.fontFamily.sansMedium,
                      },
                    ]}
                  >
                    {h < 10 ? `0${h}` : h}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Minute Horizontal Wheel */}
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted, marginTop: 12 }]}>Select Minute</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wheelScroll}
          >
            {MINUTES.map((m) => {
              const minVal = parseInt(m, 10);
              const isSelected = activeTime.minute === minVal;
              return (
                <TouchableOpacity
                  key={`min-${m}`}
                  onPress={() => updateActiveTime({ ...activeTime, minute: minVal })}
                  style={[
                    styles.slotBtn,
                    isSelected && { backgroundColor: priorityColor, borderColor: priorityColor },
                    !isSelected && { backgroundColor: theme.elevated, borderColor: theme.stroke },
                  ]}
                >
                  <Text
                    style={[
                      styles.slotBtnText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        fontFamily: isSelected
                          ? Typography.fontFamily.sansBold
                          : Typography.fontFamily.sansMedium,
                      },
                    ]}
                  >
                    :{m}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    margin: 10,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  tabItemActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
  },
  calendarBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 16,
  },
  monthNav: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
  },
  gridMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 12,
  },
  dayCellSelected: {
    borderRadius: 12,
  },
  dayCellToday: {
    borderWidth: 1.5,
  },
  dayCellText: {
    fontSize: 14,
  },
  quickPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  quickDatePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeBody: {
    padding: 14,
  },
  timeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeHeaderTitle: {
    fontSize: 14,
  },
  timeHeaderValue: {
    fontSize: 16,
  },
  periodToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  periodBtnActive: {
    borderWidth: 0,
  },
  periodBtnText: {
    fontSize: 13,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 2,
  },
  wheelScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  slotBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBtnText: {
    fontSize: 14,
  },
});
