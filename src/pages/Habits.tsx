
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import HabitItem from '@/components/Habits/HabitItem';
import HabitForm from '@/components/Habits/HabitForm';
import { 
  Habit, 
  HabitLog, 
  getHabits, 
  getHabitLogs, 
  saveHabit, 
  saveHabitLog,
  deleteHabit
} from '@/utils/dataStore';
import { toISODateString, getTodayString } from '@/utils/dateUtils';
import { useToast } from '@/hooks/use-toast';

interface HabitsProps {
  user: any;
}

const Habits: React.FC<HabitsProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | undefined>(undefined);
  const [streaks, setStreaks] = useState<{[key: string]: number}>({});
  
  // Load data
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Load habits
    const userHabits = getHabits(user.id);
    setHabits(userHabits);
    
    // Load habit logs
    const userHabitLogs = getHabitLogs(user.id);
    setHabitLogs(userHabitLogs);
    
    // Check if edit query param exists
    const editHabitId = searchParams.get('edit');
    if (editHabitId) {
      const habitToEdit = userHabits.find(h => h.id === editHabitId);
      if (habitToEdit) {
        setHabitToEdit(habitToEdit);
        setIsCreateModalOpen(true);
      }
    }
    
    setLoading(false);
  }, [user, searchParams]);
  
  // Calculate habit streaks
  useEffect(() => {
    if (!habits.length) return;
    
    const habitStreakMap: {[key: string]: number} = {};
    
    habits.forEach(habit => {
      let currentStreak = 0;
      const today = new Date();
      let checkDate = new Date();
      
      // Check consecutive days backward from today
      while (true) {
        const dateString = toISODateString(checkDate);
        const log = habitLogs.find(log => 
          log.habitId === habit.id && log.date === dateString
        );
        
        if (log && log.completed) {
          currentStreak++;
        } else if (checkDate.getTime() < today.getTime()) {
          // If we find an incomplete day in the past, break
          break;
        }
        
        // Move to previous day
        checkDate.setDate(checkDate.getDate() - 1);
        
        // Don't go back more than 30 days
        if (today.getTime() - checkDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
          break;
        }
      }
      
      habitStreakMap[habit.id] = currentStreak;
    });
    
    setStreaks(habitStreakMap);
  }, [habits, habitLogs]);
  
  const handleAddHabit = () => {
    setHabitToEdit(undefined);
    setIsCreateModalOpen(true);
  };
  
  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsCreateModalOpen(true);
  };
  
  const handleSaveHabit = (habit: Habit) => {
    // Save to storage
    const savedHabit = saveHabit(habit);
    
    // Update local state
    if (habitToEdit) {
      setHabits(habits.map(h => h.id === habit.id ? savedHabit : h));
      toast({
        title: "Habit Updated",
        description: "Your habit has been updated successfully",
      });
    } else {
      setHabits([savedHabit, ...habits]);
      toast({
        title: "Habit Added",
        description: "Your new habit has been added",
      });
    }
    
    setIsCreateModalOpen(false);
    setHabitToEdit(undefined);
    
    // Clear the edit param if it exists
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };
  
  const handleToggleHabit = (habitId: string, completed: boolean) => {
    const todayString = getTodayString();
    
    // Find existing log for today
    const existingLog = habitLogs.find(log => 
      log.habitId === habitId && log.date === todayString
    );
    
    // Create or update habit log
    const updatedLog: HabitLog = {
      id: existingLog?.id || Date.now().toString(),
      habitId,
      userId: user.id,
      date: todayString,
      completed,
      notes: existingLog?.notes
    };
    
    // Save to storage
    saveHabitLog(updatedLog);
    
    // Update local state
    if (existingLog) {
      setHabitLogs(habitLogs.map(log => 
        log.id === existingLog.id ? updatedLog : log
      ));
    } else {
      setHabitLogs([...habitLogs, updatedLog]);
    }
    
    toast({
      title: completed ? "Habit Completed" : "Habit Marked Incomplete",
      description: completed ? "Keep up the good work!" : "You can try again tomorrow",
    });
  };
  
  const handleDeleteHabit = (habitId: string) => {
    // Delete from storage (in a real app, also delete associated logs)
    deleteHabit(user.id, habitId);
    
    // Update local state
    setHabits(habits.filter(h => h.id !== habitId));
    
    toast({
      title: "Habit Deleted",
      description: "The habit has been removed",
    });
  };
  
  return (
    <div className="screen-container">
      <h1 className="text-2xl font-bold mb-4">Habits</h1>
      
      <div className="flex justify-end mb-6">
        <Button onClick={handleAddHabit}>
          <Plus size={16} className="mr-1" />
          Add Habit
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading habits...
        </div>
      ) : habits.length > 0 ? (
        <div>
          {habits.map(habit => {
            const todayLog = habitLogs.find(log => 
              log.habitId === habit.id && log.date === getTodayString()
            );
            
            return (
              <HabitItem 
                key={habit.id} 
                habit={habit}
                habitLog={todayLog}
                currentStreak={streaks[habit.id] || 0}
                onToggle={handleToggleHabit}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground glass-card rounded-lg">
          <p>No habits yet. Add your first habit to start building streaks!</p>
        </div>
      )}
      
      {/* Habit Creation/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{habitToEdit ? 'Edit Habit' : 'Add New Habit'}</DialogTitle>
          </DialogHeader>
          <HabitForm 
            userId={user.id}
            editHabit={habitToEdit}
            onSave={handleSaveHabit}
            onCancel={() => {
              setIsCreateModalOpen(false);
              // Clear the edit param if it exists
              if (searchParams.has('edit')) {
                searchParams.delete('edit');
                setSearchParams(searchParams);
              }
            }}
          />
        </DialogContent>
      </Dialog>
      
      <MobileNavbar />
    </div>
  );
};

export default Habits;
