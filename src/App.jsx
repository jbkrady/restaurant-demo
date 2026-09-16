import { useState } from "react";
import { dishes, deliveryInfo } from "./data";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import PaymentModal from "./components/PaymentModal";
import OrderTracking from "./components/OrderTracking";
import { SCENARIOS, SPEEDS, TIME_FACTOR, VARIANTS, loadSession, saveSession, clearSession } from "./tracking";
import "./App.css";

export default function App() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPayment, setShowPayment] = useState(false);
  const [session, setSession] = useState(loadSession);
  const [scenario, setScenario] = useState("S1");
  const [variant, setVariant] = useState("with_map");
  const [timeFactor, setTimeFactor] = useState(TIME_FACTOR);

  function addToCart(dish) {
    setCart([...cart, { ...dish, quantity: 1 }]);
  }

  function removeFromCart(id) {
    setCart(cart.filter((item) => item.id !== id));
  }

  function handlePaid(order) {
    const next = { scenario, variant, timeFactor, startedAt: Date.now(), order };
    saveSession(next);
    setSession(next);
    setCart([]);
    setShowPayment(false);
  }

  function resetSession() {
    clearSession();
    setSession(null);
    setCart([]);
    setShowPayment(false);
    setSelectedCategory("All");
  }

  const cartCount = cart.length;

  return (
    <div className="app">
      <header className="app-header">
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <img src={`${import.meta.env.BASE_URL}deliveroo-logo.png`} alt="Deliveroo" height="36" />
          <h1>roo<span style={{color:"#1a271f"}}>food</span></h1>
          <span className="delivery-eta">
            <span className="eta-dot" />
            <span className="eta-icon">🛵</span>
            Delivery in {deliveryInfo.etaMin}–{deliveryInfo.etaMax} min
          </span>
        </div>
        <div className="cart-badge-wrapper">
          <span className="cart-icon">🛒</span>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </div>
      </header>

      {session ? (
        <OrderTracking key={session.startedAt} session={session} />
      ) : (
        <main className="app-main">
          <Menu
            dishes={dishes}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddToCart={addToCart}
          />
          <Cart cart={cart} onRemove={removeFromCart} onCheckout={() => setShowPayment(true)} />
        </main>
      )}
      {showPayment && !session && (
        <PaymentModal
          cart={cart}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaid}
        />
      )}

      {/* Facilitator controls for test sessions */}
      <div className="facilitator-bar">
        <select
          value={session ? session.scenario : scenario}
          onChange={(e) => setScenario(e.target.value)}
          disabled={Boolean(session)}
          aria-label="Test scenario"
        >
          {Object.entries(SCENARIOS).map(([id, s]) => (
            <option key={id} value={id}>{s.label}</option>
          ))}
        </select>
        <select
          value={session ? session.variant : variant}
          onChange={(e) => setVariant(e.target.value)}
          disabled={Boolean(session)}
          aria-label="Prototype variant"
        >
          {Object.entries(VARIANTS).map(([id, label]) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
        <select
          value={session ? session.timeFactor ?? TIME_FACTOR : timeFactor}
          onChange={(e) => setTimeFactor(Number(e.target.value))}
          disabled={Boolean(session)}
          aria-label="Speed"
        >
          {Object.entries(SPEEDS).map(([factor, label]) => (
            <option key={factor} value={factor}>{label}</option>
          ))}
        </select>
        <button type="button" onClick={resetSession}>Reset</button>
      </div>
    </div>
  );
}
