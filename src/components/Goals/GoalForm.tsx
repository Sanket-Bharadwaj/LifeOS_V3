
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Goal, GoalMilestone } from '@/utils/dataStore';
import { useToast } from '@/hooks/use-toast';

interface GoalFormProps {
  userId: string;
  editGoal?: Goal;
  onSave: (goal: Goal) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ userId, editGoal, onSave, onCancel }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [milestones, setMilestones] = useState<GoalMilestone[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  
  // Initialize form when editing
  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setDescription(editGoal.description || '');
      setDeadline(editGoal.deadline ? new Date(editGoal.deadline) : undefined);
      setMilestones([...editGoal.milestones]);
    } else {
      setMilestones([]);
    }
  }, [editGoal]);
  
  const handleAddMilestone = () => {
    if (newMilestone.trim() === '') return;
    navigator.vibrate && navigator.vibrate(50);
    
    const milestone: GoalMilestone = {
      id: Date.now().toString(),
      title: newMilestone,
      completed: false,
      order: milestones.length,
    };
    
    setMilestones([...milestones, milestone]);
    setNewMilestone('');
  };
  
  const handleRemoveMilestone = (id: string) => {
    navigator.vibrate && navigator.vibrate(50);
    const updatedMilestones = milestones.filter(m => m.id !== id);
    // Update orders to keep them sequential
    const reorderedMilestones = updatedMilestones.map((m, index) => ({ ...m, order: index }));
    setMilestones(reorderedMilestones);
  };
  
  const handleToggleMilestone = (id: string) => {
    navigator.vibrate && navigator.vibrate(50);
    const updatedMilestones = milestones.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updatedMilestones);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.vibrate && navigator.vibrate(100);
    
    if (!title.trim()) {
      toast({
        title: "Goal title required",
        description: "Please enter a title for your goal",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate progress based on completed milestones
    const completedMilestones = milestones.filter(m => m.completed).length;
    const progress = milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;
    
    const goal: Goal = {
      id: editGoal?.id || Date.now().toString(),
      userId,
      title,
      description: description || undefined,
      deadline: deadline ? deadline.toISOString() : undefined,
      milestones,
      progress,
      createdAt: editGoal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onSave(goal);
    
    // Reset form if not editing
    if (!editGoal) {
      setTitle('');
      setDescription('');
      setDeadline(undefined);
      setMilestones([]);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 glass-card p-4 rounded-lg animate-fade-in">
      <Input
        placeholder="Goal title"
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
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Deadline (Optional)</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !deadline && "text-muted-foreground"
              )}
              onClick={() => navigator.vibrate && navigator.vibrate(50)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Milestones</label>
        
        <div className="flex">
          <Input
            placeholder="Add a milestone"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            className="mr-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddMilestone();
              }
            }}
          />
          <Button 
            type="button" 
            onClick={handleAddMilestone}
          >
            Add
          </Button>
        </div>
        
        <div className="space-y-2 mt-2">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className="flex items-center p-2 bg-secondary/50 rounded"
            >
              <div 
                className={`flex-1 ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}
                onClick={() => handleToggleMilestone(milestone.id)}
              >
                {index + 1}. {milestone.title}
              </div>
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMilestone(milestone.id)}
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
              >
                <X size={14} />
              </Button>
            </div>
          ))}
          
          {milestones.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No milestones yet. Add some to track your progress!
            </p>
          )}
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
          {editGoal ? 'Update Goal' : 'Add Goal'}
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;
