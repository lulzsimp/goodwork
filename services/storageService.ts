import AsyncStorage from '@react-native-async-storage/async-storage';
import { TaskItemData } from '../types/task';
import { INITIAL_STITCH_TASKS } from '../constants/mockData';

const TASKS_STORAGE_KEY = '@cruxwdev_tasks_v1';
const USER_PROFILE_KEY = '@cruxwdev_user_profile_v1';

export interface UserProfile {
  fullName: string;
  lastName: string;
}

export const storageService = {
  // --- User Profile (Name) ---
  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
      if (data) {
        return JSON.parse(data) as UserProfile;
      }
    } catch (e) {
      console.warn('Error reading user profile from AsyncStorage:', e);
    }
    return null;
  },

  saveUserProfile: async (fullName: string): Promise<UserProfile> => {
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);
    // Extract last name: if single word, use it; otherwise last token
    const lastName = parts.length > 1 ? parts[parts.length - 1] : trimmed;

    const profile: UserProfile = {
      fullName: trimmed,
      lastName: lastName.toLowerCase(),
    };

    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving user profile to AsyncStorage:', e);
    }
    return profile;
  },

  // --- Task Persistence ---
  getTasks: async (): Promise<TaskItemData[]> => {
    try {
      const data = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as TaskItemData[];
      }
      // Initialize with initial sample data on first run
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_STITCH_TASKS));
      return INITIAL_STITCH_TASKS;
    } catch (e) {
      console.warn('Error reading tasks from AsyncStorage, fallback to memory:', e);
      return INITIAL_STITCH_TASKS;
    }
  },

  saveTasks: async (tasks: TaskItemData[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Error saving tasks to AsyncStorage:', e);
    }
  },
};
