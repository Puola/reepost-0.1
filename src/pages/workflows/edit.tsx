import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateWorkflow } from '@/lib/workflows';
import type { Workflow } from '@/lib/workflows';
import { Button } from '@/components/ui/button';

export function WorkflowEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    isAuto: false,
    videoFormat: 'vertical',
    videoDuration: 'default'
  });

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!id) return;

      try {
        const workflowDoc = await getDoc(doc(db, 'workflows', id));
        if (workflowDoc.exists()) {
          const data = workflowDoc.data() as Workflow;
          setWorkflow({ ...data, id: workflowDoc.id });
          setFormData({
            title: data.title,
            isAuto: data.isAuto,
            videoFormat: data.videoFormat || 'vertical',
            videoDuration: data.videoDuration || 'default'
          });
        }
      } catch (error) {
        console.error('Error fetching workflow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    setSaving(true);
    try {
      await updateWorkflow(id, formData);
      navigate('/workflows');
    } catch (error) {
      console.error('Error updating workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Workflow introuvable</h2>
          <Button onClick={() => navigate('/workflows')}>
            Retour aux workflows
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/workflows')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Modifier le workflow</h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Informations générales</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du workflow
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Automatisation
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, isAuto: !prev.isAuto }))}
                      className={`flex items-center rounded-full transition-all duration-500 ease-in-out w-[60px] h-[25px] relative ${
                        formData.isAuto ? 'bg-green-500' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div
                        className={`absolute w-[19px] h-[19px] rounded-full transition-all duration-500 ease-in-out ${
                          formData.isAuto ? 'right-[3px] bg-white' : 'left-[3px] bg-gray-400'
                        }`}
                      />
                      {formData.isAuto && (
                        <span className="absolute left-[8px] text-[10px] text-white font-bold">
                          auto
                        </span>
                      )}
                    </button>
                    <span className="ml-3 text-sm text-gray-600">
                      {formData.isAuto ? 'Automatique' : 'Manuel'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Paramètres vidéo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, videoFormat: 'vertical' }))}
                      className={`flex items-center px-4 py-2 rounded-lg border-2 ${
                        formData.videoFormat === 'vertical'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="w-4 h-6 border-2 border-current rounded mr-2" />
                      Vertical
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, videoFormat: 'horizontal' }))}
                      className={`flex items-center px-4 py-2 rounded-lg border-2 ${
                        formData.videoFormat === 'horizontal'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="w-6 h-4 border-2 border-current rounded mr-2" />
                      Horizontal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, videoDuration: 'default' }))}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        formData.videoDuration === 'default'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                    >
                      Default
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, videoDuration: 'short' }))}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        formData.videoDuration === 'short'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                    >
                      Short (moins de 60 secs)
                    </button>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, videoDuration: 'long' }))}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        formData.videoDuration === 'long'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                    >
                      Long (plus de 60 secs)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}