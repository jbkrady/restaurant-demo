// Simulated order tracking for user-test sessions (spec 01).
// Everything is derived from the start time, so reloads and locked phones
// always land on the step matching the real elapsed time.

export const STEPS = [
  { title: "Confirmed", text: "The restaurant has received your order" },
  { title: "Preparing", text: "The restaurant is preparing your order" },
  { title: "On its way", text: "Your order is on its way" },
  { title: "Delivered", text: "Enjoy your meal" },
];

// Simulated minute at which each step starts.
export const SCENARIOS = {
  S1: { label: "S1 · nominal", stepStarts: [0, 1, 19, 37] },
  S2: { label: "S2 · delay", stepStarts: [0, 1, 31, 49], reestimateAt: 20 },
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
