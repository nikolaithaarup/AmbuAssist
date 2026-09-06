import type { SessionLookupResult } from "./types";

export function loadAmbuAssistSession(): Promise<SessionLookupResult>;
export function saveLegacyBamProfile(bamId: string): Promise<void>;
export function getPortalLoginUrl(returnTo?: string): string;
export function captureRequestedUrl(force?: boolean): void;

export function restoreRequestedUrl(): void;
