import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Link, Copy, Loader2 } from 'lucide-react';
import PrimaryButton from '../global/PrimaryButton';
import SecondaryButton from '../global/SecondaryButton';
import ToolTip from '../global/ToolTip';

interface YoutubeTranscriberProps {
  onBack: () => void;
}

interface TranscriptionResult {
  title: string;
  transcript: string;
  videoId: string;
}

const YoutubeTranscriber: React.FC<YoutubeTranscriberProps> = ({ onBack }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleTranscribe = async () => {
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/YouTube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'Failed to transcribe video');
      }
    } catch {
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTranscript = async () => {
    if (result?.transcript) {
      try {
        await navigator.clipboard.writeText(result.transcript);
        setShowTooltip(true);
      } catch (err) {
        console.error('Failed to copy transcript:', err);
      }
    }
  };

  const handleHideTooltip = () => {
    setShowTooltip(false);
  };

  const handleTranscribeNew = () => {
    setResult(null);
    setYoutubeUrl('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleTranscribe();
    }
  };

  // Results view
  if (result) {
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
              YouTube Video Transcriber
            </h1>
            <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
              Transcription complete
            </p>
          </div>

          <div className="w-[88px] flex-shrink-0"></div>
        </div>

        {/* Main Content - Results */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Transcript Container */}
          <div className="w-full max-w-[588px] bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6 flex flex-col gap-2.5 h-[200px]">
            <h2 className="text-base font-bold text-[var(--system-color-elevation-base-content)] leading-[1.21]">
              {result.title}
            </h2>
            <div className="flex-1 overflow-y-auto">
              <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
                {result.transcript}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <SecondaryButton
              onClick={handleTranscribeNew}
              icon={Link}
              iconStrokeWidth={1.67}
              variant="compact"
            >
              Transcribe New Video
            </SecondaryButton>
            
            <PrimaryButton
              onClick={handleCopyTranscript}
              icon={Copy}
              iconStrokeWidth={2}
              variant="default"
            >
              Copy Transcript
            </PrimaryButton>
          </div>
        </div>

        {/* ToolTip */}
        <ToolTip
          message="Transcript Copied Successfully!"
          isVisible={showTooltip}
          onHide={handleHideTooltip}
          duration={3000}
        />
      </div>
    );
  }

  // Input view
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
            YouTube Video Transcriber
          </h1>
          <p className="text-sm text-[var(--system-color-elevation-base-content-tint)] leading-[1.21]">
            Takes a youtube link then transcribes it for you
          </p>
        </div>

        <div className="w-[88px] flex-shrink-0"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-[var(--system-color-elevation-base-background)] border border-[var(--system-color-border-primary)] rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          {/* Input and Button Row */}
          <div className="flex items-center gap-2 w-full">
            {/* Input Field */}
            <div className="flex items-center gap-2 flex-1 h-10 px-4 bg-[var(--system-color-elevation-one-background)] border border-[var(--system-color-border-primary)] rounded-2xl hover:border-[#adb2b8] focus-within:border-[var(--system-color-border-focus)] focus-within:hover:border-[var(--system-color-border-focus)] transition-colors">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter YouTube URL here..."
                className="flex-1 bg-transparent text-sm text-[var(--system-color-elevation-base-content)] placeholder-[var(--system-color-elevation-base-content-tint)] border-none outline-none"
                disabled={isLoading}
              />
            </div>

            {/* Transcribe Button */}
            <PrimaryButton
              onClick={handleTranscribe}
              icon={isLoading ? Loader2 : ChevronRight}
              iconStrokeWidth={2}
              iconPosition="right"
              variant="compact"
              disabled={isLoading || !youtubeUrl.trim()}
            >
              {isLoading ? 'Processing...' : 'Transcribe'}
            </PrimaryButton>
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full p-3 bg-[var(--system-color-functional-error-alt)] border border-[var(--system-color-functional-error-alt)] rounded-lg outline-1 outline-[var(--system-color-functional-error)]">
              <p className="text-sm text-[var(--system-color-functional-error)]">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ToolTip */}
      <ToolTip
        message="Transcript Copied Successfully!"
        isVisible={showTooltip}
        onHide={handleHideTooltip}
        duration={3000}
      />
    </div>
  );
};

export default YoutubeTranscriber;
