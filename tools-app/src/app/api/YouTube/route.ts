import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

// Helper function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to get video info and transcript
async function getVideoTranscript(videoId: string) {
  try {
    // Get video info from oEmbed
    console.log('Fetching video info for:', videoId);
    const videoInfoResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (!videoInfoResponse.ok) {
      console.error('Video info response not ok:', videoInfoResponse.status, videoInfoResponse.statusText);
      throw new Error('Video not found or unavailable');
    }
    
    const videoInfo = await videoInfoResponse.json();
    console.log('Video info retrieved:', videoInfo.title);
    
    // Get transcript using youtube-transcript library
    let transcript = '';
    
    try {
      console.log('Attempting to fetch transcript using youtube-transcript library...');
      const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (transcriptArray && transcriptArray.length > 0) {
        console.log('Successfully fetched transcript with', transcriptArray.length, 'segments');
        
        // Combine all transcript segments into a single string
        transcript = transcriptArray
          .map(item => item.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        console.log('Processed transcript length:', transcript.length);
      } else {
        console.log('No transcript segments found');
        throw new Error('No transcript available');
      }
    } catch (transcriptError) {
      console.error('Error fetching transcript:', transcriptError);
      throw new Error('This video does not have captions available or they are disabled');
    }
    
    return {
      title: videoInfo.title,
      transcript: transcript,
      videoId
    };
    
  } catch (error) {
    console.error('Error fetching video data:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to YouTube API');
    
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
