// Simulated order tracking for user-test sessions (spec 01).
// Everything is derived from the start time, so reloads and locked phones
// always land on the step matching the real elapsed time.

export const STEPS = [
  { title: "Confirmed", text: "The restaurant has received your order" },
  { title: "Preparing", text: "The restaurant is preparing your order" },
  { title: "On its way", text: "Your order is on its way" },
  { title: "Delivered", text: "Enjoy your meal" },
];

// Simulated minute at which each step starts, and central delivery estimate
// (preparation + pickup + travel). S2 revises the estimate at `reestimate.at`.
export const SCENARIOS = {
  S1: { label: "S1 · nominal", stepStarts: [0, 1, 19, 37], central: 36 },
  S2: {
    label: "S2 · delay",
    stepStarts: [0, 1, 31, 49],
    central: 36,
    reestimate: { at: 20, central: 48 },
  },
};

// 1 simulated minute = 10 real seconds.
export const TIME_FACTOR = 6;

export function getElapsedSimMinutes(startedAt, now = Date.now()) {
  return ((now - startedAt) / 60000) * TIME_FACTOR;
}

export function getCurrentStep(scenarioId, elapsedSimMinutes) {
  const { stepStarts } = SCENARIOS[scenarioId];
  let step = 0;
  stepStarts.forEach((start, i) => {
    if (elapsedSimMinutes >= start) step = i;
  });
  return step;
}

// Same asymmetric margin as the pre-order estimate: x0.70 low, x1.10 high.
export function getEtaRange(central) {
  return { min: Math.round(central * 0.7), max: Math.round(central * 1.1) };
}

// Remaining range at a given simulated minute, counted down minute by minute.
export function getEta(scenarioId, elapsedSimMinutes) {
  const { central, reestimate } = SCENARIOS[scenarioId];
  const delayed = Boolean(reestimate) && elapsedSimMinutes >= reestimate.at;
  const range = getEtaRange(delayed ? reestimate.central : central);
  const minutes = Math.floor(elapsedSimMinutes);
  return {
    min: range.min - minutes,
    max: range.max - minutes,
    initialMin: range.min,
    initialMax: range.max,
    confidence: delayed ? "medium" : "high",
    delayed,
  };
}

export function formatEta(eta) {
  if (eta.max <= 0) return "Running a little late";
  if (eta.max <= 5) return "Any minute now";
  if (eta.min <= 0) return `Arriving in less than ${eta.max} min`;
  return `Arriving in ${eta.min}–${eta.max} min`;
}

const STORAGE_KEY = "restaurant-demo:tracking";

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const session = raw ? JSON.parse(raw) : null;
    return session && SCENARIOS[session.scenario] ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable: tracking still works until the page is reloaded.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

// Prototype analytics: events are logged, not sent anywhere.
export function track(event, props) {
  console.info("[track]", event, props);
}
