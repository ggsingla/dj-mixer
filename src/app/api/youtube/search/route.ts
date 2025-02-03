import { youtube_v3 } from '@googleapis/youtube'
import { NextResponse } from 'next/server'

const youtube = new youtube_v3.Youtube({
  auth: process.env.YOUTUBE_API_KEY,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      videoCategoryId: '10', // Music category
      maxResults: 5,
      regionCode: 'IN', // Set region to India
      videoType: 'any',
      order: 'relevance',
    })

    const videoIds = response.data.items
      ?.map((item) => item.id?.videoId)
      .filter((id): id is string => id !== undefined && id !== null)

    if (!videoIds?.length) return NextResponse.json([])

    // Get video details including duration
    const videoDetails = await youtube.videos.list({
      part: ['contentDetails', 'snippet'],
      id: videoIds,
    })

    const results = (videoDetails.data.items || []).map(
      (video: youtube_v3.Schema$Video) => ({
        id: video.id || '',
        title: video.snippet?.title || '',
        thumbnail: video.snippet?.thumbnails?.default?.url || '',
        duration: video.contentDetails?.duration || '',
        channelTitle: video.snippet?.channelTitle || '',
      })
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching videos:', error)
    return NextResponse.json(
      { error: 'Failed to search videos' },
      { status: 500 }
    )
  }
}
