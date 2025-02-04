export interface VideoSearchResult {
  id: string
  title: string
  thumbnail: string
  duration: string
  channelTitle: string
}

export async function searchVideos(
  query: string
): Promise<VideoSearchResult[]> {
  try {
    const response = await fetch(
      `/api/youtube/search?q=${encodeURIComponent(query)}`
    )
    if (!response.ok) throw new Error('Failed to search videos')
    return await response.json()
  } catch (error) {
    console.error('Error searching videos:', error)
    return []
  }
}

export async function getVideoDetails(
  videoId: string
): Promise<VideoSearchResult | null> {
  try {
    const response = await fetch(`/api/youtube/video?id=${videoId}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Error getting video details:', error)
    return null
  }
}

// Convert ISO 8601 duration to seconds
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return 0

  const hours = parseInt(match[1]?.replace('H', '') || '0')
  const minutes = parseInt(match[2]?.replace('M', '') || '0')
  const seconds = parseInt(match[3]?.replace('S', '') || '0')

  return hours * 3600 + minutes * 60 + seconds
}

// Format duration for display
export function formatDuration(duration: string): string {
  const seconds = parseDuration(duration)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const getYouTubeID = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : ''
}
