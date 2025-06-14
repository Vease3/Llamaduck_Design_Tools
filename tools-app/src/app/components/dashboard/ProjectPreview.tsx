import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ProjectPreviewProps {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  coverImage?: {
    light: string;
    dark: string;
  };
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  id,
  title,
  description,
  category,
  icon: Icon,
  onClick,
  coverImage
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Get initial theme
    const currentTheme = document.documentElement.dataset.theme as 'light' | 'dark' || 'light';
    setTheme(currentTheme);

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.dataset.theme as 'light' | 'dark' || 'light';
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="flex-1 flex flex-col gap-[10px] p-4 bg-[var(--system-color-elevation-two-background)] border border-[var(--system-color-border-primary)] rounded-2xl hover:bg-[var(--system-color-elevation-base-hover)] hover:border-[var(--system-color-border-hover-primary)] transition-all duration-200 cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Card Content */}
      <div className="flex flex-col gap-4">
        {/* Icon/Cover Image Container */}
        <div className="flex justify-center items-center bg-[var(--system-color-elevation-base-background)] group-hover:bg-[var(--system-color-elevation-base-hover)] rounded-lg p-[10px] aspect-[16/9] transition-all duration-200 overflow-hidden">
          {coverImage ? (
            <Image 
              src={theme === 'dark' ? coverImage.dark : coverImage.light}
              alt={`${title} cover`}
              width={200}
              height={113}
              className={`rounded-md ${
                id === '5' 
                  ? 'w-[64%] h-[64%] object-contain' 
                  : 'w-full h-full object-cover'
              }`}
            />
          ) : (
            <div className="w-6 h-6 rounded flex items-center justify-center">
              <Icon 
                className="w-[18px] h-[18px] text-[var(--system-color-elevation-base-content)] stroke-2"
              />
            </div>
          )}
        </div>
        
        {/* Text Content */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
              {title}
            </h3>
            <p className="text-sm text-[var(--system-color-elevation-base-content)] font-normal leading-[1.21] line-clamp-2 h-[2.42em]">
              {description}
            </p>
          </div>
          {/* Category Label - Below description */}
          <div className="flex justify-end">
            <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] font-normal leading-[1.21]">
              {category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;
