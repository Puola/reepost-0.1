import { HelpCircle, Plus } from 'lucide-react';
import { VideoPreview } from '../video-preview';

export function IntroOutroStep() {
  return (
    <div className="flex gap-8">
      <VideoPreview />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <h3 className="text-sm font-medium mb-8 flex items-center justify-center gap-2">
            Ajouter intro et outro (optionnel)
            <button>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </button>
          </h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg">
              <Plus className="w-4 h-4" />
              Sélectionner un fichier d'intro
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg">
              <Plus className="w-4 h-4" />
              Sélectionner un fichier d'outro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}