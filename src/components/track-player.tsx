import { formatDuration, useSongDetails } from "@/queries/songs";
import { crossfaderValueAtom } from "@/store/atoms";
import { SongSearchResult } from "@/types/song";
import { Pause, Play, RotateCw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { SongSearch } from "./song-search";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface TrackPlayerProps {
  title: string;
  url: string;
  onUrlChange: (url: string) => void;
  playerRef: React.RefObject<HTMLAudioElement>;
  isLeftTrack: boolean;
}

export function TrackPlayer({
  title,
  url,
  onUrlChange,
  playerRef,
  isLeftTrack,
}: TrackPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState([0]);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState([1]);
  const [isClient, setIsClient] = useState(false);
  const crossfaderValue = useRecoilValue(crossfaderValueAtom);

  const { data: songDetails } = useSongDetails(url);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset track player when song changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      setSeekValue([0]);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [url, playerRef]);

  useEffect(() => {
    if (!isClient) return;

    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        setCurrentTime(playerRef.current.currentTime);
        setSeekValue([playerRef.current.currentTime]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playerRef, isClient]);

  const calculateVolume = () => {
    if (isMuted) return 0;
    // For left track (Track 1), volume decreases as crossfader value increases
    if (isLeftTrack) {
      return Math.max(0, Math.min(100, 100 - crossfaderValue));
    }
    // For right track (Track 2), volume increases as crossfader value increases
    return Math.max(0, Math.min(100, crossfaderValue));
  };

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
        playerRef.current.volume = calculateVolume() / 100;
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (playerRef.current) {
      const time = value[0];
      playerRef.current.currentTime = time;
      setSeekValue(value);
      setCurrentTime(time);
    }
  };

  const handleReset = () => {
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      setSeekValue([0]);
      setCurrentTime(0);
    }
  };

  const handleSongSelect = (song: SongSearchResult) => {
    onUrlChange(song.id);
  };

  const handleMuteToggle = () => {
    if (playerRef.current) {
      playerRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTempoChange = (value: number[]) => {
    if (playerRef.current) {
      playerRef.current.playbackRate = value[0];
      setPlaybackRate(value);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = calculateVolume() / 100;
    }
  }, [crossfaderValue, playerRef]);

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <SongSearch onVideoSelect={handleSongSelect} />
        </div>

        {songDetails && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatDuration(songDetails.duration.toString())}</span>
              </div>

              <Slider
                value={seekValue}
                onValueChange={handleSeek}
                max={duration}
                step={1}
                className="my-2"
              />
            </div>
          </div>
        )}

        {isClient && (
          <audio
            ref={playerRef}
            src={songDetails?.downloadUrl[4].url}
            onLoadedMetadata={(e) => {
              setDuration(e.currentTarget.duration);
            }}
            onEnded={() => {
              setIsPlaying(false);
              handleReset();
            }}
            onError={(e) => {
              console.error('Audio player error:', e);
              setIsPlaying(false);
            }}
          />
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleMuteToggle}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Tempo</Label>
              <Badge variant="secondary" onClick={() => handleTempoChange([1])} className="cursor-pointer hover:bg-primary/20 group">
                {playbackRate[0]}x <RotateCw strokeWidth={2.5} className="size-3 opacity-50 ml-1 group-hover:rotate-180 transition-transform duration-200 group-hover:scale-125" />
              </Badge>
            </div>
            <Slider
              value={playbackRate}
              onValueChange={handleTempoChange}
              min={0.25}
              max={2}
              step={0.01}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 