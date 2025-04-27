
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/utils/dataStore';
import { formatDate } from '@/utils/dateUtils';

interface GoalItemProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onAddMilestone: (goalId: string) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, onEdit, onDelete, onAddMilestone }) => {
  const { title, description, deadline, milestones, progress } = goal;
  const completedMilestones = milestones.filter(m => m.completed).length;
  
  return (
    <div className="glass-card p-4 mb-4 rounded-lg overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(goal)}
            className="h-8 w-8 mr-1"
            title="Edit goal"
          >
            <Edit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(goal.id)}
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            title="Delete goal"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
      )}
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <div className="font-medium">Progress</div>
          <div>{progress}%</div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {deadline && (
        <p className="text-xs text-muted-foreground mb-3">
          Deadline: {formatDate(new Date(deadline))}
        </p>
      )}
      
      <div className="space-y-1 mt-4">
        <div className="flex justify-between mb-2">
          <h4 className="text-sm font-medium">Milestones ({completedMilestones}/{milestones.length})</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onAddMilestone(goal.id)}
            className="h-6 text-xs px-2 py-0 flex items-center"
          >
            <Plus size={12} className="mr-1" />
            Add
          </Button>
        </div>
        
        {milestones.length > 0 ? (
          milestones
            .sort((a, b) => a.order - b.order)
            .map((milestone) => (
              <div 
                key={milestone.id} 
                className={`text-sm p-2 rounded flex items-center ${
                  milestone.completed 
                    ? 'bg-primary/10 line-through text-muted-foreground' 
                    : 'bg-secondary/50'
                }`}
              >
                <div className="mr-2">
                  {milestone.order + 1}.
                </div>
                <div>{milestone.title}</div>
              </div>
            ))
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No milestones yet. Add some to track your progress!
          </p>
        )}
      </div>
    </div>
  );
};

export default GoalItem;
