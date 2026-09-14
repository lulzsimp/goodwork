export type PriorityLevel = 'urgent' | 'high' | 'low';
export type FilterPeriod = 'daily' | 'weekly' | 'all';
export type RecurrenceOption = 'daily' | 'weekly' | 'does_not_repeat';
export type ReminderOption = '15_min_before' | '30_min_before' | 'at_time' | '1_day_before';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  priority?: PriorityLevel;
}

export interface PlaceLocation {
  id: string;
  name: string;
  type?: 'physical' | 'virtual';
  room?: string;
}

export interface TaskItemData {
  id: string;
  title: string;
  note?: string;
  priority: PriorityLevel;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:30 AM"
  date: string;      // e.g. "Oct 24, 2026"
  dateTimestamp?: number;
  period: FilterPeriod;
  recurring?: RecurrenceOption;
  remindWhen?: ReminderOption;
  place: PlaceLocation;
  subtasks: Subtask[];
  isCompleted: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}
