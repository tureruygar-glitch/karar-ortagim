import { create } from "zustand";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import type { Decision, DecisionFormData, GeminiAnalysisResponse } from "../types";

interface DecisionState {
  decisions: Decision[];
  loading: boolean;
  error: string | null;
  subscribeToDecisions: (userId: string) => () => void;
  createDecision: (
    userId: string,
    formData: DecisionFormData,
    analysis: GeminiAnalysisResponse
  ) => Promise<string>;
  updateDecision: (id: string, data: Partial<Decision>) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
  recordRegret: (
    id: string,
    regretScore: number,
    regretNotes: string
  ) => Promise<void>;
}

const parseTimestamp = (ts: Timestamp | undefined): Date => {
  return ts ? ts.toDate() : new Date();
};

export const useDecisionStore = create<DecisionState>((set, get) => ({
  decisions: [],
  loading: false,
  error: null,

  subscribeToDecisions: (userId: string) => {
    const q = query(
      collection(db, "decisions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const decisions: Decision[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            voiceRecording: data.voiceRecording,
            values: data.values || [],
            analysis: data.analysis || "",
            followUpQuestions: data.followUpQuestions || [],
            status: data.status || "pending",
            choice: data.choice || "",
            regretScore: data.regretScore,
            regretNotes: data.regretNotes,
            createdAt: parseTimestamp(data.createdAt),
            updatedAt: parseTimestamp(data.updatedAt),
            reminderScheduledAt: parseTimestamp(data.reminderScheduledAt),
            remindedAt: data.remindedAt ? parseTimestamp(data.remindedAt) : undefined,
          } as Decision;
        });
        set({ decisions, loading: false, error: null });
      },
      (err) => {
        set({ error: err.message, loading: false });
      }
    );

    return unsubscribe;
  },

  createDecision: async (userId, formData, analysis) => {
    set({ loading: true, error: null });
    try {
      const reminderDate = new Date();
      reminderDate.setMonth(reminderDate.getMonth() + 3);

      const docRef = await addDoc(collection(db, "decisions"), {
        userId,
        title: formData.title,
        description: formData.description,
        voiceRecording: formData.voiceRecording,
        values: analysis.values,
        analysis: analysis.analysis,
        followUpQuestions: analysis.followUpQuestions,
        status: "pending",
        choice: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reminderScheduledAt: Timestamp.fromDate(reminderDate),
      });

      set({ loading: false });
      return docRef.id;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateDecision: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const ref = doc(db, "decisions", id);
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteDecision: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, "decisions", id));
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  recordRegret: async (id, regretScore, regretNotes) => {
    set({ loading: true, error: null });
    try {
      const ref = doc(db, "decisions", id);
      await updateDoc(ref, {
        regretScore,
        regretNotes,
        status: "completed",
        remindedAt: Timestamp.fromDate(new Date()),
        updatedAt: serverTimestamp(),
      });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));
