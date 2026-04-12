import { useRef, useCallback } from 'react';
import { StudySession, formatMinutes } from '@/lib/sessions';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { toast } from 'sonner';

interface Props {
  session: StudySession;
}

function drawSessionCard(canvas: HTMLCanvasElement, session: StudySession) {
  const ctx = canvas.getContext('2d')!;
  const w = 720;
  const h = 480;
  canvas.width = w;
  canvas.height = h;

  // Background
  ctx.fillStyle = '#1a1c2e';
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 24);
  ctx.fill();

  // Header accent bar
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, '#e5a220');
  grad.addColorStop(1, '#f0c040');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 6);

  // Title
  ctx.fillStyle = '#f5f0e8';
  ctx.font = 'bold 28px "Space Grotesk", sans-serif';
  ctx.fillText('Study Session', 36, 52);

  // Date & time
  ctx.fillStyle = '#8888a0';
  ctx.font = '16px "Inter", sans-serif';
  ctx.fillText(`${session.date}  ·  ${session.startTime} → ${session.endTime}`, 36, 82);

  // Divider
  ctx.strokeStyle = '#2a2c3e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, 100);
  ctx.lineTo(w - 36, 100);
  ctx.stroke();

  const studyPercent = session.totalMinutes > 0 ? Math.round((session.actualStudyMinutes / session.totalMinutes) * 100) : 0;
  const breakPercent = session.totalMinutes > 0 ? Math.round(((session.totalBreakMinutes || 0) / session.totalMinutes) * 100) : 0;
  const wastedPercent = session.totalMinutes > 0 ? Math.round((session.wastedMinutes / session.totalMinutes) * 100) : 0;

  // Time breakdown bar
  const barY = 120;
  const barH = 20;
  const barX = 36;
  const barW = w - 72;
  ctx.fillStyle = '#2a2c3e';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 10);
  ctx.fill();

  let offset = barX;
  // Study portion
  if (studyPercent > 0) {
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(offset, barY, barW * studyPercent / 100, barH);
    offset += barW * studyPercent / 100;
  }
  // Break portion
  if (breakPercent > 0) {
    ctx.fillStyle = '#e5a220';
    ctx.fillRect(offset, barY, barW * breakPercent / 100, barH);
    offset += barW * breakPercent / 100;
  }
  // Wasted portion
  if (wastedPercent > 0) {
    ctx.fillStyle = '#f87171';
    ctx.fillRect(offset, barY, barW * wastedPercent / 100, barH);
  }

  // Legend
  ctx.font = '13px "Inter", sans-serif';
  const legendY = barY + barH + 24;
  const legends = [
    { color: '#4ade80', label: `Study ${studyPercent}%` },
    { color: '#e5a220', label: `Breaks ${breakPercent}%` },
    { color: '#f87171', label: `Wasted ${wastedPercent}%` },
  ];
  let lx = barX;
  for (const l of legends) {
    ctx.fillStyle = l.color;
    ctx.beginPath();
    ctx.arc(lx + 6, legendY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8888a0';
    ctx.fillText(l.label, lx + 16, legendY + 5);
    lx += ctx.measureText(l.label).width + 40;
  }

  // Stats grid
  const statsY = legendY + 44;
  const stats = [
    { label: 'Total Duration', value: formatMinutes(session.totalMinutes), color: '#f5f0e8' },
    { label: 'Studied', value: formatMinutes(session.actualStudyMinutes), color: '#4ade80' },
    { label: 'Breaks', value: formatMinutes(session.totalBreakMinutes || 0), color: '#e5a220' },
    { label: 'Wasted', value: formatMinutes(session.wastedMinutes), color: '#f87171' },
  ];
  const colW = (w - 72) / 2;
  stats.forEach((stat, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = barX + col * (colW + 12);
    const sy = statsY + row * 80;

    // Card background
    ctx.fillStyle = '#22243a';
    ctx.beginPath();
    ctx.roundRect(sx, sy, colW - 6, 68, 12);
    ctx.fill();

    ctx.fillStyle = '#8888a0';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText(stat.label, sx + 16, sy + 24);

    ctx.fillStyle = stat.color;
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText(stat.value, sx + 16, sy + 52);
  });

  // Efficiency
  const effY = statsY + 176;
  ctx.fillStyle = '#8888a0';
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillText('Efficiency', barX, effY);
  ctx.fillStyle = studyPercent >= 70 ? '#4ade80' : studyPercent >= 40 ? '#e5a220' : '#f87171';
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.fillText(`${studyPercent}%`, barX + 70, effY);

  // Branding
  ctx.fillStyle = '#555570';
  ctx.font = '12px "Inter", sans-serif';
  ctx.fillText('StudyKeeper', w - 110, h - 16);
}

export default function SessionShareImage({ session }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawSessionCard(canvas, session);

    try {
      if (Capacitor.isNativePlatform()) {
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        const fileName = `session-${session.date}-${session.id.slice(0, 6)}.png`;

        const saved = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Cache,
        });

        await Share.share({
          title: `Study Session - ${session.date}`,
          text: `Studied ${formatMinutes(session.actualStudyMinutes)} on ${session.date}`,
          url: saved.uri,
          dialogTitle: 'Share Session',
        });
      } else {
        // Web: download
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `session-${session.date}.png`;
        a.click();
        toast.success('Image saved!');
      }
    } catch (err: any) {
      if (err?.message?.includes('canceled') || err?.message?.includes('cancelled')) return;
      toast.error('Failed to share image');
    }
  }, [session]);

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <Button
        onClick={handleShare}
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-lg"
      >
        <Share2 className="w-4 h-4" /> Share as Image
      </Button>
    </>
  );
}
