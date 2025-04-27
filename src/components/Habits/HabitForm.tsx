
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Habit } from '@/utils/dataStore';
import { useToast } from '@/hooks/use-toast';

interface HabitFormProps {
  userId: string;
  editHabit?: Habit;
  onSave: (habit: Habit) => void;
  onCancel: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ userId, editHabit, onSave, onCancel }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [color, setColor] = useState<string>('none');
  
  // Initialize form when editing
  useEffect(() => {
    if (editHabit) {
      setName(editHabit.name);
      setDescription(editHabit.description || '');
      setFrequency(editHabit.frequency);
      setColor(editHabit.color || 'none');
    }
  }, [editHabit]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.vibrate && navigator.vibrate(100);
    
    if (!name.trim()) {
      toast({
        title: "Habit name required",
        description: "Please enter a name for your habit",
        variant: "destructive"
      });
      return;
    }
    
    const habit: Habit = {
      id: editHabit?.id || Date.now().toString(),
      userId,
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      color: color === 'none' ? undefined : color,
      createdAt: editHabit?.createdAt || new Date().toISOString(),
    };
    
    onSave(habit);
    
    // Reset form if not editing
    if (!editHabit) {
      setName('');
      setDescription('');
      setFrequency('daily');
      setColor('none');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Habit name"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
          <label className="text-sm text-muted-foreground">Frequency</label>
          <Select 
            value={frequency} 
            onValueChange={(value: 'daily' | 'weekly') => setFrequency(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Color (Optional)</label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Color</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="yellow">Yellow</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
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
          {editHabit ? 'Update Habit' : 'Add Habit'}
        </Button>
      </div>
    </form>
  );
};

export default HabitForm;
