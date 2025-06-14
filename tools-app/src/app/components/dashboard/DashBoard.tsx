import React from 'react';
import { TextCursorInput, FileImage, Video } from 'lucide-react';
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
    },
    {
      id: '3', 
      title: 'SVG Token Assigner',
      description: 'Assign design tokens to SVG colors',
      category: 'Imagery',
      icon: FileImage
    },
    {
      id: '5',
      title: 'Video to GIF Converter',
      description: 'Convert video files to high-quality GIFs',
      category: 'Imagery',
      icon: Video
    },
    {
      id: '4',
      title: 'YouTube Video Transcriber',
      description: 'Takes a youtube link then transcribes it for you',
      category: 'Misc Tools',
      icon: Video
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
          <div className="grid grid-cols-3 gap-4">
            {toolCards.map((tool) => (
              <ProjectPreview
                key={tool.id}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                category={tool.category}
                icon={tool.icon}
                coverImage={tool.id === '2' ? {
                  light: '/lottie-token-assign/cover-img-lightmode.svg',
                  dark: '/lottie-token-assign/cover-img-darkmode.svg'
                } : tool.id === '3' ? {
                  light: '/svg-token-assign/cover-img-lightmode.svg',
                  dark: '/svg-token-assign/cover-img-darkmode.svg'
                } : tool.id === '4' ? {
                  light: '/youtube-transcriber/cover-img-lightmode.svg',
                  dark: '/youtube-transcriber/cover-img-darkmode.svg'
                } : tool.id === '5' ? {
                  light: '/GIFConvert/gifmock.gif',
                  dark: '/GIFConvert/gifmock.gif'
                } : undefined}
                onClick={() => {
                  // Handle tool selection
                  console.log(`Selected tool: ${tool.title}`);
                  onToolSelect?.(tool.id);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
