
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ThemeToggleProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme }) => {
  const { toast } = useToast();
  
  const handleToggle = () => {
    toggleTheme();
    toast({
      title: isDarkMode ? "Light Mode Activated" : "Dark Mode Activated",
      description: isDarkMode ? "Switched to light theme" : "Switched to dark theme",
    });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleToggle}
      className="rounded-full hover:bg-primary/10 transition-colors"
    >
      {isDarkMode ? (
        <Sun className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all" />
      ) : (
        <Moon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all" />
      )}
      <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
    </Button>
  );
};

export default ThemeToggle;
