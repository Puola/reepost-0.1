import { Search, Bell, ChevronLeft, ChevronRight, Filter, Plus, Calendar as CalendarIcon, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { SearchNotificationBar } from '@/components/layout/search-notification-bar';
import { Calendar } from '@/components/calendar/calendar';

interface SocialStatsProps {
  platform: string;
  count: string;
}

function SocialStats({ platform, count }: SocialStatsProps) {
  return (
    <div className="flex items-center space-x-2">
      <img
        src={`/icons/${platform}.svg`}
        alt={platform}
        className="h-4 w-4"
      />
      <span className="text-sm">{count}</span>
    </div>
  );
}

interface AccountCardProps {
  username: string;
  followers: string;
  image: string;
  onMoreClick?: () => void;
}

function AccountCard({ username, followers, image, onMoreClick }: AccountCardProps) {
  return (
    <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 rounded-xl text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <img
            src={image}
            alt={username}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{username}</div>
            <div className="text-sm text-white/80">{followers}</div>
          </div>
        </div>
        <button onClick={onMoreClick} className="p-1 hover:bg-white/10 rounded-full">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>
      <div className="flex space-x-6 mt-4">
        <SocialStats platform="tiktok" count="283.2k" />
        <SocialStats platform="youtube" count="117.8k" />
        <SocialStats platform="instagram" count="52k" />
        <SocialStats platform="snapchat" count="31k" />
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    percentage: string;
    isPositive: boolean;
  };
}

function StatsCard({ title, value, change }: StatsCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl">
      <h3 className="text-gray-500 mb-4">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold">{value}</div>
        <div className={`flex items-center ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <span className="text-sm">+{change.percentage}</span>
        </div>
      </div>
    </div>
  );
}

interface Publication {
  id: string;
  title: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook';
  date: Date;
}

function PublicationCalendar({ publications }: { publications: Publication[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const monthDays = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Calendrier</h3>
          <span className="text-sm text-gray-500">{formatMonth(currentDate)}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="h-8" />
        ))}

        {monthDays.map((date) => {
          const dayPublications = publications.filter(
            pub => pub.date.toDateString() === date.toDateString()
          );
          
          return (
            <div
              key={date.getDate()}
              className={`h-8 relative ${
                date.toDateString() === new Date().toDateString()
                  ? 'bg-primary/5 rounded'
                  : ''
              }`}
            >
              <div className="h-full w-full rounded hover:bg-gray-50 p-1">
                <span className={`text-xs ${
                  date.toDateString() === new Date().toDateString()
                    ? 'font-medium text-primary'
                    : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </span>
                {dayPublications.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
                    {dayPublications.slice(0, 3).map((pub) => (
                      <div
                        key={pub.id}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        title={pub.title}
                      />
                    ))}
                    {dayPublications.length > 3 && (
                      <span className="text-[10px] text-gray-500">+{dayPublications.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { userData } = useAuth();
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const publications = [
    {
      id: '1',
      title: 'Nouvelle vidéo TikTok',
      platform: 'tiktok',
      date: new Date(2024, 2, 15)
    },
    {
      id: '2',
      title: 'Post Instagram',
      platform: 'instagram',
      date: new Date(2024, 2, 15)
    },
    {
      id: '3',
      title: 'Vidéo YouTube',
      platform: 'youtube',
      date: new Date(2024, 2, 20)
    }
  ];

  return (
    <div className="pl-[310px]">
      <div className="px-[75px] py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <SearchNotificationBar />
        </div>

        <h2 className="text-xl mb-6">Bonjour {userData?.firstName} !</h2>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedAccountIndex(0)}
            className={`p-4 rounded-xl shadow-sm text-left transition-all duration-300 w-[280px] ${
              selectedAccountIndex === 0 
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <img
                  src={userData?.profilePicture}
                  alt="Account"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold">@lesincredibles</div>
                  <div className={`text-sm ${selectedAccountIndex === 0 ? 'text-white/80' : 'text-gray-500'}`}>484k</div>
                </div>
              </div>
              <div className="p-1 hover:bg-white/10 rounded-full">
                <MoreVertical className={`w-5 h-5 ${selectedAccountIndex === 0 ? 'text-white' : 'text-gray-600'}`} />
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedAccountIndex(1)}
            className={`p-4 rounded-xl shadow-sm text-left transition-all duration-300 w-[280px] ${
              selectedAccountIndex === 1
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                : 'bg-white text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <img
                  src={userData?.profilePicture}
                  alt="Account"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold">@theincredibleblog</div>
                  <div className={`text-sm ${selectedAccountIndex === 1 ? 'text-white/80' : 'text-gray-500'}`}>14k</div>
                </div>
              </div>
              <div className="p-1 hover:bg-white/10 rounded-full">
                <MoreVertical className={`w-5 h-5 ${selectedAccountIndex === 1 ? 'text-white' : 'text-gray-600'}`} />
              </div>
            </div>
          </button>

          <button className="w-[280px] h-[82px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-500 hover:border-gray-300 transition-colors shadow-sm">
            <Plus className="w-6 h-6" />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
              <CalendarIcon className="w-4 h-4" />
              <span>Période</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* New Stats Layout */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Left column (25%) - Split into two boxes */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 mb-2">Nombre d'abonnés</h3>
              <div>
                <div className="text-3xl font-bold">6 043 132</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 mb-2">Nombre de vues</h3>
              <div>
                <div className="text-3xl font-bold">9.32 Md</div>
              </div>
            </div>
          </div>
          
          {/* Middle column (50%) - Split into two boxes */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 mb-2">Nouveaux abonnés</h3>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">+28 264</div>
                <span className="px-2 py-0.5 bg-green-100 rounded-full text-xs text-green-500">+14.7%</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-gray-500 mb-2">Nouvelles vues</h3>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">+10,7 M</div>
                <span className="px-2 py-0.5 bg-green-100 rounded-full text-xs text-green-500">+9.2%</span>
              </div>
            </div>
          </div>
          
          {/* Right column (25%) - One tall box */}
          <div className="col-span-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-full">
              <h3 className="text-gray-500 mb-4">Evolution des abonnés</h3>
              <div className="h-[calc(100%-2rem)] flex items-center justify-center">
                <div className="w-full h-full relative">
                  {/* Chart placeholder */}
                  <div className="absolute inset-0">
                    <div className="w-full h-full flex items-end">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-4">
                        <span>150K</span>
                        <span>100K</span>
                        <span>50K</span>
                        <span>0</span>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="absolute left-10 right-0 bottom-0 flex justify-between text-xs text-gray-400">
                        <span>15</span>
                        <span>16</span>
                        <span>17</span>
                        <span>18</span>
                        <span>19</span>
                        <span>20</span>
                        <span>21</span>
                      </div>
                      
                      <div className="absolute left-0 right-0 bottom-0 text-xs text-gray-400 text-center">
                        Fev.
                      </div>
                      
                      {/* Chart lines */}
                      <div className="absolute left-10 right-0 top-4 bottom-6">
                        {/* TikTok line (black) */}
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,90 C10,85 20,80 30,60 S50,50 60,40 S80,20 100,10" fill="none" stroke="black" strokeWidth="2" />
                        </svg>
                        
                        {/* YouTube line (red) */}
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,70 C20,65 40,60 60,60 S80,50 100,45" fill="none" stroke="#FF0000" strokeWidth="2" />
                        </svg>
                        
                        {/* Instagram line (purple) */}
                        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,100 C20,100 40,100 60,90 S80,50 100,45" fill="none" stroke="#8A3AB9" strokeWidth="2" />
                        </svg>
                        
                        {/* Data points */}
                        <div className="absolute top-[20%] right-[20%] w-2 h-2 rounded-full bg-black"></div>
                        <div className="absolute top-[45%] right-[20%] w-2 h-2 rounded-full bg-red-600"></div>
                        <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-purple-500"></div>
                      </div>
                      
                      {/* Legend */}
                      <div className="absolute top-2 right-2 flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-black rounded-full mr-1"></div>
                          <span className="text-xs">TikTok</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
                          <span className="text-xs">YouTube</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                          <span className="text-xs">Instagram</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-8 text-center text-white mb-8">
          <h2 className="text-2xl font-bold">
            Félicitations pour vos 6 millions d'abonnés !
          </h2>
        </div>

        <Calendar publications={publications} />
      </div>
    </div>
  );
}