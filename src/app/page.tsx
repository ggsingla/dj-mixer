"use client";
import { Crossfader } from "@/components/crossfader";
import { SongLibrary } from "@/components/song-library";
import { TrackPlayer } from "@/components/track-player";
import { useRef, useState } from "react";

export default function Home() {
  const [track1URL, setTrack1URL] = useState("");
  const [track2URL, setTrack2URL] = useState("");

  const player1Ref = useRef<HTMLAudioElement | null>(null);
  const player2Ref = useRef<HTMLAudioElement | null>(null);

  return (
    <div className="py-8 bg-background">
      <main className="container mx-auto space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <TrackPlayer
            title="Track 1"
            url={track1URL}
            isLeftTrack={true}
          />

          <TrackPlayer
            title="Track 2"
            url={track2URL}
            isLeftTrack={false}
          />
        </div>

        <Crossfader
          player1Ref={player1Ref}
          player2Ref={player2Ref}
        />

        <SongLibrary
          onAddToTrack1={(song) => setTrack1URL(song.id)}
          onAddToTrack2={(song) => setTrack2URL(song.id)}
        />
      </main>
    </div>
  );
}
