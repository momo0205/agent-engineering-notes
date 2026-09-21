# Jev Research Topic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a six-chapter, evidence-graded Jev research topic on `notes.ironmao.com`, with an honest in-progress state, a practical API tutorial, and a versioned experiment plan.

**Architecture:** Reuse the site's existing topic pattern: Markdown is the source of chapter content, a typed registry owns metadata and ordering, and two Next/Vinext routes render the topic overview and chapter pages. Jev-specific evidence metadata remains in the registry and is rendered on both surfaces; the future Python experiment bench stays outside this repository and is referenced only after it exists.

**Tech Stack:** TypeScript 5.9, React 19, Vinext, raw Markdown imports, Vitest, Testing Library, existing `ArticleBody` and `renderMarkdown` utilities, OpenAI Sites hosting.

**Spec:** `docs/superpowers/specs/2026-09-20-jev-research-topic-design.md`

## Global Constraints

- Publish exactly six first-release chapters: `why-jev`, `capability-boundary`, `text-context-reasoning`, `benchmark-audit`, `quickstart`, and `experiment-plan`.
- Label vendor claims, official facts, third-party observations, local reproductions, provisional judgments, unresolved questions, and overturned claims distinctly; do not collapse them into a single confidence label.
- State that local Jev experiments have not started; never present planned measurements as completed results.
- Do not guess unpublished Jev architecture or RLCD mathematics.
- Do not claim “zero hallucination,” “absolute reliability,” or a universal `193.6×` / `444.6×` improvement.
- Keep API keys, private inputs, company data, personal data, and unredacted experiment traces out of source and generated pages.
- Keep the Python experiment bench outside the website build and outside this implementation plan's production files.
- Preserve the current visual system and responsive reading experience; no site redesign or new dependency.
- Use TDD for each behavior change and commit only explicit task files; leave the pre-existing untracked `.superpowers/` directory untouched.

## Review Focus

- Unknown chapter slugs must resolve through `notFound()` and must not receive misleading metadata; Task 3 pins this behavior.
- A chapter marked `experiment-pending` must visibly say that no local experiment has run; Tasks 1 and 3 pin this behavior.
- Benchmark copy must distinguish original claims, comparison arithmetic, and current interpretation; Task 1 pins all three markers.
- Quickstart examples must use placeholder environment-variable names and must never contain a key-shaped secret; Tasks 1 and 5 pin this behavior.
- Navigation, sitemap, and canonical metadata must expose all seven Jev routes without displacing existing topic routes; Task 4 pins this behavior.

---

### Task 1: Jev content registry and publication boundaries

**Files:**
- Create: `lib/content/jev-topic.ts`
- Create: `content/topics/jev/why-jev.md`
- Create: `content/topics/jev/capability-boundary.md`
- Create: `content/topics/jev/text-context-reasoning.md`
- Create: `content/topics/jev/benchmark-audit.md`
- Create: `content/topics/jev/quickstart.md`
- Create: `content/topics/jev/experiment-plan.md`
- Create: `tests/content/jev-topic.test.ts`

**Interfaces:**
- Produces: `EvidenceLevel`, `JevChapterStatus`, `JevTopicChapter`, `jevReviewedAt`, `jevModelVersion`, `jevChapters`, and `jevChapter(slug)`.
- `jevChapters` is an ordered readonly array used by every route and sitemap test.
- `jevChapter(slug: string): JevTopicChapter | undefined` is the only chapter lookup API.

- [ ] **Step 1: Write the failing registry and content-boundary tests**

Create `tests/content/jev-topic.test.ts` with assertions equivalent to:

```ts
import { describe, expect, it } from "vitest";
import {
  jevChapter,
  jevChapters,
  jevModelVersion,
  jevReviewedAt,
} from "../../lib/content/jev-topic";

const expectedSlugs = [
  "why-jev",
  "capability-boundary",
  "text-context-reasoning",
  "benchmark-audit",
  "quickstart",
  "experiment-plan",
];

describe("Jev research topic registry", () => {
  it("publishes the approved six chapters in order", () => {
    expect(jevChapters.map(({ slug }) => slug)).toEqual(expectedSlugs);
    expect(jevReviewedAt).toBe("2026-09-20");
    expect(jevModelVersion).toMatch(/jev/i);
    expect(jevChapter("why-jev")?.order).toBe("01");
    expect(jevChapter("missing")).toBeUndefined();
  });

  it("requires evidence and experiment metadata on every chapter", () => {
    for (const chapter of jevChapters) {
      expect(chapter.evidenceLevels.length).toBeGreaterThan(0);
      expect(chapter.reviewedAt).toMatch(/^2026-\d{2}-\d{2}$/);
      expect(["research", "verified", "experiment-pending"]).toContain(chapter.status);
      expect(chapter.body.length).toBeGreaterThan(800);
    }
  });

  it("keeps performance claims attached to their audit boundary", () => {
    const body = jevChapter("benchmark-audit")!.body;
    expect(body).toContain("原始声明");
    expect(body).toContain("计算口径");
    expect(body).toContain("当前判断");
    expect(body).toContain("不同的对照");
    expect(body).toContain("不是人工真值");
  });

  it("marks the experiment as planned rather than completed", () => {
    const body = jevChapter("experiment-plan")!.body;
    expect(body).toContain("实验尚未开始");
    expect(body).toContain("Shadow Mode");
    expect(body).not.toMatch(/我们已经证明|实验结果表明/);
  });

  it("documents safe key configuration without publishing a key", () => {
    const body = jevChapter("quickstart")!.body;
    expect(body).toContain("TYPESAFE_API_KEY");
    expect(body).toContain("环境变量");
    expect(body).not.toMatch(/(?:sk|ts)-[A-Za-z0-9_-]{20,}/);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- tests/content/jev-topic.test.ts
```

Expected: FAIL because `lib/content/jev-topic.ts` does not exist.

- [ ] **Step 3: Implement the typed registry**

Create `lib/content/jev-topic.ts` using raw Markdown imports and these exact public types:

```ts
export type EvidenceLevel =
  | "official-fact"
  | "vendor-claim"
  | "third-party"
  | "local-reproduction"
  | "provisional"
  | "unresolved"
  | "overturned";

export type JevChapterStatus = "research" | "verified" | "experiment-pending";

export type JevTopicChapter = {
  slug: string;
  order: string;
  title: string;
  summary: string;
  readingMinutes: number;
  status: JevChapterStatus;
  evidenceLevels: readonly EvidenceLevel[];
  reviewedAt: string;
  modelVersion: string;
  localExperiment: "not-started" | "completed";
  body: string;
};

export const jevReviewedAt = "2026-09-20";
export const jevModelVersion = "jev-1.13.0 / early access";
export const jevChapters: readonly JevTopicChapter[] = [/* six exact entries */];
export function jevChapter(slug: string): JevTopicChapter | undefined {
  return jevChapters.find((chapter) => chapter.slug === slug);
}
```

Use chapter titles:

1. `为什么研究一个不写文本的模型`
2. `Jev 是什么，不是什么`
3. `没有文本，它还在“思考”吗`
4. `审计 193.6×、444.6× 与 67.8%`
5. `从零开始调用 Jev`
6. `我们准备怎样验证它`

Set chapter 1–5 to `research`; set chapter 6 to `experiment-pending`. Set every `localExperiment` to `not-started` for the first release.

- [ ] **Step 4: Write the six first-release chapters**

Each Markdown file must use descriptive headings and source links near the claims they support.

`why-jev.md` must cover:

- runtime decisions versus human-facing prose;
- the user's concern that text may serve the model, not only the reader;
- the seven evidence levels;
- current provisional conclusion: Jev is a decision component, not an Agent replacement;
- the six-chapter reading path and open questions.

`capability-boundary.md` must cover:

- the official `state + typed questions -> typed probabilistic answers` contract;
- Choice, Score, and Noul;
- comparisons with rules, traditional classifiers, embeddings, reward models, and generative LLMs;
- type correctness versus semantic correctness;
- appropriate routing, scoring, gating, and classification use cases;
- inappropriate generation, open planning, deterministic-rule, and high-risk autonomous approval use cases.

`text-context-reasoning.md` must cover:

- input context, hidden representation, internal computation, visible Chain-of-Thought, and final text as separate layers;
- why no generated prose does not imply no computation;
- why the closed architecture prevents stronger claims;
- hypotheses that future context-density and question-decomposition experiments can test;
- a visible `未解决问题` section.

`benchmark-audit.md` must cover:

- official `193.6×`, `444.6×`, `67.8%`, `$0.0004`, and `0.4s` claims with dated sources;
- the fact that the two maximum multiples use different favorable comparators;
- the near-score Terra comparison (`67.9%`, `$0.0304`, `10.1s`) as approximately `76×` cost and `25×` latency, explicitly labeled as arithmetic over vendor data;
- reference answers derived from GPT-6 Astra and Claude Fable 5.1 rather than human ground truth;
- the difference between production-style workflow simulation and production traffic;
- sections named `原始声明`, `计算口径`, and `当前判断`.

`quickstart.md` must cover:

- TypeSafe early-access and Vercel AI Gateway paths;
- `python -m venv .venv`, activation, and `pip install typesafe-sdk`;
- `export TYPESAFE_API_KEY="[REDACTED]"` as a placeholder only;
- one minimal Choice example plus smaller Score and Noul examples based on official SDK shapes;
- timeout, rate-limit, invalid-answer-space, and missing-key handling;
- `.env` / GitHub Secret guidance and a warning that no local Jev call has yet been verified for this topic.

`experiment-plan.md` must cover:

- a prominent `实验尚未开始` notice;
- the fixed labels `search`, `code`, `database`, `human_review`;
- rule, DeepSeek structured-output, and Jev baselines;
- sample schema and manual labeling;
- accuracy, confusion matrix, precision/recall, Brier Score, calibration curve, P50/P95, cost, coverage, and business-impact metrics;
- offline evaluation, Shadow Mode, then high-confidence low-risk automation;
- fallback and version-change rules;
- the boundary between the website and future external Python bench.

- [ ] **Step 5: Run the focused content test and verify GREEN**

Run:

```bash
npm test -- tests/content/jev-topic.test.ts
```

Expected: PASS with all Jev registry and boundary tests green.

- [ ] **Step 6: Commit the content model**

```bash
git add lib/content/jev-topic.ts content/topics/jev tests/content/jev-topic.test.ts
git commit -m "content: add Jev research chapters"
```

---

### Task 2: Jev topic overview

**Files:**
- Create: `app/topics/jev/page.tsx`
- Create: `tests/pages/jev-topic.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `jevChapters`, `jevReviewedAt`, and `jevModelVersion` from Task 1.
- Produces: the static `/topics/jev` overview route and reusable Jev evidence/status classes used by Task 3.

- [ ] **Step 1: Write the failing overview-page test**

Create `tests/pages/jev-topic.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import JevTopicPage, { metadata } from "../../app/topics/jev/page";

describe("Jev research topic", () => {
  it("presents a six-chapter in-progress research path", () => {
    render(<JevTopicPage />);
    expect(screen.getByRole("heading", { name: "Jev：无文本决策模型研究" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(screen.getByText(/研究进行中/)).toBeInTheDocument();
    expect(screen.getByText(/实验尚未开始/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "开放问题" })).toBeInTheDocument();
  });

  it("publishes a route-specific canonical", () => {
    expect(metadata).toMatchObject({
      title: "Jev：无文本决策模型研究",
      alternates: { canonical: "/topics/jev" },
    });
  });
});
```

- [ ] **Step 2: Run the overview test and verify RED**

Run:

```bash
npm test -- tests/pages/jev-topic.test.tsx
```

Expected: FAIL because the overview route does not exist.

- [ ] **Step 3: Implement the overview route**

Build `app/topics/jev/page.tsx` with existing `topic-page`, `topic-hero`, `topic-facts`, `topic-map`, `topic-grid`, and `topic-note` patterns. Add these content blocks in order:

1. Hero with title, lead, `研究进行中`, `jev-1.13.0 / early access`, review date, and `实验尚未开始`.
2. `核心研究问题` containing the context/text/correctness concern.
3. `当前判断` with explicitly evidence-labeled statements.
4. Six chapter cards generated from `jevChapters`.
5. `开放问题` listing unpublished architecture, RLCD details, independent calibration, and generalization questions.
6. A research-policy note explaining that conclusions may change with evidence.

Do not hard-code six independent cards; map the registry so later chapters remain appendable.

- [ ] **Step 4: Add minimal Jev status styling**

In `app/globals.css`, add only reusable classes required for evidence badges, status rows, and the open-question panel. Extend the current color, spacing, border, and typography tokens; do not introduce a separate visual theme. Verify that badge text wraps and remains readable on narrow viewports.

- [ ] **Step 5: Run the overview test and verify GREEN**

Run:

```bash
npm test -- tests/pages/jev-topic.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the overview**

```bash
git add app/topics/jev/page.tsx app/globals.css tests/pages/jev-topic.test.tsx
git commit -m "feat: add Jev research overview"
```

---

### Task 3: Jev chapter route, evidence header, and chapter navigation

**Files:**
- Create: `app/topics/jev/[chapter]/page.tsx`
- Create: `tests/pages/jev-chapter.test.tsx`

**Interfaces:**
- Consumes: `jevChapter(slug)` and ordered `jevChapters` from Task 1, `renderMarkdown`, and `ArticleBody`.
- Produces: six static chapter routes, route metadata, previous/next navigation, and an evidence summary visible before article content.

- [ ] **Step 1: Write failing chapter-route tests**

Create `tests/pages/jev-chapter.test.tsx` to assert:

```tsx
expect(generateStaticParams()).toEqual([
  { chapter: "why-jev" },
  { chapter: "capability-boundary" },
  { chapter: "text-context-reasoning" },
  { chapter: "benchmark-audit" },
  { chapter: "quickstart" },
  { chapter: "experiment-plan" },
]);
```

For each slug, render the route and assert the chapter title, `证据级别`, `最近审阅`, `模型版本`, and the correct local experiment label. Assert that the first chapter has no previous link, the last has no next link, and a middle chapter links both directions. Assert metadata canonical paths use `/topics/jev/<slug>`. Mock `next/navigation.notFound` and assert an unknown slug invokes it and receives empty metadata.

- [ ] **Step 2: Run the chapter tests and verify RED**

Run:

```bash
npm test -- tests/pages/jev-chapter.test.tsx
```

Expected: FAIL because the dynamic Jev route does not exist.

- [ ] **Step 3: Implement the dynamic route**

Implement the same route functions used by existing topic chapters:

```ts
export function generateStaticParams()
export async function generateMetadata({ params }: Props)
export default async function JevChapterPage({ params }: Props)
```

Render:

- topic kicker and ordered title;
- summary;
- evidence/status definition list;
- `实验尚未开始` when `localExperiment === "not-started"`;
- Markdown body through `renderMarkdown` and `ArticleBody`;
- previous/next navigation derived from the registry index;
- return-to-topic link.

Do not duplicate title, summary, or evidence metadata in the Markdown files.

- [ ] **Step 4: Run the chapter tests and verify GREEN**

Run:

```bash
npm test -- tests/pages/jev-chapter.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the chapter route**

```bash
git add app/topics/jev/'[chapter]'/page.tsx tests/pages/jev-chapter.test.tsx
git commit -m "feat: render Jev research chapters"
```

---

### Task 4: Site discovery, canonical metadata, and sitemap integration

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `app/sitemap.ts`
- Modify: `tests/pages/static-routes.test.tsx`
- Modify: `tests/pages/routes.test.tsx`
- Modify: `tests/publishing/publishing-metadata.test.ts`

**Interfaces:**
- Consumes: the seven routes created by Tasks 2–3.
- Produces: a `Jev` primary-navigation entry, sitemap entries, skip-navigation coverage, and route-specific metadata coverage.

- [ ] **Step 1: Extend discovery tests before production code**

Update the site-header test table with:

```ts
["Jev", "/topics/jev"]
```

Add both Jev route source files to the skip-navigation source list. Add `/topics/jev` and its six chapters to the expected sitemap array. Extend publishing metadata tests to assert the overview and all six chapter titles/canonical paths are unique.

- [ ] **Step 2: Run affected tests and verify RED**

Run:

```bash
npm test -- tests/pages/static-routes.test.tsx tests/pages/routes.test.tsx tests/publishing/publishing-metadata.test.ts
```

Expected: FAIL because the header and sitemap do not yet expose Jev.

- [ ] **Step 3: Add the Jev navigation entry and sitemap routes**

Add `<a href="/topics/jev">Jev</a>` adjacent to the other topic links. Add all seven Jev paths to `STATIC_ROUTES` in reading order without removing or reordering unrelated existing routes.

- [ ] **Step 4: Run affected tests and verify GREEN**

Run the same command as Step 2. Expected: PASS.

- [ ] **Step 5: Commit discovery integration**

```bash
git add components/site-header.tsx app/sitemap.ts tests/pages/static-routes.test.tsx tests/pages/routes.test.tsx tests/publishing/publishing-metadata.test.ts
git commit -m "feat: link Jev research topic"
```

---

### Task 5: Public-content safety, source audit, and full verification

**Files:**
- Modify: `tests/content/jev-topic.test.ts`
- Modify: `tests/security/check-internal-links.test.ts` only if its route fixture is explicit and the new routes are not already discovered automatically.
- Modify: `docs/superpowers/plans/2026-09-20-jev-research-topic-implementation.md` only to tick completed checkboxes during execution.

**Interfaces:**
- Consumes: all Jev content and routes.
- Produces: a verified, reviewable release candidate; no new user-facing capability.

- [ ] **Step 1: Add claim-source and secret regression assertions**

Extend `tests/content/jev-topic.test.ts` so public payload assertions require official TypeSafe introduction/docs, the official SDK repository, and the TypeSafe workflow-eval source. Assert that:

```ts
const payload = jevChapters.map(({ body }) => body).join("\n");
expect(payload).toContain("https://typesafe.ai/");
expect(payload).toContain("https://docs.typesafe.ai/");
expect(payload).toContain("https://evals.typesafe.ai/");
expect(payload).not.toContain("paperDeepDive.v1");
expect(payload).not.toMatch(/(?:sk|ts)-[A-Za-z0-9_-]{20,}/);
expect(payload).not.toMatch(/零幻觉|绝对可靠/);
```

Use contextual language such as `厂商所称的“零幻觉”` only if the negative matcher is refined to permit quoted critique while rejecting an unqualified claim.

- [ ] **Step 2: Verify the strengthened test can catch a missing boundary**

Before changing production content, run the focused test. If it passes immediately, temporarily change one required marker in the test to a value known to be absent, confirm the expected assertion failure, restore the intended marker, and proceed. Do not retain the temporary mutation.

- [ ] **Step 3: Correct only content gaps exposed by the test**

If a required primary source or boundary is missing, edit the relevant Markdown paragraph. Do not add unrelated chapters, examples, design changes, or experimental claims.

- [ ] **Step 4: Run the full verification suite**

Run:

```bash
npm run verify
npm run typecheck
npm run lint
git diff --check
```

Expected:

- all Vitest files pass;
- sensitive-content scan passes;
- internal-link check passes;
- production build succeeds;
- TypeScript reports no errors;
- ESLint reports no errors;
- `git diff --check` produces no output.

- [ ] **Step 5: Start a production-mode local server and run route smoke checks**

Start the built site using the existing project script and verify HTTP 200 for:

```text
/topics/jev
/topics/jev/why-jev
/topics/jev/capability-boundary
/topics/jev/text-context-reasoning
/topics/jev/benchmark-audit
/topics/jev/quickstart
/topics/jev/experiment-plan
```

Inspect the overview and at least `text-context-reasoning`, `benchmark-audit`, and `quickstart` in a browser at desktop and narrow-mobile widths. Verify readable evidence badges, no horizontal overflow, visible in-progress state, and correct previous/next navigation.

- [ ] **Step 6: Commit release verification changes**

```bash
git add tests/content/jev-topic.test.ts tests/security/check-internal-links.test.ts docs/superpowers/plans/2026-09-20-jev-research-topic-implementation.md
git commit -m "test: verify Jev topic publication boundaries"
```

Omit files from `git add` when they were not changed.

---

### Task 6: Independent review, merge, push, and Sites publication

**Files:**
- No planned source file changes; review findings may require returning to the owning task.
- Package artifact: a temporary archive outside the repository.

**Interfaces:**
- Consumes: the verified release candidate from Task 5.
- Produces: reviewed commits on `main` and a successfully deployed public Sites version.

- [ ] **Step 1: Request an independent whole-branch review**

Give the reviewer the spec, plan, base SHA, head SHA, and these review priorities:

- technical accuracy and careful distinction between hidden computation and visible text;
- evidence labels and primary-source attribution;
- benchmark arithmetic and qualification;
- no overclaiming of experiments, architecture, or reliability;
- secret/privacy boundaries;
- route, metadata, navigation, and responsive behavior.

Fix every Critical and Important finding through the owning task's RED/GREEN cycle. Record or reject Minor findings with concrete reasoning.

- [ ] **Step 2: Re-run fresh release verification**

Run again after review fixes:

```bash
npm run verify
npm run typecheck
npm run lint
git diff --check
```

Do not rely on Task 5 output.

- [ ] **Step 3: Finish the development branch**

Use `superpowers:finishing-a-development-branch`. Merge only the Jev topic commits into `main`, preserving unrelated user changes and the untracked `.superpowers/` directory. Push `main` to `origin` and copy the full output of:

```bash
git rev-parse --verify HEAD
```

- [ ] **Step 4: Publish through the existing Sites project**

Use `.openai/hosting.json` and preserve the current public audience. Follow `sites:sites-hosting` exactly:

1. obtain or refresh the Sites source write credential;
2. push the exact verified commit to the configured Sites source branch;
3. package the exact committed build;
4. save a new site version using the full commit SHA;
5. deploy that saved version;
6. poll a non-terminal deployment to `succeeded` or `failed`.

- [ ] **Step 5: Verify the custom domain**

On `https://notes.ironmao.com`, verify:

- `/topics/jev` is public;
- all six chapter routes load;
- the header links to `Jev`;
- the benchmark audit visibly distinguishes claim, arithmetic, and judgment;
- quickstart contains placeholders but no real key;
- experiment plan visibly says `实验尚未开始`.

- [ ] **Step 6: Report the shipped scope honestly**

Report the public topic URL, chapter count, verification results, and commit. State that the research topic and tutorial framework are published, while real Jev API execution and the independent Python experiment bench remain the next phase.
