# Wiki Schema

This document defines the schema, taxonomy, and operational guidelines for the `x-kindel-interface` LLM Knowledge Base.

## Core Rules
- **One concept per page**: Wikipedia-style entity pages located in `wiki/`.
- **Obsidian-compatible links**: All cross-references must use `[[kebab-case-page-name]]` or `[[page-name|Display Label]]`.
- **Contradiction alerts**: When sources or approaches conflict, flag them explicitly:
  `> ⚠️ Contradicts [[page-name]] on [topic/detail]`
- **Kebab-case filenames**: Every file inside `wiki/` must use lowercase alphanumeric kebab-case matching the concept (e.g. `kindle-browser-runtime.md`).
- **Audit trail**: Every ingest, query, and lint action must be appended to `wiki/log.md` and indexed in `wiki/index.md`.
- **Context Header**: Every code or script file in this repository must begin with 3–4 lines of architectural context header as defined in `AGENTS.md`.

## Directory Layout
```
.
├── INDEX.md            # This schema file
├── raw/                # Immutable source documents and raw research dumps
│   ├── todo-requirements.md
│   ├── kindle-hardware-and-browser-specs.md
│   ├── twitter-api-landscape-and-nitter-history.md
│   ├── live-api-probes-and-cors-verification.md
│   ├── e-ink-ui-ux-design-patterns.md
│   └── server-vs-serverless-tradeoffs.md
├── wiki/               # Compiled, cross-linked LLM entity pages
│   ├── index.md        # Master category index of all wiki pages
│   ├── log.md          # Chronological operation log ([INGEST], [QUERY], [LINT])
│   └── *.md            # Individual concept entity pages
└── experiments/        # Ground-truth experimental evaluations
    ├── readme.md
    └── api-probing/
```

## Entity Page Structure
Every file in `wiki/` must follow this structure:
```markdown
# Concept Name

## Summary
A concise one-paragraph overview explaining what this concept is and its role in the system.

## Details
In-depth technical breakdown, specifications, architectural trade-offs, and design patterns.

## Related
- [[related-concept-a]]
- [[related-concept-b]]

## Sources
- raw/<source-document>.md
```
