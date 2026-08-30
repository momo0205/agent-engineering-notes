import agentLlmContextHarness from "../../content/articles/agent-llm-context-harness.md?raw";
import agentCheckpointRecovery from "../../content/articles/agent-checkpoint-recovery.md?raw";
import agentTraceObservability from "../../content/articles/agent-trace-observability.md?raw";
import m3FromDemoToService from "../../content/articles/m3-from-demo-to-service.md?raw";
import cloudflareComputerAgentDeployment from "../../content/articles/cloudflare-computer-agent-deployment.md?raw";
import agentBudgetAndUsage from "../../content/articles/agent-budget-and-usage.md?raw";
import boundedAgentLoop from "../../content/articles/bounded-agent-loop.md?raw";
import javaToAgent from "../../content/articles/java-to-agent.md?raw";
import javaVsPythonWorker from "../../content/articles/java-vs-python-worker.md?raw";
import stanceMisclassification from "../../content/articles/stance-misclassification.md?raw";

export const bundledArticleSources = {
  "agent-checkpoint-recovery.md": agentCheckpointRecovery,
  "agent-trace-observability.md": agentTraceObservability,
  "m3-from-demo-to-service.md": m3FromDemoToService,
  "cloudflare-computer-agent-deployment.md": cloudflareComputerAgentDeployment,
  "agent-budget-and-usage.md": agentBudgetAndUsage,
  "agent-llm-context-harness.md": agentLlmContextHarness,
  "bounded-agent-loop.md": boundedAgentLoop,
  "java-to-agent.md": javaToAgent,
  "java-vs-python-worker.md": javaVsPythonWorker,
  "stance-misclassification.md": stanceMisclassification,
} as const;
