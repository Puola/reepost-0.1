import { Edit } from 'lucide-react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
}

export function Section({ title, children, onEdit }: SectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}