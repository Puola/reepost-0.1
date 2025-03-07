import { useState, useRef, useEffect } from 'react';
import { MoreVertical, FileEdit, Copy, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { PlatformIcon } from './platform-icon';
import { ContentPanel } from './content-panel';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { CreateWorkflow } from './create-workflow';
import { deleteWorkflow, updateWorkflow, duplicateWorkflow } from '@/lib/workflows';
import type { Workflow } from '@/lib/workflows';

interface WorkflowCardProps extends Workflow {
  onDelete?: () => void;
}

export function WorkflowCard({ 
  id,
  title, 
  reposts: initialReposts, 
  author, 
  platforms, 
  isAuto: defaultIsAuto = false,
  onDelete 
}: WorkflowCardProps) {
  const [isAuto, setIsAuto] = useState(defaultIsAuto);
  const [reposts, setReposts] = useState(initialReposts);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleBlur = async () => {
    const newTitle = editedTitle.trim();
    if (newTitle && newTitle !== title && newTitle.length <= 50) {
      try {
        await updateWorkflow(id, { title: newTitle });
      } catch (error) {
        console.error('Error updating workflow title:', error);
        toast.error('Une erreur est survenue lors de la mise à jour du titre');
        setEditedTitle(title);
      }
    } else {
      setEditedTitle(title);
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      titleInputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAutoToggle = async () => {
    try {
      const newIsAuto = !isAuto;
      await updateWorkflow(id, { isAuto: newIsAuto });
      setIsAuto(newIsAuto);
    } catch (error) {
      console.error('Error updating workflow auto status:', error);
    }
  };

  const handleRepost = async () => {
    try {
      const newReposts = reposts + 1;
      await updateWorkflow(id, { reposts: newReposts });
      setReposts(newReposts);
    } catch (error) {
      console.error('Error updating workflow reposts:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      await duplicateWorkflow(id);
      toast.success('Workflow dupliqué avec succès');
      setShowDropdown(false);
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      toast.error('Une erreur est survenue lors de la duplication');
    }
  };

  const handleAction = (action: string) => {
    setShowDropdown(false);
    switch (action) {
      case 'view':
        setShowContent(true);
        break;
      case 'edit':
        navigate(`/workflows/${id}/edit`);
        break;
      case 'duplicate':
        handleDuplicate();
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
      default:
        break;
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteWorkflow(id);
      onDelete?.();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  return (
    <>
      <div>
        <div className="flex">
          {/* Left column - Platform icons */}
          <div className="bg-[#F0F4F9] p-4 flex items-center space-x-4 flex-1">
            <button
              onClick={handleAutoToggle}
              className={`flex items-center rounded-full transition-all duration-500 ease-in-out w-[60px] h-[25px] relative ${
                isAuto ? 'bg-green-500' : 'bg-white border border-gray-200'
              }`}
            >
              <div
                className={`absolute w-[19px] h-[19px] rounded-full transition-all duration-500 ease-in-out ${
                  isAuto ? 'right-[3px] bg-white' : 'left-[3px] bg-gray-400'
                }`}
              />
              {isAuto && (
                <span className="absolute left-[8px] text-[10px] text-white font-bold">
                  auto
                </span>
              )}
            </button>
            <div className="flex items-center space-x-3">
              <PlatformIcon platform={platforms.from} size="lg" />
              <div className="flex items-center">
                <div className="w-[8px] h-[8px] rounded-full bg-[#9D9D9D]" />
                <div className="w-[75px] h-[2px] bg-[#9D9D9D] max-w-full" />
                <div className="w-[8px] h-[8px] rounded-full bg-[#9D9D9D]" />
              </div>
              <div className="flex space-x-[10px]">
                {platforms.to.map((platform, index) => (
                  <PlatformIcon key={index} platform={platform} />
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Title and stats */}
          <div className="w-[450px] p-4 flex items-center justify-between shrink-0">
            <div className="min-w-0 flex-1 mr-4">
              {isEditing ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editedTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  maxLength={50}
                  className="w-full font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 -ml-1"
                />
              ) : (
                <h3 
                  onClick={handleTitleClick}
                  className="w-full font-medium text-gray-900 hover:bg-gray-50 cursor-text rounded px-1 -ml-1 group relative truncate"
                >
                  {editedTitle}
                  <span className="absolute inset-0 border border-gray-200 opacity-0 group-hover:opacity-100 rounded pointer-events-none transition-opacity" />
                </h3>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <button onClick={handleRepost} className="hover:text-primary">
                  {reposts} reposts
                </button>
                <span>•</span>
                <span>{author}</span>
              </div>
            </div>
            <div>
              <button 
                ref={buttonRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="w-5 h-5 text-gray-900" />
              </button>
              
              {showDropdown && createPortal(
                <div
                  ref={dropdownRef}
                  className="absolute w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                  style={{
                    top: buttonRef.current?.getBoundingClientRect().bottom + window.scrollY + 8,
                    right: window.innerWidth - (buttonRef.current?.getBoundingClientRect().right || 0) - 8
                  }}
                >
                  <button
                    onClick={() => handleAction('view')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-3" />
                    View content
                  </button>
                  <button
                    onClick={() => handleAction('edit')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <FileEdit className="w-4 h-4 mr-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleAction('duplicate')}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleAction('delete')}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-3" />
                    Delete
                  </button>
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>

        {/* Content Panel */}
        {showContent && (
          <ContentPanel onClose={() => setShowContent(false)} />
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Supprimer le workflow"
        message="Êtes-vous sûr de vouloir supprimer ce workflow ? Cette action est irréversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDangerous
      />
    </>
  );
}