// Illustrative delivery map (spec 03): a fixed, pre-drawn route on a generic
// background. No map service, no real position, no courier identity.

const ROUTE = [
  [40, 150],
  [40, 110],
  [130, 110],
  [130, 60],
  [230, 60],
  [230, 90],
  [290, 90],
];

const SEGMENTS = ROUTE.slice(1).map(([x, y], i) => {
  const [px, py] = ROUTE[i];
  return { from: ROUTE[i], length: Math.hypot(x - px, y - py), dx: x - px, dy: y - py };
});
const TOTAL_LENGTH = SEGMENTS.reduce((sum, s) => sum + s.length, 0);

function pointAt(progress) {
  let remaining = Math.min(Math.max(progress, 0), 1) * TOTAL_LENGTH;
  for (const s of SEGMENTS) {
    if (remaining <= s.length) {
      const t = remaining / s.length;
      return [s.from[0] + s.dx * t, s.from[1] + s.dy * t];
    }
    remaining -= s.length;
  }
  return ROUTE[ROUTE.length - 1];
}

const BLOCKS = [
  [10, 10, 100, 80], [150, 10, 60, 30], [250, 10, 60, 30],
  [60, 130, 50, 40], [150, 80, 60, 60], [250, 110, 60, 60],
];

export default function DeliveryMap({ progress }) {
  const [x, y] = pointAt(progress);
  const [startX, startY] = ROUTE[0];
  const [endX, endY] = ROUTE[ROUTE.length - 1];
  const points = ROUTE.map((p) => p.join(",")).join(" ");

  return (
    <svg className="delivery-map" viewBox="0 0 320 180" role="img" aria-label="Delivery map">
      <rect width="320" height="180" fill="#eef1ec" />
      {BLOCKS.map(([bx, by, w, h], i) => (
        <rect key={i} x={bx} y={by} width={w} height={h} rx="4" fill="#dde3da" />
      ))}
      <polyline points={points} fill="none" stroke="#b9c2b6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={points} fill="none" stroke="#00c1b2" strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={startX} cy={startY} r="7" fill="#1a271f" />
      <circle cx={endX} cy={endY} r="7" fill="#ffffff" stroke="#1a271f" strokeWidth="3" />
      <g className="delivery-map-courier" style={{ transform: `translate(${x}px, ${y}px)` }}>
        <circle r="11" fill="#00c1b2" stroke="#ffffff" strokeWidth="3" />
      </g>
    </svg>
  );
}
