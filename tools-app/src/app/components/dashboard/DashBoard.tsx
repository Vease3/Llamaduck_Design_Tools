import React from 'react';
import { LayoutPanelLeft, TextCursorInput } from 'lucide-react';
import ProjectPreview from './ProjectPreview';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardProps {
  onToolSelect?: (toolId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onToolSelect }) => {
  const toolCards: ToolCard[] = [
    {
      id: '2', 
      title: 'Lottie Token Assigner',
      description: 'Assign design tokens to color layers',
      category: 'Animation',
      icon: TextCursorInput
    }
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex flex-col gap-9">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
            Design Tool Dashboard
          </h1>
          <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] font-normal leading-[1.21]">
            A collection of useful design tools
          </p>
        </div>

        {/* All Tools Section */}
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
            All Tools
          </h2>
          
          {/* Tool Cards Grid */}
          <div className="flex gap-2">
            {toolCards.map((tool) => (
              <ProjectPreview
                key={tool.id}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                category={tool.category}
                icon={tool.icon}
                onClick={() => {
                  // Handle tool selection
                  console.log(`Selected tool: ${tool.title}`);
                  onToolSelect?.(tool.id);
                }}
              />
            ))}
            
            {/* Placeholder cards to match the design */}
            <div className="flex-1 opacity-0">
              <div className="flex-1 flex flex-col gap-[10px] p-4 bg-[var(--system-color-elevation-two-background)] border border-[var(--system-color-border-primary)] rounded-2xl hover:bg-[var(--system-color-elevation-base-hover)] hover:border-[var(--system-color-border-hover-primary)] transition-all duration-200 cursor-pointer group relative">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center items-center bg-[var(--system-color-elevation-base-background)] group-hover:bg-[var(--system-color-elevation-base-hover)] rounded-lg p-[10px] aspect-[16/9] transition-all duration-200">
                    <div className="w-6 h-6 rounded flex items-center justify-center">
                      <LayoutPanelLeft 
                        className="w-[18px] h-[18px] text-[var(--system-color-elevation-base-content)] stroke-2"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                        Featured Tools
                      </h3>
                      <p className="text-sm text-[var(--system-color-elevation-base-content)] font-normal leading-[1.21] line-clamp-2 h-[2.42em]">
                        A collection of useful design tools
                      </p>
                    </div>
                    {/* Category Label - Below description */}
                    <div className="flex justify-end">
                      <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] font-normal leading-[1.21]">
                        Animation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 opacity-0">
              <div className="flex-1 flex flex-col gap-[10px] p-4 bg-[var(--system-color-elevation-two-background)] border border-[var(--system-color-border-primary)] rounded-2xl hover:bg-[var(--system-color-elevation-base-hover)] hover:border-[var(--system-color-border-hover-primary)] transition-all duration-200 cursor-pointer group relative">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center items-center bg-[var(--system-color-elevation-base-background)] group-hover:bg-[var(--system-color-elevation-base-hover)] rounded-lg p-[10px] aspect-[16/9] transition-all duration-200">
                    <div className="w-6 h-6 rounded flex items-center justify-center">
                      <LayoutPanelLeft 
                        className="w-[18px] h-[18px] text-[var(--system-color-elevation-base-content)] stroke-2"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                        Featured Tools
                      </h3>
                      <p className="text-sm text-[var(--system-color-elevation-base-content)] font-normal leading-[1.21] line-clamp-2 h-[2.42em]">
                        A collection of useful design tools
                      </p>
                    </div>
                    {/* Category Label - Below description */}
                    <div className="flex justify-end">
                      <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] font-normal leading-[1.21]">
                        Animation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
