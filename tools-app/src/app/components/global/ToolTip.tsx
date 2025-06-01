import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ToolTipProps {
  message: string;
  isVisible: boolean;
  onHide?: () => void;
  duration?: number;
}

const ToolTip: React.FC<ToolTipProps> = ({ 
  message, 
  isVisible, 
  onHide, 
  duration = 3000 
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure element is rendered before animation
      setTimeout(() => {
        setAnimationClass('animate-in');
      }, 10);

      // Auto-hide after duration
      const hideTimer = setTimeout(() => {
        setAnimationClass('animate-out');
        // Remove from DOM after animation completes
        setTimeout(() => {
          setShouldRender(false);
          onHide?.();
        }, 300);
      }, duration);

      return () => clearTimeout(hideTimer);
    } else {
      setAnimationClass('animate-out');
      setTimeout(() => {
        setShouldRender(false);
      }, 300);
    }
  }, [isVisible, duration, onHide]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
      <div 
        className={`
          mb-8 flex items-center gap-2 h-12 pl-1 pr-4 
          bg-[var(--system-color-elevation-superior-background)] rounded-full shadow-lg
          transition-all duration-300 ease-out
          ${animationClass === 'animate-in' 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-4 opacity-0'
          }
        `}
      >
        {/* Check Icon Container */}
        <div className="flex items-center justify-center w-8 h-8 bg-[var(--system-color-elevation-superior-background-alt)] rounded-full ml-1">
          <Check 
            size={20} 
            className="text-[var(--system-color-elevation-superior-content-alt)]"
            strokeWidth={1.67}
          />
        </div>
        
        {/* Message Text */}
        <span className="text-[var(--system-color-elevation-superior-content)] text-base font-medium leading-[1.21]">
          {message}
        </span>
      </div>
    </div>
  );
};

export default ToolTip;
