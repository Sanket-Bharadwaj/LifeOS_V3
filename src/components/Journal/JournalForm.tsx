
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JournalEntry } from '@/utils/dataStore';
import { useToast } from '@/hooks/use-toast';

interface JournalFormProps {
  userId: string;
  editEntry?: JournalEntry;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
}

const JournalForm: React.FC<JournalFormProps> = ({ userId, editEntry, onSave, onCancel }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Initialize form when editing
  useEffect(() => {
    if (editEntry) {
      setTitle(editEntry.title);
      setContent(editEntry.content);
      setMood(editEntry.mood || '');
      setEntryDate(new Date(editEntry.date));
      setTags(editEntry.tags || []);
    } else {
      setTitle('');
      setContent('');
      setMood('');
      setEntryDate(new Date());
      setTags([]);
    }
  }, [editEntry]);
  
  const handleAddTag = () => {
    if (tagInput.trim() === '') return;
    navigator.vibrate && navigator.vibrate(50);
    
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    navigator.vibrate && navigator.vibrate(50);
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.vibrate && navigator.vibrate(100);
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your journal entry",
        variant: "destructive"
      });
      return;
    }
    
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your journal entry",
        variant: "destructive"
      });
      return;
    }
    
    const entry: JournalEntry = {
      id: editEntry?.id || Date.now().toString(),
      userId,
      title,
      content,
      mood: mood || undefined,
      tags: tags.length > 0 ? tags : undefined,
      date: entryDate.toISOString(),
      createdAt: editEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onSave(entry);
  };
  
  const moodOptions = [
    'Happy', 'Content', 'Neutral', 'Anxious', 'Sad', 'Excited', 'Tired', 'Inspired', 'Frustrated'
  ];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 glass-card p-4 rounded-lg animate-fade-in">
      <Input
        placeholder="Journal entry title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-medium"
      />
      
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Entry Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !entryDate && "text-muted-foreground"
              )}
              onClick={() => navigator.vibrate && navigator.vibrate(50)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {entryDate ? format(entryDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={entryDate}
              onSelect={(date) => date && setEntryDate(date)}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Textarea
        placeholder="Write your thoughts here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="min-h-[200px]"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">How are you feeling? (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map(option => (
              <Button
                key={option}
                type="button"
                variant={mood === option ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  navigator.vibrate && navigator.vibrate(50);
                  setMood(mood === option ? '' : option);
                }}
                className="text-xs"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Tags (Optional)</label>
          <div className="flex">
            <Input
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddTag}
            >
              Add
            </Button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <span className="ml-1 cursor-pointer">×</span>
                </span>
              ))}
            </div>
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
          {editEntry ? 'Update Entry' : 'Save Entry'}
        </Button>
      </div>
    </form>
  );
};

export default JournalForm;
