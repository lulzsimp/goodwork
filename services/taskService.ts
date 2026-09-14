import { TaskItemData, Subtask } from '../types/task';
import { storageService } from './storageService';

type TasksListener = (tasks: TaskItemData[]) => void;
const listeners: TasksListener[] = [];

let memoryTasks: TaskItemData[] = [];
let isInitialized = false;

const notifyListeners = () => {
  listeners.forEach((listener) => listener([...memoryTasks]));
};

export const taskService = {
  // Initialize and subscribe to tasks from AsyncStorage / Local state
  subscribeToTasks: (callback: TasksListener): (() => void) => {
    listeners.push(callback);

    if (!isInitialized) {
      storageService.getTasks().then((storedTasks) => {
        memoryTasks = storedTasks;
        isInitialized = true;
        notifyListeners();
      });
    } else {
      callback([...memoryTasks]);
    }

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  // Create new task
  createTask: async (
    taskData: Omit<TaskItemData, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TaskItemData> => {
    const newTask: TaskItemData = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryTasks = [...memoryTasks, newTask];
    await storageService.saveTasks(memoryTasks);
    notifyListeners();
    return newTask;
  },

  // Update existing task
  updateTask: async (
    taskId: string,
    taskData: Partial<TaskItemData>
  ): Promise<void> => {
    memoryTasks = memoryTasks.map((t) =>
      t.id === taskId
        ? { ...t, ...taskData, updatedAt: new Date().toISOString() }
        : t
    );
    await storageService.saveTasks(memoryTasks);
    notifyListeners();
  },

  // Toggle main task completion
  toggleTaskCompletion: async (taskId: string, isCompleted: boolean): Promise<void> => {
    memoryTasks = memoryTasks.map((t) =>
      t.id === taskId
        ? { ...t, isCompleted, updatedAt: new Date().toISOString() }
        : t
    );
    await storageService.saveTasks(memoryTasks);
    notifyListeners();
  },

  // Toggle subtask completion
  toggleSubtask: async (taskId: string, subtaskId: string): Promise<void> => {
    memoryTasks = memoryTasks.map((t) => {
      if (t.id !== taskId) return t;
      const updatedSubtasks = t.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
      );
      return {
        ...t,
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString(),
      };
    });
    await storageService.saveTasks(memoryTasks);
    notifyListeners();
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    memoryTasks = memoryTasks.filter((t) => t.id !== taskId);
    await storageService.saveTasks(memoryTasks);
    notifyListeners();
  },
};
