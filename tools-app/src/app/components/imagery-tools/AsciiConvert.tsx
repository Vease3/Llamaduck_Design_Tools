import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Download, FileImage } from 'lucide-react';
import PrimaryButton from '../global/PrimaryButton';

interface AsciiConvertProps {
  onBack?: () => void;
}

interface AsciiSettings {
  width: number;
  contrast: number;
  brightness: number;
  characterSet: string;
  invertColors: boolean;
}

const AsciiConvert: React.FC<AsciiConvertProps> = ({ onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [asciiOutput, setAsciiOutput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [settings, setSettings] = useState<AsciiSettings>({
    width: 80,
    contrast: 1,
    brightness: 1,
    characterSet: '@%#*+=-:. ',
    invertColors: false
  });
  const [asciiAspectRatio, setAsciiAspectRatio] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Convert image to ASCII - memoized to prevent unnecessary recalculations
  const convertToAscii = useCallback((img: HTMLImageElement, settings: AsciiSettings) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Calculate dimensions to maintain proper aspect ratio
    const originalAspectRatio = img.width / img.height;
    const width = settings.width;
    // Characters are roughly 2:1 ratio (height:width), so we need to adjust
    const height = Math.floor(width / originalAspectRatio / 2);

    canvas.width = width;
    canvas.height = height;

    // Draw and process image
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let ascii = '';
    const chars = settings.characterSet;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        let r = pixels[offset];
        let g = pixels[offset + 1];
        let b = pixels[offset + 2];

        // Apply brightness and contrast
        r = Math.min(255, Math.max(0, (r - 128) * settings.contrast + 128 + (settings.brightness - 1) * 50));
        g = Math.min(255, Math.max(0, (g - 128) * settings.contrast + 128 + (settings.brightness - 1) * 50));
        b = Math.min(255, Math.max(0, (b - 128) * settings.contrast + 128 + (settings.brightness - 1) * 50));

        // Convert to grayscale
        let gray = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
        
        // Invert if needed
        if (settings.invertColors) {
          gray = 255 - gray;
        }

        // Map to character
        const charIndex = Math.floor((gray / 255) * (chars.length - 1));
        ascii += chars[charIndex];
      }
      ascii += '\n';
    }

    return ascii;
  }, []);

  // Process uploaded image and handle ASCII conversion
  useEffect(() => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setImageUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl(null);
      setAsciiOutput('');
      setIsProcessing(false);
    }
  }, [uploadedFile]);

  // Handle ASCII conversion with debouncing
  const performConversion = useCallback((img: HTMLImageElement, currentSettings: AsciiSettings) => {
    setIsProcessing(true);
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      try {
        const ascii = convertToAscii(img, currentSettings);
        setAsciiOutput(ascii);
      } catch (error) {
        console.error('Error converting to ASCII:', error);
        setAsciiOutput('Error converting image to ASCII');
      } finally {
        setIsProcessing(false);
      }
    });
  }, [convertToAscii]);

  // Handle ASCII conversion when image or settings change with debouncing
  useEffect(() => {
    if (!imageUrl) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const img = new Image();
    img.onload = () => {
      // Calculate ASCII dimensions to get proper aspect ratio
      const originalAspectRatio = img.width / img.height;
      const asciiWidth = settings.width;
      const asciiHeight = Math.floor(asciiWidth / originalAspectRatio / 2);
      const calculatedAsciiAspectRatio = asciiWidth / asciiHeight;
      
      // Store ASCII aspect ratio for container sizing
      setAsciiAspectRatio(calculatedAsciiAspectRatio);
      
      // Debounce the conversion to prevent rapid updates during slider changes
      debounceTimerRef.current = setTimeout(() => {
        performConversion(img, settings);
      }, 150);
    };
    
    img.onerror = () => {
      setAsciiOutput('Error loading image');
      setIsProcessing(false);
    };
    
    img.src = imageUrl;

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [imageUrl, settings, performConversion]);



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
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      setUploadedFile(imageFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setImageUrl(null);
    setAsciiOutput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSettingChange = (key: keyof AsciiSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDownload = () => {
    if (!asciiOutput) return;
    
    const dataBlob = new Blob([asciiOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uploadedFile?.name.split('.')[0] || 'image'}_ascii.txt`;
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
              ASCII Art Converter
            </h1>
            <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
              Upload an image to convert to ASCII art
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
                Drop your image here
              </h3>
              <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                or click to browse for an image file
              </p>
              <p className="text-xs text-[var(--system-color-border-secondary)] leading-[1.21]">
                Supports JPG, PNG, GIF, and other image formats
              </p>
            </div>
            
            <PrimaryButton
              icon={FileImage}
              iconStrokeWidth={1.5}
            >
              Choose File
            </PrimaryButton>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // If file is uploaded, show the ASCII conversion interface
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
            ASCII Art Converter
          </h1>
          <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
            Adjust settings and download your ASCII art
          </p>
        </div>

        <div className="w-[88px] flex-shrink-0"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Side - ASCII Preview Area */}
        <div className="flex flex-col justify-end items-end gap-6 flex-1 min-w-0">
          {/* File Info */}
          <div className="w-full flex items-center justify-between p-4 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg">
            <div className="flex items-center gap-3">
              <FileImage size={20} className="text-[var(--system-color-functional-action)]" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • {settings.width} chars wide
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

          {/* ASCII Preview */}
          <div className="w-full flex-1 border border-dashed border-[var(--system-color-border-secondary)] rounded-2xl min-h-0 flex items-center justify-center p-4 overflow-hidden">
            {isProcessing ? (
              <div className="text-center text-[var(--system-color-elevation-base-content-tint)]">
                <p className="text-sm">Converting to ASCII...</p>
              </div>
            ) : asciiOutput ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <div 
                  className="flex items-center justify-center"
                  style={{
                    aspectRatio: asciiAspectRatio,
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  <pre 
                    className="text-[var(--system-color-elevation-base-content)] font-mono leading-none whitespace-pre select-all"
                    style={{
                      fontSize: (() => {
                        // Simple approach: base font size on character width with reasonable bounds
                        const baseFontSize = Math.max(3, Math.min(12, 480 / settings.width));
                        return `${baseFontSize}px`;
                      })(),
                      lineHeight: '1',
                      margin: 0,
                      padding: 0
                    }}
                  >
                    {asciiOutput}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-[var(--system-color-elevation-base-content-tint)]">
                <p className="text-sm">Loading ASCII preview...</p>
              </div>
            )}
          </div>
          
          {/* Download Button */}
          <PrimaryButton
            onClick={handleDownload}
            disabled={!asciiOutput || isProcessing}
            icon={Download}
            iconStrokeWidth={2}
            variant="compact"
          >
            Download ASCII
          </PrimaryButton>
        </div>

        {/* Right Side - Settings Panel */}
        <div className="flex flex-col gap-6 w-80 flex-shrink-0 overflow-hidden">
          <h2 className="text-base font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21] flex-shrink-0">
            Settings
          </h2>
          
          <div className="flex flex-col gap-6 overflow-y-auto min-h-0 pr-2">
            {/* Width Setting */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Width (characters)
              </label>
              <div className="flex items-center justify-between w-full gap-2 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-2 h-10">
                <select
                  value={settings.width}
                  onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
                  className="text-sm text-[var(--system-color-elevation-base-content)] bg-transparent border-none outline-none flex-1 leading-[1.21] cursor-pointer"
                >
                  <option value={40}>40 characters</option>
                  <option value={50}>50 characters</option>
                  <option value={60}>60 characters</option>
                  <option value={70}>70 characters</option>
                  <option value={80}>80 characters</option>
                  <option value={90}>90 characters</option>
                  <option value={100}>100 characters</option>
                  <option value={110}>110 characters</option>
                  <option value={120}>120 characters</option>
                  <option value={140}>140 characters</option>
                  <option value={160}>160 characters</option>
                </select>
              </div>
            </div>

            {/* Contrast Setting */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Contrast
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={settings.contrast}
                  onChange={(e) => handleSettingChange('contrast', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-[var(--system-color-elevation-base-content-tint)] w-8">
                  {settings.contrast.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Brightness Setting */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Brightness
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.brightness}
                  onChange={(e) => handleSettingChange('brightness', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-[var(--system-color-elevation-base-content-tint)] w-8">
                  {settings.brightness.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Character Set Setting */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Character Set
              </label>
              <div className="flex items-center justify-between w-full gap-2 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-2 h-10">
                <select
                  value={settings.characterSet}
                  onChange={(e) => handleSettingChange('characterSet', e.target.value)}
                  className="text-sm text-[var(--system-color-elevation-base-content)] bg-transparent border-none outline-none flex-1 leading-[1.21] cursor-pointer font-mono"
                >
                  <option value="@%#*+=-:. ">Standard - @%#*+=-:. </option>
                  <option value="█▉▊▋▌▍▎▏ ">Block - █▉▊▋▌▍▎▏ </option>
                  <option value="@@@@@@....    ">Simple - @@@@@@....    </option>
                  <option value={'$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '}>Complex - 70 chars</option>
                  <option value="@#S%?*+;:,. ">Medium - @#S%?*+;:,. </option>
                  <option value="██▓▒░ ">Shaded - ██▓▒░ </option>
                  <option value="###... ">Hash - ###... </option>
                  <option value={'MWNXK0Okxdolc:;,". '}>Letters - MWNXK0Okxdolc:;,&apos;. </option>
                </select>
              </div>
              <p className="text-xs text-[var(--system-color-border-secondary)] leading-[1.21]">
                Characters from dark to light
              </p>
            </div>

            {/* Invert Colors Setting */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.invertColors}
                  onChange={(e) => handleSettingChange('invertColors', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  Invert colors
                </span>
              </label>
              <p className="text-xs text-[var(--system-color-border-secondary)] leading-[1.21]">
                Swap dark and light areas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsciiConvert;
