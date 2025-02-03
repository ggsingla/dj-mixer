import { youtube_v3 } from '@googleapis/youtube'
import { NextResponse } from 'next/server'

const youtube = new youtube_v3.Youtube({
  auth: process.env.YOUTUBE_API_KEY,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('id')

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
  }

  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId],
    })

    const video = response.data.items?.[0] as
      | youtube_v3.Schema$Video
      | undefined
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const result = {
      id: video.id || '',
      title: video.snippet?.title || '',
      thumbnail: video.snippet?.thumbnails?.default?.url || '',
      duration: video.contentDetails?.duration || '',
      channelTitle: video.snippet?.channelTitle || '',
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error getting video details:', error)
    return NextResponse.json(
      { error: 'Failed to get video details' },
      { status: 500 }
    )
  }
}
