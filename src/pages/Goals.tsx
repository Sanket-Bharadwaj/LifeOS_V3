
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import GoalItem from '@/components/Goals/GoalItem';
import GoalForm from '@/components/Goals/GoalForm';
import { 
  Goal,
  GoalMilestone,
  getGoals, 
  saveGoal,
  deleteGoal
} from '@/utils/dataStore';
import { useToast } from '@/hooks/use-toast';

interface GoalsProps {
  user: any;
}

const Goals: React.FC<GoalsProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | undefined>(undefined);
  const [milestoneGoalId, setMilestoneGoalId] = useState<string | undefined>(undefined);
  const [newMilestone, setNewMilestone] = useState('');
  
  // Load data
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Load goals
    const userGoals = getGoals(user.id);
    setGoals(userGoals);
    
    // Check if edit query param exists
    const editGoalId = searchParams.get('edit');
    if (editGoalId) {
      const goalToEdit = userGoals.find(g => g.id === editGoalId);
      if (goalToEdit) {
        setGoalToEdit(goalToEdit);
        setIsCreateModalOpen(true);
      }
    }
    
    setLoading(false);
  }, [user, searchParams]);
  
  const handleAddGoal = () => {
    setGoalToEdit(undefined);
    setIsCreateModalOpen(true);
  };
  
  const handleEditGoal = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsCreateModalOpen(true);
  };
  
  const handleSaveGoal = (goal: Goal) => {
    // Save to storage
    const savedGoal = saveGoal(goal);
    
    // Update local state
    if (goalToEdit) {
      setGoals(goals.map(g => g.id === goal.id ? savedGoal : g));
      toast({
        title: "Goal Updated",
        description: "Your goal has been updated successfully",
      });
    } else {
      setGoals([savedGoal, ...goals]);
      toast({
        title: "Goal Added",
        description: "Your new goal has been added",
      });
    }
    
    setIsCreateModalOpen(false);
    setGoalToEdit(undefined);
    
    // Clear the edit param if it exists
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };
  
  const handleDeleteGoal = (goalId: string) => {
    // Delete from storage
    deleteGoal(user.id, goalId);
    
    // Update local state
    setGoals(goals.filter(g => g.id !== goalId));
    
    toast({
      title: "Goal Deleted",
      description: "The goal has been removed",
    });
  };
  
  const handleAddMilestone = (goalId: string) => {
    setMilestoneGoalId(goalId);
    setNewMilestone('');
  };
  
  const handleSaveMilestone = () => {
    if (!milestoneGoalId || !newMilestone.trim()) {
      setMilestoneGoalId(undefined);
      return;
    }
    
    // Find the goal
    const goalToUpdate = goals.find(g => g.id === milestoneGoalId);
    if (!goalToUpdate) {
      setMilestoneGoalId(undefined);
      return;
    }
    
    // Create new milestone
    const newMilestoneObj: GoalMilestone = {
      id: Date.now().toString(),
      title: newMilestone.trim(),
      completed: false,
      order: goalToUpdate.milestones.length
    };
    
    // Update the goal with new milestone
    const updatedGoal = {
      ...goalToUpdate,
      milestones: [...goalToUpdate.milestones, newMilestoneObj],
      updatedAt: new Date().toISOString()
    };
    
    // Recalculate progress
    if (updatedGoal.milestones.length > 0) {
      const completedMilestones = updatedGoal.milestones.filter(m => m.completed).length;
      updatedGoal.progress = Math.round((completedMilestones / updatedGoal.milestones.length) * 100);
    }
    
    // Save to storage
    saveGoal(updatedGoal);
    
    // Update local state
    setGoals(goals.map(g => g.id === milestoneGoalId ? updatedGoal : g));
    
    // Reset
    setMilestoneGoalId(undefined);
    setNewMilestone('');
    
    toast({
      title: "Milestone Added",
      description: "New milestone has been added to your goal",
    });
  };
  
  const cancelAddMilestone = () => {
    setMilestoneGoalId(undefined);
    setNewMilestone('');
  };
  
  return (
    <div className="screen-container">
      <h1 className="text-2xl font-bold mb-4">Goals</h1>
      
      <div className="flex justify-end mb-6">
        <Button onClick={handleAddGoal}>
          <Plus size={16} className="mr-1" />
          Add Goal
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading goals...
        </div>
      ) : goals.length > 0 ? (
        <div>
          {goals.map(goal => (
            <GoalItem 
              key={goal.id} 
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onAddMilestone={handleAddMilestone}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground glass-card rounded-lg">
          <p>No goals yet. Add your first goal to start tracking progress!</p>
        </div>
      )}
      
      {/* Goal Creation/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{goalToEdit ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          </DialogHeader>
          <GoalForm 
            userId={user.id}
            editGoal={goalToEdit}
            onSave={handleSaveGoal}
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
      
      {/* Add Milestone Modal */}
      <Dialog open={!!milestoneGoalId} onOpenChange={() => milestoneGoalId ? cancelAddMilestone() : null}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Milestone description"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              className="col-span-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveMilestone();
                }
              }}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={cancelAddMilestone}>Cancel</Button>
            <Button onClick={handleSaveMilestone} disabled={!newMilestone.trim()}>
              Add Milestone
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <MobileNavbar />
    </div>
  );
};

export default Goals;
