# Algorithm Foundations Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a five-page, lightly interactive “算法原理与复现” topic on `notes.ironmao.com`, enriched with curated material from the local paper workbench and backed by an immutable public `paper-deep-dive` revision.

**Architecture:** Add a topic-specific content registry and routes following the established DeepSeek Harness topic pattern, while reusing the existing Markdown renderer, layout, link checks, secret scan, and Sites deployment. Curate prerequisites, question trees, experiment explanations, self-checks, and original section-by-section study guides from the updated local workbench without publishing full-paper translations, embedded paper images, private notes, or a second state model. A small client component owns versioned local progress and self-test disclosure state; all article content remains readable without JavaScript, GitHub, or arXiv availability.

**Tech Stack:** React 19, TypeScript 5.9, vinext/Vite, Vitest, Testing Library, Markdown source files, browser `localStorage`, Sites hosting.

**Spec:** `docs/superpowers/specs/2026-09-16-algorithm-foundations-topic-design.md`

## Global Constraints

- Begin only after `https://github.com/momo0205/paper-deep-dive` is public and its reference commit is known.
- Routes are exactly `/topics/algorithm-foundations`, `/reading-method`, `/resnet`, `/transformer`, and `/ddpm` under that topic.
- Initial statuses are ResNet `learning`, Transformer `framework`, and DDPM `framework`.
- The topic homepage uses course order as the primary hierarchy and the knowledge relationship as a secondary section.
- Never host an unlicensed paper PDF; use official arXiv links or embeds with a normal-link fallback.
- Local state key is exactly `agent-engineering-notes:algorithm-foundations:v1`.
- Do not store free-text notes or transmit local progress.
- Do not copy the local workbench's full Chinese translations, Base64 images, paper figures, private textareas, or `paperDeepDive.v1` state model into the public site.
- Each paper page follows the seven-layer structure: prerequisites, core question, original section-by-section study guide, formulas/structure, minimal reproduction, self-check/boundaries, and one-page summary.
- Every numeric experiment statement links to or names the bound repository commit and its environment.
- Every task follows RED → GREEN → REFACTOR and ends in its own commit.

---

## File Map

```text
content/topics/algorithm-foundations/
├── reading-method.md
├── resnet.md
├── transformer.md
└── ddpm.md
lib/content/algorithm-foundations-topic.ts
components/algorithm-progress.tsx
components/paper-self-check.tsx
app/topics/algorithm-foundations/page.tsx
app/topics/algorithm-foundations/[chapter]/page.tsx
tests/content/algorithm-foundations-topic.test.ts
tests/components/algorithm-progress.test.tsx
tests/components/paper-self-check.test.tsx
tests/pages/algorithm-foundations-topic.test.tsx
tests/pages/algorithm-foundations-chapter.test.tsx
tests/content/algorithm-rich-content.test.ts
```

Existing files modified: `components/site-header.tsx`, `app/sitemap.ts`, `app/globals.css`, `tests/publishing/publishing-metadata.test.ts`, and `tests/pages/static-routes.test.tsx`. Existing link and security scripts are exercised unchanged.

### Task 1: Define the typed topic registry bound to the public revision

**Files:**
- Create: `lib/content/algorithm-foundations-topic.ts`
- Create: `tests/content/algorithm-foundations-topic.test.ts`
- Create: four Markdown files under `content/topics/algorithm-foundations/`

**Interfaces:**
- Produces: `AlgorithmChapterStatus = "framework" | "learning" | "verified"`.
- Produces: `AlgorithmChapter { slug, order, paperTitle, question, status, summary, readingMinutes, arxivId, arxivVersion, abstractUrl, pdfUrl, body }`.
- Produces: `algorithmFoundationsRevision`, `algorithmFoundationsReviewedAt`, `algorithmFoundationsChapters`, and `algorithmFoundationsChapter(slug)`.

- [ ] **Step 1: Capture the repository revision and write the failing registry tests**

Run `git -C <workspace>/paper-deep-dive rev-parse --verify HEAD` and use the returned full SHA in the tests. Assert exactly three chapters in order, exact statuses, official HTTPS arXiv URLs, explicit versions, non-empty Markdown bodies, and the exact repository revision.

```ts
expect(algorithmFoundationsChapters.map(({ slug, status }) => [slug, status])).toEqual([
  ["resnet", "learning"],
  ["transformer", "framework"],
  ["ddpm", "framework"],
]);
expect(algorithmFoundationsRevision).toMatch(/^[0-9a-f]{40}$/);
```

- [ ] **Step 2: Run the registry test to verify RED**

Run: `npm test -- --run tests/content/algorithm-foundations-topic.test.ts`

Expected: FAIL because the registry module does not exist.

- [ ] **Step 3: Add the minimal typed registry and honest first-release content**

Import each Markdown file with `?raw`. Store the exact full GitHub revision and review date. Each chapter Markdown must contain the core question, paper context, official original-paper links, minimal reproduction command, what is already verified, what has not yet been concluded, and a self-test section. Do not invent personal derivations or paper-level reproduction metrics.

- [ ] **Step 4: Run the registry test and commit**

Run: `npm test -- --run tests/content/algorithm-foundations-topic.test.ts`

Expected: PASS.

```bash
git add lib/content/algorithm-foundations-topic.ts content/topics/algorithm-foundations tests/content/algorithm-foundations-topic.test.ts
git commit -m "content: add algorithm foundations source registry"
```

### Task 2: Build the topic homepage with course order and knowledge relationships

**Files:**
- Create: `app/topics/algorithm-foundations/page.tsx`
- Create: `tests/pages/algorithm-foundations-topic.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: the registry from Task 1.
- Produces: semantic page sections labelled “学习路径”, “三篇论文不是孤岛”, “学习循环”, and “本地进度”.

- [ ] **Step 1: Write the failing homepage test**

Test the approved hierarchy, not CSS implementation details:

```tsx
render(<AlgorithmFoundationsTopicPage />);
expect(screen.getByRole("heading", { name: "算法原理与复现" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: /继续学习.*ResNet/ })).toHaveAttribute(
  "href", "/topics/algorithm-foundations/resnet",
);
expect(screen.getAllByRole("article")).toHaveLength(3);
expect(screen.getByRole("heading", { name: "三篇论文不是孤岛" })).toBeInTheDocument();
expect(screen.getByText(/信息如何在越来越深、越来越复杂的模型中稳定流动/)).toBeInTheDocument();
```

- [ ] **Step 2: Run the page test to verify RED**

Run: `npm test -- --run tests/pages/algorithm-foundations-topic.test.tsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement the semantic homepage**

Use the existing `topic-page`, `topic-hero`, `topic-map`, and `topic-grid` visual language, adding narrowly named algorithm-topic classes only for the three-node relationship and progress region. Include explicit status copy and the immutable GitHub tree URL built from `algorithmFoundationsRevision`.

- [ ] **Step 4: Run the page test and accessibility-focused route tests**

Run:

```bash
npm test -- --run tests/pages/algorithm-foundations-topic.test.tsx tests/pages/static-routes.test.tsx
```

Expected: topic test passes and existing routes remain green.

- [ ] **Step 5: Commit the homepage**

```bash
git add app/topics/algorithm-foundations/page.tsx app/globals.css tests/pages/algorithm-foundations-topic.test.tsx
git commit -m "feat: add algorithm foundations topic homepage"
```

### Task 3: Build reusable chapter routes and official-paper fallbacks

**Files:**
- Create: `app/topics/algorithm-foundations/[chapter]/page.tsx`
- Create: `tests/pages/algorithm-foundations-chapter.test.tsx`

**Interfaces:**
- Consumes: `algorithmFoundationsChapter(slug)` and the existing Markdown renderer.
- Produces: chapter metadata, breadcrumb, status, official abstract/PDF links, GitHub revision link, Markdown body, previous/next navigation, and readable fallback links without an embedded PDF.

- [ ] **Step 1: Write failing route tests**

Test each chapter through its exported page component or route helper. Assertions must cover official paper links, status text, exact revision short SHA, Markdown headings, and previous/next navigation. Test an unknown slug returns the project's existing not-found behavior.

- [ ] **Step 2: Run the chapter tests to verify RED**

Run: `npm test -- --run tests/pages/algorithm-foundations-chapter.test.tsx`

Expected: FAIL because the dynamic page is absent.

- [ ] **Step 3: Implement the shared chapter page**

Render the official abstract and PDF as ordinary links in all cases. If an iframe/embed is included, mark it as progressive enhancement and keep the links outside it; do not make test success depend on arXiv loading. Sanitize Markdown through the existing renderer and avoid copying the full paper text.

- [ ] **Step 4: Run chapter and Markdown security tests**

Run:

```bash
npm test -- --run tests/pages/algorithm-foundations-chapter.test.tsx tests/content/markdown-renderer.test.ts
```

Expected: all pass.

- [ ] **Step 5: Commit chapter routes**

```bash
git add 'app/topics/algorithm-foundations/[chapter]/page.tsx' tests/pages/algorithm-foundations-chapter.test.tsx
git commit -m "feat: add algorithm paper study pages"
```

### Task 4: Add versioned local progress with safe degradation

**Files:**
- Create: `components/algorithm-progress.tsx`
- Create: `lib/algorithm-progress.ts`
- Create: `tests/components/algorithm-progress.test.tsx`
- Modify: `app/topics/algorithm-foundations/page.tsx`
- Modify: `app/topics/algorithm-foundations/[chapter]/page.tsx`

**Interfaces:**
- Produces: `ProgressV1 { version: 1; completed: Record<string, string[]>; masteredChecks: Record<string, string[]> }`.
- Produces: `readProgress(storage: StorageLike): ProgressV1`, `writeProgress(storage: StorageLike, value: ProgressV1): boolean`, and `resetProgress(storage: StorageLike): void`.
- Storage key: `agent-engineering-notes:algorithm-foundations:v1`.

- [ ] **Step 1: Write unit and component tests for storage behavior**

Cover valid restore, malformed JSON, wrong version, quota/security exceptions, toggling one step, and isolation from unrelated keys:

```ts
expect(readProgress(storageWith("not json"))).toEqual(emptyProgress());
expect(() => resetProgress(storage)).not.toThrow();
expect(storage.getItem("unrelated")).toBe("keep-me");
```

Render the component without `window.localStorage` and assert checkboxes still work for the current render session.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- --run tests/components/algorithm-progress.test.tsx`

Expected: FAIL because progress interfaces do not exist.

- [ ] **Step 3: Implement the storage adapter and client component**

Keep serialization logic in `lib/algorithm-progress.ts`; keep React rendering and hydration handling in the client component. Catch only storage access/parse failures, return an empty v1 state, and show non-blocking text “进度仅保存在当前浏览器”. Do not persist free text.

- [ ] **Step 4: Integrate homepage summary and chapter checklists**

The homepage displays completed steps across 18 total steps. Each chapter exposes six stable identifiers: `question`, `skim`, `derive`, `reproduce`, `experiment`, `self-check`. Labels are Chinese display copy; identifiers remain stable across copy edits.

- [ ] **Step 5: Run targeted and full component tests**

Run:

```bash
npm test -- --run tests/components/algorithm-progress.test.tsx tests/pages/algorithm-foundations-topic.test.tsx tests/pages/algorithm-foundations-chapter.test.tsx
```

Expected: PASS without jsdom storage warnings.

- [ ] **Step 6: Commit local progress**

```bash
git add components/algorithm-progress.tsx lib/algorithm-progress.ts tests/components/algorithm-progress.test.tsx app/topics/algorithm-foundations
git commit -m "feat: track algorithm study progress locally"
```

### Task 5: Add accessible self-check disclosure and code-copy behavior

**Files:**
- Create: `components/paper-self-check.tsx`
- Create: `tests/components/paper-self-check.test.tsx`
- Modify: chapter Markdown or structured question data in `lib/content/algorithm-foundations-topic.ts`
- Modify: `app/topics/algorithm-foundations/[chapter]/page.tsx`

**Interfaces:**
- Produces: `SelfCheckQuestion { id, prompt, answer }` arrays per chapter.
- Produces: keyboard-accessible native `<details>` answer disclosures and mastery toggles integrated with `ProgressV1.masteredChecks`.
- Code copying uses `navigator.clipboard.writeText` when available and exposes success/failure status through `aria-live`.

- [ ] **Step 1: Write failing interaction tests**

Assert answers are not visible before disclosure, native summaries are named by question, mastery toggles persist through the provided progress callback, copying uses the exact command, and clipboard rejection renders “复制失败，请手动选择”.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test -- --run tests/components/paper-self-check.test.tsx`

Expected: FAIL because the component and question data do not exist.

- [ ] **Step 3: Implement the smallest accessible components**

Use native buttons and `<details>/<summary>` rather than custom div click handlers. Answers are part of server-rendered HTML but collapsed by default; the article remains usable without JavaScript. Clipboard behavior is optional enhancement.

- [ ] **Step 4: Run interaction and page tests**

Run:

```bash
npm test -- --run tests/components/paper-self-check.test.tsx tests/pages/algorithm-foundations-chapter.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit self-check interactions**

```bash
git add components/paper-self-check.tsx tests/components/paper-self-check.test.tsx lib/content/algorithm-foundations-topic.ts app/topics/algorithm-foundations
git commit -m "feat: add algorithm paper self checks"
```

### Task 6: Curate the updated local workbench into public study guides

**Files:**
- Modify: `content/topics/algorithm-foundations/resnet.md`
- Modify: `content/topics/algorithm-foundations/transformer.md`
- Modify: `content/topics/algorithm-foundations/ddpm.md`
- Modify: `lib/content/algorithm-foundations-topic.ts`
- Create: `tests/content/algorithm-rich-content.test.ts`

**Interfaces:**
- Consumes: the updated local workbench fields `prereq`, `question`, `checkpoint`, `code_file`, `run_cmd`, `result`, and `zh`; the public repository revision and fixed paper metadata from Tasks 1–5.
- Produces: three public Markdown bodies with the same seven stable headings and expanded `SelfCheckQuestion[]` data; no raw workbench HTML or second persistence model enters the site.

- [ ] **Step 1: Write failing rich-content and publication-boundary tests**

For every paper body, assert the stable headings `前置知识`, `核心问题`, `逐节中文精读导读`, `关键公式与结构`, `最小复现`, `自测与能力边界`, and `一页纸总结`. Assert the body names the exact repository revision and official fixed-version paper URLs. Assert at least six stable self-check questions per paper.

Add negative assertions across the three bodies and structured data:

```ts
const publicPayload = JSON.stringify({
  bodies: algorithmFoundationsChapters.map((chapter) => chapter.body),
  questions: algorithmFoundationsChapters.map((chapter) => chapter.selfChecks),
});

expect(publicPayload).not.toMatch(/data:image\//i);
expect(publicPayload).not.toContain("paperDeepDive.v1");
expect(publicPayload).not.toMatch(/<textarea|自动保存|中文全文翻译/i);
expect(Math.max(...algorithmFoundationsChapters.map((chapter) => chapter.body.length))).toBeLessThan(120_000);
```

- [ ] **Step 2: Run the new content test to verify RED**

Run: `npm test -- --run tests/content/algorithm-rich-content.test.ts`

Expected: FAIL because the current short bodies do not contain the approved seven-layer public study structure or expanded self-check data.

- [ ] **Step 3: Curate prerequisites, questions, experiment evidence, and self-checks**

Read the local workbench as source material, but rewrite it into the site's existing Markdown voice. Preserve correct paper terminology and the distinction between paper claims, repository smoke observations, and personal interpretation. Keep the current honest statuses: ResNet `learning`; Transformer and DDPM `framework`.

Use the local `prereq`, `question`, `checkpoint`, `code_file`, `run_cmd`, and `result` fields as candidates. Do not copy free-text placeholders, local PDF paths, complete source files, or result claims that cannot be traced to the frozen repository revision and environment.

- [ ] **Step 4: Replace full translations with original section-by-section study guides**

For each paper, write an original guide organized around the paper's major sections. Explain what question each section answers, how the reasoning moves forward, and which formulas or figures the reader should inspect in the official PDF. Do not translate paragraph-by-paragraph, reproduce full tables/figures, or embed Base64/data URLs. Short quotations, if indispensable, must be attributed and remain subordinate to original commentary.

- [ ] **Step 5: Run content, renderer, page, link, and public-boundary checks**

Run:

```bash
npm test -- --run tests/content/algorithm-rich-content.test.ts tests/content/algorithm-foundations-topic.test.ts tests/content/markdown-renderer.test.ts tests/pages/algorithm-foundations-chapter.test.tsx
npm run check:secrets
npm run check:links
npm run typecheck
npm run build
```

Expected: all commands pass; production output contains no full translation marker, Base64 paper image, private textarea, or second local-storage key.

- [ ] **Step 6: Commit the curated public study material**

```bash
git add content/topics/algorithm-foundations lib/content/algorithm-foundations-topic.ts tests/content/algorithm-rich-content.test.ts
git commit -m "content: expand algorithm paper study guides"
```

### Task 7: Integrate global navigation, sitemap, metadata, and public checks

**Files:**
- Modify: `components/site-header.tsx`
- Modify: `app/sitemap.ts`
- Modify: `tests/pages/static-routes.test.tsx`
- Modify: `tests/publishing/publishing-metadata.test.ts`

**Interfaces:**
- Produces: visible “算法” navigation entry and five canonical sitemap URLs.

- [ ] **Step 1: Extend navigation and publishing tests first**

Assert the header links “算法” to `/topics/algorithm-foundations`. Assert sitemap entries for the overview, reading method, and three papers under the configured canonical origin. Assert each route exports a unique title and canonical path.

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- --run tests/pages/static-routes.test.tsx tests/publishing/publishing-metadata.test.ts
```

Expected: FAIL on missing navigation and URLs.

- [ ] **Step 3: Implement navigation, metadata, and sitemap entries**

Rename the current generic “专题” link to “Harness” and add a sibling “算法” link. Do not add a hover-only submenu in the first version. Browser acceptance must verify that both links remain usable at the site's narrow mobile width.

- [ ] **Step 4: Run all publishing checks**

Run:

```bash
npm run test
npm run check:secrets
npm run check:links
npm run build
```

Expected: tests, sensitive-content scan, internal-link scan, and production build pass.

- [ ] **Step 5: Commit site integration**

```bash
git add components/site-header.tsx app/sitemap.ts tests/pages/static-routes.test.tsx tests/publishing/publishing-metadata.test.ts
git commit -m "feat: integrate algorithm topic into site navigation"
```

### Task 8: Perform browser acceptance, user gate, and production publication

**Files:**
- Modify only files required by browser findings; every behavior fix needs a regression test.

**Interfaces:**
- Produces: an approved local preview, a GitHub commit on `agent-engineering-notes/main`, and a new public Sites version at `notes.ironmao.com`.

- [ ] **Step 1: Run the complete verification command**

Run: `npm run verify`

Expected: all tests pass, secret and link scans pass, production build succeeds.

- [ ] **Step 2: Start the local production-equivalent preview**

Run the repository's supported preview command and inspect:

- desktop and narrow mobile widths;
- homepage course hierarchy before knowledge graph;
- all five routes;
- official paper fallback links;
- refresh persistence and corrupted-storage reset;
- keyboard access to checkboxes, disclosures, and copy buttons;
- light/dark or existing site theme behavior where applicable.

- [ ] **Step 3: Stop for the explicit user visual-acceptance gate**

Present the local URLs and summarize known limitations. Do not push or publish until the user confirms the homepage and at least one chapter page.

- [ ] **Step 4: Request code review and fix only evidence-backed findings**

Use `superpowers:requesting-code-review`; run `npm run verify` again after any fix.

- [ ] **Step 5: Commit final review fixes and push GitHub**

```bash
git status --short
git push origin main
git rev-parse --verify HEAD
```

Expected: only intentional files are committed, push succeeds, and the full SHA matches the source packaged for Sites.

- [ ] **Step 6: Publish through Sites**

Use the `sites:sites-building` and `sites:sites-hosting` skills. Reuse the existing project ID from `.openai/hosting.json`, push the exact source revision to the Sites source repository, package the verified build, save a new site version, deploy using the site's existing public audience, and poll to terminal success.

- [ ] **Step 7: Verify production**

Open `https://notes.ironmao.com/topics/algorithm-foundations` and one chapter URL. Confirm the deployed version displays the exact repository revision, official paper link, status label, and local-progress disclosure. Report the website commit, Sites version, test count, and any non-blocking build warning.

## Site Plan Completion Gate

The feature is complete only when both repositories are public and green, the website references the immutable paper repository commit, the user has approved local visual output, and the production deployment succeeds.
