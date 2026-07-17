export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface PracticeAttempt {
  moduleIndex: number; // 0 to 3
  dayIndex: number;    // 0 to 4
  score: number;       // percentage (0-100)
  totalQuestions: number;
  correctAnswers: number;
  date: string;
}

export interface ExamAttempt {
  id: string;
  type: 'module' | 'simulation';
  moduleIndex?: number; // defined if type is 'module'
  score: number;        // percentage
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  answers: { [questionId: string]: string }; // user selections, e.g., 'a', 'b'
}

export interface UserProgress {
  userId: string;
  completedTheory: string[]; // List of "M{index}-D{index}" completed
  practiceAttempts: { [key: string]: PracticeAttempt[] }; // key: "M{index}-D{index}"
  masteredPractice?: string[]; // List of "M{index}-D{index}" that reached 100% on a practice attempt at least once
  examAttempts: ExamAttempt[];
  googleSheetUrl?: string;
  lastSyncedAt?: string;
}

export interface Question {
  id: string;
  moduleIndex: number; // 0 to 3
  dayIndex?: number;   // 0 to 4 (undefined for general review exams)
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: 'a' | 'b' | 'c' | 'd';
  explanation: string;
}

export interface TheoryDay {
  title: string;
  focus: string;
  cheatSheet: string[];
  practiceQuestions: Question[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  duration: string;
  description: string;
  /** Object path (not a URL) inside the Firebase Storage bucket, e.g. "El_Marco_Gramatical_B2.mp4" */
  audioStoragePath?: string;
  transcript: { speaker: string; text: string }[];
}

export interface ModuleData {
  index: number;
  title: string;
  description: string;
  days: TheoryDay[];
  resources: {
    id: string;
    name: string;
    description: string;
    fileSize: string;
    type: 'pdf' | 'spreadsheet' | 'audio';
    content: string;
  }[];
  podcastEpisodes: PodcastEpisode[];
  controlExam: Question[];
}
