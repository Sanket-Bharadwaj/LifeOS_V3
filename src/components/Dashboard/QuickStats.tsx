
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ListTodo, Target } from 'lucide-react';

interface StatsProps {
  tasksToday: number;
  habitStreak: number;
  goalsInProgress: number;
}

const QuickStats: React.FC<StatsProps> = ({ tasksToday, habitStreak, goalsInProgress }) => {
  const stats = [
    {
      title: 'Tasks Today',
      value: tasksToday,
      icon: <Check className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-500'
    },
    {
      title: 'Habit Streak',
      value: habitStreak,
      icon: <ListTodo className="h-5 w-5 text-green-500" />,
      color: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-500'
    },
    {
      title: 'Goals In Progress',
      value: goalsInProgress,
      icon: <Target className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in">
      {stats.map((stat, index) => (
        <Card key={index} className="glass-card overflow-hidden">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className={`rounded-full p-2 mb-2 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium">{stat.title}</p>
            <p className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;
