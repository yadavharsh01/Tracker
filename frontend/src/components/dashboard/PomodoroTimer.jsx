import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";

const DEFAULT_SECONDS = 25 * 60;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function PomodoroTimer() {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Created lazily and only played on explicit user action, so the
    // browser's autoplay policy is never fought — this was silently
    // failing before as an unconditional autoplay call on page load.
    audioRef.current = new Audio(
      "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
    );
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          audioRef.current?.play().catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const start = () => {
    if (secondsLeft === 0) setSecondsLeft(DEFAULT_SECONDS);
    setIsRunning(true);
  };

  const pause = () => setIsRunning(false);

  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(DEFAULT_SECONDS);
  };

  const applyCustomTime = (e) => {
    e.preventDefault();
    const minutes = parseInt(customMinutes, 10);
    if (!minutes || minutes <= 0) return;
    setIsRunning(false);
    setSecondsLeft(minutes * 60);
    setCustomMinutes("");
  };

  return (
    <Card>
      <h3 className="font-display font-semibold text-base mb-4">Focus timer</h3>

      <p className="tabular text-center text-5xl font-semibold py-4 text-ink-900 dark:text-paper-50">
        {formatTime(secondsLeft)}
      </p>

      <div className="flex items-center justify-center gap-2 mb-5">
        {isRunning ? (
          <Button variant="secondary" onClick={pause}>
            <Pause size={16} /> Pause
          </Button>
        ) : (
          <Button variant="primary" onClick={start}>
            <Play size={16} /> Start
          </Button>
        )}
        <Button variant="ghost" onClick={reset}>
          <RotateCcw size={16} /> Reset
        </Button>
      </div>

      <form onSubmit={applyCustomTime} className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            id="custom-minutes"
            placeholder="Custom minutes"
            inputMode="numeric"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Set
        </Button>
      </form>
    </Card>
  );
}
