
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import { 
  Task, 
  HabitLog, 
  getTasks, 
  getHabits, 
  getHabitLogs
} from '@/utils/dataStore';
import { 
  getDatesInMonth, 
  getDateRangeForView, 
  isSameDay, 
  formatDate,
  CalendarViewType
} from '@/utils/dateUtils';

interface CalendarProps {
  user: any;
}

const Calendar: React.FC<CalendarProps> = ({ user }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get dates for the current view
  const { start, end } = getDateRangeForView(view, currentDate);
  const dates = getDatesInMonth(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );
  
  // Load data
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Load tasks
    const userTasks = getTasks(user.id);
    setTasks(userTasks);
    
    // Load habit logs
    const userHabitLogs = getHabitLogs(user.id);
    setHabitLogs(userHabitLogs);
    
    setLoading(false);
  }, [user]);
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Filter tasks for specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };
  
  // Filter habit logs for specific date
  const getHabitLogsForDate = (date: Date) => {
    return habitLogs.filter(log => {
      return isSameDay(new Date(log.date), date);
    });
  };
  
  // Calculate calendar grid
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const today = new Date();
  
  // Generate calendar days including padding for the start of month
  const calendarDays = [];
  
  // Add padding for days before the first of the month
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }
  
  // Month name and year
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  return (
    <div className="screen-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      
      <Card className="glass-card mb-6 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-primary/5 p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-center">
              {monthName} {currentDate.getFullYear()}
            </h2>
          </div>
          
          <div className="grid grid-cols-7 text-center border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-sm font-medium">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 text-center">
            {calendarDays.map((day, index) => {
              if (!day) {
                // Empty cell for padding
                return <div key={`empty-${index}`} className="p-2 border-t border-r border-border h-24"></div>;
              }
              
              const isToday = isSameDay(day, today);
              const tasksForDay = getTasksForDate(day);
              const habitLogsForDay = getHabitLogsForDate(day);
              const completedHabits = habitLogsForDay.filter(log => log.completed).length;
              
              return (
                <div
                  key={day.getTime()}
                  className={`
                    p-2 border-t border-r border-border min-h-24 h-auto
                    ${isToday ? 'bg-primary/10' : ''}
                  `}
                >
                  <div className={`
                    flex justify-center items-center w-6 h-6 mb-1 mx-auto rounded-full
                    ${isToday ? 'bg-primary text-white' : ''}
                  `}>
                    {day.getDate()}
                  </div>
                  
                  {tasksForDay.length > 0 && (
                    <div className="mt-1 text-xs text-center">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                        {tasksForDay.length} task{tasksForDay.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  
                  {completedHabits > 0 && (
                    <div className="mt-1 text-xs text-center">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                        {completedHabits} habit{completedHabits !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">
        Upcoming Tasks
      </h2>
      
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading events...
          </div>
        ) : (
          tasks
            .filter(task => !task.completed && task.dueDate)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 5)
            .map(task => (
              <div 
                key={task.id} 
                className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex justify-between items-center cursor-pointer hover:bg-primary/5 glass-card"
                onClick={() => navigate(`/tasks?edit=${task.id}`)}
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDate(new Date(task.dueDate!))}
                  </p>
                </div>
                <CalendarIcon size={16} className="text-muted-foreground" />
              </div>
            ))
        )}
        
        {!loading && tasks.filter(task => !task.completed && task.dueDate).length === 0 && (
          <div className="text-center py-4 text-muted-foreground glass-card rounded-lg">
            <p>No upcoming tasks</p>
          </div>
        )}
      </div>
      
      <MobileNavbar />
    </div>
  );
};

export default Calendar;
