import { HelpCircle, ChevronDown } from 'lucide-react';
import { VideoPreview } from '../video-preview';
import { useState } from 'react';

export function InstagramOptionsStep() {
  const [shareToFeed, setShareToFeed] = useState(false);
  const [shareToFacebook, setShareToFacebook] = useState(false);

  return (
    <div className="flex gap-8 items-center justify-center">
      <VideoPreview />
      <div className="flex-1 w-fit mx-auto">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Share to Instagram feed */}
          <div className="col-span-2">
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-black">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Also share to Instagram feed</h3>
                <button>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <button 
                onClick={() => setShareToFeed(!shareToFeed)}
                className={`flex items-center rounded-full transition-all duration-500 ease-in-out w-[60px] h-[25px] relative ${
                  shareToFeed ? 'bg-black' : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`absolute w-[19px] h-[19px] rounded-full transition-all duration-500 ease-in-out ${
                  shareToFeed ? 'right-[3px] bg-white' : 'left-[3px] bg-gray-400'
                }`} />
              </button>
            </div>
          </div>

          {/* Share to Facebook */}
          <div className="col-span-2">
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-black">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Partager sur Facebook</h3>
                <button>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <button 
                onClick={() => setShareToFacebook(!shareToFacebook)}
                className={`flex items-center rounded-full transition-all duration-500 ease-in-out w-[60px] h-[25px] relative ${
                  shareToFacebook ? 'bg-black' : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`absolute w-[19px] h-[19px] rounded-full transition-all duration-500 ease-in-out ${
                  shareToFacebook ? 'right-[3px] bg-white' : 'left-[3px] bg-gray-400'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}