export const ALGORITHM_PROGRESS_STORAGE_KEY = "agent-engineering-notes:algorithm-foundations:v1";

export const ALGORITHM_PROGRESS_CHAPTER_IDS = ["resnet", "transformer", "ddpm"] as const;
export const ALGORITHM_PROGRESS_STEP_IDS = [
  "question",
  "skim",
  "derive",
  "reproduce",
  "experiment",
  "self-check",
] as const;

export type AlgorithmProgressChapterId = (typeof ALGORITHM_PROGRESS_CHAPTER_IDS)[number];
export type AlgorithmProgressStepId = (typeof ALGORITHM_PROGRESS_STEP_IDS)[number];

export type ProgressV1 = {
  version: 1;
  completed: Record<string, string[]>;
  masteredChecks: Record<string, string[]>;
};

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function emptyProgress(): ProgressV1 {
  return { version: 1, completed: {}, masteredChecks: {} };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function isChapterId(value: string): value is AlgorithmProgressChapterId {
  return (ALGORITHM_PROGRESS_CHAPTER_IDS as readonly string[]).includes(value);
}

function isStepId(value: string): value is AlgorithmProgressStepId {
  return (ALGORITHM_PROGRESS_STEP_IDS as readonly string[]).includes(value);
}

function isMasteredCheckId(value: string): boolean {
  return /^[a-z][a-z0-9-]{0,63}$/.test(value);
}

function isIdentifierRecord(value: unknown, isIdentifier: (identifier: string) => boolean): value is Record<string, string[]> {
  if (!isPlainRecord(value)) return false;

  return Object.entries(value).every(([chapter, identifiers]) => (
    isChapterId(chapter)
    && Array.isArray(identifiers)
    && identifiers.every((identifier) => typeof identifier === "string" && isIdentifier(identifier))
    && new Set(identifiers).size === identifiers.length
  ));
}

function isProgressV1(value: unknown): value is ProgressV1 {
  if (!isPlainRecord(value)) return false;
  const keys = Object.keys(value).sort();

  return keys.length === 3
    && keys[0] === "completed"
    && keys[1] === "masteredChecks"
    && keys[2] === "version"
    && value.version === 1
    && isIdentifierRecord(value.completed, isStepId)
    && isIdentifierRecord(value.masteredChecks, isMasteredCheckId);
}

function removeTopicProgress(storage: StorageLike): void {
  try {
    storage.removeItem(ALGORITHM_PROGRESS_STORAGE_KEY);
  } catch {
    // Browser privacy settings can reject storage cleanup; the in-memory fallback remains usable.
  }
}

export function readProgress(storage: StorageLike): ProgressV1 {
  let serialized: string | null;

  try {
    serialized = storage.getItem(ALGORITHM_PROGRESS_STORAGE_KEY);
  } catch {
    return emptyProgress();
  }

  if (serialized === null) return emptyProgress();

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (isProgressV1(parsed)) return parsed;
  } catch {
    // Invalid JSON is treated the same as an incompatible schema below.
  }

  removeTopicProgress(storage);
  return emptyProgress();
}

export function writeProgress(storage: StorageLike, value: ProgressV1): boolean {
  if (!isProgressV1(value)) return false;

  try {
    storage.setItem(ALGORITHM_PROGRESS_STORAGE_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function resetProgress(storage: StorageLike): void {
  removeTopicProgress(storage);
}
