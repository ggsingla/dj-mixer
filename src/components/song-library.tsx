'use client'
import useDebounce from '@/hooks/useDebounce'
import { useSearchSongs } from '@/queries/songs'
import { SongSearchResult } from '@/types/song'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Input } from './ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

interface SongLibraryProps {
  onAddToTrack1: (song: SongSearchResult) => void
  onAddToTrack2: (song: SongSearchResult) => void
}

export function SongLibrary({
  onAddToTrack1,
  onAddToTrack2,
}: SongLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 350)
  const { data: searchResults = [], isLoading: isSearching } =
    useSearchSongs(debouncedSearchQuery)

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Song Library</h2>
          <Input
            placeholder='Search for songs...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='max-w-sm'
          />

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[60px]'></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Artists</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isSearching ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-4'>
                      Searching...
                    </TableCell>
                  </TableRow>
                ) : searchResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-4'>
                      No songs found
                    </TableCell>
                  </TableRow>
                ) : (
                  searchResults.map((song) => (
                    <TableRow key={song.id}>
                      <TableCell>
                        <Image
                          src={song?.image[0]?.url}
                          alt={song?.name}
                          className='h-full w-full object-cover rounded'
                          width={32}
                          height={32}
                        />
                      </TableCell>
                      <TableCell className='font-medium'>{song.name}</TableCell>
                      <TableCell>
                        {song.artists.all
                          .slice(0, 2)
                          .map((artist) => artist.name)
                          .join(', ')}
                      </TableCell>
                      <TableCell>{song.duration}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onAddToTrack1(song)}
                            className='flex items-center gap-1'>
                            <Plus className='h-4 w-4' />
                            <span>Track 1</span>
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onAddToTrack2(song)}
                            className='flex items-center gap-1'>
                            <Plus className='h-4 w-4' />
                            <span>Track 2</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
