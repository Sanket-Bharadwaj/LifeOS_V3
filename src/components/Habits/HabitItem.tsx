
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Habit, HabitLog } from '@/utils/dataStore';
import { toISODateString } from '@/utils/dateUtils';

interface HabitItemProps {
  habit: Habit;
  habitLog?: HabitLog;
  currentStreak: number;
  onToggle: (habitId: string, completed: boolean) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ 
  habit, 
  habitLog, 
  currentStreak,
  onToggle, 
  onEdit, 
  onDelete 
}) => {
  const isCompleted = habitLog?.completed || false;
  const streakText = currentStreak > 0 ? `${currentStreak} day${currentStreak > 1 ? 's' : ''}` : 'Start today!';
  
  const progressPercentage = currentStreak > 0 ? Math.min(100, (currentStreak / 10) * 100) : 0;
  
  return (
    <div className="glass-card p-4 mb-4 rounded-lg animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {habit.description}
            </p>
          )}
          <p className="text-xs text-primary font-medium mt-1">
            Current streak: {streakText}
          </p>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4 relative">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500"
                style={{ height: `${progressPercentage}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {currentStreak}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <Button
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              className={`mb-1 ${isCompleted ? "bg-green-500 hover:bg-green-600" : ""}`}
              onClick={() => onToggle(habit.id, !isCompleted)}
            >
              {isCompleted ? (
                <Check className="mr-1 h-4 w-4" />
              ) : (
                <X className="mr-1 h-4 w-4" />
              )}
              {isCompleted ? "Done" : "Not Done"}
            </Button>
            
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(habit)}
                className="h-8 w-8 mr-1"
                title="Edit habit"
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(habit.id)}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                title="Delete habit"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitItem;
