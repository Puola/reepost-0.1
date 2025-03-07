import { Eye } from 'lucide-react';

interface ContentPanelProps {
  onClose: () => void;
}

export function ContentPanel({ onClose }: ContentPanelProps) {
  return (
    <div className="border-t border-gray-200">
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <button onClick={onClose} className="text-sm font-medium">
          Fermer
        </button>
      </div>
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl">
            <div className="relative w-16 aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1557682250-33bd709cbe85"
                alt="Content preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium mb-1 truncate">Cette maman éléphant ne se réveille pas...</h5>
              <div className="flex items-center gap-2">
                {index === 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-red-500 text-xs">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                      Erreur
                    </div>
                    <span className="text-xs text-gray-400">28/12/2023 à 13h28</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1 text-green-500 text-xs">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                      Publié
                    </div>
                    <span className="text-xs text-gray-400">28/12/2023 à 13h28</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {['tiktok', 'youtube', 'instagram', 'facebook'].map((platform, i) => (
                  <div key={i} className={`relative w-8 h-8 rounded flex items-center justify-center ${
                    index === 0 && i === 2 ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <img
                      src={`/icons/${platform}.svg`}
                      alt={platform}
                      className={`w-4 h-4 ${index === 0 && i === 2 ? 'opacity-50' : ''}`}
                    />
                    {index === 0 && i === 2 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-red-500">!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              index === 0 
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}>
              {index === 0 ? 'Essayer de nouveau' : 'Republier'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}