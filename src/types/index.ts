
// Core types for LifeOS

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

export interface ThemeState {
  isDarkMode: boolean;
  themeColor: string;
}

export type CalendarViewType = 'day' | 'week' | 'month';
