/* eslint-disable @next/next/no-img-element */
"use client"
import useDebounce from "@/hooks/useDebounce";
import { VideoSearchResult, searchVideos } from "@/lib/youtube";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
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

interface VideoSearchProps {
  onVideoSelect: (video: VideoSearchResult) => void;
}

export function VideoSearch({ onVideoSelect }: VideoSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoSearchResult | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchVideos(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

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
            {selectedVideo ? (
              <div className="flex items-center gap-2">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="w-6 h-6 object-cover rounded"
                />
                <span className="truncate w-[200px]">{selectedVideo.title}</span>
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
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : "No songs found."}
              </CommandEmpty>
              <CommandGroup>
                {searchResults.map((video) => (
                  <CommandItem
                    key={video.id}
                    value={video.id}
                    onSelect={() => {
                      setSelectedVideo(video);
                      onVideoSelect(video);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex flex-col items-start text-left min-w-0">
                      <span className="font-medium truncate w-full">
                        {video.title}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {video.channelTitle} • {video.duration}
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