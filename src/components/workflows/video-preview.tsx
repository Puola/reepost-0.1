import { Play } from 'lucide-react';

export function VideoPreview() {
  return (
    <div className="relative w-[130px] h-[250px] rounded-lg overflow-hidden bg-black">
      <img 
        src="https://images.unsplash.com/photo-1611162617474-5b21e879e113"
        alt="Video preview"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <Play className="w-3 h-3 text-black ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}