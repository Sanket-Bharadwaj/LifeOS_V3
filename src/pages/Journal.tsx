
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MobileNavbar from '@/components/Layout/MobileNavbar';
import JournalEntryComponent from '@/components/Journal/JournalEntry';
import JournalForm from '@/components/Journal/JournalForm';
import { 
  JournalEntry, 
  getJournalEntries, 
  saveJournalEntry, 
  deleteJournalEntry 
} from '@/utils/dataStore';
import { useToast } from '@/hooks/use-toast';

interface JournalProps {
  user: any;
}

const Journal: React.FC<JournalProps> = ({ user }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load data
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Load journal entries
    const userEntries = getJournalEntries(user.id);
    // Sort entries by date (newest first)
    const sortedEntries = userEntries.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setEntries(sortedEntries);
    setFilteredEntries(sortedEntries);
    
    // Check if edit query param exists
    const editEntryId = searchParams.get('edit');
    if (editEntryId) {
      const entryToEdit = userEntries.find(e => e.id === editEntryId);
      if (entryToEdit) {
        setEntryToEdit(entryToEdit);
        setIsCreateModalOpen(true);
      }
    }
    
    setLoading(false);
  }, [user, searchParams]);
  
  // Filter entries when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEntries(entries);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = entries.filter(entry => 
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query)))
      );
      setFilteredEntries(filtered);
    }
  }, [searchQuery, entries]);
  
  const handleAddEntry = () => {
    setEntryToEdit(undefined);
    setIsCreateModalOpen(true);
  };
  
  const handleEditEntry = (entry: JournalEntry) => {
    setEntryToEdit(entry);
    setIsCreateModalOpen(true);
  };
  
  const handleSaveEntry = (entry: JournalEntry) => {
    // Save to storage
    const savedEntry = saveJournalEntry(entry);
    
    // Update local state
    if (entryToEdit) {
      setEntries(entries.map(e => e.id === entry.id ? savedEntry : e));
      toast({
        title: "Entry Updated",
        description: "Your journal entry has been updated",
      });
    } else {
      setEntries([savedEntry, ...entries]);
      toast({
        title: "Entry Added",
        description: "Your new journal entry has been saved",
      });
    }
    
    setIsCreateModalOpen(false);
    setEntryToEdit(undefined);
    
    // Clear the edit param if it exists
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams);
    }
  };
  
  const handleDeleteEntry = (entryId: string) => {
    // Delete from storage
    deleteJournalEntry(user.id, entryId);
    
    // Update local state
    setEntries(entries.filter(e => e.id !== entryId));
    setFilteredEntries(filteredEntries.filter(e => e.id !== entryId));
    
    toast({
      title: "Entry Deleted",
      description: "The journal entry has been removed",
    });
  };
  
  const handleExportJournal = () => {
    // This would generate and download a PDF in a real app
    // For now, we'll just show a toast
    toast({
      title: "Journal Export",
      description: "Journal entries would be exported as PDF in the real app",
    });
  };
  
  return (
    <div className="screen-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Journal</h1>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button onClick={handleExportJournal} variant="outline" className="flex-1 sm:flex-none">
              <FileDown size={16} className="mr-1" />
              Export
            </Button>
            <Button onClick={handleAddEntry} className="flex-1 sm:flex-none">
              <Plus size={16} className="mr-1" />
              New Entry
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading journal entries...
        </div>
      ) : filteredEntries.length > 0 ? (
        <div>
          {filteredEntries.map(entry => (
            <JournalEntryComponent 
              key={entry.id} 
              entry={entry}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground glass-card rounded-lg">
          {searchQuery ? (
            <p>No journal entries match your search</p>
          ) : (
            <p>No journal entries yet. Start writing your thoughts!</p>
          )}
        </div>
      )}
      
      {/* Journal Entry Creation/Edit Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{entryToEdit ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
          </DialogHeader>
          <JournalForm 
            userId={user.id}
            editEntry={entryToEdit}
            onSave={handleSaveEntry}
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

export default Journal;
