import { HelpCircle, Upload, X } from 'lucide-react';
import { VideoPreview } from '../video-preview';

export function WatermarkStep() {
  return (
    <div className="flex gap-8">
      <VideoPreview />
      <div className="flex-1 space-y-8">
      <div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-sm font-medium text-center">Watermark</h3>
          <button className="ml-2">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer">
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-sm">Upload watermark</span>
            <span className="text-xs text-gray-400 mt-1">PNG with transparency, max 2MB</span>
          </div>
          <div className="relative border-2 border-gray-200 rounded-lg p-4">
            <img className="w-full h-full rounded object-contain" />
            <button className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50">
              <X className="w-4 h-4" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-gray-500">No watermark</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      <div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <h3 className="text-sm font-medium text-center">Position</h3>
          <button className="ml-2">
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <button className="aspect-square rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-center">
            Top Left
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Top Center
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Top Right
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Center Left
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Center
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Center Right
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Bottom Left
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Bottom Center
          </button>
          <button className="aspect-square rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center">
            Bottom Right
          </button>
        </div>
      </div>
    </div>
  );
}