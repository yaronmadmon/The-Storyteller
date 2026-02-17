import type { BookType } from "./templates";

export type ChapterStatus = "draft" | "complete";
export type StyleOption = "default" | "casual" | "formal" | "humor" | "darker" | "simplify";

export type PublishStatus = "draft" | "in_review" | "published";

export interface Book {
  id: string;
  user_id: string;
  type: BookType;
  description: string;
  mode: BookType;
  created_at: string;
  updated_at: string;
  title?: string | null;
  subtitle?: string | null;
  author_name_override?: string | null;
  cover_url?: string | null;
  publish_status?: PublishStatus;
}

export interface ChapterVersion {
  at: string;
  polished: string;
}

export interface Chapter {
  id: string;
  book_id: string;
  number: number;
  title: string;
  instructions: string;
  checklist: string[];
  transcription: string | null;
  polished: string | null;
  style: StyleOption;
  word_count: number | null;
  status: ChapterStatus;
  created_at: string;
  updated_at: string;
  versions?: ChapterVersion[];
}

export interface Introduction {
  id: string;
  book_id: string;
  answers: Record<string, string>;
  created_at: string;
  updated_at: string;
}
