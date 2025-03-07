import { HelpCircle } from 'lucide-react';
import { uploadVideo } from '@/lib/video-processor';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface VideoFormatStepProps {
  videoFormat: 'vertical' | 'horizontal';
  videoDuration: 'default' | 'short' | 'long';
  onFormatChange: (format: 'vertical' | 'horizontal') => void;
  onDurationChange: (duration: 'default' | 'short' | 'long') => void;
}

export function VideoFormatStep({
  videoFormat,
  videoDuration,
  onFormatChange,
  onDurationChange
}: VideoFormatStepProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadVideo(file, {
        format: videoFormat,
        duration: videoDuration
      });
      toast.success('Vidéo téléchargée et traitée avec succès');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Erreur lors du traitement de la vidéo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-8 items-center justify-center">
      {/* Left Column - Video Preview */}
      <div className="relative w-[130px] h-[250px] rounded-lg overflow-hidden bg-black">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <div className="w-0 h-0 border-l-8 border-l-black border-y-[6px] border-y-transparent ml-1" />
            </div>
          </div>
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Right Column - Options */}
      <div className="flex-1 space-y-6">
        <div className="w-fit mx-auto space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-center">Format</h3>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onFormatChange('vertical')}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 ${
                videoFormat === 'vertical'
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-4 h-6 border-2 border-current rounded mr-2" />
              Vertical (original)
            </button>
            <button
              onClick={() => onFormatChange('horizontal')}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 ${
                videoFormat === 'horizontal'
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-6 h-4 border-2 border-current rounded mr-2" />
              Horizontal
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-center">Durée</h3>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onDurationChange('default')}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 ${
                videoDuration === 'default'
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => onDurationChange('short')}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 ${
                videoDuration === 'short'
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Short (moins de 60 secs)
            </button>
            <button
              onClick={() => onDurationChange('long')}
              className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 ${
                videoDuration === 'long'
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Long (plus de 60 secs)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}