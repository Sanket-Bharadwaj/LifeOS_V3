
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, Project, getProjects } from '@/utils/dataStore';
import { useToast } from '@/hooks/use-toast';

interface TaskFormProps {
  userId: string;
  editTask?: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ userId, editTask, onSave, onCancel }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Load projects
  useEffect(() => {
    const userProjects = getProjects(userId);
    setProjects(userProjects);
  }, [userId]);
  
  // Initialize form when editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setDueDate(editTask.dueDate ? new Date(editTask.dueDate) : undefined);
      setProjectId(editTask.projectId);
    }
  }, [editTask]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.vibrate && navigator.vibrate(100);
    
    if (!title.trim()) {
      toast({
        title: "Task title required",
        description: "Please enter a title for your task",
        variant: "destructive"
      });
      return;
    }
    
    const task: Task = {
      id: editTask?.id || Date.now().toString(),
      userId,
      title,
      description: description || undefined,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      completed: editTask?.completed || false,
      projectId: projectId || undefined,
      createdAt: editTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onSave(task);
    
    // Reset form if not editing
    if (!editTask) {
      setTitle('');
      setDescription('');
      setDueDate(undefined);
      setProjectId(undefined);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 glass-card p-4 rounded-lg animate-fade-in">
      <Input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
      />
      
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Due Date (Optional)</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
                onClick={() => navigator.vibrate && navigator.vibrate(50)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Project (Optional)</label>
          <Select 
            value={projectId} 
            onValueChange={setProjectId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            navigator.vibrate && navigator.vibrate(50);
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          onClick={() => navigator.vibrate && navigator.vibrate(50)}
        >
          {editTask ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
