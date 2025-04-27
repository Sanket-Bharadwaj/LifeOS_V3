// Data store utilities for LifeOS
// In a real mobile app, this would use SQLite from Expo
// For this web demo, we'll use localStorage

import { User } from '../types';

// Task related types and functions
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  completed: boolean;
  projectId?: string;
  category?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export const getTasks = (userId: string): Task[] => {
  const tasksJson = localStorage.getItem(`lifeos_tasks_${userId}`);
  if (!tasksJson) return [];
  
  try {
    return JSON.parse(tasksJson);
  } catch (e) {
    console.error('Error parsing tasks', e);
    return [];
  }
};

export const getTasksByProject = (userId: string, projectId: string): Task[] => {
  const tasks = getTasks(userId);
  return tasks.filter(task => task.projectId === projectId);
};

export const saveTask = (task: Task): Task => {
  const tasks = getTasks(task.userId);
  const existingTaskIndex = tasks.findIndex(t => t.id === task.id);
  
  task.updatedAt = new Date().toISOString();
  
  if (existingTaskIndex >= 0) {
    tasks[existingTaskIndex] = task;
  } else {
    task.createdAt = new Date().toISOString();
    tasks.push(task);
  }
  
  localStorage.setItem(`lifeos_tasks_${task.userId}`, JSON.stringify(tasks));
  return task;
};

export const deleteTask = (userId: string, taskId: string): boolean => {
  const tasks = getTasks(userId);
  const updatedTasks = tasks.filter(t => t.id !== taskId);
  
  if (updatedTasks.length === tasks.length) {
    return false; // Task not found
  }
  
  localStorage.setItem(`lifeos_tasks_${userId}`, JSON.stringify(updatedTasks));
  return true;
};

// Project related types and functions
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export const getProjects = (userId: string): Project[] => {
  const projectsJson = localStorage.getItem(`lifeos_projects_${userId}`);
  if (!projectsJson) return [];
  
  try {
    return JSON.parse(projectsJson);
  } catch (e) {
    console.error('Error parsing projects', e);
    return [];
  }
};

export const saveProject = (project: Project): Project => {
  const projects = getProjects(project.userId);
  const existingProjectIndex = projects.findIndex(p => p.id === project.id);
  
  project.updatedAt = new Date().toISOString();
  
  if (existingProjectIndex >= 0) {
    projects[existingProjectIndex] = project;
  } else {
    project.createdAt = new Date().toISOString();
    projects.push(project);
  }
  
  localStorage.setItem(`lifeos_projects_${project.userId}`, JSON.stringify(projects));
  return project;
};

export const deleteProject = (userId: string, projectId: string): boolean => {
  const projects = getProjects(userId);
  const updatedProjects = projects.filter(p => p.id !== projectId);
  
  if (updatedProjects.length === projects.length) {
    return false; // Project not found
  }
  
  localStorage.setItem(`lifeos_projects_${userId}`, JSON.stringify(updatedProjects));
  
  // Also delete or update associated tasks
  const tasks = getTasks(userId);
  const updatedTasks = tasks.map(task => {
    if (task.projectId === projectId) {
      return { ...task, projectId: undefined };
    }
    return task;
  });
  
  localStorage.setItem(`lifeos_tasks_${userId}`, JSON.stringify(updatedTasks));
  return true;
};

// Habit related types and functions
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  color?: string;
  icon?: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  notes?: string;
}

export const getHabits = (userId: string): Habit[] => {
  const habitsJson = localStorage.getItem(`lifeos_habits_${userId}`);
  if (!habitsJson) return [];
  
  try {
    return JSON.parse(habitsJson);
  } catch (e) {
    console.error('Error parsing habits', e);
    return [];
  }
};

export const getHabitLogs = (userId: string, habitId?: string, startDate?: string, endDate?: string): HabitLog[] => {
  const logsJson = localStorage.getItem(`lifeos_habit_logs_${userId}`);
  if (!logsJson) return [];
  
  try {
    let logs: HabitLog[] = JSON.parse(logsJson);
    
    // Filter by habit ID if provided
    if (habitId) {
      logs = logs.filter(log => log.habitId === habitId);
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      logs = logs.filter(log => log.date >= startDate && log.date <= endDate);
    } else if (startDate) {
      logs = logs.filter(log => log.date >= startDate);
    } else if (endDate) {
      logs = logs.filter(log => log.date <= endDate);
    }
    
    return logs;
  } catch (e) {
    console.error('Error parsing habit logs', e);
    return [];
  }
};

export const saveHabit = (habit: Habit): Habit => {
  const habits = getHabits(habit.userId);
  const existingHabitIndex = habits.findIndex(h => h.id === habit.id);
  
  if (existingHabitIndex >= 0) {
    habits[existingHabitIndex] = habit;
  } else {
    habit.createdAt = new Date().toISOString();
    habits.push(habit);
  }
  
  localStorage.setItem(`lifeos_habits_${habit.userId}`, JSON.stringify(habits));
  return habit;
};

export const saveHabitLog = (log: HabitLog): HabitLog => {
  const logs = getHabitLogs(log.userId);
  
  // Check for existing log for this habit and date
  const existingLogIndex = logs.findIndex(l => l.habitId === log.habitId && l.date === log.date);
  
  if (existingLogIndex >= 0) {
    logs[existingLogIndex] = log;
  } else {
    logs.push(log);
  }
  
  localStorage.setItem(`lifeos_habit_logs_${log.userId}`, JSON.stringify(logs));
  return log;
};

// Goal related types and functions
export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  deadline?: string; // ISO date string
  milestones: GoalMilestone[];
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export const getGoals = (userId: string): Goal[] => {
  const goalsJson = localStorage.getItem(`lifeos_goals_${userId}`);
  if (!goalsJson) return [];
  
  try {
    return JSON.parse(goalsJson);
  } catch (e) {
    console.error('Error parsing goals', e);
    return [];
  }
};

export const saveGoal = (goal: Goal): Goal => {
  const goals = getGoals(goal.userId);
  const existingGoalIndex = goals.findIndex(g => g.id === goal.id);
  
  goal.updatedAt = new Date().toISOString();
  
  // Calculate progress based on milestones
  if (goal.milestones && goal.milestones.length > 0) {
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    goal.progress = Math.round((completedMilestones / goal.milestones.length) * 100);
  }
  
  if (existingGoalIndex >= 0) {
    goals[existingGoalIndex] = goal;
  } else {
    goal.createdAt = new Date().toISOString();
    goals.push(goal);
  }
  
  localStorage.setItem(`lifeos_goals_${goal.userId}`, JSON.stringify(goals));
  return goal;
};

// Note related types and functions
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags?: string[];
  color?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getNotes = (userId: string): Note[] => {
  const notesJson = localStorage.getItem(`lifeos_notes_${userId}`);
  if (!notesJson) return [];
  
  try {
    return JSON.parse(notesJson);
  } catch (e) {
    console.error('Error parsing notes', e);
    return [];
  }
};

export const saveNote = (note: Note): Note => {
  const notes = getNotes(note.userId);
  const existingNoteIndex = notes.findIndex(n => n.id === note.id);
  
  note.updatedAt = new Date().toISOString();
  
  if (existingNoteIndex >= 0) {
    notes[existingNoteIndex] = note;
  } else {
    note.createdAt = new Date().toISOString();
    notes.push(note);
  }
  
  localStorage.setItem(`lifeos_notes_${note.userId}`, JSON.stringify(notes));
  return note;
};

export const deleteNote = (userId: string, noteId: string): boolean => {
  const notes = getNotes(userId);
  const updatedNotes = notes.filter(n => n.id !== noteId);
  
  if (updatedNotes.length === notes.length) {
    return false; // Note not found
  }
  
  localStorage.setItem(`lifeos_notes_${userId}`, JSON.stringify(updatedNotes));
  return true;
};

// Journal entry related types and functions
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export const getJournalEntries = (userId: string): JournalEntry[] => {
  const entriesJson = localStorage.getItem(`lifeos_journal_entries_${userId}`);
  if (!entriesJson) return [];
  
  try {
    return JSON.parse(entriesJson);
  } catch (e) {
    console.error('Error parsing journal entries', e);
    return [];
  }
};

export const saveJournalEntry = (entry: JournalEntry): JournalEntry => {
  const entries = getJournalEntries(entry.userId);
  const existingEntryIndex = entries.findIndex(e => e.id === entry.id);
  
  entry.updatedAt = new Date().toISOString();
  
  if (existingEntryIndex >= 0) {
    entries[existingEntryIndex] = entry;
  } else {
    entry.createdAt = new Date().toISOString();
    entries.push(entry);
  }
  
  localStorage.setItem(`lifeos_journal_entries_${entry.userId}`, JSON.stringify(entries));
  return entry;
};

export const deleteJournalEntry = (userId: string, entryId: string): boolean => {
  const entries = getJournalEntries(userId);
  const updatedEntries = entries.filter(e => e.id !== entryId);
  
  if (updatedEntries.length === entries.length) {
    return false; // Entry not found
  }
  
  localStorage.setItem(`lifeos_journal_entries_${userId}`, JSON.stringify(updatedEntries));
  return true;
};

// Generic utilities for data export
export const getUserData = (userId: string) => {
  return {
    tasks: getTasks(userId),
    projects: getProjects(userId),
    habits: getHabits(userId),
    habitLogs: getHabitLogs(userId),
    goals: getGoals(userId),
    notes: getNotes(userId),
    journalEntries: getJournalEntries(userId),
  };
};

export const deleteHabit = (userId: string, habitId: string): boolean => {
  const habits = getHabits(userId);
  const updatedHabits = habits.filter(h => h.id !== habitId);
  
  if (updatedHabits.length === habits.length) {
    return false; // Habit not found
  }
  
  localStorage.setItem(`lifeos_habits_${userId}`, JSON.stringify(updatedHabits));
  
  // Also delete associated habit logs
  const logs = getHabitLogs(userId);
  const updatedLogs = logs.filter(log => log.habitId !== habitId);
  localStorage.setItem(`lifeos_habit_logs_${userId}`, JSON.stringify(updatedLogs));
  
  return true;
};

export const deleteGoal = (userId: string, goalId: string): boolean => {
  const goals = getGoals(userId);
  const updatedGoals = goals.filter(g => g.id !== goalId);
  
  if (updatedGoals.length === goals.length) {
    return false; // Goal not found
  }
  
  localStorage.setItem(`lifeos_goals_${userId}`, JSON.stringify(updatedGoals));
  return true;
};
