export type ReadingPathStep = {
  title: string;
  description: string;
  status: "已记录" | "正在学习" | "待探索";
};

export function ReadingPath({ steps }: { steps: readonly ReadingPathStep[] }) {
  return (
    <ol className="reading-path" aria-label="Agent 工程学习顺序">
      {steps.map((step, index) => (
        <li key={step.title} className="reading-path-step">
          <div className="reading-path-number" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <p className="path-status">{step.status}</p>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
