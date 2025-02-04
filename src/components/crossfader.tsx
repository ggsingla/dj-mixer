import { crossfaderValueAtom } from "@/store/atoms";
import { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { useRecoilState } from "recoil";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Slider } from "./ui/slider";

interface CrossfaderProps {
  player1Ref: React.RefObject<YouTube>;
  player2Ref: React.RefObject<YouTube>;
}

export function Crossfader({
  player1Ref,
  player2Ref,
}: CrossfaderProps) {
  const [targetValue, setTargetValue] = useState<number | null>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [crossfaderValue, setCrossfaderValue] = useRecoilState(crossfaderValueAtom);

  const handleCrossfade = (newValue: number[]) => {
    setCrossfaderValue(newValue[0]);
    if (player1Ref.current && player2Ref.current) {
      const vol1 = (100 - newValue[0]) / 100;
      const vol2 = newValue[0] / 100;
      player1Ref.current.internalPlayer.setVolume(vol1 * 100);
      player2Ref.current.internalPlayer.setVolume(vol2 * 100);
    }
  };

  const animateCrossfade = (currentTime: number) => {
    if (targetValue === null) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    const currentValue = crossfaderValue;
    const diff = targetValue - currentValue;
    const speed = 0.05;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), speed * deltaTime);

    if (Math.abs(diff) > 0.1) {
      handleCrossfade([currentValue + step]);
      animationRef.current = requestAnimationFrame(animateCrossfade);
    } else {
      handleCrossfade([targetValue]);
      setTargetValue(null);
    }
  };

  useEffect(() => {
    if (targetValue !== null) {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animateCrossfade);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, crossfaderValue]);

  const handleTrackButton = (target: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setTargetValue(target);
  };

  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => handleTrackButton(0)}
              className="w-24"
            >
              Track 1
            </Button>
            <h2 className="text-xl font-semibold">Crossfader</h2>
            <Button
              variant="outline"
              onClick={() => handleTrackButton(100)}
              className="w-24"
            >
              Track 2
            </Button>
          </div>
          <Slider
            value={[crossfaderValue]}
            onValueChange={handleCrossfade}
            max={100}
            step={5}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Track 1</span>
            <span>Track 2</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 