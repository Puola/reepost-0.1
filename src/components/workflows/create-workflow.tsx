import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SourceStep } from './steps/source-step';
import { DestinationStep } from './steps/destination-step';
import { VideoFormatStep } from './steps/video-format-step';
import { IntroOutroStep } from './steps/intro-outro-step';
import { DescriptionStep } from './steps/description-step';
import { SelectionStep } from './steps/selection-step';
import { PublicationStep } from './steps/publication-step';
import { FinalizationStep } from './steps/finalization-step';
import { YouTubeOptionsStep } from './steps/youtube-options-step';
import { InstagramOptionsStep } from './steps/instagram-options-step';

interface CreateWorkflowProps {
  onCancel: () => void;
  workflow?: Workflow;
  onWorkflowCreated: (workflow: {
    title: string;
    reposts: number;
    author: string;
    platforms: {
      from: string;
      to: string[];
    };
    isAuto: boolean;
  }) => void;
}

export function CreateWorkflow({ onCancel, onWorkflowCreated, workflow }: CreateWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedSource, setSelectedSource] = useState<string | null>(workflow?.platforms.from || null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(workflow?.platforms.to || []);
  const [selectedDestinationAccounts, setSelectedDestinationAccounts] = useState<Record<string, string>>({});
  const [workflowName, setWorkflowName] = useState(workflow?.title || '');
  const [videoFormat, setVideoFormat] = useState<'vertical' | 'horizontal'>(workflow?.videoFormat || 'vertical');
  const [videoDuration, setVideoDuration] = useState<'default' | 'short' | 'long'>(workflow?.videoDuration || 'default');

  const STEPS = [
    { id: 1, title: "Source", progress: 0 },
    { id: 2, title: "Destination", progress: 10 },
    { id: 3, title: "Format vidéo", progress: 20 },
    { id: 4, title: "Intro & Outro", progress: 30 },
    { id: 5, title: "Description", progress: 50 },
    { id: 6, title: "Options YouTube", progress: 60 },
    { id: 7, title: "Options Instagram", progress: 70 },
    { id: 8, title: "Selection", progress: 80 },
    { id: 9, title: "Publication", progress: 90 },
    { id: 10, title: "", progress: 100 }
  ];

  const step = STEPS.find(s => s.id === currentStep) || STEPS[0];

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (!workflowName || !selectedSource || selectedDestinations.length === 0) return;

    const newWorkflow = {
      title: workflowName,
      reposts: 0,
      author: "Vous",
      platforms: {
        from: selectedSource,
        to: selectedDestinations
      },
      isAuto: true
    };

    onWorkflowCreated(newWorkflow);
    onCancel();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SourceStep
            selectedSource={selectedSource}
            selectedAccount={selectedAccount}
            onSourceSelect={setSelectedSource}
            onAccountSelect={setSelectedAccount}
          />
        );
      case 2:
        return (
          <DestinationStep
            selectedSource={selectedSource}
            selectedSourceAccount={selectedAccount}
            selectedDestinations={selectedDestinations}
            selectedDestinationAccounts={selectedDestinationAccounts}
            onDestinationsChange={setSelectedDestinations}
            onDestinationAccountsChange={setSelectedDestinationAccounts}
          />
        );
      case 3:
        return (
          <VideoFormatStep
            videoFormat={videoFormat}
            videoDuration={videoDuration}
            onFormatChange={setVideoFormat}
            onDurationChange={setVideoDuration}
          />
        );
      case 4:
        return <IntroOutroStep />;
      case 5:
        return <DescriptionStep />;
      case 6:
        return <YouTubeOptionsStep />;
      case 7:
        return <InstagramOptionsStep />;
      case 8:
        return <SelectionStep />;
      case 9:
        return <PublicationStep />;
      case 10:
        return (
          <FinalizationStep
            workflowName={workflowName}
            onWorkflowNameChange={setWorkflowName}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-[#E1E6ED]">
      <div className="pt-5 px-5 relative">
        <div 
          className="h-[20px] bg-gray-100 rounded-[100px] relative"
        >
          <div className="relative h-full">
            {step.progress === 0 ? (
              <>
                <div className="absolute left-0 top-0 h-[20px] w-[20px] bg-primary rounded-[100px]" />
                <span className="absolute left-[28px] top-1/2 -translate-y-1/2 text-xs font-bold text-primary">
                  0%
                </span>
              </>
            ) : (
              <div 
                className="h-[20px] bg-primary rounded-[100px] transition-all duration-300 flex items-center justify-center"
                style={{ width: `${step.progress}%` }}
              >
                <span className="text-xs font-bold text-white">
                  {step.progress}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[450px]">
        <div className="p-8 pb-0">
          <h2 className="text-2xl font-semibold mb-4 text-center">{step.title}</h2>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-[330px] px-8">
            {renderStepContent()}
          </div>
        </div>

        <div className="p-4 pt-0 mt-auto">
          <div className="flex justify-between">
            {currentStep === 1 ? (
              <button
                onClick={onCancel}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 py-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Revenir à la liste de workflows
              </button>
            ) : (
              <button
                onClick={handlePrevious}
                className="inline-flex px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Précédent
              </button>
            )}
            
            {currentStep === STEPS.length ? (
              <button
                onClick={handleFinish}
                className="inline-flex px-5 py-2 rounded-lg bg-black text-white hover:bg-black/90 disabled:opacity-50"
                disabled={!workflowName}
              >
                Enregistrer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className={`inline-flex px-5 py-2 rounded-lg bg-black text-white ${
                  (currentStep === 1 && (!selectedSource || !selectedAccount)) || (currentStep === 2 && selectedDestinations.length === 0)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-black/90'
                }`}
                disabled={
                  (currentStep === 1 && (!selectedSource || !selectedAccount)) ||
                  (currentStep === 2 && (
                    selectedDestinations.length === 0 || 
                    selectedDestinations.some(dest => !selectedDestinationAccounts[dest])
                  ))
                }
              >
                Suivant
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}