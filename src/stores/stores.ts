/**
 * stores/stores.ts
 *
 * Zustand stores (no Redux) — same split as mobile/admin:
 *   useAuthStore   — authentication, session
 *   useParentStore — the logged-in parent's own profile
 *   useAppStore    — theme/language preferences
 */

import { create } from "zustand";
import {
  StorageManager,
  AppStore,
  SecureStore,
  type PersistedSession,
  type Parent,
} from "@/storage/storage";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH STORE
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  parentId: string | null;
  schoolId: string | null;
  isInitializing: boolean;
  error: string | null;

  initialize: () => void;
  login: (
    session: PersistedSession,
    rememberMe: boolean,
    credentials?: { email: string; password: string },
  ) => void;
  logout: () => void;
  completeLogout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  parentId: null,
  schoolId: null,
  isInitializing: true,
  error: null,

  initialize: () => {
    const session = AppStore.getSession();
    const token = SecureStore.getToken();
    const parentId = SecureStore.getParentId();

    if (session && token && parentId) {
      set({
        isAuthenticated: true,
        token,
        parentId,
        schoolId: session.schoolId,
        isInitializing: false,
        error: null,
      });
    } else {
      set({
        isAuthenticated: false,
        token: null,
        parentId: null,
        schoolId: null,
        isInitializing: false,
      });
    }
  },

  login: (session, rememberMe, credentials) => {
    StorageManager.saveLoginData(session, rememberMe, credentials);
    set({
      isAuthenticated: true,
      token: session.token,
      parentId: session.parentId,
      schoolId: session.schoolId,
      error: null,
    });
  },

  logout: () => {
    StorageManager.logout();
    set({ isAuthenticated: false, token: null, parentId: null, schoolId: null });
  },

  completeLogout: () => {
    StorageManager.completeLogout();
    set({ isAuthenticated: false, token: null, parentId: null, schoolId: null });
  },

  clearError: () => set({ error: null }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// PARENT PROFILE STORE
// ─────────────────────────────────────────────────────────────────────────────

interface ParentState {
  profile: Parent | null;
  setProfile: (profile: Parent | null) => void;
  clearProfile: () => void;
}

export const useParentStore = create<ParentState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// APP STORE
// ─────────────────────────────────────────────────────────────────────────────

interface AppState {
  theme: "light" | "dark";
  language: string;
  initialize: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  language: "en",

  initialize: () => {
    set({ theme: AppStore.getTheme(), language: AppStore.getLanguage() });
  },

  setTheme: (theme) => {
    AppStore.saveTheme(theme);
    set({ theme });
  },

  setLanguage: (language) => {
    AppStore.saveLanguage(language);
    set({ language });
  },
}));
