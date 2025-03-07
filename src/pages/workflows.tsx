import { useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchNotificationBar } from '@/components/layout/search-notification-bar';
import { CreateWorkflow } from '@/components/workflows/create-workflow';
import { WorkflowCard } from '@/components/workflows/workflow-card';
import { useWorkflows, createWorkflow, type Workflow } from '@/lib/workflows';
import { useAuth } from '@/lib/auth';
import { toast } from 'react-hot-toast';

function WorkflowSearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
    setShowResults(value.length > 0);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        placeholder="Rechercher un workflow..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setShowResults(searchTerm.length > 0)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        className="pl-10 pr-4 py-2 border rounded-lg w-[32rem] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto z-10">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2">Résultats de recherche</div>
            <div className="space-y-1">
              {searchTerm && (
                <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">
                  <div className="font-medium text-sm">Créer "{searchTerm}"</div>
                  <div className="text-xs text-gray-500">Nouveau workflow</div>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState<Workflow[]>([]);
  const { workflows, loading } = useWorkflows();
  const { user } = useAuth();

  const handleSearch = (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }

    const results = workflows.filter(workflow => 
      workflow.title.toLowerCase().includes(term.toLowerCase()) ||
      workflow.author.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleWorkflowCreated = async (newWorkflow: Omit<Workflow, 'id' | 'userId' | 'createdAt' | 'order'>) => {
    if (!user) return;

    try {
      const workflowData = {
        ...newWorkflow,
        userId: user.uid
      };
      
      await createWorkflow(workflowData);
      toast.success('Workflow créé avec succès');
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Une erreur est survenue lors de la création du workflow');
    }
  };

  if (loading) {
    return (
      <div className="pl-[310px] flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayedWorkflows = searchResults.length > 0 ? searchResults : workflows;

  return (
    <div className="pl-[310px]">
      <div className="px-[75px] py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Workflows</h1>
            <p className="text-gray-500">
              {workflows.length} workflow{workflows.length > 1 ? 's' : ''} actif{workflows.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <WorkflowSearchBar onSearch={handleSearch} />
            <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {!isCreating ? (
            <>
              {displayedWorkflows.map((workflow) => (
                <div key={workflow.id} className="bg-white rounded-xl overflow-hidden flex flex-col border-2 border-[#E1E6ED] transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                  <WorkflowCard {...workflow} />
                </div>
              ))}

              <button 
                onClick={() => setIsCreating(true)}
                className="group relative w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-300 transition-colors overflow-hidden"
              >
                {/* Glowing effect container */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Rotating gradient */}
                    <div className="absolute inset-[-100%] bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-glow" />
                  </div>
                </div>
                
                {/* Button content */}
                <div className="relative flex items-center">
                  <span className="text-2xl mr-2">+</span>
                  Créer un nouveau workflow
                </div>
              </button>
            </>
          ) : (
            <CreateWorkflow 
              onCancel={() => setIsCreating(false)} 
              onWorkflowCreated={handleWorkflowCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}