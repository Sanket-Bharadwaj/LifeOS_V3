
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from '@/utils/dataStore';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  return (
    <div className={`glass-card p-4 mb-2 rounded-lg flex items-center justify-between transition-all ${
      task.completed ? 'opacity-70' : ''
    } animate-fade-in`}>
      <div className="flex items-center flex-1">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
          className="mr-3"
        />
        <div className="flex-1">
          <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 truncate max-w-[250px]">
              {task.description}
            </p>
          )}
          {task.dueDate && (
            <p className={`text-xs mt-1 ${
              new Date(task.dueDate) < new Date() && !task.completed 
                ? 'text-red-500' 
                : 'text-muted-foreground'
            }`}>
              Due: {formatDate(new Date(task.dueDate))}
            </p>
          )}
        </div>
      </div>
      <div className="flex">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onEdit(task)} 
          className="h-8 w-8 mr-1"
          title="Edit task"
        >
          <Edit size={14} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onDelete(task.id)} 
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
          title="Delete task"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
};

export default TaskItem;
