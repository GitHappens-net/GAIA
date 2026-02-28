import type { Node } from "./types";

const BASE = "/api";

export async function fetchNodes(): Promise<Node[]> {
  const res = await fetch(`${BASE}/nodes`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function setSprinkler(node_id: number, sprinkler_status: boolean): Promise<void> {
  const res = await fetch(`${BASE}/sprinkler`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ node_id, sprinkler_status }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

