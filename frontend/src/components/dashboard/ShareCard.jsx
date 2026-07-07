import { useRef } from "react";
import { Download, Share2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useToast } from "../../context/ToastContext";

const WIDTH = 600;
const HEIGHT = 315;

export default function ShareCard({ streak, level, totalHours }) {
  const canvasRef = useRef(null);
  const { notify } = useToast();

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    // Background gradient matching the app's ink palette
    const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    bg.addColorStop(0, "#16213A");
    bg.addColorStop(1, "#0B1120");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Ticket-stub notches, echoing the admit-card motif
    ctx.fillStyle = "#0B1120";
    ctx.beginPath();
    ctx.arc(0, HEIGHT / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(WIDTH, HEIGHT / 2, 18, 0, Math.PI * 2);
    ctx.fill();

    // Dashed divider
    ctx.strokeStyle = "rgba(246,245,241,0.2)";
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(WIDTH * 0.62, 30);
    ctx.lineTo(WIDTH * 0.62, HEIGHT - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Title
    ctx.fillStyle = "#E8A33D";
    ctx.font = "600 15px 'Space Grotesk', sans-serif";
    ctx.fillText("CAT PREP TRACKER", 40, 50);

    ctx.fillStyle = "#F6F5F1";
    ctx.font = "600 26px 'Space Grotesk', sans-serif";
    ctx.fillText("Grinding, one session at a time.", 40, 90);

    // Stats block (left)
    const stats = [
      { label: "STREAK", value: `${streak}d` },
      { label: "LEVEL", value: `${level}` },
      { label: "TOTAL HOURS", value: totalHours.toFixed(0) },
    ];

    stats.forEach((s, i) => {
      const y = 150 + i * 50;
      ctx.fillStyle = "rgba(246,245,241,0.5)";
      ctx.font = "500 12px 'IBM Plex Mono', monospace";
      ctx.fillText(s.label, 40, y);

      ctx.fillStyle = "#F6F5F1";
      ctx.font = "600 28px 'IBM Plex Mono', monospace";
      ctx.fillText(s.value, 40, y + 28);
    });

    // Right stub
    ctx.fillStyle = "#F0B860";
    ctx.font = "600 13px 'Space Grotesk', sans-serif";
    ctx.save();
    ctx.translate(WIDTH * 0.62 + 40, HEIGHT / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("ADMIT ONE — CAT PREP", 0, 0);
    ctx.restore();
  };

  const handleDownload = () => {
    draw();
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "cat-prep-progress.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    notify("Downloaded. Ready to share.");
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Share2 size={18} className="text-amber-500" />
        <h3 className="font-display font-semibold text-base">Share your progress</h3>
      </div>
      <p className="text-sm text-ink-900/60 dark:text-paper-50/60 mb-4">
        Download a progress card to share — no account details included.
      </p>

      {/* Hidden canvas used only for rendering the download; not shown directly
          since font-loading timing in a visible canvas can look briefly wrong. */}
      <canvas ref={canvasRef} className="hidden" />

      <Button onClick={handleDownload} className="w-full">
        <Download size={16} /> Download progress card
      </Button>
    </Card>
  );
}
