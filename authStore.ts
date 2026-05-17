import { create } from "zustand";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../services/firebase";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  initAuth: () => {
    onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        set({
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "",
            createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
          },
          initialized: true,
        });
      } else {
        set({ user: null, initialized: true });
      }
    });
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const u = cred.user;
      set({
        user: {
          id: u.uid,
          email: u.email || "",
          displayName: u.displayName || "",
          createdAt: new Date(u.metadata.creationTime || Date.now()),
        },
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, displayName: string) => {
    set({ loading: true });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await cred.user.updateProfile({ displayName });
      set({
        user: {
          id: cred.user.uid,
          email: cred.user.email || "",
          displayName,
          createdAt: new Date(),
        },
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));
