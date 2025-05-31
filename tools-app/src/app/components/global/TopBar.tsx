import { PanelLeft, ChevronRight } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

interface TopBarProps {
  onMenuClick: () => void;
  selectedItem: string;
}

export default function TopBar({ onMenuClick, selectedItem }: TopBarProps) {
  return (
    <div className="h-16 flex items-center px-6 gap-4 justify-between">
      <div className="flex items-center gap-4">
        {/* Menu Icon Container */}
        <button 
          onClick={onMenuClick}
          className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--system-color-elevation-base-hover)] transition-colors cursor-pointer"
        >
          <PanelLeft size={18} className="text-[var(--system-color-elevation-base-content)]" strokeWidth={2} />
        </button>
        
        {/* Divider */}
        <div className="w-px h-6 bg-[var(--system-color-border-primary)]"></div>
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-4">
          <span className="text-[var(--system-color-elevation-base-content-tint)] text-base font-normal">Design tools</span>
          <ChevronRight size={16} className="text-[var(--system-color-elevation-base-content-tint)]" strokeWidth={1.33} />
          <span className="text-[var(--system-color-elevation-base-content)] text-base font-normal">{selectedItem}</span>
        </div>
      </div>

      {/* Theme Toggle */}
      <ThemeSwitcher />
    </div>
  );
}
