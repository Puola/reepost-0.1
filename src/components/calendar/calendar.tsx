import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month';
type Publication = {
  id: string;
  title: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook';
  date: Date;
};

interface CalendarProps {
  publications: Publication[];
}

export function Calendar({ publications }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const navigate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
        break;
    }
  };

  const getDaysToDisplay = () => {
    switch (viewMode) {
      case 'day':
        return [currentDate];
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
      }
      case 'month': {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
      }
    }
  };

  const getPublicationsForDay = (date: Date) => {
    return publications.filter(pub => isSameDay(pub.date, date));
  };

  const renderDayContent = (date: Date) => {
    const dayPublications = getPublicationsForDay(date);
    const isToday = isSameDay(date, new Date());
    const isCurrentMonth = isSameMonth(date, currentDate);

    return (
      <div 
        className={`h-full min-h-[100px] p-2 ${
          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
        } ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}
      >
        <span className={`text-sm ${
          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
        } ${isToday ? 'font-bold text-primary' : ''}`}>
          {format(date, 'd')}
        </span>
        
        {dayPublications.length > 0 && (
          <div className="mt-2 space-y-1">
            {dayPublications.map(pub => (
              <div 
                key={pub.id}
                className="flex items-center gap-1 text-xs bg-primary/5 text-primary rounded p-1"
              >
                <img
                  src={`/icons/${pub.platform}.svg`}
                  alt={pub.platform}
                  className="w-3 h-3"
                />
                <span className="truncate">{pub.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Calendrier</h3>
          <span className="text-sm text-gray-500">
            {format(currentDate, viewMode === 'day' ? 'dd MMMM yyyy' : 'MMMM yyyy', { locale: fr })}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* View mode selector */}
          <div className="flex rounded-lg border overflow-hidden">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium ${
                  viewMode === mode
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {/* Week days header */}
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 border-b bg-gray-50">
            {weekDays.map(day => (
              <div key={day} className="px-2 py-3 text-sm font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Calendar grid */}
        <div 
          className={`grid ${
            viewMode === 'day' 
              ? 'grid-cols-1' 
              : viewMode === 'week'
              ? 'grid-cols-7'
              : 'grid-cols-7'
          } divide-x divide-y`}
        >
          {getDaysToDisplay().map((date, i) => (
            <div key={i} className="min-w-[120px]">
              {renderDayContent(date)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}