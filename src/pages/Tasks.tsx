
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import TaskItem from '@/components/Tasks/TaskItem';
import TaskForm from '@/components/Tasks/TaskForm';
import { Task, getTasks, saveTask, deleteTask, Project, getProjects } from '@/utils/dataStore';
import { useToast } from '@/hooks/use-toast';

interface TasksProps {
  user: any;
}

const Tasks: React.FC<TasksProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Load data
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Load tasks
    const userTasks = getTasks(user.id);
    setTasks(userTasks);
    
    // Load projects
    const userProjects = getProjects(user.id);
    setProjects(userProjects);
    
    // Check if edit query param exists
    const editTaskId = searchParams.get('edit');
    if (editTaskId) {
      const taskToEdit = userTasks.find(t => t.id === editTaskId);
      if (taskToEdit) {
        setTaskToEdit(taskToEdit);
        setIsCreateModalOpen(true);
      }
    }
    
    setLoading(false);
  }, [user, searchParams]);
  
  // Filter tasks based on project and completion status
  const filteredTasks = tasks.filter(task => {
    const projectMatch = projectFilter === 'all' || task.projectId === projectFilter;
    const completionMatch = showCompleted || !task.completed;
    return projectMatch && completionMatch;
  });
  
  // Sort tasks by due date and completion status
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by due date if both have one
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Tasks without due dates go last
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Otherwise sort by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  const handleAddTask = () => {
    setTaskToEdit(undefined);
    setIsCreateModalOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsCreateModalOpen(true);
  };
  
  const handleSaveTask = (task: Task) => {
    // Save to storage
    const savedTask = saveTask(task);
    
    // Update local state
    if (taskToEdit) {
      setTasks(tasks.map(t => t.id === task.id ? savedTask : t));
      toast({
        title: "Task Updated",
        description: "Your task has been updated successfully",
      });
    } else {
      setTasks([savedTask, ...tasks]);
      toast({
        title: "Task Added",
        description: "Your new task has been added",
      });
    }
    
    setIsCreateModalOpen(false);
    setTaskToEdit(undefined);
    
    // Clear the edit param if it exists
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };
  
  const handleToggleTask = (taskId: string, completed: boolean) => {
    // Find the task
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    // Update the task
    const updatedTask = {
      ...taskToUpdate,
      completed,
      updatedAt: new Date().toISOString()
    };
    
    // Save to storage
    saveTask(updatedTask);
    
    // Update local state
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
  };
  
  const handleDeleteTask = (taskId: string) => {
    // Delete from storage
    deleteTask(user.id, taskId);
    
    // Update local state
    setTasks(tasks.filter(t => t.id !== taskId));
    
    toast({
      title: "Task Deleted",
      description: "The task has been removed",
    });
  };
  
  const getProjectName = (projectId?: string) => {
    if (!projectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '';
  };
  
  return (
    <div className="screen-container">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex items-center mb-2 w-full sm:w-auto">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px] mr-2">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="none">No Project</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowCompleted(!showCompleted)}
            className="mr-2"
          >
            {showCompleted ? <X size={14} className="mr-1" /> : <Filter size={14} className="mr-1" />}
            {showCompleted ? "Hide Completed" : "Show Completed"}
          </Button>
        </div>
        
        <Button onClick={handleAddTask} className="mb-2">
          <Plus size={16} className="mr-1" />
          Add Task
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading tasks...
        </div>
      ) : sortedTasks.length > 0 ? (
        <div>
          {sortedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground glass-card rounded-lg">
          {projectFilter !== 'all' ? (
            <p>No tasks in this project</p>
          ) : (
            <p>No tasks yet. Add your first task to get started!</p>
          )}
        </div>
      )}
      
      {/* Task Creation/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{taskToEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm 
            userId={user.id}
            editTask={taskToEdit}
            onSave={handleSaveTask}
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

export default Tasks;
