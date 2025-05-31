import React from 'react';

interface ProjectPreviewProps {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}

const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  title,
  description,
  category,
  icon: Icon,
  onClick
}) => {
  return (
    <div
      className="flex-1 flex flex-col gap-[10px] p-4 bg-[#F6F9FD] border border-[#DCE0E4] rounded-2xl hover:bg-[#DCE0E4] hover:border-[#ADB2B8] transition-all duration-200 cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Card Content */}
      <div className="flex flex-col gap-4">
        {/* Icon Container */}
        <div className="flex justify-center items-center bg-[#F3F6FA] group-hover:bg-[#DCE0E4] rounded-lg p-[10px] aspect-[16/9] transition-all duration-200">
          <div className="w-6 h-6 rounded flex items-center justify-center">
            <Icon 
              className="w-[18px] h-[18px] text-[#020A17] stroke-2"
            />
          </div>
        </div>
        
        {/* Text Content */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-[#020A17] leading-[1.21]">
              {title}
            </h3>
            <p className="text-sm text-[#020A17] font-normal leading-[1.21] line-clamp-2 h-[2.42em]">
              {description}
            </p>
          </div>
          {/* Category Label - Below description */}
          <div className="flex justify-end">
            <span className="text-xs text-[#4F5761] font-normal leading-[1.21]">
              {category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPreview;
