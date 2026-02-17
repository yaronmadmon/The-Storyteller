import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { Book, Chapter, Introduction } from "./types";

export interface FileStoreData {
  books: Record<string, Book>;
  chapters: Record<string, Chapter[]>;
  introductions: Record<string, Introduction>;
}

const DATA_DIR = join(process.cwd(), ".data");
const STORE_PATH = join(DATA_DIR, "store.json");

function defaultData(): FileStoreData {
  return { books: {}, chapters: {}, introductions: {} };
}

export async function loadStore(): Promise<FileStoreData> {
  try {
    const raw = await readFile(STORE_PATH, "utf-8");
    const data = JSON.parse(raw) as FileStoreData;
    return {
      books: data.books ?? {},
      chapters: data.chapters ?? {},
      introductions: data.introductions ?? {},
    };
  } catch {
    return defaultData();
  }
}

export async function saveStore(data: FileStoreData): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist store:", err);
  }
}
