import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import GreetingHeader from '@/components/Dashboard/GreetingHeader';
import QuickStats from '@/components/Dashboard/QuickStats';
import DashboardCharts from '@/components/Dashboard/DashboardCharts';
import TaskItem from '@/components/Tasks/TaskItem';
import HabitItem from '@/components/Habits/HabitItem';
import { Task, Habit, HabitLog, Goal, getTasks, getHabits, getHabitLogs, getGoals, saveHabitLog } from '@/utils/dataStore';
import { toISODateString, getTodayString } from '@/utils/dateUtils';

interface DashboardProps {
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    if (!user || !user.id) return;
    
    const userTasks = getTasks(user.id);
    const today = getTodayString();
    const todaysTasks = userTasks.filter(task => 
      !task.dueDate || task.dueDate.startsWith(today)
    );
    setTasks(userTasks); // Use all tasks for charts
    
    const userHabits = getHabits(user.id);
    setHabits(userHabits);
    
    const userHabitLogs = getHabitLogs(user.id);
    setHabitLogs(userHabitLogs);
    
    const userGoals = getGoals(user.id);
    setGoals(userGoals);
    
    setLoading(false);
  }, [user]);
  
  useEffect(() => {
    if (!habits.length) return;
    
    const habitStreakMap: {[key: string]: number} = {};
    
    habits.forEach(habit => {
      let currentStreak = 0;
      const today = new Date();
      let checkDate = new Date();
      
      while (true) {
        const dateString = toISODateString(checkDate);
        const log = habitLogs.find(log => 
          log.habitId === habit.id && log.date === dateString
        );
        
        if (log && log.completed) {
          currentStreak++;
        } else if (checkDate.getTime() < today.getTime()) {
          break;
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
        
        if (today.getTime() - checkDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
          break;
        }
      }
      
      habitStreakMap[habit.id] = currentStreak;
    });
    
    setStreaks(habitStreakMap);
  }, [habits, habitLogs]);
  
  const handleTaskToggle = (taskId: string, completed: boolean) => {
    console.log(`Toggle task ${taskId} to ${completed}`);
  };
  
  const handleHabitToggle = (habitId: string, completed: boolean) => {
    const todayString = getTodayString();
    
    const existingLog = habitLogs.find(log => 
      log.habitId === habitId && log.date === todayString
    );
    
    const updatedLog: HabitLog = {
      id: existingLog?.id || Date.now().toString(),
      habitId,
      userId: user.id,
      date: todayString,
      completed,
      notes: existingLog?.notes
    };
    
    saveHabitLog(updatedLog);
    
    if (existingLog) {
      setHabitLogs(habitLogs.map(log => 
        log.id === existingLog.id ? updatedLog : log
      ));
    } else {
      setHabitLogs([...habitLogs, updatedLog]);
    }
  };
  
  const todayTasksCount = tasks.filter(task => 
    !task.dueDate || task.dueDate.startsWith(getTodayString())
  ).length;
  const maxHabitStreak = Object.values(streaks).reduce((max, streak) => Math.max(max, streak), 0);
  const goalsInProgressCount = goals.filter(goal => goal.progress > 0 && goal.progress < 100).length;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="screen-container pb-32">
      <GreetingHeader userName={user.name} />
      
      <QuickStats 
        tasksToday={todayTasksCount} 
        habitStreak={maxHabitStreak}
        goalsInProgress={goalsInProgressCount} 
      />
      
      <DashboardCharts 
        tasks={tasks}
        habits={habits}
        habitLogs={habitLogs}
        goals={goals}
      />
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Today's Tasks</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              navigator.vibrate && navigator.vibrate(50); 
              navigate('/tasks');
            }}
            className="text-muted-foreground text-sm hover:text-foreground flex items-center"
          >
            View all <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
        
        {tasks.length > 0 ? (
          <div>
            {tasks.slice(0, 3).map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={handleTaskToggle}
                onEdit={() => navigate(`/tasks?edit=${task.id}`)}
                onDelete={() => console.log(`Delete task ${task.id}`)}
              />
            ))}
            {tasks.length > 3 && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                +{tasks.length - 3} more tasks
              </p>
            )}
          </div>
        ) : (
          <Card className="p-4 text-center text-muted-foreground text-sm glass-card">
            <p>No tasks scheduled for today</p>
            <Button 
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/tasks')}
            >
              <Plus size={14} className="mr-1" />
              Add a task
            </Button>
          </Card>
        )}
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Daily Habits</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              navigator.vibrate && navigator.vibrate(50);
              navigate('/habits');
            }}
            className="text-muted-foreground text-sm hover:text-foreground flex items-center"
          >
            View all <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
        
        {habits.length > 0 ? (
          <div>
            {habits.slice(0, 3).map(habit => {
              const todayLog = habitLogs.find(log => 
                log.habitId === habit.id && log.date === getTodayString()
              );
              
              return (
                <HabitItem 
                  key={habit.id} 
                  habit={habit}
                  habitLog={todayLog}
                  currentStreak={streaks[habit.id] || 0}
                  onToggle={handleHabitToggle}
                  onEdit={() => navigate(`/habits?edit=${habit.id}`)}
                  onDelete={() => console.log(`Delete habit ${habit.id}`)}
                />
              );
            })}
            {habits.length > 3 && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                +{habits.length - 3} more habits
              </p>
            )}
          </div>
        ) : (
          <Card className="p-4 text-center text-muted-foreground text-sm glass-card">
            <p>No habits tracked yet</p>
            <Button 
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/habits')}
            >
              <Plus size={14} className="mr-1" />
              Create a habit
            </Button>
          </Card>
        )}
      </div>
      
      <MobileNavbar />
    </div>
  );
};

export default Dashboard;
