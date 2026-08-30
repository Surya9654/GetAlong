/**
 * mockMap.js
 * Generates a styled SVG "route diagram" connecting ride waypoints.
 * Used as a development substitute for the Google Maps Directions API.
 *
 * The diagram shows:
 *  - A curved path drawn through evenly-spaced waypoint nodes.
 *  - Distinct styles for START (green), STOP (amber), and DESTINATION (red) nodes.
 *  - Labelled waypoint names below each node.
 *  - Distance annotations between segments (if distanceKm is provided).
 */

const W = 600;   // SVG width
const H = 230;   // SVG height
const MARGIN_X = 60;
const NODE_Y = 115;

const COLORS = {
  start:  '#7A9B5C',   // moss green
  stop:   '#F2B705',   // amber
  dest:   '#D9622B',   // rust / destination
  line:   '#F2B705',   // route line colour
  text:   '#F2EFE9',   // label text
  muted:  '#9297A0',
  bg:     '#1E2126',
  grid:   '#2A2D33',
};

/**
 * Build an SVG path string that draws a smooth bezier curve through all nodes.
 * For two nodes it's a simple straight line; for more we use cubic beziers.
 * @param {{ x: number, y: number }[]} pts
 * @returns {string} SVG path `d` attribute value
 */
function buildCurvedPath(pts) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    // alternating slight vertical curves to give a natural road feel
    const cpY0 = i % 2 === 0 ? NODE_Y - 30 : NODE_Y + 30;
    const cpY1 = i % 2 === 0 ? NODE_Y + 30 : NODE_Y - 30;
    d += ` C ${cpX} ${cpY0}, ${cpX} ${cpY1}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/**
 * Wrap a long label into two lines at ~18 chars each.
 * @param {string} label
 * @returns {string[]}
 */
function wrapLabel(label) {
  const maxLen = 14;
  if (label.length <= maxLen) return [label];
  const breakAt = label.lastIndexOf(' ', maxLen);
  if (breakAt <= 0) return [label.slice(0, maxLen), label.slice(maxLen)];
  return [label.slice(0, breakAt), label.slice(breakAt + 1)];
}

/**
 * Generate a premium-styled mock map SVG for the given waypoints.
 * @param {string[]} points   Array of place-name strings. Must have at least 2.
 * @param {number}  [totalKm] Optional total distance in km for annotation.
 * @returns {string} Raw SVG markup (UTF-8 string).
 */
export function generateMockMapSvg(points = [], totalKm = null) {
  if (!points || points.length < 2) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="${COLORS.muted}">No route data</text>
    </svg>`;
  }

  const n = points.length;
  const usableWidth = W - 2 * MARGIN_X;
  const step = usableWidth / (n - 1);

  // Compute node positions
  const nodes = points.map((_, i) => ({
    x: MARGIN_X + i * step,
    y: NODE_Y,
  }));

  // Node style: first = start, last = destination, middle = stop
  const nodeColor = (i) => {
    if (i === 0) return COLORS.start;
    if (i === n - 1) return COLORS.dest;
    return COLORS.stop;
  };
  const nodeRadius = (i) => (i === 0 || i === n - 1 ? 10 : 8);
  const nodeLabel = (i) => {
    if (i === 0) return 'START';
    if (i === n - 1) return 'END';
    return `STOP ${i}`;
  };

  const curvePath = buildCurvedPath(nodes);

  // Segment distances (evenly split if totalKm is given)
  const segKm = totalKm ? Math.round(totalKm / (n - 1)) : null;

  // Dashes pattern along the route line
  const dashArray = '10 6';

  const svgParts = [];

  // ── Background
  svgParts.push(`<rect width="${W}" height="${H}" fill="${COLORS.bg}" rx="12" ry="12"/>`);

  // ── Subtle grid lines
  for (let gy = 30; gy < H; gy += 40) {
    svgParts.push(`<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" stroke="${COLORS.grid}" stroke-width="1"/>`);
  }
  for (let gx = 40; gx < W; gx += 60) {
    svgParts.push(`<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" stroke="${COLORS.grid}" stroke-width="1"/>`);
  }

  // ── Glow under the route path (thick, blurred amber stroke)
  svgParts.push(`
    <path d="${curvePath}" fill="none" stroke="${COLORS.line}" stroke-width="10" stroke-linecap="round"
          stroke-opacity="0.15" filter="url(#glowFilter)"/>
  `);

  // ── Dashed route line
  svgParts.push(`
    <path d="${curvePath}" fill="none" stroke="${COLORS.line}" stroke-width="2.5"
          stroke-dasharray="${dashArray}" stroke-linecap="round"/>
  `);

  // ── Segment distance labels (between nodes)
  if (segKm) {
    for (let i = 0; i < n - 1; i++) {
      const mx = (nodes[i].x + nodes[i + 1].x) / 2;
      svgParts.push(`
        <rect x="${mx - 21}" y="${NODE_Y - 52}" width="42" height="18" rx="5" fill="${COLORS.bg}" opacity="0.85"/>
        <text x="${mx}" y="${NODE_Y - 39}" text-anchor="middle"
              font-family="'IBM Plex Mono', monospace" font-size="10" fill="${COLORS.line}">
          ${segKm} km
        </text>
      `);
    }
  }

  // ── Nodes (circles with glow rings)
  nodes.forEach(({ x, y }, i) => {
    const r = nodeRadius(i);
    const c = nodeColor(i);
    // outer glow ring
    svgParts.push(`<circle cx="${x}" cy="${y}" r="${r + 6}" fill="${c}" opacity="0.15"/>`);
    // mid ring
    svgParts.push(`<circle cx="${x}" cy="${y}" r="${r + 3}" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.4"/>`);
    // solid node
    svgParts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${COLORS.bg}" stroke-width="2"/>`);
    // node type label (START / STOP N / END) — above node
    svgParts.push(`
      <text x="${x}" y="${y - r - 8}" text-anchor="middle"
            font-family="'IBM Plex Mono', monospace" font-size="8" font-weight="600"
            letter-spacing="0.08em" fill="${c}" opacity="0.85">
        ${nodeLabel(i)}
      </text>
    `);
    // place name — below node (wrapped)
    const lines = wrapLabel(points[i]);
    lines.forEach((line, li) => {
      svgParts.push(`
        <text x="${x}" y="${y + r + 18 + li * 14}" text-anchor="middle"
              font-family="'Inter', sans-serif" font-size="11" font-weight="500" fill="${COLORS.text}">
          ${line}
        </text>
      `);
    });
  });

  // ── Total distance badge (bottom-right)
  if (totalKm) {
    svgParts.push(`
      <rect x="${W - 90}" y="${H - 30}" width="80" height="20" rx="6" fill="${COLORS.line}" opacity="0.15"/>
      <text x="${W - 50}" y="${H - 16}" text-anchor="middle"
            font-family="'IBM Plex Mono', monospace" font-size="11" font-weight="600" fill="${COLORS.line}">
        ${totalKm} km total
      </text>
    `);
  }

  // ── "MOCK MAP" watermark (dev indicator)
  svgParts.push(`
    <text x="10" y="${H - 10}" font-family="'IBM Plex Mono', monospace" font-size="9"
          fill="${COLORS.muted}" opacity="0.45" letter-spacing="0.05em">DEV MOCK MAP</text>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
    </filter>
  </defs>
  ${svgParts.join('\n  ')}
</svg>`;
}
