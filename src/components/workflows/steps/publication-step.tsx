import { HelpCircle } from 'lucide-react';
import { VideoPreview } from '../video-preview';
import { useState } from 'react';

export function PublicationStep() {
  const [autoPublish, setAutoPublish] = useState(false);
  const [notifyOnPublish, setNotifyOnPublish] = useState(true);

  return (
    <div className="flex gap-8">
      <VideoPreview />
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Auto Publish */}
          <div className="col-span-2">
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-black">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Publication automatique</h3>
                <button>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <button 
                onClick={() => setAutoPublish(!autoPublish)}
                className={`flex items-center rounded-full transition-all duration-500 ease-in-out w-[60px] h-[25px] relative ${
                  autoPublish ? 'bg-black' : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`absolute w-[19px] h-[19px] rounded-full transition-all duration-500 ease-in-out ${
                  autoPublish ? 'right-[3px] bg-white' : 'left-[3px] bg-gray-400'
                }`} />
              </button>
            </div>
          </div>

          {/* Planification */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Planification</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>Immédiatement</span>
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Fréquence */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Fréquence</h3>
              <button>
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button className="w-full flex items-center justify-between px-4 py-2 border-2 border-black rounded-lg">
              <span>Une fois</span>
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Notification */}
          <div className="col-span-2">
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-black">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Recevoir une notification lors de la publication</h3>
                <button>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <button 
                onClick={() => setNotifyOnPublish(!notifyOnPublish)}
                className={`flex items-center rounded-full transition-all duration-500 ease-in-out w-[60px] h-[25px] relative ${
                  notifyOnPublish ? 'bg-black' : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`absolute w-[19px] h-[19px] rounded-full transition-all duration-500 ease-in-out ${
                  notifyOnPublish ? 'right-[3px] bg-white' : 'left-[3px] bg-gray-400'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}