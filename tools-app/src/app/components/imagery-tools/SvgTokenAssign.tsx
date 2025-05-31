import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Download, Upload, FileText, Palette } from 'lucide-react';
import PrimaryButton from '../global/PrimaryButton';

interface SvgTokenAssignProps {
  onBack?: () => void;
}

interface UniqueColor {
  id: string;
  hexValue: string;
  variableName: string;
  usageCount: number;
}

const SvgTokenAssign: React.FC<SvgTokenAssignProps> = ({ onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [originalSvgContent, setOriginalSvgContent] = useState<string>('');
  const [uniqueColors, setUniqueColors] = useState<UniqueColor[]>([]);
  const [variablesApplied, setVariablesApplied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all unique colors from SVG content
  const extractUniqueColors = (svgString: string): UniqueColor[] => {
    const colorMap = new Map<string, number>();
    
    // More comprehensive regular expressions to find colors
    const hexColorRegex = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g;
    const rgbColorRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
    const rgbaColorRegex = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/g;
    
    // More comprehensive fill and stroke attribute patterns
    const fillStrokeRegex = /(?:fill|stroke)\s*=\s*["']([^"']+)["']/gi;
    const fillStrokeNoQuotesRegex = /(?:fill|stroke)\s*=\s*([^\s>]+)/gi;
    
    // Named colors mapping (more comprehensive)
    const namedColorMap: { [key: string]: string } = {
      red: '#ff0000', blue: '#0000ff', green: '#008000', yellow: '#ffff00',
      orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', brown: '#a52a2a',
      black: '#000000', white: '#ffffff', gray: '#808080', grey: '#808080',
      cyan: '#00ffff', magenta: '#ff00ff', lime: '#00ff00', navy: '#000080',
      maroon: '#800000', olive: '#808000', teal: '#008080', silver: '#c0c0c0',
      aqua: '#00ffff', fuchsia: '#ff00ff', darkred: '#8b0000', darkgreen: '#006400',
      darkblue: '#00008b', lightgray: '#d3d3d3', lightgrey: '#d3d3d3',
      transparent: 'transparent', none: 'none'
    };
    
    const addColor = (colorValue: string) => {
      if (!colorValue || colorValue === 'none' || colorValue === 'transparent') return;
      
      // Skip CSS variables that are already applied
      if (colorValue.includes('var(')) return;
      
      let hex = '';
      
      // Check if it's a hex color
      const hexMatch = colorValue.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      if (hexMatch) {
        hex = hexMatch[0].toLowerCase();
        // Convert 3-digit hex to 6-digit
        if (hex.length === 4) {
          hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
      }
      
      // Check if it's an RGB color
      const rgbMatch = colorValue.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
      
      // Check if it's an RGBA color
      const rgbaMatch = colorValue.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/);
      if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]);
        const g = parseInt(rgbaMatch[2]);
        const b = parseInt(rgbaMatch[3]);
        hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
      
      // Check if it's a named color
      const namedHex = namedColorMap[colorValue.toLowerCase()];
      if (namedHex && namedHex !== 'transparent' && namedHex !== 'none') {
        hex = namedHex;
      }
      
      if (hex) {
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
    };
    
    // Find all hex colors in the SVG
    let match;
    while ((match = hexColorRegex.exec(svgString)) !== null) {
      addColor(match[0]);
    }
    
    // Find all RGB colors in the SVG
    while ((match = rgbColorRegex.exec(svgString)) !== null) {
      addColor(match[0]);
    }
    
    // Find all RGBA colors in the SVG
    while ((match = rgbaColorRegex.exec(svgString)) !== null) {
      addColor(match[0]);
    }
    
    // Find colors in fill and stroke attributes (with quotes)
    while ((match = fillStrokeRegex.exec(svgString)) !== null) {
      const colorValue = match[1].trim();
      addColor(colorValue);
    }
    
    // Find colors in fill and stroke attributes (without quotes)
    while ((match = fillStrokeNoQuotesRegex.exec(svgString)) !== null) {
      const colorValue = match[1].trim();
      addColor(colorValue);
    }
    
    // Convert map to array of UniqueColor objects
    const colors: UniqueColor[] = [];
    colorMap.forEach((count, hexValue) => {
      colors.push({
        id: `color_${hexValue.replace('#', '')}`,
        hexValue: hexValue,
        variableName: '',
        usageCount: count
      });
    });

    return colors.sort((a, b) => b.usageCount - a.usageCount); // Sort by usage frequency
  };

  // Apply color variables to SVG content
  const applyColorVariables = () => {
    if (!originalSvgContent) return;
    
    let modifiedSvg = originalSvgContent;
    
    // For each color with a variable name, replace it in fill and stroke attributes
    uniqueColors.forEach(color => {
      if (color.variableName.trim()) {
        const variableName = color.variableName.trim();
        const hexValue = color.hexValue;
        
        // Replace in fill attributes
        const fillRegex = new RegExp(`(fill\\s*=\\s*["']?)${hexValue.replace('#', '\\#')}(["']?)`, 'gi');
        modifiedSvg = modifiedSvg.replace(fillRegex, `$1var(--${variableName}, ${hexValue})$2`);
        
        // Replace in stroke attributes
        const strokeRegex = new RegExp(`(stroke\\s*=\\s*["']?)${hexValue.replace('#', '\\#')}(["']?)`, 'gi');
        modifiedSvg = modifiedSvg.replace(strokeRegex, `$1var(--${variableName}, ${hexValue})$2`);
        
        // Also handle named colors if they were used
        Object.entries({
          red: '#ff0000', blue: '#0000ff', green: '#008000', yellow: '#ffff00',
          orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', brown: '#a52a2a',
          black: '#000000', white: '#ffffff', gray: '#808080', grey: '#808080',
          cyan: '#00ffff', magenta: '#ff00ff', lime: '#00ff00', navy: '#000080',
          maroon: '#800000', olive: '#808000', teal: '#008080', silver: '#c0c0c0',
          aqua: '#00ffff', fuchsia: '#ff00ff'
        }).forEach(([namedColor, namedHex]) => {
          if (namedHex === hexValue) {
            const namedFillRegex = new RegExp(`(fill\\s*=\\s*["']?)${namedColor}(["']?)`, 'gi');
            modifiedSvg = modifiedSvg.replace(namedFillRegex, `$1var(--${variableName}, ${hexValue})$2`);
            
            const namedStrokeRegex = new RegExp(`(stroke\\s*=\\s*["']?)${namedColor}(["']?)`, 'gi');
            modifiedSvg = modifiedSvg.replace(namedStrokeRegex, `$1var(--${variableName}, ${hexValue})$2`);
          }
        });
      }
    });
    
    // Add CSS variables definition to the SVG
    const variableDefinitions = uniqueColors
      .filter(color => color.variableName.trim())
      .map(color => `--${color.variableName.trim()}: ${color.hexValue};`)
      .join(' ');
    
    if (variableDefinitions) {
      // Add style tag with CSS variables if it doesn't exist
      if (!modifiedSvg.includes('<style>') && !modifiedSvg.includes('<defs>')) {
        modifiedSvg = modifiedSvg.replace(
          /<svg([^>]*)>/,
          `<svg$1><defs><style>:root { ${variableDefinitions} }</style></defs>`
        );
      } else if (modifiedSvg.includes('<defs>') && !modifiedSvg.includes('<style>')) {
        modifiedSvg = modifiedSvg.replace(
          /<defs>/,
          `<defs><style>:root { ${variableDefinitions} }</style>`
        );
      } else if (modifiedSvg.includes('<style>')) {
        // Check if the style tag already has variable definitions
        if (modifiedSvg.includes(':root')) {
          modifiedSvg = modifiedSvg.replace(
            /(:root\s*\{[^}]*)(})/,
            `$1 ${variableDefinitions}$2`
          );
        } else {
          modifiedSvg = modifiedSvg.replace(
            /<style>/,
            `<style>:root { ${variableDefinitions} }\n`
          );
        }
      }
    }
    
    setSvgContent(modifiedSvg);
    setVariablesApplied(true);
  };

  // Read and parse the uploaded SVG file
  useEffect(() => {
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const svgString = e.target?.result as string;
          setOriginalSvgContent(svgString);
          setSvgContent(svgString);
          
          // Extract unique colors
          const colors = extractUniqueColors(svgString);
          setUniqueColors(colors);
          setVariablesApplied(false);
        } catch (error) {
          console.error('Error parsing SVG:', error);
          setSvgContent('');
          setOriginalSvgContent('');
          setUniqueColors([]);
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      setSvgContent('');
      setOriginalSvgContent('');
      setUniqueColors([]);
      setVariablesApplied(false);
    }
  }, [uploadedFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const svgFile = files.find(file => 
      file.type === 'image/svg+xml' || 
      file.name.toLowerCase().endsWith('.svg')
    );
    
    if (svgFile) {
      setUploadedFile(svgFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        setUploadedFile(file);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setSvgContent('');
    setOriginalSvgContent('');
    setUniqueColors([]);
    setVariablesApplied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVariableNameChange = (colorId: string, value: string) => {
    setUniqueColors(prev => 
      prev.map(color => 
        color.id === colorId ? { ...color, variableName: value } : color
      )
    );
  };

  const handleDownload = () => {
    if (!svgContent) return;
    
    const dataBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uploadedFile?.name.replace('.svg', '') || 'svg'}_with_variables.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // If no file is uploaded, show the upload interface
  if (!uploadedFile) {
    return (
      <div className="flex flex-col h-full max-h-full overflow-hidden gap-8 p-8">
        {/* Header Section */}
        <div className="flex items-start h-[54px] flex-shrink-0">
          <PrimaryButton
            onClick={onBack}
            icon={ChevronLeft}
            iconStrokeWidth={1.67}
            variant="compact"
          >
            Back
          </PrimaryButton>
          
          <div className="flex flex-col gap-2 flex-1 text-center">
            <h1 className="text-2xl font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
              SVG Token Assigner
            </h1>
            <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
              Upload an SVG file to get started
            </p>
          </div>

          <div className="w-[88px] flex-shrink-0"></div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex items-center justify-center bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6">
          <div 
            className={`flex flex-col items-center gap-6 p-12 border-2 border-dashed rounded-2xl transition-all cursor-pointer w-full max-w-md ${
              isDragging 
                ? 'border-[var(--system-color-border-focus)] bg-[var(--system-color-functional-action-alt)]' 
                : 'border-[var(--system-color-border-secondary)] hover:border-[var(--system-color-border-focus)] hover:bg-[var(--system-color-functional-action-alt)]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-lg font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Drop your SVG file here
              </h3>
              <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                or click to browse for an SVG file
              </p>
              <p className="text-xs text-[var(--system-color-border-secondary)] leading-[1.21]">
                Supports .svg files only
              </p>
            </div>
            
            <PrimaryButton
              icon={FileText}
              iconStrokeWidth={1.5}
            >
              Choose File
            </PrimaryButton>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // If file is uploaded, show the color assignment interface
  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden gap-8 p-8">
      {/* Header Section */}
      <div className="flex items-start h-[54px] flex-shrink-0">
        <PrimaryButton
          onClick={onBack}
          icon={ChevronLeft}
          iconStrokeWidth={1.67}
          variant="compact"
        >
          Back
        </PrimaryButton>
        
        <div className="flex flex-col gap-2 flex-1 text-center">
          <h1 className="text-2xl font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
            SVG Token Assigner
          </h1>
          <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
            Assign variable names to colors
          </p>
        </div>

        <div className="w-[88px] flex-shrink-0"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Side - SVG Preview Area */}
        <div className="flex flex-col justify-end items-end gap-6 flex-1 min-w-0">
          {/* File Info */}
          <div className="w-full flex items-center justify-between p-4 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[var(--system-color-functional-action)]" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • {uniqueColors.length} colors found
                </span>
              </div>
            </div>
            <button 
              onClick={handleRemoveFile}
              className="text-sm text-[var(--system-color-elevation-base-content-tint)] hover:text-[var(--system-color-elevation-base-content)] transition-colors"
            >
              Remove
            </button>
          </div>

          {/* SVG Preview */}
          <div className="w-full flex-1 border border-dashed border-[var(--system-color-border-secondary)] rounded-2xl min-h-0 flex items-center justify-center p-8 bg-white">
            {svgContent ? (
              <div 
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgContent }}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%'
                }}
              />
            ) : (
              <div className="text-center text-[var(--system-color-elevation-base-content-tint)]">
                <p className="text-sm">Loading SVG preview...</p>
              </div>
            )}
          </div>
          
          {/* Download/Apply Variables Button */}
          <PrimaryButton
            onClick={variablesApplied ? handleDownload : applyColorVariables}
            disabled={!variablesApplied && uniqueColors.some(color => !color.variableName.trim())}
            icon={variablesApplied ? Download : Palette}
            iconStrokeWidth={2}
            variant="compact"
          >
            {variablesApplied ? 'Download SVG' : 'Add Color Variables'}
          </PrimaryButton>
        </div>

        {/* Right Side - Color List */}
        <div className="flex flex-col gap-6 w-80 flex-shrink-0 overflow-hidden">
          <h2 className="text-base font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21] flex-shrink-0">
            Colors ({uniqueColors.length})
          </h2>
          
          <div className="flex flex-col gap-4 overflow-y-auto min-h-0 pr-2">
            {uniqueColors.length > 0 ? (
              uniqueColors.map((color) => (
                <div key={color.id} className="flex flex-col gap-2 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Color Swatch */}
                    <div 
                      className="w-6 h-6 rounded border border-[var(--system-color-border-primary)] flex-shrink-0"
                      style={{ backgroundColor: color.hexValue }}
                    ></div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                        {color.hexValue.toUpperCase()}
                      </span>
                      <span className="text-xs text-[var(--system-color-border-secondary)] leading-[1.21]">
                        Used {color.usageCount} time{color.usageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full gap-2 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-2 h-10">
                    <input
                      type="text"
                      placeholder="Enter variable name"
                      value={color.variableName}
                      onChange={(e) => handleVariableNameChange(color.id, e.target.value)}
                      className="text-sm text-[var(--system-color-elevation-base-content-tint)] bg-transparent border-none outline-none flex-1 leading-[1.21] placeholder:text-[var(--system-color-elevation-base-content-tint)]"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-[var(--system-color-elevation-base-content-tint)] py-8">
                <p className="text-sm">No colors found in this SVG file.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SvgTokenAssign;
