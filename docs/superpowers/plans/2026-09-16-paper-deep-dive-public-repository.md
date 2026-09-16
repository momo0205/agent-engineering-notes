# Paper Deep Dive Public Repository Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a public `momo0205/paper-deep-dive` repository that preserves the verified ResNet, Transformer, and DDPM learning exercises while enforcing source, licensing, reproducibility, and public-content boundaries.

**Architecture:** Build a fresh repository at `/Users/chenmao/Desktop/workspace/paper-deep-dive` from a curated copy of `ai-instructure/03-research/paper-deep-dive`; do not split the existing parent repository or copy its unrelated history. The repository owns executable code, tests, paper metadata, download verification, raw learning notes, and reference outputs. Paper PDFs remain local artifacts fetched from official arXiv URLs and never enter public Git history unless a separate redistribution review explicitly allows one.

**Tech Stack:** Python 3.11+, NumPy, PyTorch CPU, torchvision, scikit-learn, matplotlib, pytest, PyYAML, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-16-algorithm-foundations-topic-design.md`

## Global Constraints

- Public repository name is exactly `momo0205/paper-deep-dive`.
- The local checkout is `/Users/chenmao/Desktop/workspace/paper-deep-dive`.
- Preserve the three existing demonstrations' default teaching behavior; only add explicit smoke-mode inputs and public-boundary support.
- Do not commit PDF files, downloaded datasets, `input.txt`, model files, caches, local absolute paths, company URLs, API keys, or generated outputs outside `outputs/reference/`.
- The three paper records are arXiv `1512.03385v1`, `1706.03762v7`, and `2006.11239v2`.
- CI must run on CPU and without API keys or network-dependent tests.
- Every implementation task follows RED → GREEN → REFACTOR and ends in its own commit.

---

## File Map

```text
/Users/chenmao/Desktop/workspace/paper-deep-dive/
├── .github/workflows/ci.yml                 # public CI
├── .gitignore                               # public artifact boundary
├── README.md                                # learning path and commands
├── LICENSE                                  # license for original repository content only
├── pyproject.toml                           # dependencies and pytest configuration
├── papers.yml                               # official paper metadata and expected hashes
├── scripts/fetch_papers.py                  # official download + SHA-256 verification
├── questions/*.md                           # three question trees
├── notes/{resnet,transformer,ddpm}/*.md      # learning notes and summaries
├── code/common/mnist.py                     # offline-tolerant dataset loader
├── code/{resnet,transformer,ddpm}/*.py       # demonstrations
├── checkpoints/*.md                         # self-test questions
├── outputs/reference/README.md              # rules for publishable outputs
└── tests/
    ├── test_public_boundary.py
    ├── test_paper_catalog.py
    ├── test_fetch_papers.py
    ├── test_smoke_commands.py
    └── existing algorithm tests
```

### Task 1: Create the curated repository and enforce its public boundary

**Files:**
- Create: `/Users/chenmao/Desktop/workspace/paper-deep-dive/.gitignore`
- Create: `/Users/chenmao/Desktop/workspace/paper-deep-dive/pyproject.toml`
- Create: `/Users/chenmao/Desktop/workspace/paper-deep-dive/tests/test_public_boundary.py`
- Copy and reorganize: `questions/`, `papers/*/{notes,summary}.md`, `code/`, `checkpoints/`
- Create: `/Users/chenmao/Desktop/workspace/paper-deep-dive/notes/{resnet,transformer,ddpm}/`

**Interfaces:**
- Consumes: the reviewed source tree at `/Users/chenmao/Desktop/workspace/ai-instructure/03-research/paper-deep-dive`.
- Produces: an independently testable Git repository whose tracked files pass `assert_public_tree(root: Path) -> None`.

- [ ] **Step 1: Initialize an empty repository without touching the source tree**

Run:

```bash
mkdir -p /Users/chenmao/Desktop/workspace/paper-deep-dive
git -C /Users/chenmao/Desktop/workspace/paper-deep-dive init -b main
```

Expected: an empty `main` branch in the new directory; the source worktree remains unchanged.

- [ ] **Step 2: Write the failing public-boundary test**

Create `tests/test_public_boundary.py` with a recursive tracked-content policy:

```python
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORBIDDEN_SUFFIXES = {".pdf", ".pt", ".pth", ".ckpt", ".pyc"}
FORBIDDEN_PARTS = {".pytest_cache", "__pycache__", "data"}
FORBIDDEN_TEXT = (
    "/Users/chenmao/",
    "takumi.corp.kuaishou.com",
    "DEEPSEEK_API_KEY=",
    "sk-",
)
REQUIRED_FILES = {
    "questions/q1-why-deep-networks-fail.md",
    "questions/q2-why-attention-works.md",
    "questions/q3-why-diffusion-generates.md",
    "code/resnet/plain_vs_residual.py",
    "code/transformer/tiny_attention.py",
    "code/ddpm/simple_ddpm.py",
}


def public_files():
    return [path for path in ROOT.rglob("*") if path.is_file() and ".git" not in path.parts]


def test_public_tree_excludes_private_or_generated_artifacts():
    violations = []
    for path in public_files():
        relative = path.relative_to(ROOT)
        if path.suffix.lower() in FORBIDDEN_SUFFIXES or FORBIDDEN_PARTS.intersection(relative.parts):
            violations.append(str(relative))
        if path.name == "input.txt":
            violations.append(str(relative))
    assert violations == []


def test_required_learning_material_is_present():
    present = {str(path.relative_to(ROOT)) for path in public_files()}
    assert REQUIRED_FILES <= present


def test_text_files_do_not_expose_local_or_company_data():
    violations = []
    for path in public_files():
        if path.suffix.lower() not in {".md", ".py", ".toml", ".yml", ".yaml", ".txt"}:
            continue
        text = path.read_text(encoding="utf-8")
        for needle in FORBIDDEN_TEXT:
            if needle in text:
                violations.append(f"{path.relative_to(ROOT)}: {needle}")
    assert violations == []
```

- [ ] **Step 3: Run the test to establish RED**

Run:

```bash
cd /Users/chenmao/Desktop/workspace/paper-deep-dive
python3 -m pytest tests/test_public_boundary.py -q
```

Expected: FAIL because the new environment and curated tree have not been created yet.

- [ ] **Step 4: Add package metadata and ignore rules**

Create `pyproject.toml` with project license `MIT`, Python `>=3.11`, runtime dependencies `numpy`, `torch`, `torchvision`, `scikit-learn`, `matplotlib`, `PyYAML`, and pytest configuration setting `pythonpath = ["code"]` and `testpaths = ["tests"]`.

Create `.gitignore` containing:

```gitignore
.venv/
__pycache__/
.pytest_cache/
*.pyc
*.pdf
*.pt
*.pth
*.ckpt
data/
code/transformer/input.txt
outputs/*
!outputs/reference/
!outputs/reference/**
```

- [ ] **Step 5: Curate the existing material into the new layout**

Copy only source Markdown and Python files. Move `papers/<paper>/notes.md` and `summary.md` into `notes/<paper>/`. Move the four existing test modules into `tests/` and update their imports only as required by `pythonpath = ["code"]`. Do not copy PDFs, `index.html`, `build_dashboard.py`, `input.txt`, `.pytest_cache`, PNGs, or downloaded data.

- [ ] **Step 6: Run the migrated algorithm tests and boundary tests**

Run:

```bash
cd /Users/chenmao/Desktop/workspace/paper-deep-dive
python3 -m pytest -q
```

Expected: six migrated algorithm tests plus the three public-boundary tests pass.

- [ ] **Step 7: Commit the curated base**

```bash
git add .gitignore pyproject.toml questions notes code checkpoints tests
git commit -m "chore: bootstrap public paper deep dive repository"
```

### Task 2: Add versioned paper metadata and verified official downloads

**Files:**
- Create: `papers.yml`
- Create: `scripts/fetch_papers.py`
- Create: `tests/test_paper_catalog.py`
- Create: `tests/test_fetch_papers.py`

**Interfaces:**
- Consumes: `papers.yml` records with `slug`, `title`, `authors`, `arxiv_id`, `version`, `abstract_url`, `pdf_url`, and `sha256`.
- Produces: `load_catalog(path: Path) -> list[Paper]`, `download_paper(paper: Paper, destination: Path, opener: Callable) -> Path`, and CLI `python scripts/fetch_papers.py [slug ...] --output-dir papers`.

- [ ] **Step 1: Write catalog and downloader tests first**

`tests/test_paper_catalog.py` must assert exactly the slugs `resnet`, `transformer`, and `ddpm`, HTTPS arXiv URLs, explicit versions `v1`, `v7`, and `v2`, and 64-character lowercase hashes.

`tests/test_fetch_papers.py` must use a fake opener returning fixed bytes and assert successful atomic write, hash mismatch rejection, and no partially written target on failure:

```python
def test_download_rejects_hash_mismatch(tmp_path):
    paper = Paper(slug="resnet", title="ResNet", authors=("Kaiming He",),
                  arxiv_id="1512.03385", version="v1",
                  abstract_url="https://arxiv.org/abs/1512.03385v1",
                  pdf_url="https://arxiv.org/pdf/1512.03385v1",
                  sha256="0" * 64)
    with pytest.raises(HashMismatch):
        download_paper(paper, tmp_path, opener=lambda _: b"not-the-paper")
    assert list(tmp_path.iterdir()) == []
```

- [ ] **Step 2: Run targeted tests to verify RED**

Run: `python3 -m pytest tests/test_paper_catalog.py tests/test_fetch_papers.py -q`

Expected: collection fails because `scripts.fetch_papers` and `papers.yml` do not exist.

- [ ] **Step 3: Add the three exact paper records**

Populate titles, complete author lists, the reviewed arXiv version URLs, and SHA-256 values calculated from the already downloaded local files. The `sha256` values must be generated with `shasum -a 256` during implementation and copied exactly; never invent a digest.

- [ ] **Step 4: Implement an atomic downloader**

Use `urllib.request.urlopen`, stream into a temporary file under the destination directory, compute SHA-256 while writing, compare using `hmac.compare_digest`, then `Path.replace` to `<slug>-<arxiv_id><version>.pdf`. Expose `--output-dir` and optional slugs through `argparse`; default to all papers.

- [ ] **Step 5: Run tests, then perform one real official-source verification**

Run:

```bash
python3 -m pytest tests/test_paper_catalog.py tests/test_fetch_papers.py -q
python3 scripts/fetch_papers.py resnet --output-dir /tmp/paper-deep-dive-download-check
shasum -a 256 /tmp/paper-deep-dive-download-check/resnet-1512.03385v1.pdf
```

Expected: unit tests pass; real download hash equals the catalog value. The `/tmp` PDF is not added to Git.

- [ ] **Step 6: Commit metadata and downloader**

```bash
git add papers.yml scripts/fetch_papers.py tests/test_paper_catalog.py tests/test_fetch_papers.py
git commit -m "feat: add verified official paper downloads"
```

### Task 3: Add deterministic quick-smoke commands without changing teaching defaults

**Files:**
- Modify: `code/resnet/plain_vs_residual.py`
- Modify: `code/transformer/tiny_attention.py`
- Modify: `code/ddpm/simple_ddpm.py`
- Create: `tests/test_smoke_commands.py`

**Interfaces:**
- Produces: each script accepts `--smoke`, `--output-dir PATH`, and `--offline`; default invocation retains existing step counts and behavior.
- `--smoke --offline` uses fallback or synthetic inputs, a fixed seed, no network, no GUI, and exits successfully on CPU.

- [ ] **Step 1: Write subprocess tests for all three commands**

Parameterize the scripts and assert exit code zero, a script-specific marker, and no files outside the provided temporary output directory:

```python
@pytest.mark.parametrize((script, marker), [
    ("code/resnet/plain_vs_residual.py", "residual/plain"),
    ("code/transformer/tiny_attention.py", "attention shape"),
    ("code/ddpm/simple_ddpm.py", "sample shape"),
])
def test_offline_smoke_command(script, marker, tmp_path):
    result = subprocess.run(
        [sys.executable, script, "--smoke", "--offline", "--output-dir", str(tmp_path)],
        cwd=ROOT, text=True, capture_output=True, timeout=90,
    )
    assert result.returncode == 0, result.stderr
    assert marker in result.stdout
```

- [ ] **Step 2: Run the smoke test to verify RED**

Run: `python3 -m pytest tests/test_smoke_commands.py -q`

Expected: FAIL because the scripts reject the new arguments.

- [ ] **Step 3: Add shared CLI semantics with minimal internal changes**

Each script parses the three flags in `main()`. Smoke mode must reduce data and steps enough to finish within the test timeout, while testing the actual forward/backward or sampling path. Offline mode injects synthetic MNIST or the existing Transformer fallback rather than attempting a network request. Output files are written only beneath `--output-dir`.

- [ ] **Step 4: Run targeted and full tests**

Run:

```bash
python3 -m pytest tests/test_smoke_commands.py -q
python3 -m pytest -q
```

Expected: all tests pass; the original numerical gradient and causality assertions remain unchanged.

- [ ] **Step 5: Commit smoke support**

```bash
git add code/resnet/plain_vs_residual.py code/transformer/tiny_attention.py code/ddpm/simple_ddpm.py tests/test_smoke_commands.py
git commit -m "feat: add offline smoke runs for paper demos"
```

### Task 4: Document reproducibility and add public CI

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `docs/learning-method.md`
- Create: `docs/reproducibility.md`
- Create: `outputs/reference/README.md`
- Create: `.github/workflows/ci.yml`
- Modify: `tests/test_public_boundary.py`

**Interfaces:**
- Produces: a clone-to-test path using `python -m venv`, `pip install -e .`, `pytest -q`, and three smoke commands.
- CI executes boundary tests, all algorithm tests, and offline smoke commands on Python 3.11.

- [ ] **Step 1: Extend the boundary test for public documentation**

Assert `README.md` links all three official arXiv abstract pages, explains that PDFs are fetched rather than redistributed, and contains commands for tests and each smoke run. Assert `LICENSE` explicitly covers original repository content and does not claim ownership of linked papers or datasets.

- [ ] **Step 2: Run the boundary test to verify RED**

Run: `python3 -m pytest tests/test_public_boundary.py -q`

Expected: FAIL because the required public documentation does not exist.

- [ ] **Step 3: Write documentation and CI**

`README.md` must lead with the three questions and the 6–9 week learning loop. `docs/reproducibility.md` must state Python version, CPU expectation, seeds, offline behavior, output provenance, and why a smoke result is not equivalent to reproducing the paper's published metrics.

`.github/workflows/ci.yml` must use `actions/checkout@v4`, `actions/setup-python@v5` with Python 3.11 and pip caching, `pip install -e .`, `pytest -q`, and all three `--smoke --offline` commands.

- [ ] **Step 4: Verify the fresh-install path locally**

Run in a temporary Python 3.11 virtual environment:

```bash
python3.11 -m venv /tmp/paper-deep-dive-verify
/tmp/paper-deep-dive-verify/bin/pip install -e .
/tmp/paper-deep-dive-verify/bin/pytest -q
```

Expected: all tests pass without API keys and without PDF files in the checkout.

- [ ] **Step 5: Commit public documentation and CI**

```bash
git add README.md LICENSE docs outputs/reference/README.md .github/workflows/ci.yml tests/test_public_boundary.py
git commit -m "docs: publish reproducible paper study workflow"
```

### Task 5: Create the GitHub repository and freeze the website reference revision

**Files:**
- No source changes unless GitHub reports a CI-only compatibility failure; any such fix requires its own failing local regression test.

**Interfaces:**
- Produces: public remote `https://github.com/momo0205/paper-deep-dive`, passing `main`, and a full 40-character revision for the website plan.

- [ ] **Step 1: Perform the final public-history audit**

Run:

```bash
git status --short
git ls-files | rg '\.(pdf|pt|pth|ckpt)$|(^|/)input\.txt$' && exit 1 || true
git grep -n -e '/Users/chenmao/' -e 'takumi.corp.kuaishou.com' -e 'DEEPSEEK_API_KEY=' -- . ':!docs/superpowers' && exit 1 || true
python3 -m pytest -q
```

Expected: clean worktree, no forbidden tracked files or strings, all tests pass.

- [ ] **Step 2: Create and push the explicitly approved public repository**

Run:

```bash
gh repo create momo0205/paper-deep-dive --public --source=. --remote=origin --push
```

Expected: remote is created under `momo0205`, and `main` is pushed. If `gh` is unavailable or not authenticated, stop and ask the user to complete authentication; do not create a differently named repository.

- [ ] **Step 3: Verify GitHub CI and record the immutable revision**

Run:

```bash
gh run watch --exit-status
git rev-parse --verify HEAD
git status --short
```

Expected: CI succeeds, a full 40-character SHA is printed, and the worktree is clean. Preserve that SHA as the input to the website implementation plan.

## Repository Plan Completion Gate

Do not start the website plan until the public repository URL loads without authentication, GitHub Actions is green, the exact reference SHA is known, and the three official paper links are verified.
