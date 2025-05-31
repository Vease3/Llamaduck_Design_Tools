import React from 'react';
import { 
  Home, 
  TextCursorInput
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface LeftDrawerProps {
  isOpen: boolean;
  selectedItem: string;
  onNavigation: (view: string) => void;
}

const LeftDrawer: React.FC<LeftDrawerProps> = ({ isOpen, selectedItem, onNavigation }) => {
  const menuSections: MenuSection[] = [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", icon: Home }
      ]
    },
    {
      title: "Animation",
      items: [
        { title: "Lottie Token Assigner", icon: TextCursorInput }
      ]
    }
  ];

  return (
    <div className={`w-[340px] h-screen bg-[var(--system-color-elevation-one-background)] border-r border-[var(--system-color-border-primary)] flex flex-col fixed left-0 top-0 z-10 transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Header Section */}
      <div className="flex items-center gap-4 p-6">
        {/* Logo */}
        <div className="w-14 h-14 flex items-center justify-center">
          <svg width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="56" height="56" rx="14" fill="#0B3183"/>
            <g clipPath="url(#Frame15__a)">
              <path fill="#fff" d="M23.816 28H35.08v10.621H23.816z"/>
              <path d="M46.594 39.4c0 1.322-1.054 2.395-2.352 2.395h-9.01a10.65 10.65 0 0 0 3.047-7.476c0-1.322-.245-2.587-.678-3.757.34.441.602.92.81 1.438a.4.4 0 0 0 .037.115c1.919 4.677 5.888 4.888 5.888 4.888l.283.058c1.11.172 1.956 1.15 1.956 2.338h.019Z" fill="#E0834D"/>
              <path d="M35.193 41.795h.038a10.65 10.65 0 0 0 3.048-7.476c0-1.322-.245-2.587-.678-3.757 0-.038-.056-.057-.075-.096l-.113-.345c.094-.095.188-.172.282-.268a4.842 4.842 0 0 0 1.374-3.393c0-2.645-2.107-4.792-4.703-4.792h-3.763v-5.119c0-1.418-1.11-2.549-2.502-2.549-.15 0-.32.02-.47.038h-.038a2.875 2.875 0 0 0-.79.326 2.673 2.673 0 0 0-1.185 1.86l-1.129 4.255-1.129-4.255C23.191 14.959 22.137 14 20.877 14c-.752 0-1.43.345-1.881.882a2.46 2.46 0 0 0-.621 1.667V56H37.94a802.771 802.771 0 0 0-2.22-11.33v-.114c-.113-.46-.207-.92-.3-1.342-.095-.48-.189-.92-.264-1.342-.02-.019-.02-.038-.02-.057h.057v-.02Zm-4.59-5.923c-.828 0-1.58-.364-2.088-.958H26.84c-1.035 0-1.882-.863-1.882-1.917 0-1.055.847-1.917 1.882-1.917h1.674a2.739 2.739 0 0 1 2.088-.959c1.562 0 2.822 1.285 2.822 2.876 0 1.59-1.26 2.875-2.822 2.875Z" fill="#fff"/>
              <circle cx="30.736" cy="32.989" r="2.736" fill="#0B3183"/>
            </g>
            <defs>
              <clipPath id="Frame15__a">
                <path fill="#fff" transform="translate(18.375 14)" d="M0 0h28.219v42H0z"/>
              </clipPath>
            </defs>
          </svg>
        </div>
        
        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-base font-bold text-[var(--system-color-elevation-base-content)] leading-tight">
            Llamaduck Design Tools
          </h1>
          <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-tight">
            creative suite
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex flex-col gap-8">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="flex flex-col gap-2">
              {/* Section Title */}
              <div className="px-2">
                <h2 className="text-sm text-[var(--system-color-elevation-base-content-tint)] font-normal">
                  {section.title}
                </h2>
              </div>
              
              {/* Menu Items */}
              <div className="flex flex-col gap-1">
                {section.items.map((item, itemIndex) => {
                  const isSelected = selectedItem === item.title;
                  return (
                    <button
                      key={itemIndex}
                      onClick={() => onNavigation(item.title)}
                      className={`flex items-center gap-2 px-2 py-3 rounded-lg transition-colors group w-full text-left ${
                        isSelected 
                          ? 'bg-[var(--system-color-elevation-base-content)]' 
                          : 'bg-transparent hover:bg-[var(--system-color-elevation-base-hover)]'
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <item.icon 
                          className={`w-5 h-5 ${
                            isSelected ? 'text-[var(--system-color-elevation-base-content-alt)]' : 'text-[var(--system-color-elevation-base-content)]'
                          }`}
                        />
                      </div>
                      <span className={`text-base font-normal ${
                        isSelected ? 'text-[var(--system-color-elevation-base-content-alt)]' : 'text-[var(--system-color-elevation-base-content)]'
                      }`}>
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftDrawer;
