
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from './utils/auth';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import Calendar from './pages/Calendar';
import Journal from './pages/Journal';
import Settings from './pages/Settings';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  
  // Check for user session on app start
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
    
    // Check for stored theme preference
    const themeMode = localStorage.getItem('lifeos_theme_mode');
    const storedTheme = localStorage.getItem('lifeos_theme');
    
    if (themeMode === 'auto') {
      // If auto mode, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (storedTheme === 'light') {
      // If explicitly set to light, use light mode
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark mode
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lifeos_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lifeos_theme', 'light');
    }
  };
  
  // Handle user login
  const handleLogin = (user: any) => {
    setUser(user);
  };
  
  // Handle user logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lifeos_current_user');
  };
  
  // Update user data
  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {!user ? (
            // Public routes
            <Routes>
              <Route path="/*" element={<AuthPage onLogin={handleLogin} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
            </Routes>
          ) : (
            // Protected routes
            <Routes>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/tasks" element={<Tasks user={user} />} />
              <Route path="/habits" element={<Habits user={user} />} />
              <Route path="/goals" element={<Goals user={user} />} />
              <Route path="/calendar" element={<Calendar user={user} />} />
              <Route path="/journal" element={<Journal user={user} />} />
              <Route path="/settings" element={
                <Settings 
                  user={user} 
                  onUpdateUser={handleUpdateUser} 
                  onLogout={handleLogout} 
                  isDarkMode={isDarkMode} 
                  toggleTheme={toggleTheme} 
                />
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
