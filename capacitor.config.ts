import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.studykeeper',
  appName: 'Study Tracker',
  webDir: 'dist',
  server: {
    url: 'https://23e2624f-7b7d-44a5-8c16-788e4c47e273.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
