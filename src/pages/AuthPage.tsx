
import React, { useState } from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Card, CardContent } from '@/components/ui/card';
import ThemeToggle from '@/components/Layout/ThemeToggle';

interface AuthPageProps {
  onLogin: (user: any) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, isDarkMode, toggleTheme }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="absolute top-4 right-4">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            LifeOS
          </h1>
          <p className="text-muted-foreground">
            Your complete offline productivity system
          </p>
        </div>
        
        {isLoginView ? (
          <LoginForm 
            onLoginSuccess={onLogin} 
            onSwitchToRegister={() => setIsLoginView(false)} 
          />
        ) : (
          <RegisterForm 
            onRegisterSuccess={onLogin} 
            onSwitchToLogin={() => setIsLoginView(true)} 
          />
        )}
        
        <Card className="mt-6 glass-card bg-opacity-30 shadow-lg">
          <CardContent className="p-4 text-sm text-muted-foreground text-center">
            <p>
              LifeOS stores all your data locally.<br/>
              Your information never leaves your device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
