# REA real walkthrough implementation plan

> For agentic workers: use the workspace Superpowers execution and verification methods. This is a bounded content refinement of an approved topic; the Sites helper owns final commit, source synchronization and packaging.

**Goal:** Make the six-chapter REA topic concretely teach AI-assisted reverse engineering through a reproducible, honestly scoped local experiment.

**Architecture:** Existing Markdown chapters and metadata remain the website delivery boundary. A small `examples/rea-export-investigation/` fixture is reference material only; Node tests and REA CLI execute locally, never in the website request path.

**Tech stack:** Node.js built-in test runner, fixed rea-agents 6.4.0 CLI, existing Vinext/Markdown site and Sites publication tools.

## Task 1: establish the experiment contract

- [x] Record baseline website test result before editing behavior.
- [x] Create `examples/rea-export-investigation/verify-export.mjs` with separate success, cancellation, explicit-error, IPC-shaped invocation and rejected-backend tests. Select only `baseline`, `defective` or `candidate` using `REA_LAB_TARGET`.
- [x] Run `REA_LAB_TARGET=baseline node --test examples/rea-export-investigation/verify-export.mjs`; expect failure because the selected module does not yet exist.
- [x] Create baseline modules, with cancellation mapped to idle, explicit error to failed, otherwise success, and a dependency-injected bridge calling the literal `report:export` channel.
- [x] Re-run baseline tests; expect all declared cases to pass.

## Task 2: analyze the deliberately defective target

- [x] Create `defective` modules that retain the baseline interface but omit the cancellation branch.
- [x] Run the same tests; expect only cancellation to fail with success instead of idle. Preserve this expected failure as experiment evidence, not a website regression.
- [x] Run `npx --yes rea-agents@6.4.0 analyze-javascript-application <absolute fixture directory> --json` for both target directories, saving raw output in a dedicated temporary experiment directory.
- [x] Inspect actual result schema, target digests, module facts, limitations and any graph coverage. Use the release help/contracts for follow-up queries; do not invent arguments or output.
- [x] Derive and publish only supported observations. If an operation fails, preserve the error and narrow the claim rather than silently changing package version.

## Task 3: independent candidate and finite verification

- [x] Keep the defective target unchanged. Create a candidate after inspecting analysis output and the known fixture contract.
- [x] Run the five-case test matrix against candidate; expect all cases to pass.
- [x] Save fixture README with the three verification commands, expected pass/fail states, CLI reproduction and limits. Clearly state this is a known-answer white-box workflow demonstration.

## Task 4: enrich the six existing chapters

- [x] Update introductory positioning and site lead without altering routes/style.
- [x] Insert actual invocation/output excerpts and distinguish static facts from interpretation in source and evidence chapters.
- [x] Use the real small case in the tutorial; retain broader Electron and native scenarios as separate designs, not accomplished experiments.
- [x] Explain the concrete native investigation sequence and what AI adds, with source anchors and no native-run claim.
- [x] Update evidence status: one local JS CLI/behavioral example completed; real native engines, MCP integration and comparative model experiments remain unverified.

## Task 5: review and publish

- [x] Read-only final factual review of result excerpts, version bounds and experimental claims.
- [ ] Run website tests, content scan, internal-link check, lint, typecheck, experiment checks and production build.
- [ ] Package/save/deploy the same verified source commit through Sites. Preserve public audience and existing domain.
- [ ] Push that commit to existing GitHub main non-force, fast-forward the primary checkout only if safe, and confirm deployment and CI results.

## Execution rulings and evidence

Mac static analysis failed compiling the Swift ownership helper; a second existing SDK also failed. Ruling: retain both failures, use the already available OrbStack host and an official fixed Node image with read-only sample mounts, and keep the same REA release. No system toolchain repair or safety bypass is authorized or attempted. Linux analyses and the later saved-Evidence comparison succeeded; this does not establish Mac analysis success.

The real comparison was deliberately kept conservative: summary 0/0/0/1 unknown, partial coverage. Behavioral tests are separate evidence and were fixed before analysis. The authoring agent knows the fixture answer; no blind-task or comparative-performance claim is allowed.

Adding public examples and chapter cross-links exposed two delivery gaps. Ruling: include examples in the existing public scanner and validate only the finite registered REA chapter set against its content and page, rather than allowing arbitrary dynamic URLs. Both changes had observed red-to-green tests. Offline positive fixture tests join npm verify; REA itself is not installed in CI.

Final read-only review found one raw-output publication risk in tutorial root paths. Corrected all analysis/request/comparison output to ignored rea-output paths; git check-ignore confirms all four paths. Current browser QA renders the real walkthrough and at 390 pixels has no page-level horizontal overflow. Full publication checks and deployment remain the final gate.
