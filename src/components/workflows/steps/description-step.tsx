import { HelpCircle, GripVertical } from 'lucide-react';
import { VideoPreview } from '../video-preview';
import { useState, useRef } from 'react';

interface DraggableBlock {
  id: string;
  label: string;
  value: string;
}

export function DescriptionStep() {
  const [description, setDescription] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [blocks] = useState<DraggableBlock[]>([
    { id: 'original', label: 'Description originale', value: '{description}' },
    { id: 'username', label: 'Nom d\'utilisateur', value: '{username}' },
    { id: 'hashtags', label: 'Hashtags', value: '{hashtags}' }
  ]);

  const handleDragStart = (e: React.DragEvent, block: DraggableBlock) => {
    e.dataTransfer.setData('text/plain', block.value);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const value = e.dataTransfer.getData('text/plain');
    const textarea = textareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      
      const newText = text.substring(0, start) + value + text.substring(end);
      setDescription(newText);
      
      // Restore cursor position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + value.length, start + value.length);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-8 items-center justify-center">
      <VideoPreview />
      <div className="flex-1 w-fit mx-auto">
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-center">Description</h3>
            <button className="ml-2">
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            {blocks.map(block => (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 hover:border-gray-300 rounded-lg cursor-move group"
              >
                <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                <span className="text-sm">{block.label}</span>
              </div>
            ))}
          </div>
          
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="w-[500px] h-32 px-4 py-2 rounded-lg border-2 border-black focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Entrez la description de votre vidéo..."
          />
        </div>
      </div>
    </div>
  );
}