import { Capacitor, registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
export interface UpdateInfo { currentVersion: string; currentVersionCode: number; available: boolean; latestVersion: string; notes: string; }
interface Updater {
  check(): Promise<UpdateInfo>;
  downloadAndInstall(): Promise<{ status: 'permissionRequired' | 'installerOpened' }>;
  installDownloaded(): Promise<{ status: 'permissionRequired' | 'installerOpened' }>;
  addListener(event: 'downloadProgress', callback: (event: { percent: number }) => void): Promise<PluginListenerHandle>;
}
export const AppUpdater = registerPlugin<Updater>('AppUpdater');
export const supportsNativeUpdates = () => Capacitor.getPlatform() === 'android' && Capacitor.isPluginAvailable('AppUpdater');
