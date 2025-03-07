import { HelpCircle, ChevronDown } from 'lucide-react';
import { VideoPreview } from '../video-preview';
import { useState } from 'react';

export function YouTubeOptionsStep() {
  const [defaultTextLanguage, setDefaultTextLanguage] = useState('English');
  const [defaultAudioLanguage, setDefaultAudioLanguage] = useState('English');
  const [privacy, setPrivacy] = useState('Public');
  const [category, setCategory] = useState('Entertainment');
  const [audience, setAudience] = useState('No, it is not made for kids');
  const [playlist, setPlaylist] = useState('Main channel (no playlist)');

  return (
    <div className="flex gap-8 items-center justify-center">
      <VideoPreview />
      <div className="flex-1 w-fit mx-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Default Text Language */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Default text language</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>{defaultTextLanguage}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Default Audio Language */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Default audio language</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>{defaultAudioLanguage}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Privacy */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Privacy</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>{privacy}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Category</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>{category}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Audience */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Audience</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>{audience}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Playlist */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Playlist</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>{playlist}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}