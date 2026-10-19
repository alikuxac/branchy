# Branchy

Personal financial ledger modeled on Git version control. Models transactions as a directed acyclic graph (DAG) to branch spending scenarios, calculate timeline diffs, and project cash flow without mutating the main financial history.

## Monorepo Architecture

Managed with [Turborepo](https://turbo.build/) and [pnpm](https://pnpm.io/).

```text
branchy/
├── apps/
│   ├── api/        # Hono REST API running on Cloudflare Workers
│   └── web/        # Next.js 16 (App Router) dashboard
└── packages/
    ├── git-engine/ # Zero-dependency TypeScript DAG engine (nodes, branches, diffs)
    ├── db/         # Drizzle ORM schema for Cloudflare D1
    ├── ui/         # Shared UI components
    └── typescript-config/ # Shared tsconfig bases
```

## Core Features

- **Branching Engine**: Fork financial timelines from any commit or checkpoint node.
- **Ledger Diffing**: Compare spending across scenarios (`aheadBy`, `behindBy`, net impact).
- **Safe-to-Spend Projection**: Calculate spendable funds above a configured reserve floor.
- **Edge Deployment**: Serverless architecture built for Cloudflare Workers and D1 without external AI dependencies.

## Prerequisites

- Node.js >= 22
- pnpm >= 11

## Getting Started

Install workspace dependencies:

```bash
pnpm install
```

Run the development servers across all workspaces:

```bash
pnpm run dev
```

Run type checks:

```bash
pnpm run check-types
```

Build all packages and applications:

```bash
pnpm run build
```

## API Endpoints

The API service runs on `apps/api` using Hono:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health status |
| `GET` | `/api/branches` | List all branches and the active branch ID |
| `POST` | `/api/branches` | Create a new branch (`{ name, baseBranchId? }`) |
| `POST` | `/api/branches/fork` | Fork a new branch from a node/head (`{ fromBranchId, newBranchName, fromNodeId? }`) |
| `POST` | `/api/branches/checkout` | Switch the active branch (`{ branchId }`) |
| `POST` | `/api/branches/commit` | Append a transaction commit to a branch |
| `POST` | `/api/branches/virtual-commit` | Append a projected / virtual commit to a branch (`{ branchId, ...payload }`) |
| `POST` | `/api/branches/merge` | Merge a source branch into a target branch |
| `POST` | `/api/simulate-diff` | Compare commit histories between two heads |
| `POST` | `/api/safe-to-spend` | Calculate minimum balance runway over projected deltas |
| `POST` | `/api/project-timeline` | Project daily cashflow timeline for a branch (`{ branchId, days?, startDate? }`) |
| `POST` | `/api/webhooks/cross-repo-pr` | Webhook receiver for cross-scenario merge requests |

## License

GNU Affero General Public License v3.0 ([AGPL-3.0](LICENSE)).
