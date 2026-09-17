"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALGORITHM_PROGRESS_CHANGE_EVENT,
  ALGORITHM_PROGRESS_STORAGE_KEY,
  ALGORITHM_PROGRESS_STEP_IDS,
  emptyProgress,
  readProgress,
  writeProgress,
  type AlgorithmProgressStepId,
  type ProgressV1,
  type StorageLike,
} from "../lib/algorithm-progress";

const TOTAL_STEPS = 18;

const stepLabels: Record<AlgorithmProgressStepId, string> = {
  question: "带着核心问题开始",
  skim: "通读原文并标记关键段落",
  derive: "完成必要的推导",
  reproduce: "运行最小复现",
  experiment: "解释对照实验",
  "self-check": "完成自测",
};

function browserStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isProgressStorageEvent(event: Event, activeStorage: StorageLike | null): boolean {
  try {
    const storageEvent = event as StorageEvent;
    if (
      event.type !== "storage"
      || (storageEvent.key !== ALGORITHM_PROGRESS_STORAGE_KEY && storageEvent.key !== null)
    ) {
      return false;
    }

    const localStorage = browserStorage();
    if (localStorage && storageEvent.storageArea !== localStorage) return false;
    if (activeStorage && storageEvent.storageArea !== activeStorage) return false;
    return activeStorage !== null;
  } catch {
    return false;
  }
}

function completedStepCount(progress: ProgressV1): number {
  return Object.values(progress.completed).reduce((total, steps) => total + steps.length, 0);
}

function toggleStep(progress: ProgressV1, chapter: string, step: AlgorithmProgressStepId): ProgressV1 {
  const completed = progress.completed[chapter] ?? [];
  const nextCompleted = completed.includes(step)
    ? completed.filter((completedStep) => completedStep !== step)
    : [...completed, step];

  return {
    ...progress,
    completed: {
      ...progress.completed,
      [chapter]: nextCompleted,
    },
  };
}

export function AlgorithmProgress({
  chapter,
  chapterName,
  storage,
}: {
  chapter?: string;
  chapterName?: string;
  storage?: StorageLike;
}) {
  const storageRef = useRef<StorageLike | null>(null);
  const [progress, setProgress] = useState<ProgressV1>(emptyProgress);

  useEffect(() => {
    const activeStorage = storage ?? browserStorage();
    storageRef.current = activeStorage;
    const restoreTimer = activeStorage
      ? window.setTimeout(() => setProgress(readProgress(activeStorage)), 0)
      : null;

    const synchronize = (event: Event) => {
      if (storageRef.current) {
        setProgress(readProgress(storageRef.current));
      } else if (event instanceof CustomEvent) {
        setProgress(event.detail as ProgressV1);
      }
    };
    const synchronizeStorage = (event: Event) => {
      if (storageRef.current && isProgressStorageEvent(event, storageRef.current)) {
        setProgress(readProgress(storageRef.current));
      }
    };
    window.addEventListener(ALGORITHM_PROGRESS_CHANGE_EVENT, synchronize);
    window.addEventListener("storage", synchronizeStorage);
    return () => {
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
      window.removeEventListener(ALGORITHM_PROGRESS_CHANGE_EVENT, synchronize);
      window.removeEventListener("storage", synchronizeStorage);
    };
  }, [storage]);

  const saveProgress = (nextProgress: ProgressV1) => {
    setProgress(nextProgress);
    const persisted = storageRef.current && writeProgress(storageRef.current, nextProgress);
    if (!persisted) {
      storageRef.current = null;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<ProgressV1>(ALGORITHM_PROGRESS_CHANGE_EVENT, { detail: nextProgress }));
    }
  };

  if (!chapter) {
    return (
      <div role="status">
        <strong>{completedStepCount(progress)} / {TOTAL_STEPS} 个学习步骤已完成</strong>
        <p>进度仅保存在当前浏览器，不会同步到账号或其他设备。</p>
        <p>如果浏览器存储不可用，勾选仍会保留在当前页面会话。</p>
      </div>
    );
  }

  const completed = progress.completed[chapter] ?? [];

  return (
    <section className="algorithm-chapter-progress" aria-labelledby={`algorithm-progress-${chapter}`}>
      <h2 id={`algorithm-progress-${chapter}`}>{chapterName ?? chapter} 学习检查</h2>
      <p>进度仅保存在当前浏览器</p>
      <div className="algorithm-progress-checklist">
        {ALGORITHM_PROGRESS_STEP_IDS.map((step) => {
          const id = `algorithm-progress-${chapter}-${step}`;
          return (
            <label key={step} htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                data-step-id={step}
                checked={completed.includes(step)}
                onChange={() => saveProgress(toggleStep(progress, chapter, step))}
              />
              {stepLabels[step]}
            </label>
          );
        })}
      </div>
    </section>
  );
}
