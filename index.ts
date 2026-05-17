export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export interface Decision {
  id: string;
  userId: string;
  title: string;
  description: string;
  voiceRecording?: string;
  values: ValueTag[];
  analysis: string;
  followUpQuestions: string[];
  status: "pending" | "made" | "completed";
  choice: string;
  regretScore?: number;
  regretNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  reminderScheduledAt: Date;
  remindedAt?: Date;
}

export interface ValueTag {
  name: string;
  score: number;
  icon: string;
}

export interface DecisionFormData {
  title: string;
  description: string;
  voiceRecording?: string;
}

export interface GeminiAnalysisResponse {
  values: ValueTag[];
  analysis: string;
  followUpQuestions: string[];
}

export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  NewDecision: undefined;
  DecisionDetail: { decisionId: string };
  Values: undefined;
};
