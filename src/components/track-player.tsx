import { getAverageColor } from "@/lib/color";
import { cn } from "@/lib/utils";
import { useSongDetails } from "@/queries/songs";
import { crossfaderValueAtom } from "@/store/atoms";
import { Pause, Play, RotateCw, Volume2, VolumeX } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactHowler from "react-howler";
import { useRecoilValue } from "recoil";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface TrackPlayerProps {
  title: string;
  url: string;
  isLeftTrack: boolean;
}

export function TrackPlayer({
  title,
  url,
  isLeftTrack,
}: TrackPlayerProps) {
  const { theme } = useTheme();
  const [cardColor, setCardColor] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState([0]);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState([1]);
  const crossfaderValue = useRecoilValue(crossfaderValueAtom);
  const playerRef = useRef<ReactHowler>(null);

  const { data: songDetails } = useSongDetails(url);

  // Initialize state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`track-player-${isLeftTrack ? 'left' : 'right'}`);
    if (savedState) {
      const { currentTime, isPlaying } = JSON.parse(savedState);
      setCurrentTime(currentTime);
      setSeekValue([currentTime]);
      if (isPlaying) {
        setIsPlaying(true);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    const state = {
      currentTime,
      isPlaying,
      url
    };
    localStorage.setItem(`track-player-${isLeftTrack ? 'left' : 'right'}`, JSON.stringify(state));
  }, [currentTime, isPlaying, url]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const savedState = localStorage.getItem(`track-player-${isLeftTrack ? 'left' : 'right'}`);
        if (savedState) {
          const { currentTime, isPlaying } = JSON.parse(savedState);
          setCurrentTime(currentTime);
          setSeekValue([currentTime]);
          if (isPlaying) {
            setIsPlaying(true);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLeftTrack]);

  // Reset track player when song changes
  useEffect(() => {
    const savedState = localStorage.getItem(`track-player-${isLeftTrack ? 'left' : 'right'}`);
    if (!savedState || JSON.parse(savedState).url !== url) {
      setSeekValue([0]);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [url]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const seek = playerRef.current.seek();
        if (typeof seek === 'number') {
          setCurrentTime(seek);
          setSeekValue([seek]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (songDetails?.image[1]?.url) {
      getAverageColor(songDetails.image[1].url, theme === 'dark')
        .then((color) => {
          setCardColor(color);
        })
        .catch((error) => {
          console.error('Error getting average color:', error);
        });
    } else {
      setCardColor(null);
    }
  }, [songDetails, theme]);

  const calculateVolume = () => {
    if (isMuted) return 0;
    // For left track (Track 1), volume decreases as crossfader value increases
    if (isLeftTrack) {
      return Math.max(0, Math.min(1, (100 - crossfaderValue) / 100));
    }
    // For right track (Track 2), volume increases as crossfader value increases
    return Math.max(0, Math.min(1, crossfaderValue / 100));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (playerRef.current) {
      const time = value[0];
      playerRef.current.seek(time);
      setSeekValue(value);
      setCurrentTime(time);
    }
  };

  const handleReset = () => {
    if (playerRef.current) {
      playerRef.current.seek(0);
      setSeekValue([0]);
      setCurrentTime(0);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleTempoChange = (value: number[]) => {
    setPlaybackRate(value);
    if (playerRef.current) {
      playerRef.current.howler.rate(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        !songDetails && "opacity-50"
      )}
      style={cardColor ? { '--primary': cardColor } as React.CSSProperties : undefined}
    >
      {songDetails && (
        <div className="absolute inset-0">
          <Image
            src={songDetails.image[1].url}
            alt={songDetails.name}
            className="w-full h-full object-cover opacity-30 blur-md"
            fill
            priority
          />
        </div>
      )}
      <CardContent className="p-6 space-y-4 relative">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-muted/50 flex-shrink-0 overflow-hidden">
              {songDetails ? (
                <Image
                  src={songDetails.image[0].url}
                  alt={songDetails.name}
                  className="w-full h-full object-cover"
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-full h-full bg-muted" />
              )}
            </div>
            <div className="flex flex-col">
              <span className={`font-medium ${!songDetails ? 'text-muted-foreground' : ''}`}>
                {songDetails ? songDetails.name : 'No song selected'}
              </span>
              <span className={`text-sm ${!songDetails ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                {songDetails ? songDetails.artists.all.slice(0, 2).map((artist) => artist.name).join(', ') : 'Select a song to begin'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{songDetails ? formatDuration(Number(songDetails.duration)) : '0:00'}</span>
            </div>

            <Slider
              value={seekValue}
              onValueChange={handleSeek}
              max={duration}
              step={1}
              className="my-2"
              disabled={!songDetails}
            />
          </div>
        </div>

        {url && songDetails?.downloadUrl[4].url && (
          <ReactHowler
            ref={playerRef}
            src={songDetails.downloadUrl[4].url}
            playing={isPlaying}
            mute={isMuted}
            volume={calculateVolume()}
            rate={playbackRate[0]}
            onLoad={() => {
              if (playerRef.current) {
                setDuration(playerRef.current.duration());
              }
            }}
            onEnd={() => {
              setIsPlaying(false);
              handleReset();
            }}
            onLoadError={(id, error) => {
              console.error('Audio player error:', error);
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
              disabled={!songDetails}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              disabled={!songDetails}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleMuteToggle}
              disabled={!songDetails}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Tempo</Label>
              <Badge
                variant="secondary"
                onClick={() => handleTempoChange([1])}
                className={`cursor-pointer hover:bg-primary/20 group ${!songDetails ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {playbackRate[0]}x <RotateCw strokeWidth={2.5} className="size-3 opacity-50 ml-1 group-hover:rotate-180 transition-transform duration-200 group-hover:scale-125" />
              </Badge>
            </div>
            <Slider
              value={playbackRate}
              onValueChange={handleTempoChange}
              min={0.25}
              max={2}
              step={0.01}
              disabled={!songDetails}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 