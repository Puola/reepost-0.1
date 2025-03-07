import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchNotificationBarProps {
  showSearch?: boolean;
}

export function SearchNotificationBar({ showSearch = true }: SearchNotificationBarProps) {
  return (
    <div className="flex items-center space-x-4">
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search for your automations..."
            className="pl-10 pr-4 py-2 border rounded-lg w-[32rem] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      )}
      <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-full relative">
        <Bell className="h-5 w-5 text-gray-600" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
      </Link>
    </div>
  );
}