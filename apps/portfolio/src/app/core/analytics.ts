import { track } from '@vercel/analytics';

export type CvDownloadSource = 'profile' | 'footer';

export function trackCvDownload(source: CvDownloadSource): void {
  track('cv_download', { source });
}
