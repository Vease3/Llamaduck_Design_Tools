import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to get video info and transcript using Innertube
async function getVideoTranscript(videoId: string) {
  try {
    console.log('Initializing Innertube for video:', videoId);
    
    // Initialize Innertube
    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
    });

    console.log('Fetching video info...');
    
    // Get video info
    const info = await youtube.getInfo(videoId);
    
    if (!info) {
      throw new Error('Video not found or unavailable');
    }

    console.log('Video info retrieved:', info.basic_info?.title);

    // Get transcript
    console.log('Attempting to fetch transcript...');
    const transcriptData = await info.getTranscript();
    
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript available for this video');
    }

    // Extract transcript segments
    const segments = transcriptData.transcript.content?.body?.initial_segments;
    
    if (!segments || !Array.isArray(segments)) {
      throw new Error('Unable to parse transcript data');
    }

    console.log('Successfully fetched transcript with', segments.length, 'segments');

    // Combine all transcript segments into a single string
    const transcript = segments
      .map(segment => segment.snippet?.text || '')
      .filter(text => text.trim() !== '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!transcript) {
      throw new Error('Transcript appears to be empty');
    }

    console.log('Processed transcript length:', transcript.length);

    return {
      title: info.basic_info?.title || 'Unknown Title',
      transcript: transcript,
      videoId
    };
    
  } catch (error) {
    console.error('Error fetching video data:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Video unavailable') || error.message.includes('not found')) {
        throw new Error('This video is unavailable, private, or does not exist');
      } else if (error.message.includes('Sign in required')) {
        throw new Error('This video requires sign-in to access. Please try a different video.');
      } else if (error.message.includes('No transcript') || error.message.includes('transcript')) {
        throw new Error('This video does not have captions or subtitles available');
      } else if (error.message.includes('age-restricted')) {
        throw new Error('This video is age-restricted and cannot be transcribed');
      }
    }
    
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to YouTube API (using Innertube)');
    
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (jsonError) {
      console.error('Error parsing request JSON:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }
    
    console.log('Processing URL:', url);
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL format' },
        { status: 400 }
      );
    }
    
    console.log('Extracted video ID:', videoId);
    
    const result = await getVideoTranscript(videoId);
    
    console.log('Transcript result:', {
      title: result.title,
      transcriptLength: result.transcript.length,
      videoId: result.videoId
    });
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('YouTube API error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to transcribe video',
        success: false
      },
      { status: 500 }
    );
  }
}
