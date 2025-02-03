"use client";
import { Crossfader } from "@/components/crossfader";
import { TrackPlayer } from "@/components/track-player";
import { useRef, useState } from "react";
import YouTube from "react-youtube";

export default function Home() {
  const [track1URL, setTrack1URL] = useState("");
  const [track2URL, setTrack2URL] = useState("");
  const [crossfadeValue, setCrossfadeValue] = useState([50]);
  const [volume1, setVolume1] = useState([100]);
  const [volume2, setVolume2] = useState([100]);

  const player1Ref = useRef<YouTube | null>(null);
  const player2Ref = useRef<YouTube | null>(null);

  const handleVolume1Change = (value: number[]) => {
    setVolume1(value);
    if (player1Ref.current) {
      const vol = (value[0] / 100) * ((100 - crossfadeValue[0]) / 100);
      player1Ref.current.internalPlayer.setVolume(vol * 100);
    }
  };

  const handleVolume2Change = (value: number[]) => {
    setVolume2(value);
    if (player2Ref.current) {
      const vol = (value[0] / 100) * (crossfadeValue[0] / 100);
      player2Ref.current.internalPlayer.setVolume(vol * 100);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <main className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-12">DJ Mixer</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <TrackPlayer
            title="Track 1"
            url={track1URL}
            onUrlChange={setTrack1URL}
            volume={volume1}
            onVolumeChange={handleVolume1Change}
            playerRef={player1Ref}
          />

          <TrackPlayer
            title="Track 2"
            url={track2URL}
            onUrlChange={setTrack2URL}
            volume={volume2}
            onVolumeChange={handleVolume2Change}
            playerRef={player2Ref}
          />
        </div>

        <Crossfader
          value={crossfadeValue}
          onValueChange={setCrossfadeValue}
          player1Ref={player1Ref}
          player2Ref={player2Ref}
          volume1={volume1}
          volume2={volume2}
        />
      </main>
    </div>
  );
}
