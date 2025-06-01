import { NextRequest, NextResponse } from 'next/server';

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
    
    // Try to get transcript
    let transcript = '';
    
    try {
      console.log('Attempting to fetch transcript...');
      // Try to get the transcript using YouTube's subtitle API
      const transcriptUrl = `https://video.google.com/timedtext?lang=en&v=${videoId}`;
      console.log('Transcript URL:', transcriptUrl);
      
      const transcriptResponse = await fetch(transcriptUrl, {
        headers: {
          'Accept': 'text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('Transcript response status:', transcriptResponse.status);
      
      if (transcriptResponse.ok) {
        const xmlContent = await transcriptResponse.text();
        console.log('XML content length:', xmlContent.length);
        console.log('XML content preview:', xmlContent.substring(0, 200));
        
        // Parse the XML transcript
        const textMatches = xmlContent.match(/<text[^>]*>(.*?)<\/text>/g);
        
        if (textMatches && textMatches.length > 0) {
          console.log('Found text matches:', textMatches.length);
          transcript = textMatches
            .map(match => {
              // Extract text content and clean it
              const textContent = match.replace(/<text[^>]*>(.*?)<\/text>/, '$1');
              return textContent
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .trim();
            })
            .filter(text => text.length > 0)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          console.log('Processed transcript length:', transcript.length);
        } else {
          console.log('No text matches found in XML');
        }
      } else {
        console.log('Transcript response not ok, trying alternative...');
      }
    } catch (transcriptError) {
      console.error('Error fetching transcript:', transcriptError);
    }
    
    // Alternative approach if the first one fails
    if (!transcript) {
      try {
        console.log('Trying auto-generated captions...');
        // Try auto-generated captions
        const autoTranscriptUrl = `https://video.google.com/timedtext?lang=en&v=${videoId}&kind=asr`;
        const autoResponse = await fetch(autoTranscriptUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('Auto transcript response status:', autoResponse.status);
        
        if (autoResponse.ok) {
          const xmlContent = await autoResponse.text();
          console.log('Auto XML content length:', xmlContent.length);
          
          const textMatches = xmlContent.match(/<text[^>]*>(.*?)<\/text>/g);
          
          if (textMatches && textMatches.length > 0) {
            transcript = textMatches
              .map(match => {
                const textContent = match.replace(/<text[^>]*>(.*?)<\/text>/, '$1');
                return textContent
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
                  .replace(/&nbsp;/g, ' ')
                  .trim();
              })
              .filter(text => text.length > 0)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
      } catch (autoError) {
        console.error('Error fetching auto-generated transcript:', autoError);
      }
    }
    
    // Demo fallback for testing purposes
    if (!transcript) {
      console.log('No transcript found, using demo content');
      transcript = `Welcome to this YouTube video! This is a demo transcript because we couldn't extract the actual captions from the video. The video titled "${videoInfo.title}" may not have captions enabled, or they may not be accessible through the public API. In a real implementation, you might need to use a paid service or library specifically designed for YouTube transcript extraction. This demo shows what the interface would look like with actual transcript content. The transcript would normally contain the full spoken content of the video, formatted in a readable way for easy copying and reference.`;
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
