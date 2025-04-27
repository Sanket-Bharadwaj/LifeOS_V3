
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import { updateUserProfile } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sun, Moon, Laptop } from 'lucide-react';

interface SettingsProps {
  user: any;
  onUpdateUser: (user: any) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  user, 
  onUpdateUser, 
  onLogout, 
  isDarkMode, 
  toggleTheme 
}) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>(isDarkMode ? 'dark' : 'light');
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    
    // Check for system preference if auto is selected
    if (themeMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark !== isDarkMode) {
        toggleTheme();
      }
    }
  }, [user]);
  
  // Set up listener for system theme changes when auto is selected
  useEffect(() => {
    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const shouldBeDark = e.matches;
        if (shouldBeDark !== isDarkMode) {
          toggleTheme();
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode, isDarkMode, toggleTheme]);
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.vibrate && navigator.vibrate(100);
    setError(null);
    
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }
    
    setIsLoading(true);
    
    // Update user profile
    const success = updateUserProfile(user.id, { name, email });
    
    if (success) {
      // Update user in parent component
      onUpdateUser({
        ...user,
        name,
        email
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated",
      });
    } else {
      setError('Failed to update profile');
    }
    
    setIsLoading(false);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.vibrate && navigator.vibrate(100);
    setError(null);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, we'd verify the current password here first
    // For this demo, we'll just update the password
    const success = updateUserProfile(user.id, { password: newPassword });
    
    if (success) {
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });
      
      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError('Failed to update password');
    }
    
    setIsLoading(false);
  };
  
  const handleLogout = () => {
    navigator.vibrate && navigator.vibrate(100);
    onLogout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };
  
  const handleExportData = () => {
    navigator.vibrate && navigator.vibrate(100);
    // This would generate and download all user data in a real app
    toast({
      title: "Data Export",
      description: "All your data would be exported in the real app",
    });
  };
  
  const handleThemeChange = (value: 'light' | 'dark' | 'auto') => {
    navigator.vibrate && navigator.vibrate(50);
    setThemeMode(value);
    
    if (value === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark !== isDarkMode) {
        toggleTheme();
      }
    } else {
      const shouldBeDark = value === 'dark';
      if (shouldBeDark !== isDarkMode) {
        toggleTheme();
      }
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('lifeos_theme_mode', value);
    if (value !== 'auto') {
      localStorage.setItem('lifeos_theme', value);
    }
  };
  
  return (
    <div className="screen-container pb-32">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-8">
        {/* Profile Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                onClick={() => navigator.vibrate && navigator.vibrate(50)}
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Password Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                onClick={() => navigator.vibrate && navigator.vibrate(50)}
              >
                {isLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Appearance Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how LifeOS looks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme-selector">Theme</Label>
                <Select 
                  value={themeMode} 
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light" className="flex items-center">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark" className="flex items-center">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="auto" className="flex items-center">
                      <div className="flex items-center">
                        <Laptop className="mr-2 h-4 w-4" />
                        Auto (System)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Data Management */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>
              Manage your data and account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Export your data as a PDF file
              </p>
              <Button 
                variant="outline" 
                onClick={handleExportData}
              >
                Export Data
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Sign out from your account
              </p>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* App Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>About LifeOS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0<br />
              Made with ❤️ by <a 
                href="https://github.com/Sanket-Bharadwaj" 
                className="text-primary hover:underline"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Sanket Bharadwaj
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <MobileNavbar />
    </div>
  );
};

export default Settings;
