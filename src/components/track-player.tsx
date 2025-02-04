/* eslint-disable @next/next/no-img-element */
import { VideoSearchResult, formatDuration, getVideoDetails } from "@/lib/youtube";
import { Pause, Play, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";
import { VideoSearch } from "./video-search";

interface TrackPlayerProps {
  title: string;
  url: string;
  onUrlChange: (url: string) => void;
  volume: number[];
  onVolumeChange: (value: number[]) => void;
  playerRef: React.RefObject<YouTube>;
}

export function TrackPlayer({
  title,
  url,
  onUrlChange,
  volume,
  onVolumeChange,
  playerRef,
}: TrackPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState([0]);
  const [videoDetails, setVideoDetails] = useState<VideoSearchResult | null>(null);

  const getYouTubeID = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current?.internalPlayer && isPlaying) {
        playerRef.current.internalPlayer.getCurrentTime().then((time: number) => {
          setCurrentTime(time);
          setSeekValue([time]);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playerRef]);

  useEffect(() => {
    const loadVideoDetails = async () => {
      const videoId = getYouTubeID(url);
      if (videoId) {
        const details = await getVideoDetails(videoId);
        setVideoDetails(details);
      }
    };

    loadVideoDetails();
  }, [url]);

  const handlePlayPause = async () => {
    if (playerRef.current?.internalPlayer) {
      try {
        const state = await playerRef.current.internalPlayer.getPlayerState();
        if (state === 1) { // Playing
          await playerRef.current.internalPlayer.pauseVideo();
        } else {
          await playerRef.current.internalPlayer.playVideo();
        }
      } catch (error) {
        console.error('Error controlling playback:', error);
      }
    }
  };

  const handleSeek = async (value: number[]) => {
    if (playerRef.current?.internalPlayer) {
      const time = value[0];
      try {
        await playerRef.current.internalPlayer.seekTo(time, true);
        setSeekValue(value);
        setCurrentTime(time);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const handleReset = async () => {
    if (playerRef.current?.internalPlayer) {
      try {
        await playerRef.current.internalPlayer.seekTo(0, true);
        setSeekValue([0]);
        setCurrentTime(0);
      } catch (error) {
        console.error('Error resetting:', error);
      }
    }
  };

  const handleVideoSelect = (video: VideoSearchResult) => {
    setVideoDetails(video);
    onUrlChange(`https://www.youtube.com/watch?v=${video.id}`);
  };


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <VideoSearch onVideoSelect={handleVideoSelect} />
        </div>

        {videoDetails && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatDuration(videoDetails.duration)}</span>
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

        <div className="relative w-full h-0">
          <div className="absolute inset-0 opacity-0 pointer-events-none">
            <YouTube
              videoId={getYouTubeID(url)}
              ref={playerRef}
              opts={{
                playerVars: {
                  controls: 0,
                  autoplay: 0,
                  rel: 0,
                  modestbranding: 1,
                  origin: typeof window !== 'undefined' ? window.location.origin : undefined,
                  enablejsapi: 1,
                  playsinline: 1
                },
                width: '100%',
                height: '100%',
              }}
              onStateChange={(event: YouTubeEvent<number>) => {
                setIsPlaying(event.data === 1);
                if (event.target && !duration) {
                  const dur = event.target.getDuration();
                  setDuration(dur);
                }
                if (event.data === 0) {
                  handleReset();
                }
              }}
              onReady={(event: YouTubeEvent<YouTubePlayer>) => {
                event.target.setVolume(volume[0]);
                const dur = event.target.getDuration();
                setDuration(dur);
              }}
              onError={(error: YouTubeEvent<any>) => {
                console.error('YouTube player error:', error);
                setIsPlaying(false);
                setTimeout(() => {
                  if (playerRef.current?.internalPlayer) {
                    playerRef.current.internalPlayer.loadVideoById(getYouTubeID(url));
                  }
                }, 1000);
              }}
            />
          </div>
        </div>

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

          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium">Volume</p>
            <Slider
              value={volume}
              onValueChange={onVolumeChange}
              max={100}
              step={10}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 