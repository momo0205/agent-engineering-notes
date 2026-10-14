# REA export-result investigation

Self-owned, known-answer JavaScript fixture for the website's REA topic. This is not an Electron application, live IPC, UI, file-writing backend, blind reverse-engineering assessment or performance benchmark. The bridge is dependency-injected and tests supply a controlled implementation.

## Contract and three targets

- `baseline`: cancellation maps to idle, an explicit error to failed, otherwise success.
- `defective`: deliberately omits cancellation handling. Do not fix this reference fixture.
- `candidate`: independent small implementation checked against the frozen behavior tests.

The declared cases use a string document and object replies, including `{ canceled: true }`, `{ error: "Access denied" }` and `{ path: "report.csv" }`. Arbitrary/malformed replies, real files, concurrency and Electron lifecycle are outside these five tests.

From the repository root:

```bash
REA_LAB_TARGET=baseline node --test examples/rea-export-investigation/verify-export.mjs
REA_LAB_TARGET=defective node --test examples/rea-export-investigation/verify-export.mjs
REA_LAB_TARGET=candidate node --test examples/rea-export-investigation/verify-export.mjs
```

Expected: baseline 5 pass / 0 fail; defective 4 pass / 1 fail specifically on cancellation and exit code 1; candidate 5 pass / 0 fail. The defective result is an intentional experiment observation, not the positive CI command. `npm run test:rea-example` checks baseline and candidate offline without installing REA.

## Static analysis

Use a Node version supported by the fixed package: 22.x >=22.19, 24.x >=24.11 or 26+. Verify the actual runtime in the working directory. The 2026-10-14 run used Node 22.22.2 and rea-agents 6.4.0.

```bash
mkdir -p rea-output
npx --yes rea-agents@6.4.0 analyze-javascript-application \
  "$PWD/examples/rea-export-investigation/baseline" --json > rea-output/baseline-analysis.json
npx --yes rea-agents@6.4.0 analyze-javascript-application \
  "$PWD/examples/rea-export-investigation/defective" --json > rea-output/defective-analysis.json
```

Check the exit code before treating output as successful Evidence. The original Mac run failed compiling the Swift process-ownership helper. A second existing SDK did not solve it; the experiment did not modify system tools or bypass ownership checks.

The successful analyses used an existing OrbStack host and a disposable Linux arm64 container. For this example only, mount the fixture read-only and an explicit output directory writable:

```bash
mkdir -p rea-output
docker run --rm --memory=768m --cpus=2 \
  --mount "type=bind,source=$PWD/examples/rea-export-investigation,target=/lab,readonly" \
  --mount "type=bind,source=$PWD/rea-output,target=/out" \
  node:22.22.2-bookworm-slim sh -c '
    apt-get update -qq && apt-get install -y --no-install-recommends procps &&
    npx --yes rea-agents@6.4.0 analyze-javascript-application /lab/baseline --json > /out/baseline-analysis.json &&
    npx --yes rea-agents@6.4.0 analyze-javascript-application /lab/defective --json > /out/defective-analysis.json
  '
```

Image digest observed in that run: `sha256:9f6d5975c7dca860947d3915877f85607946403fc55349f39b4bc3688448bb6e`. First image/package retrieval and procps installation require network. REA static analysis does not execute the supplied target. Containers here are a compatibility choice, not an isolation guarantee made by REA.

## Compare exact return shapes

With jq available, preserve both complete Evidence inputs unchanged:

```bash
jq -n --slurpfile left rea-output/baseline-analysis.json \
  --slurpfile right rea-output/defective-analysis.json \
  '{left:$left[0],right:$right[0],
    left_module_path:"present.mjs",left_export_name:"presentExportResult",
    right_module_path:"present.mjs",right_export_name:"presentExportResult"}' \
  > rea-output/shape-request.json
npx --yes rea-agents@6.4.0 compare-javascript-export-shapes \
  rea-output/shape-request.json --json > rea-output/shapes.json
```

The exact comparison completed on Mac using the Linux-generated Evidence. Observed summary: added 0, removed 0, changed 0, unknown 1. Coverage: partial, two paired variants and one unpaired left variant. The unknown points to baseline `present.mjs` line 2; it does not automatically prove a deleted branch or unchanged behavior.

Observed target digests:

- baseline: `159a2d4338607505fcde6fcf16ca53cc13df03378af1687a3e6e567d42b7c0fa`
- defective: `d949214aa769cfdf9c34e042831ea802f557418fc8d8efaad1bd845751527cb6`

Both analyses parsed two JS files with zero parse failures and reported structural coverage complete, but semantic coverage unknown. Raw output remains an experiment artifact, not content automatically approved for publication. The article combines selected tool observations, ordinary source inspection, known fixture design and independent tests; it does not claim an unknown bug was first discovered by the model.
