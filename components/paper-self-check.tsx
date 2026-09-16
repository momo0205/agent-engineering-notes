"use client";

import { useEffect, useState } from "react";
import {
  ALGORITHM_PROGRESS_CHANGE_EVENT,
  emptyProgress,
  readProgress,
  writeProgress,
  type ProgressV1,
  type StorageLike,
} from "../lib/algorithm-progress";
import type { SelfCheckQuestion } from "../lib/content/algorithm-foundations-topic";

export type { SelfCheckQuestion } from "../lib/content/algorithm-foundations-topic";

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function toggleMasteredCheck(progress: ProgressV1, chapter: string, questionId: string): ProgressV1 {
  const masteredChecks = progress.masteredChecks[chapter] ?? [];
  const nextMasteredChecks = masteredChecks.includes(questionId)
    ? masteredChecks.filter((id) => id !== questionId)
    : [...masteredChecks, questionId];

  return {
    ...progress,
    masteredChecks: {
      ...progress.masteredChecks,
      [chapter]: nextMasteredChecks,
    },
  };
}

export function PaperSelfCheck({
  chapter,
  questions,
  command,
  progress,
  onProgressChange,
  storage,
}: {
  chapter: string;
  questions: readonly SelfCheckQuestion[];
  command: string;
  progress?: ProgressV1;
  onProgressChange?: (nextProgress: ProgressV1) => void;
  storage?: StorageLike;
}) {
  const [storedProgress, setStoredProgress] = useState<ProgressV1>(emptyProgress);
  const [copyStatus, setCopyStatus] = useState("");
  const currentProgress = progress ?? storedProgress;

  useEffect(() => {
    if (progress !== undefined) return;

    const activeStorage = storage ?? browserStorage();
    const restoreTimer = activeStorage
      ? window.setTimeout(() => setStoredProgress(readProgress(activeStorage)), 0)
      : null;

    return () => {
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
    };
  }, [progress, storage]);

  const updateProgress = (nextProgress: ProgressV1) => {
    if (progress === undefined) {
      setStoredProgress(nextProgress);
      const activeStorage = storage ?? browserStorage();
      if (activeStorage) writeProgress(activeStorage, nextProgress);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent<ProgressV1>(ALGORITHM_PROGRESS_CHANGE_EVENT, { detail: nextProgress }));
      }
    }
    onProgressChange?.(nextProgress);
  };

  const copyCommand = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(command);
      setCopyStatus("已复制命令");
    } catch {
      setCopyStatus("复制失败，请手动选择");
    }
  };

  const mastered = currentProgress.masteredChecks[chapter] ?? [];

  return (
    <section className="paper-self-check" aria-labelledby={`paper-self-check-${chapter}`}>
      <h2 id={`paper-self-check-${chapter}`}>自测与下一步</h2>
      <p>先自己回答，再展开答案核对；标记“已掌握”只记录在当前浏览器的自测进度中。</p>
      {questions.map((question) => {
        const checkboxId = `paper-self-check-${chapter}-${question.id}`;
        return (
          <div key={question.id} className="paper-self-check-question">
            <details>
              <summary>{question.prompt}</summary>
              <p>{question.answer}</p>
            </details>
            <label htmlFor={checkboxId}>
              <input
                id={checkboxId}
                type="checkbox"
                checked={mastered.includes(question.id)}
                onChange={() => updateProgress(toggleMasteredCheck(currentProgress, chapter, question.id))}
              />
              我已能回答：{question.prompt}
            </label>
          </div>
        );
      })}
      <button type="button" onClick={copyCommand}>复制复现命令</button>
      <p role="status" aria-live="polite">{copyStatus}</p>
    </section>
  );
}
