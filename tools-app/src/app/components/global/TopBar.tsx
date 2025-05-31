import { PanelLeft, ChevronRight } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="h-16 flex items-center px-6 gap-4">
      {/* Menu Icon Container */}
      <button 
        onClick={onMenuClick}
        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#DCE0E4] transition-colors cursor-pointer"
      >
        <PanelLeft size={18} className="text-[#020A17]" strokeWidth={2} />
      </button>
      
      {/* Divider */}
      <div className="w-px h-6 bg-[#DCE0E4]"></div>
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-4">
        <span className="text-[#4F5761] text-base font-normal">Design tools</span>
        <ChevronRight size={16} className="text-[#4F5761]" strokeWidth={1.33} />
        <span className="text-[#020A17] text-base font-normal">Dashboard</span>
      </div>
    </div>
  );
}
