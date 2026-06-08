export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  minutes: number;
  priority: Priority;
  date: string;
  completed: boolean;
  completedAt?: string;
}

export interface ScheduleBlock {
  taskId: string;
  start: string;
  end: string;
  note: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  minutes: number;
  completedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Insight {
  headline: string;
  summary: string;
  recommendation: string;
}
