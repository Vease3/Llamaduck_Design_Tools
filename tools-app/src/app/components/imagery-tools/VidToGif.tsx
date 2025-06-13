import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, Download, FileVideo, Upload, Settings, Play, Pause } from 'lucide-react';
import PrimaryButton from '../global/PrimaryButton';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface VidToGifProps {
  onBack?: () => void;
}

interface ConversionSettings {
  startTime: number | null; // null means "start of video"
  endTime: number | null; // null means "end of video"
  width: number;
  fps: number;
  quality: 'ultra' | 'high' | 'medium';
}

const VidToGif: React.FC<VidToGifProps> = ({ onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedGifUrl, setConvertedGifUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<string>('');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [settings, setSettings] = useState<ConversionSettings>({
    startTime: null, // null means "start of video"
    endTime: null, // null means "end of video"
    width: 720, // Higher default for better quality
    fps: 20, // Higher default for smoother motion
    quality: 'high'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Load FFmpeg on component mount
  const loadFFmpeg = useCallback(async () => {
    const ffmpeg = ffmpegRef.current;
    
    if (!ffmpegLoaded) {
      try {
        setConversionProgress('Loading FFmpeg...');
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        
        ffmpeg.on('log', ({ message }) => {
          console.log(message);
        });
        
        ffmpeg.on('progress', ({ progress }) => {
          setConversionProgress(`Converting... ${Math.round(progress * 100)}%`);
        });

        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpegLoaded(true);
        setConversionProgress('');
        console.log('FFmpeg loaded successfully');
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        setConversionProgress('Failed to load converter');
      }
    }
  }, [ffmpegLoaded]);

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
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      setUploadedFile(videoFile);
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      setConvertedGifUrl(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        setUploadedFile(file);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setConvertedGifUrl(null);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (convertedGifUrl) {
      URL.revokeObjectURL(convertedGifUrl);
    }
    setVideoUrl(null);
    setConvertedGifUrl(null);
    setIsPlaying(false);
    setConversionProgress('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleConvertToGif = useCallback(async () => {
    if (!uploadedFile || !ffmpegLoaded) {
      if (!ffmpegLoaded) {
        await loadFFmpeg();
      }
      return;
    }
    
    setIsConverting(true);
    setConversionProgress('Preparing conversion...');
    
    try {
      const ffmpeg = ffmpegRef.current;
      
      // Write the input file to FFmpeg's virtual file system
      await ffmpeg.writeFile('input.mp4', await fetchFile(uploadedFile));
      
      setConversionProgress('Generating color palette...');
      
      // Step 1: Generate optimized color palette for high quality
      const paletteCommand = [
        '-i', 'input.mp4',
        ...(settings.startTime !== null ? ['-ss', settings.startTime.toString()] : []),
        ...(settings.endTime !== null ? ['-to', settings.endTime.toString()] : []),
        '-vf', `fps=${settings.fps},scale=${settings.width}:-1:flags=lanczos,palettegen=max_colors=256:reserve_transparent=0`
      ];

      // Add palette quality settings based on user choice
      if (settings.quality === 'ultra') {
        paletteCommand.push('-vf', `fps=${settings.fps},scale=${settings.width}:-1:flags=lanczos,palettegen=max_colors=256:reserve_transparent=0:stats_mode=diff`);
      } else if (settings.quality === 'high') {
        paletteCommand.push('-vf', `fps=${settings.fps},scale=${settings.width}:-1:flags=lanczos,palettegen=max_colors=224:reserve_transparent=0`);
      } else {
        paletteCommand.push('-vf', `fps=${settings.fps},scale=${settings.width}:-1:flags=lanczos,palettegen=max_colors=192:reserve_transparent=0`);
      }

      paletteCommand.push('palette.png');
      
      // Generate palette
      await ffmpeg.exec(paletteCommand);

      setConversionProgress('Converting with high-quality palette...');
      
      // Step 2: Use the palette to create high-quality GIF
      const gifCommand = [
        '-i', 'input.mp4',
        '-i', 'palette.png',
        ...(settings.startTime !== null ? ['-ss', settings.startTime.toString()] : []),
        ...(settings.endTime !== null ? ['-to', settings.endTime.toString()] : []),
        '-lavfi', `fps=${settings.fps},scale=${settings.width}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`
      ];

      // Optimize for quality within 50MB budget
      if (settings.quality === 'ultra') {
        gifCommand.push('-f', 'gif', '-gifflags', '+offsetting');
      } else if (settings.quality === 'high') {
        gifCommand.push('-f', 'gif', '-gifflags', '+transdiff');
      } else {
        gifCommand.push('-f', 'gif');
      }

      gifCommand.push('output.gif');
      
      // Execute the GIF conversion
      await ffmpeg.exec(gifCommand);

      // Read the output file
      const data = await ffmpeg.readFile('output.gif');
      
      // Create a blob and URL for the GIF
      const gifBlob = new Blob([data], { type: 'image/gif' });
      const gifUrl = URL.createObjectURL(gifBlob);
      
      // Check file size (aim for under 50MB)
      const fileSizeMB = gifBlob.size / (1024 * 1024);
      
      setConvertedGifUrl(gifUrl);
      setConversionProgress(`Conversion complete! File size: ${fileSizeMB.toFixed(1)}MB`);
      
      // Clean up temporary files
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('palette.png');
      await ffmpeg.deleteFile('output.gif');
      
    } catch (error) {
      console.error('Conversion failed:', error);
      setConversionProgress('Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
      setTimeout(() => setConversionProgress(''), 3000);
    }
  }, [uploadedFile, ffmpegLoaded, settings, loadFFmpeg]);

  const handleDownload = () => {
    if (!convertedGifUrl || !uploadedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedGifUrl;
    link.download = `${uploadedFile.name.replace(/\.[^/.]+$/, '')}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSettingChange = (key: keyof ConversionSettings, value: number | string | null) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Load FFmpeg when component mounts
  useEffect(() => {
    loadFFmpeg();
  }, [loadFFmpeg]);

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
              Video to GIF Converter
            </h1>
            <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
              Upload a video file to convert to GIF
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
                Drop your video file here
              </h3>
              <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                or click to browse for a video file
              </p>
              <p className="text-xs text-[var(--system-color-border-secondary)] leading-[1.21]">
                Supports MP4, MOV, AVI, WEBM and more
              </p>
            </div>
            
            <PrimaryButton
              icon={FileVideo}
              iconStrokeWidth={1.5}
            >
              Choose Video
            </PrimaryButton>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // If file is uploaded, show the conversion interface
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
            Video to GIF Converter
          </h1>
          <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
            Configure settings and convert your video
          </p>
        </div>

        <div className="w-[88px] flex-shrink-0"></div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Side - Video Preview Area */}
        <div className="flex flex-col justify-end items-end gap-6 flex-1 min-w-0">
          {/* File Info */}
          <div className="w-full flex items-center justify-between p-4 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg">
            <div className="flex items-center gap-3">
              <FileVideo size={20} className="text-[var(--system-color-functional-action)]" strokeWidth={1.5} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                  {uploadedFile.name}
                </span>
                <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB
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

          {/* Video Preview */}
          <div className="w-full flex-1 border border-dashed border-[var(--system-color-border-secondary)] rounded-2xl min-h-0 flex items-center justify-center p-8 relative">
            {videoUrl ? (
              <div className="w-full h-full flex items-center justify-center relative">
                <video 
                  ref={videoRef}
                  src={videoUrl}
                  className="max-w-full max-h-full rounded-lg"
                  controls={false}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg"
                >
                  <div className="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                    {isPlaying ? (
                      <Pause size={20} className="text-white" strokeWidth={2} />
                    ) : (
                      <Play size={20} className="text-white ml-1" strokeWidth={2} />
                    )}
                  </div>
                </button>
              </div>
            ) : (
              <div className="text-center text-[var(--system-color-elevation-base-content-tint)]">
                <p className="text-sm">Loading video preview...</p>
              </div>
            )}
          </div>
          
          {/* Convert/Download Button */}
          <div className="flex flex-col gap-2 items-end">
            <PrimaryButton
              onClick={convertedGifUrl ? handleDownload : handleConvertToGif}
              disabled={isConverting || !ffmpegLoaded}
              icon={convertedGifUrl ? Download : Upload}
              iconStrokeWidth={2}
              variant="compact"
            >
              {!ffmpegLoaded 
                ? 'Loading Converter...' 
                : isConverting 
                  ? 'Converting...' 
                  : convertedGifUrl 
                    ? 'Download GIF' 
                    : 'Convert to GIF'
              }
            </PrimaryButton>
            {conversionProgress && (
              <p className="text-xs text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                {conversionProgress}
              </p>
            )}
          </div>
        </div>

        {/* Right Side - Settings Panel */}
        <div className="flex flex-col gap-6 w-80 flex-shrink-0 overflow-hidden">
          <h2 className="text-base font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21] flex-shrink-0 flex items-center gap-2">
            <Settings size={16} strokeWidth={2} />
            Conversion Settings
          </h2>
          
                     <div className="flex flex-col gap-6 overflow-y-auto min-h-0 pr-2">
             {/* Start Time */}
             <div className="flex flex-col gap-2">
               <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                 Start Time
               </label>
               <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-3 h-10 flex items-center">
                 <input
                   type="number"
                   min="0"
                   step="0.1"
                   placeholder="Start of video"
                   value={settings.startTime ?? ''}
                   onChange={(e) => handleSettingChange('startTime', e.target.value ? parseFloat(e.target.value) : null)}
                   className="text-sm text-[var(--system-color-elevation-base-content)] bg-transparent border-none outline-none flex-1 leading-[1.21] placeholder:text-[var(--system-color-elevation-base-content-tint)]"
                 />
                 <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] ml-2">sec</span>
               </div>
             </div>

             {/* End Time */}
             <div className="flex flex-col gap-2">
               <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                 End Time
               </label>
               <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-3 h-10 flex items-center">
                 <input
                   type="number"
                   min="0"
                   step="0.1"
                   placeholder="End of video"
                   value={settings.endTime ?? ''}
                   onChange={(e) => handleSettingChange('endTime', e.target.value ? parseFloat(e.target.value) : null)}
                   className="text-sm text-[var(--system-color-elevation-base-content)] bg-transparent border-none outline-none flex-1 leading-[1.21] placeholder:text-[var(--system-color-elevation-base-content-tint)]"
                 />
                 <span className="text-xs text-[var(--system-color-elevation-base-content-tint)] ml-2">sec</span>
               </div>
             </div>

             {/* Width */}
             <div className="flex flex-col gap-2">
               <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                 Width
               </label>
               <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-3 h-10 flex items-center">
                 <select
                   value={settings.width}
                   onChange={(e) => handleSettingChange('width', parseInt(e.target.value))}
                   className="text-sm text-[var(--system-color-elevation-base-content)] bg-transparent border-none outline-none flex-1 leading-[1.21] cursor-pointer"
                 >
                   <option value={480}>480px (Compact)</option>
                   <option value={640}>640px (Standard)</option>
                   <option value={720}>720px (High Quality)</option>
                   <option value={1080}>1080px (Maximum)</option>
                   <option value={1280}>1280px (Ultra)</option>
                 </select>
               </div>
             </div>

             {/* FPS */}
             <div className="flex flex-col gap-2">
               <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                 Frame Rate
               </label>
               <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-3 h-10 flex items-center">
                 <select
                   value={settings.fps}
                   onChange={(e) => handleSettingChange('fps', parseInt(e.target.value))}
                   className="text-sm text-[var(--system-color-elevation-base-content)] bg-transparent border-none outline-none flex-1 leading-[1.21] cursor-pointer"
                 >
                   <option value={12}>12 FPS (Efficient)</option>
                   <option value={15}>15 FPS (Balanced)</option>
                   <option value={20}>20 FPS (High Quality)</option>
                   <option value={24}>24 FPS (Cinematic)</option>
                   <option value={30}>30 FPS (Ultra Smooth)</option>
                 </select>
               </div>
             </div>

            {/* Quality */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
                Quality
              </label>
              <div className="bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg px-3 h-10 flex items-center">
                                 <select
                   value={settings.quality}
                   onChange={(e) => handleSettingChange('quality', e.target.value)}
                   className="text-sm text-[var(--system-color-elevation-base-content)] bg-transparent border-none outline-none flex-1 leading-[1.21] cursor-pointer"
                 >
                   <option value="medium">Balanced (Good quality)</option>
                   <option value="high">Premium (Best quality)</option>
                   <option value="ultra">Ultra (Maximum quality)</option>
                 </select>
              </div>
            </div>

                         {/* Settings Preview */}
             <div className="p-4 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-lg">
               <h3 className="text-sm font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21] mb-2">
                 Quality Settings
               </h3>
               <div className="flex flex-col gap-1 text-xs text-[var(--system-color-elevation-base-content-tint)]">
                 <span>
                   Clip: {settings.startTime ?? 'Start'} - {settings.endTime ?? 'End'}
                   {settings.startTime !== null && settings.endTime !== null && (
                     <span className="ml-1">({settings.endTime - settings.startTime}s duration)</span>
                   )}
                 </span>
                 <span>Resolution: {settings.width}px wide</span>
                 <span>Frame Rate: {settings.fps} FPS</span>
                 <span>Quality: {settings.quality.charAt(0).toUpperCase() + settings.quality.slice(1)} (Palette optimized)</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VidToGif;
