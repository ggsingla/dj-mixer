"use client";
import { Crossfader } from "@/components/crossfader";
import { TrackPlayer } from "@/components/track-player";
import { useRef, useState } from "react";
import YouTube from "react-youtube";

export default function Home() {
  const [track1URL, setTrack1URL] = useState("");
  const [track2URL, setTrack2URL] = useState("");

  const player1Ref = useRef<YouTube | null>(null);
  const player2Ref = useRef<YouTube | null>(null);

  return (
    <div className="min-h-screen p-8 bg-background">
      <main className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-12">DJ Mixer</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <TrackPlayer
            title="Track 1"
            url={track1URL}
            onUrlChange={setTrack1URL}
            playerRef={player1Ref}
            isLeftTrack={true}
          />

          <TrackPlayer
            title="Track 2"
            url={track2URL}
            onUrlChange={setTrack2URL}
            playerRef={player2Ref}
            isLeftTrack={false}
          />
        </div>

        <Crossfader
          player1Ref={player1Ref}
          player2Ref={player2Ref}
        />
      </main>
    </div>
  );
}
