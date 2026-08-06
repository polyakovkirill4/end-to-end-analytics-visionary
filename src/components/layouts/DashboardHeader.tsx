import { Search, Bell, HelpCircle } from 'lucide-react';
import Image from 'next/image';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-[#FCFCFD]/80 backdrop-blur-md px-8">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-[#6D28D9]" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border-0 bg-purple-50/50 py-2.5 pl-11 pr-4 text-slate-900 shadow-sm ring-1 ring-inset ring-purple-100/50 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#6D28D9] sm:text-sm sm:leading-6 transition-all duration-300 outline-none"
            placeholder="Поиск..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0.5 right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
        
        <button className="text-slate-500 hover:text-slate-700 transition-colors">
          <HelpCircle className="h-6 w-6" />
        </button>
        
        <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100 relative bg-slate-200 cursor-pointer hover:ring-purple-200 transition-all">
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium text-sm">
            US
          </div>
          {/* If there's an actual avatar, we can render it over the placeholder */}
          <img 
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f8f9fa" 
            alt="User avatar"
            className="h-full w-full object-cover relative z-10"
          />
        </div>
      </div>
    </header>
  );
}
