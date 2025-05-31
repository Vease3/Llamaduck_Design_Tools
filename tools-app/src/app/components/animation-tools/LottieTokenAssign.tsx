import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Download, Upload, FileText, Palette } from 'lucide-react';
import Lottie from 'lottie-react';

interface LottieTokenAssignProps {
  onBack?: () => void;
}

interface UniqueColor {
  id: string;
  colorValue: number[]; // RGB values [r, g, b]
  hexValue: string; // Hex color for display
  variableName: string;
  usageCount: number; // How many times this color appears
}

const LottieTokenAssign: React.FC<LottieTokenAssignProps> = ({ onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [lottieData, setLottieData] = useState<any>(null);
  const [originalLottieData, setOriginalLottieData] = useState<any>(null);
  const [uniqueColors, setUniqueColors] = useState<UniqueColor[]>([]);
  const [variablesApplied, setVariablesApplied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract all unique colors from Lottie JSON
  const extractUniqueColors = (data: any): UniqueColor[] => {
    const colorMap = new Map<string, { color: number[], count: number }>();
    
    const findColors = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        obj.forEach(item => findColors(item));
        return;
      }

      // Look for color properties in fill and stroke elements
      if ((obj.ty === 'fl' || obj.ty === 'st') && obj.c && obj.c.k) {
        let colorValue = obj.c.k;
        
        // Handle animated colors (take first keyframe)
        if (Array.isArray(colorValue) && colorValue.length > 0 && colorValue[0].s) {
          colorValue = colorValue[0].s;
        }
        
        // Ensure we have a valid RGB array
        if (Array.isArray(colorValue) && colorValue.length >= 3) {
          // Convert from 0-1 range to 0-255 range
          const rgb = [
            Math.round(colorValue[0] * 255),
            Math.round(colorValue[1] * 255),
            Math.round(colorValue[2] * 255)
          ];
          
          const colorKey = `${rgb[0]},${rgb[1]},${rgb[2]}`;
          
          if (colorMap.has(colorKey)) {
            colorMap.get(colorKey)!.count++;
          } else {
            colorMap.set(colorKey, { color: rgb, count: 1 });
          }
        }
      }

      // Recursively search all properties
      Object.keys(obj).forEach(key => {
        findColors(obj[key]);
      });
    };

    findColors(data);

    // Convert map to array of UniqueColor objects
    const colors: UniqueColor[] = [];
    colorMap.forEach((value, key) => {
      const [r, g, b] = value.color;
      const hexValue = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      colors.push({
        id: `color_${key}`,
        colorValue: value.color,
        hexValue: hexValue,
        variableName: '',
        usageCount: value.count
      });
    });

    return colors.sort((a, b) => b.usageCount - a.usageCount); // Sort by usage frequency
  };

  // Apply color variables to Lottie JSON
  const applyColorVariables = () => {
    if (!originalLottieData) return;
    
    const modifiedData = JSON.parse(JSON.stringify(originalLottieData));
    
    const addVariablesToColors = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        obj.forEach(item => addVariablesToColors(item));
        return;
      }

      // Check if this is a fill or stroke element with color
      if ((obj.ty === 'fl' || obj.ty === 'st') && obj.c && obj.c.k) {
        let colorValue = obj.c.k;
        
        // Handle animated colors (take first keyframe)
        if (Array.isArray(colorValue) && colorValue.length > 0 && colorValue[0].s) {
          colorValue = colorValue[0].s;
        }
        
        if (Array.isArray(colorValue) && colorValue.length >= 3) {
          // Convert to RGB for matching
          const rgb = [
            Math.round(colorValue[0] * 255),
            Math.round(colorValue[1] * 255),
            Math.round(colorValue[2] * 255)
          ];
          
          // Find matching color with variable name
          const matchingColor = uniqueColors.find(color => 
            color.colorValue[0] === rgb[0] && 
            color.colorValue[1] === rgb[1] && 
            color.colorValue[2] === rgb[2] &&
            color.variableName.trim()
          );
          
          if (matchingColor) {
            obj.cl = matchingColor.variableName.trim();
          }
        }
      }

      // Recursively process all object properties
      Object.keys(obj).forEach(key => {
        addVariablesToColors(obj[key]);
      });
    };

    addVariablesToColors(modifiedData);
    setLottieData(modifiedData);
    setVariablesApplied(true);
  };

  // Read and parse the uploaded JSON file
  useEffect(() => {
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          setOriginalLottieData(jsonData);
          setLottieData(jsonData);
          
          // Extract unique colors
          const colors = extractUniqueColors(jsonData);
          setUniqueColors(colors);
          setVariablesApplied(false);
        } catch (error) {
          console.error('Error parsing Lottie JSON:', error);
          setLottieData(null);
          setOriginalLottieData(null);
          setUniqueColors([]);
        }
      };
      reader.readAsText(uploadedFile);
    } else {
      setLottieData(null);
      setOriginalLottieData(null);
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
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      setUploadedFile(jsonFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setUploadedFile(file);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setLottieData(null);
    setOriginalLottieData(null);
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
    if (!lottieData) return;
    
    const dataStr = JSON.stringify(lottieData); // Remove formatting for smaller file size
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uploadedFile?.name.replace('.json', '') || 'lottie'}_with_variables.json`;
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
        <div className="flex items-start justify-between h-[54px] flex-shrink-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-[#020A17] leading-[1.21]">
              Lottie Token Assigner
            </h1>
            <p className="text-sm text-[#4F5761] leading-[1.21]">
              Upload a Lottie JSON file to get started
            </p>
          </div>
          
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-[#105FD5] text-white px-4 py-2 pl-2 rounded-2xl h-10 hover:bg-[#0E4FB8] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} className="text-white" strokeWidth={1.67} />
            <span className="text-base font-medium">Back</span>
          </button>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex items-center justify-center bg-[#F3F6FA] border border-[#DCE0E4] rounded-2xl p-6">
          <div 
            className={`flex flex-col items-center gap-6 p-12 border-2 border-dashed rounded-2xl transition-all cursor-pointer w-full max-w-md ${
              isDragging 
                ? 'border-[#105FD5] bg-[#105FD5]/5' 
                : 'border-[#ADB2B8] hover:border-[#105FD5] hover:bg-[#105FD5]/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="flex items-center justify-center w-16 h-16 bg-[#EFF3F8] rounded-full">
              <Upload size={32} className="text-[#105FD5]" strokeWidth={1.5} />
            </div>
            
            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-lg font-bold text-[#020A17] leading-[1.21]">
                Drop your Lottie file here
              </h3>
              <p className="text-sm text-[#4F5761] leading-[1.21]">
                or click to browse for a JSON file
              </p>
              <p className="text-xs text-[#ADB2B8] leading-[1.21]">
                Supports .json files only
              </p>
            </div>
            
            <button className="flex items-center gap-2 bg-[#105FD5] text-white px-6 py-3 rounded-2xl hover:bg-[#0E4FB8] transition-colors">
              <FileText size={20} className="text-white" strokeWidth={1.5} />
              <span className="text-base font-medium">Choose File</span>
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
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
      <div className="flex items-start justify-between h-[54px] flex-shrink-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-[#020A17] leading-[1.21]">
            Lottie Token Assigner
          </h1>
          <p className="text-sm text-[#4F5761] leading-[1.21]">
            Assign variable names to colors
          </p>
        </div>
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-[#105FD5] text-white px-4 py-2 pl-2 rounded-2xl h-10 hover:bg-[#0E4FB8] transition-colors flex-shrink-0"
        >
          <ChevronLeft size={20} className="text-white" strokeWidth={1.67} />
          <span className="text-base font-medium">Back</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 bg-[#F3F6FA] border border-[#DCE0E4] rounded-2xl p-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Side - Lottie Preview Area */}
        <div className="flex flex-col justify-end items-end gap-6 flex-1 min-w-0">
          {/* File Info */}
          <div className="w-full flex items-center justify-between p-4 bg-[#EFF3F8] border border-[#DCE0E4] rounded-lg">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-[#105FD5]" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#020A17] leading-[1.21]">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-[#4F5761] leading-[1.21]">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • {uniqueColors.length} colors found
                </span>
              </div>
            </div>
            <button 
              onClick={handleRemoveFile}
              className="text-sm text-[#4F5761] hover:text-[#020A17] transition-colors"
            >
              Remove
            </button>
          </div>

          {/* Lottie Preview */}
          <div className="w-full flex-1 border border-dashed border-[#ADB2B8] rounded-2xl min-h-0 flex items-center justify-center p-8">
            {lottieData ? (
              <div className="w-full h-full flex items-center justify-center">
                <Lottie 
                  animationData={lottieData}
                  loop={true}
                  autoplay={true}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto'
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-[#4F5761]">
                <p className="text-sm">Loading Lottie preview...</p>
              </div>
            )}
          </div>
          
          {/* Download/Apply Variables Button */}
          <button 
            onClick={variablesApplied ? handleDownload : applyColorVariables}
            disabled={!variablesApplied && uniqueColors.some(color => !color.variableName.trim())}
            className="flex items-center gap-2 bg-[#105FD5] text-white px-4 py-2 rounded-2xl h-10 hover:bg-[#0E4FB8] transition-colors flex-shrink-0 disabled:bg-[#ADB2B8] disabled:cursor-not-allowed"
          >
            {variablesApplied ? (
              <>
                <Download size={20} className="text-white" strokeWidth={2} />
                <span className="text-base font-medium">Download Lottie</span>
              </>
            ) : (
              <>
                <Palette size={20} className="text-white" strokeWidth={2} />
                <span className="text-base font-medium">Add Color Variables</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side - Color List */}
        <div className="flex flex-col gap-6 w-80 flex-shrink-0 overflow-hidden">
          <h2 className="text-base font-bold text-[#020A17] leading-[1.21] flex-shrink-0">
            Colors ({uniqueColors.length})
          </h2>
          
          <div className="flex flex-col gap-4 overflow-y-auto min-h-0 pr-2">
            {uniqueColors.length > 0 ? (
              uniqueColors.map((color) => (
                <div key={color.id} className="flex flex-col gap-2 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    {/* Color Swatch */}
                    <div 
                      className="w-6 h-6 rounded border border-[#DCE0E4] flex-shrink-0"
                      style={{ backgroundColor: color.hexValue }}
                    ></div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-[#4F5761] leading-[1.21]">
                        {color.hexValue.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#ADB2B8] leading-[1.21]">
                        Used {color.usageCount} time{color.usageCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full gap-2 bg-[#EFF3F8] border border-[#DCE0E4] rounded-lg px-2 h-10">
                    <input
                      type="text"
                      placeholder="Enter variable name"
                      value={color.variableName}
                      onChange={(e) => handleVariableNameChange(color.id, e.target.value)}
                      className="text-sm text-[#4F5761] bg-transparent border-none outline-none flex-1 leading-[1.21] placeholder:text-[#4F5761]"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-[#4F5761] py-8">
                <p className="text-sm">No colors found in this Lottie file.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LottieTokenAssign;
