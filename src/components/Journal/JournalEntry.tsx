
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/utils/dateUtils';
import { JournalEntry as JournalEntryType } from '@/utils/dataStore';

interface JournalEntryProps {
  entry: JournalEntryType;
  onEdit: (entry: JournalEntryType) => void;
  onDelete: (entryId: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onEdit, onDelete }) => {
  return (
    <Card className="mb-4 overflow-hidden glass-card animate-fade-in">
      <CardHeader className="bg-primary/5 p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{entry.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(new Date(entry.date))}
            </p>
          </div>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(entry)}
              className="h-8 w-8 mr-1"
              title="Edit entry"
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry.id)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              title="Delete entry"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
        
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {entry.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-sm whitespace-pre-wrap">
          {entry.content}
        </div>
        
        {entry.mood && (
          <div className="mt-2 text-xs text-muted-foreground">
            Mood: {entry.mood}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalEntry;
