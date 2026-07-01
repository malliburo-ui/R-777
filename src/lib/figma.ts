export type FigmaFrameRef = {
  fileKey: string;
  nodeId: string;
  url: string;
};

/**
 * Parses a Figma design URL into fileKey + nodeId for MCP / Code Connect.
 *
 * Example:
 * https://www.figma.com/design/Jzp1DZk5IVqDysrCvpLB3R/WORKOUTII?node-id=785-153
 * → { fileKey: "Jzp1DZk5IVqDysrCvpLB3R", nodeId: "785:153" }
 */
export function parseFigmaDesignUrl(url: string): FigmaFrameRef | null {
  try {
    const parsed = new URL(url.trim());

    if (!parsed.hostname.includes("figma.com")) {
      return null;
    }

    const pathMatch = parsed.pathname.match(
      /\/design\/([A-Za-z0-9]+)(?:\/[^/]*)?/,
    );
    const fileKey = pathMatch?.[1];

    const rawNodeId = parsed.searchParams.get("node-id");
    if (!fileKey || !rawNodeId) {
      return null;
    }

    return {
      fileKey,
      nodeId: rawNodeId.replace(/-/g, ":"),
      url: url.trim(),
    };
  } catch {
    return null;
  }
}

export function formatFigmaFrameLabel(ref: FigmaFrameRef): string {
  return `${ref.fileKey} → ${ref.nodeId}`;
}
