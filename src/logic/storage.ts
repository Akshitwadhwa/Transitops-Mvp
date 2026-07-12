import type { AppData } from "../types";
import { seedData } from "../data/seed";

const STORAGE_KEY = "transitops-mvp-data";

export function loadData(): AppData {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return seedData;

  try {
    return JSON.parse(stored) as AppData;
  } catch {
    return seedData;
  }
}

export function saveData(data: AppData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetData() {
  window.localStorage.removeItem(STORAGE_KEY);
  return seedData;
}
