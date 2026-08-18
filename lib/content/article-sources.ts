import agentLlmContextHarness from "../../content/articles/agent-llm-context-harness.md?raw";
import boundedAgentLoop from "../../content/articles/bounded-agent-loop.md?raw";
import javaToAgent from "../../content/articles/java-to-agent.md?raw";
import javaVsPythonWorker from "../../content/articles/java-vs-python-worker.md?raw";
import stanceMisclassification from "../../content/articles/stance-misclassification.md?raw";

export const bundledArticleSources = {
  "agent-llm-context-harness.md": agentLlmContextHarness,
  "bounded-agent-loop.md": boundedAgentLoop,
  "java-to-agent.md": javaToAgent,
  "java-vs-python-worker.md": javaVsPythonWorker,
  "stance-misclassification.md": stanceMisclassification,
} as const;
