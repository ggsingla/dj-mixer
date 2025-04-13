"use client"
import useDebounce from "@/hooks/useDebounce";
import { useSearchSongs } from "@/queries/songs";
import { SongSearchResult } from "@/types/song";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
interface SongSearchProps {
  onVideoSelect: (song: SongSearchResult) => void;
}

export function SongSearch({ onVideoSelect }: SongSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<SongSearchResult | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const { data: searchResults = [], isLoading: isSearching } = useSearchSongs(debouncedSearchQuery);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedSong ? (
              <div className="flex items-center gap-2">
                <Image
                  src={selectedSong.image[0].url}
                  alt={selectedSong.name}
                  className="w-6 h-6 object-cover rounded"
                  width={24}
                  height={24}
                />
                <span className="truncate w-[200px] text-left">{selectedSong.name}</span>
              </div>
            ) : (
              "Add a song..."
            )}
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-0">
          <Command shouldFilter={false}>

            <CommandInput
              placeholder="Type to search..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              autoFocus
            />
            <CommandList>
              <CommandEmpty>
                {isSearching ? "Searching..." : "No songs found."}
              </CommandEmpty>
              <CommandGroup>
                {searchResults.map((song) => (
                  <CommandItem
                    key={song.id}
                    value={song.id}
                    onSelect={() => {
                      setSelectedSong(song);
                      onVideoSelect(song);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={song?.image[0]?.url}
                      alt={song?.name}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                      width={40}
                      height={40}
                    />
                    <div className="flex flex-col items-start text-left min-w-0">
                      <span className="font-medium truncate w-full">
                        {song.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {song.artists.all.slice(0, 2).map((artist) => artist.name).join(', ')} • {song.duration}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 