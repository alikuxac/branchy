import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { resolveBalanceAt, getNodeAncestry } from "../src/ledger-resolver.js";
import type { TransactionNode } from "../src/types.js";

describe("Ledger Graph Traversal & Balance Resolver", () => {
  /**
   * Graph layout for test:
   *
   *  (root: +1000, t=10)
   *          |
   *  (n1: -200, t=20)
   *       /        \
   * (n_main: -100, t=30)   (n_side: +500, t=25)
   *                          |
   *                        (n_side2: -50, t=35)
   */
  const nodes: TransactionNode[] = [
    {
      id: "root",
      parentId: null,
      timestamp: 10,
      amount: 1000,
      type: "actual",
      metadata: { description: "Opening balance" },
    },
    {
      id: "n1",
      parentId: "root",
      timestamp: 20,
      amount: -200,
      type: "actual",
      metadata: { description: "Groceries" },
    },
    {
      id: "n_main",
      parentId: "n1",
      timestamp: 30,
      amount: -100,
      type: "actual",
      metadata: { description: "Utilities" },
    },
    {
      id: "n_side",
      parentId: "n1",
      timestamp: 25,
      amount: 500,
      type: "projected",
      metadata: { description: "Side gig income" },
    },
    {
      id: "n_side2",
      parentId: "n_side",
      timestamp: 35,
      amount: -50,
      type: "projected",
      metadata: { description: "Tools" },
    },
  ];

  const graph = new Map<string, TransactionNode>();
  for (const node of nodes) {
    graph.set(node.id, node);
  }

  test("calculates cumulative balance along main branch ancestry", () => {
    // root (1000) + n1 (-200) + n_main (-100) = 700
    const balance = resolveBalanceAt("n_main", graph);
    assert.equal(balance, 700);
  });

  test("isolates side branch from main branch commits", () => {
    // root (1000) + n1 (-200) + n_side (500) + n_side2 (-50) = 1250
    // (n_main should NOT affect side branch)
    const balance = resolveBalanceAt("n_side2", graph);
    assert.equal(balance, 1250);
  });

  test("resolves balance up to a specific cutoff timestamp T", () => {
    // At T=22 on n_side2 branch:
    // root (t=10, 1000) + n1 (t=20, -200) = 800.
    // n_side (t=25) and n_side2 (t=35) are excluded.
    const balanceAt22 = resolveBalanceAt("n_side2", graph, { timestamp: 22 });
    assert.equal(balanceAt22, 800);

    // At T=26 on n_side2 branch:
    // root (1000) + n1 (-200) + n_side (500) = 1300.
    const balanceAt26 = resolveBalanceAt("n_side2", graph, { timestamp: 26 });
    assert.equal(balanceAt26, 1300);
  });

  test("returns correct ancestry nodes order", () => {
    const ancestry = getNodeAncestry("n_side", graph);
    const ids = ancestry.map((n) => n.id);
    assert.deepEqual(ids, ["n_side", "n1", "root"]);
  });

  test("handles empty or non-existent node safely", () => {
    assert.equal(resolveBalanceAt(null, graph), 0);
    assert.equal(resolveBalanceAt("unknown_node", graph), 0);
  });
});
