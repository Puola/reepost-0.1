import { HelpCircle, ChevronDown } from 'lucide-react';
import { VideoPreview } from '../video-preview';
import { useState } from 'react';

export function SelectionStep() {
  const [minDuration, setMinDuration] = useState('');
  const [minViews, setMinViews] = useState('');
  const [excludedHashtags, setExcludedHashtags] = useState('');
  const [includedHashtags, setIncludedHashtags] = useState('');

  return (
    <div className="flex gap-8">
      <VideoPreview />
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Minimum Duration */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Durée minimum</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <input
              type="number"
              value={minDuration}
              onChange={(e) => setMinDuration(e.target.value)}
              placeholder="30"
              className="w-full px-4 py-2 border-2 border-black rounded-lg"
            />
          </div>

          {/* Minimum Views */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Vues minimum</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <input
              type="number"
              value={minViews}
              onChange={(e) => setMinViews(e.target.value)}
              placeholder="1000"
              className="w-full px-4 py-2 border-2 border-black rounded-lg"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Exclure les hashtags</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={excludedHashtags}
              onChange={(e) => setExcludedHashtags(e.target.value)}
              placeholder="#viral #trending"
              className="w-full px-4 py-2 border-2 border-black rounded-lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Inclure les hashtags</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={includedHashtags}
              onChange={(e) => setIncludedHashtags(e.target.value)}
              placeholder="#viral #trending"
              className="w-full px-4 py-2 border-2 border-black rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}