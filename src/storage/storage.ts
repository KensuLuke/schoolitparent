/**
 * storage.ts
 *
 * Single source of truth for:
 *   1. TypeScript types mirrored from the GraphQL schema (parent-app slice)
 *   2. Storage keys and helpers
 *
 * Storage engine copied verbatim from mobile/admin/src/storage/storage.ts —
 * same AsyncStorage-backed in-memory cache, same SecureStore/AppStore split.
 * Per CLAUDE.md: "Same platform choices as staff mobile unless there's a
 * specific reason to diverge" — there's no reason to diverge here.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const _cache = new Map<string, string>();
let _hydrated = false;

export async function hydrateStorage(): Promise<void> {
  if (_hydrated) return;
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys as string[]);
    for (const [k, v] of pairs) {
      if (v != null) _cache.set(k, v);
    }
  } catch (e) {
    console.warn("[Storage] Hydration failed:", e);
  } finally {
    _hydrated = true;
  }
}

function _set(key: string, value: string): void {
  _cache.set(key, value);
  AsyncStorage.setItem(key, value).catch((e) =>
    console.warn("[Storage] Write failed:", key, e),
  );
}

function _get(key: string): string | undefined {
  return _cache.get(key);
}

function _delete(key: string): void {
  _cache.delete(key);
  AsyncStorage.removeItem(key).catch((e) =>
    console.warn("[Storage] Delete failed:", key, e),
  );
}

function _clear(prefix?: string): void {
  if (prefix) {
    for (const k of _cache.keys()) {
      if (k.startsWith(prefix)) {
        _cache.delete(k);
        AsyncStorage.removeItem(k).catch(() => {});
      }
    }
  } else {
    _cache.clear();
    AsyncStorage.clear().catch(() => {});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  (mirrored from the GraphQL schema — see server/graphQl/typeDefs)
// ─────────────────────────────────────────────────────────────────────────────

export enum ParentStudentLinkStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum ParentStudentLinkRelationship {
  MOTHER = "MOTHER",
  FATHER = "FATHER",
  GUARDIAN = "GUARDIAN",
  OTHER = "OTHER",
}

export enum ReportType {
  WEEKLY = "WEEKLY",
  MID_TERM = "MID_TERM",
  TERMINAL = "TERMINAL",
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  school: string;
  isActive?: boolean;
  lastLogin?: string | null;
}

export interface StudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  image?: string | null;
  class?: { id: string; name?: string | null } | null;
}

export interface ParentStudentLink {
  id: string;
  parent: string;
  student: StudentSummary | null;
  school: string;
  relationship: ParentStudentLinkRelationship;
  status: ParentStudentLinkStatus;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string | null;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  reason?: string | null;
}

export interface GradeRecord {
  id: string;
  percentage?: number | null;
  subject?: { id: string; name: string } | null;
  term?: { id: string; name?: string | null } | null;
  createdAt?: string | null;
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  message?: string | null;
  createdAt?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHOOLIT SOCIAL — mirrors server/graphQl/typeDefs/socialPostTypedefs.js.
// Explore tab feed only (browse/react/vote) — this app never authors posts.
// ─────────────────────────────────────────────────────────────────────────────

export type FeedTab = "FOR_YOU" | "RECOMMENDED";
export type FeedEntryKind = "INTERNAL_EVENT" | "SOCIAL_POST";

export interface SocialPostUpdateItem {
  id: string;
  media: string;
  caption?: string | null;
  postedAt: string;
  statusAtPost?: string | null;
}

export interface SocialPostVoteNominee {
  id: string;
  nominee: unknown;
  voteCount: number;
  isDisqualified: boolean;
}

export interface SocialPostVoteSession {
  id: string;
  title?: string | null;
  status: string;
  duration: { start: string; end?: string | null };
  nominees: SocialPostVoteNominee[];
}

export interface SocialPost {
  id: string;
  title: string;
  description: string;
  type: string;
  customTypeLabel?: string | null;
  school: { id: string; name?: string | null };
  isPublic: boolean;
  isPublished: boolean;
  status: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  coverImage?: string | null;
  updates: SocialPostUpdateItem[];
  reactionCount: number;
  viewerHasReacted: boolean;
  isBoosted: boolean;
  boostExpiresAt?: string | null;
  voteSessions: SocialPostVoteSession[];
  createdAt: string;
}

export interface FeedEntry {
  kind: FeedEntryKind;
  tier: number;
  event?: { id: string; title: string; image?: string | null } | null;
  post?: SocialPost | null;
}

export interface SocialPostFeedInput {
  school: string;
  tab?: FeedTab;
  page?: number;
  limit?: number;
}

export interface SocialPostFeedResult {
  items: FeedEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface WeeklyReportRecord {
  id: string;
  weekStart: string;
  weekEnd: string;
  status: string;
  overallPerformance?: string | null;
  teacherComments?: string | null;
  parentComments?: string | null;
  parentRating?: number | null;
  acknowledgedAt?: string | null;
}

export interface MidTermReportRecord {
  id: string;
  status: string;
  teacherComments?: string | null;
  parentComments?: string | null;
  parentRating?: number | null;
  acknowledgedAt?: string | null;
  createdAt?: string | null;
}

export interface TerminalReportRecord {
  id: string;
  status: string;
  remarks?: { academicSummary?: string | null; behavioralNote?: string | null } | null;
  parentFeedback?: string | null;
  parentRating?: number | null;
  acknowledgedAt?: string | null;
}

export interface AcknowledgmentResult {
  id: string;
  reportType: ReportType;
  status: string;
  acknowledgedAt?: string | null;
  parentRating?: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS — mirrors server/models/Notification.js. recipient/entity are
// opaque JSON on the server (DynamicRef) — entity is typed loosely here since
// its shape depends on entity.model (WeeklyReport/Announcement/Attendance/...).
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationType = "INFO" | "REMINDER" | "ALERT";

export interface NotificationEntityRef {
  id: string;
  model: string;
}

export interface AppNotification {
  id: string;
  title?: string;
  message?: string;
  type?: NotificationType;
  channel?: string[];
  isRead: boolean;
  entity?: NotificationEntityRef | null;
  createdAt: string;
}

export interface NotificationPageResult {
  items: AppNotification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  cursor?: string | null;
}

export interface PersistedSession {
  token: string;
  parentId: string;
  name: string;
  email: string;
  schoolId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE KEYS
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  AUTH_TOKEN: "auth_token",
  PARENT_ID: "auth_parent_id",
  PARENT_CREDENTIALS: "auth_credentials",
  SESSION: "app_session",
  THEME: "app_theme",
  LANGUAGE: "app_language",
  REMEMBER_ME: "app_remember_me",
};

export const SecureStore = {
  saveToken: (token: string) => _set(KEYS.AUTH_TOKEN, token),
  getToken: (): string | undefined => _get(KEYS.AUTH_TOKEN),

  saveParentId: (id: string) => _set(KEYS.PARENT_ID, id),
  getParentId: (): string | undefined => _get(KEYS.PARENT_ID),

  saveCredentials: (email: string, password: string) =>
    _set(KEYS.PARENT_CREDENTIALS, JSON.stringify({ email, password })),

  getCredentials: (): { email: string; password: string } | null => {
    const raw = _get(KEYS.PARENT_CREDENTIALS);
    return raw ? JSON.parse(raw) : null;
  },

  clearCredentials: () => _delete(KEYS.PARENT_CREDENTIALS),

  clearAll: () => _clear("auth_"),
};

export const AppStore = {
  saveSession: (session: PersistedSession) =>
    _set(KEYS.SESSION, JSON.stringify(session)),

  getSession: (): PersistedSession | null => {
    const raw = _get(KEYS.SESSION);
    return raw ? JSON.parse(raw) : null;
  },

  clearSession: () => _delete(KEYS.SESSION),

  saveTheme: (theme: "light" | "dark") => _set(KEYS.THEME, theme),
  getTheme: (): "light" | "dark" => (_get(KEYS.THEME) as "light" | "dark") ?? "light",

  saveLanguage: (lang: string) => _set(KEYS.LANGUAGE, lang),
  getLanguage: (): string => _get(KEYS.LANGUAGE) ?? "en",

  setRememberMe: (value: boolean) => _set(KEYS.REMEMBER_ME, value ? "true" : "false"),
  getRememberMe: (): boolean => _get(KEYS.REMEMBER_ME) === "true",
};

export const StorageManager = {
  saveLoginData: (
    session: PersistedSession,
    rememberMe: boolean,
    credentials?: { email: string; password: string },
  ) => {
    SecureStore.saveToken(session.token);
    SecureStore.saveParentId(session.parentId);
    AppStore.saveSession(session);
    AppStore.setRememberMe(rememberMe);
    if (rememberMe && credentials) {
      SecureStore.saveCredentials(credentials.email, credentials.password);
    } else {
      SecureStore.clearCredentials();
    }
  },

  /** Soft logout — keeps remember-me credentials */
  logout: () => {
    _delete(KEYS.AUTH_TOKEN);
    _delete(KEYS.PARENT_ID);
    AppStore.clearSession();
  },

  /** Complete logout — wipes everything including saved credentials */
  completeLogout: () => {
    SecureStore.clearAll();
    AppStore.clearSession();
  },
};
