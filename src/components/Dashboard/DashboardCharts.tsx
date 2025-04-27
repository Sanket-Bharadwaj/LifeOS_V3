
import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Habit, HabitLog, Goal } from '@/utils/dataStore';

interface DashboardChartsProps {
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  goals: Goal[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ tasks, habits, habitLogs, goals }) => {
  // Prepare data for task completion chart
  const taskCompletionData = [
    { name: 'Completed', value: tasks.filter(task => task.completed).length, color: '#10B981' },
    { name: 'Pending', value: tasks.filter(task => !task.completed).length, color: '#F59E0B' }
  ];

  // Prepare data for habit streak chart (last 7 days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const habitStreakData = last7Days.map(date => {
    const logsForDay = habitLogs.filter(log => log.date.startsWith(date) && log.completed);
    return {
      date: date.split('-').slice(1).join('/'), // Format as MM/DD
      completed: logsForDay.length,
    };
  });

  // Prepare data for goals progress
  const goalProgressData = goals.slice(0, 5).map(goal => ({
    name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
    progress: goal.progress,
    color: getProgressColor(goal.progress)
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in">
      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskCompletionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Habit Completion (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={habitStreakData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden col-span-1 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalProgressData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                  {goalProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get color based on progress value
function getProgressColor(progress: number): string {
  if (progress < 30) return '#EF4444';
  if (progress < 70) return '#F59E0B';
  return '#10B981';
}

export default DashboardCharts;
