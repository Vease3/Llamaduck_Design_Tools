import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: LucideIcon;
  iconSize?: number;
  iconStrokeWidth?: number;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'compact';
  className?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  disabled = false,
  icon: Icon,
  iconSize = 20,
  iconStrokeWidth = 1.5,
  iconPosition = 'left',
  variant = 'default',
  className = ''
}) => {
  const baseClasses = `
    flex items-center gap-2 
    bg-[var(--system-color-functional-action)] 
    text-[var(--system-color-elevation-base-content-alt)] 
    border border-[var(--system-color-functional-action)]
    rounded-2xl 
    font-medium 
    transition-colors 
    flex-shrink-0
    cursor-pointer
    hover:bg-[var(--system-color-functional-action-hover)]
    disabled:bg-[var(--system-color-border-secondary)] 
    disabled:cursor-not-allowed
    disabled:border-[var(--system-color-border-secondary)]
  `;

  const variantClasses = {
    default: 'px-6 py-3 text-base h-10',
    compact: 'px-4 py-2 text-base h-10'
  };

  const iconClasses = variant === 'compact' && Icon && iconPosition === 'left' ? 'pl-2' : 
                     variant === 'compact' && Icon && iconPosition === 'right' ? 'pr-2' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${iconClasses} ${className}`}
    >
      {Icon && iconPosition === 'left' && (
        <Icon 
          size={iconSize} 
          className="text-[var(--system-color-elevation-base-content-alt)]" 
          strokeWidth={iconStrokeWidth} 
        />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon 
          size={iconSize} 
          className="text-[var(--system-color-elevation-base-content-alt)]" 
          strokeWidth={iconStrokeWidth} 
        />
      )}
    </button>
  );
};

export default PrimaryButton;
