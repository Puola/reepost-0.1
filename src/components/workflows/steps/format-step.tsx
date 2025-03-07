import { HelpCircle } from 'lucide-react';
import { VideoPreview } from '../video-preview';

export function FormatStep() {
  return (
    <div className="flex gap-8">
      <VideoPreview />
      <div className="flex-1 space-y-8">
      <div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-sm font-medium text-center">Format de sortie</h3>
          <button className="ml-2">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex justify-center gap-4">
          <button 
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border-2 border-primary bg-primary/5"
          >
            <h4 className="font-medium mb-1">MP4</h4>
            <p className="text-sm text-gray-500">Format standard</p>
          </button>
          <button 
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <h4 className="font-medium mb-1">MOV</h4>
            <p className="text-sm text-gray-500">Haute qualité</p>
          </button>
          <button 
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <h4 className="font-medium mb-1">WebM</h4>
            <p className="text-sm text-gray-500">Web optimisé</p>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-sm font-medium text-center">Qualité</h3>
          <button className="ml-2">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex justify-center gap-4">
          <button 
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <h4 className="font-medium mb-1">Standard</h4>
            <p className="text-sm text-gray-500">720p</p>
          </button>
          <button 
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border-2 border-primary bg-primary/5"
          >
            <h4 className="font-medium mb-1">HD</h4>
            <p className="text-sm text-gray-500">1080p</p>
          </button>
          <button 
            className="inline-flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300"
          >
            <h4 className="font-medium mb-1">Ultra HD</h4>
            <p className="text-sm text-gray-500">4K</p>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}