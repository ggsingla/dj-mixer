import apiClient from '@/lib/api-client'
import type { SearchResponse, SongSearchResult } from '@/types/song'
import { useQuery } from '@tanstack/react-query'

const searchSongs = async (query: string): Promise<SongSearchResult[]> => {
  const { data } = await apiClient.get<SearchResponse>(
    `/search/songs?query=${encodeURIComponent(query)}&page=1&limit=5`
  )
  return data.data.results
}

const getSongDetails = async (
  songId: string
): Promise<SongSearchResult | null> => {
  const { data } = await apiClient.get(`/songs/${songId}`)
  const song = data.data[0]
  return song
}

export const useSearchSongs = (query: string) => {
  return useQuery({
    queryKey: ['songs', query],
    queryFn: () => searchSongs(query),
    enabled: !!query,
  })
}

export const useSongDetails = (songId: string) => {
  return useQuery({
    queryKey: ['songs', 'details', songId],
    queryFn: () => getSongDetails(songId),
    enabled: !!songId,
  })
}

// Convert duration in seconds to MM:SS format
export const formatDuration = (duration: string): string => {
  const seconds = parseInt(duration)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
