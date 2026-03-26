import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
import { getSessions, getTotals } from './sessions';

interface StudyWidgetPlugin {
  updateWidget(data: {
    totalStudied: number;
    totalWasted: number;
    totalBreaks: number;
    totalSessions: number;
  }): Promise<void>;
}

const StudyWidget = registerPlugin<StudyWidgetPlugin>('StudyWidget');

export async function syncWidgetData() {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const sessions = getSessions();
    const totals = getTotals(sessions);
    await StudyWidget.updateWidget({
      totalStudied: totals.totalStudied,
      totalWasted: totals.totalWasted,
      totalBreaks: totals.totalBreaks,
      totalSessions: totals.totalSessions,
    });
  } catch (e) {
    console.warn('Widget update failed:', e);
  }
}
