import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useAnimation,
} from "framer-motion";

/* ---------------------------------------------------------------
   DATA  (later: fetch this from Firebase Firestore)
---------------------------------------------------------------- */
const MENU = [
  { id: 1, name: "Paneer Tikka Pizza", price: 349, cat: "Pizza", veg: true, rating: 4.6, time: 25, emoji: "🍕", desc: "Smoky paneer, onion, capsicum, mozzarella." },
  { id: 2, name: "Margherita", price: 249, cat: "Pizza", veg: true, rating: 4.4, time: 20, emoji: "🍕", desc: "Classic tomato, basil and fresh cheese." },
  { id: 3, name: "Chicken Peri Pizza", price: 389, cat: "Pizza", veg: false, rating: 4.7, time: 25, emoji: "🍕", desc: "Spicy peri-peri chicken with jalapeños." },
  { id: 4, name: "Aloo Tikki Burger", price: 129, cat: "Burgers", veg: true, rating: 4.2, time: 15, emoji: "🍔", desc: "Crispy potato patty, mint mayo, lettuce." },
  { id: 5, name: "Crispy Chicken Burger", price: 189, cat: "Burgers", veg: false, rating: 4.5, time: 18, emoji: "🍔", desc: "Fried chicken fillet, cheese, house sauce." },
  { id: 6, name: "Chicken Biryani", price: 279, cat: "Rice", veg: false, rating: 4.8, time: 30, emoji: "🍛", desc: "Dum-cooked basmati with tender chicken." },
  { id: 7, name: "Veg Biryani", price: 219, cat: "Rice", veg: true, rating: 4.3, time: 28, emoji: "🍛", desc: "Fragrant rice with vegetables and raita." },
  { id: 8, name: "Masala Fries", price: 99, cat: "Sides", veg: true, rating: 4.1, time: 10, emoji: "🍟", desc: "Hot fries tossed in chaat masala." },
  { id: 9, name: "Garlic Bread", price: 119, cat: "Sides", veg: true, rating: 4.4, time: 12, emoji: "🥖", desc: "Toasted with garlic butter and herbs." },
  { id: 10, name: "Cold Coffee", price: 129, cat: "Drinks", veg: true, rating: 4.6, time: 8, emoji: "🧋", desc: "Thick, chilled, with a scoop of ice cream." },
  { id: 11, name: "Fresh Lime Soda", price: 69, cat: "Drinks", veg: true, rating: 4.0, time: 5, emoji: "🍋", desc: "Sweet, salted or mixed. Very fizzy." },
  { id: 12, name: "Gulab Jamun", price: 89, cat: "Dessert", veg: true, rating: 4.7, time: 8, emoji: "🍮", desc: "Two warm jamuns in saffron syrup." },
];
const CATS = ["All", ...new Set(MENU.map((m) => m.cat))];
const PROMOS = {
  SAVE20: { label: "20% off (max ₹100)", calc: (s) => Math.min(Math.round(s * 0.2), 100) },
  FLAT50: { label: "₹50 off above ₹300", calc: (s) => (s >= 300 ? 50 : 0) },
};
const DELIVERY_FEE = 30;
const FREE_DELIVERY_ABOVE = 500;
const GST = 0.05;

const inr = (n) => "₹" + n.toLocaleString("en-IN");

/* ---------------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------------- */
export default function Resto() {
  const [cat, setCat] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("resto-cart")) || {};
    } catch {
      return {};
    }
  });
  const [drawer, setDrawer] = useState(false);
  const [step, setStep] = useState("cart"); // cart | details | done
  const [promo, setPromo] = useState(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});
  const [orderId, setOrderId] = useState("");
  const [flyers, setFlyers] = useState([]);
  const [toast, setToast] = useState("");

  const cartBtnRef = useRef(null);
  const cartControls = useAnimation();
  const toastTimer = useRef(null);

  /* persist cart */
  useEffect(() => {
    try {
      localStorage.setItem("resto-cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  /* lock page scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [drawer]);

  /* ---------- derived values ---------- */
  const items = useMemo(
    () =>
      MENU.filter(
        (m) =>
          (cat === "All" || m.cat === cat) &&
          (!vegOnly || m.veg) &&
          m.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [cat, vegOnly, query]
  );

  const lines = MENU.filter((m) => cart[m.id]);
  const count = lines.reduce((n, m) => n + cart[m.id], 0);
  const subtotal = lines.reduce((n, m) => n + cart[m.id] * m.price, 0);
  const discount = promo ? PROMOS[promo].calc(subtotal) : 0;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const tax = Math.round((subtotal - discount) * GST);
  const total = Math.max(subtotal - discount + tax + delivery, 0);
  const freeLeft = Math.max(FREE_DELIVERY_ABOVE - subtotal, 0);

  /* ---------- actions ---------- */
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1600);
  };

  const change = (id, d) =>
    setCart((c) => {
      const q = (c[id] || 0) + d;
      const next = { ...c };
      if (q <= 0) delete next[id];
      else next[id] = Math.min(q, 20);
      return next;
    });

  /* add + "fly to cart" animation */
  const addWithFly = (item, e) => {
    change(item.id, 1);
    const from = e.currentTarget.getBoundingClientRect();
    const to = cartBtnRef.current?.getBoundingClientRect();
    if (!to) return;
    setFlyers((f) => [
      ...f,
      {
        key: Date.now() + Math.random(),
        emoji: item.emoji,
        from: { x: from.left + from.width / 2 - 16, y: from.top },
        to: { x: to.left + to.width / 2 - 16, y: to.top + to.height / 2 - 16 },
      },
    ]);
  };

  const removeFlyer = (key) => {
    setFlyers((f) => f.filter((x) => x.key !== key));
    cartControls.start({ scale: [1, 1.18, 1], transition: { duration: 0.3 } });
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!PROMOS[code]) return setPromoMsg("That code isn't valid.");
    if (PROMOS[code].calc(subtotal) === 0)
      return setPromoMsg("Add more items to use this code.");
    setPromo(code);
    setPromoMsg("");
    setPromoInput("");
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Enter your name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (form.address.trim().length < 8) e.address = "Enter your full delivery address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (!validate()) return;
    /* Firebase later:
       await addDoc(collection(db, "orders"), { form, cart, total, createdAt: serverTimestamp() }) */
    setOrderId("RST" + Math.floor(100000 + Math.random() * 900000));
    setCart({});
    setPromo(null);
    setStep("done");
  };

  const closeDrawer = () => {
    setDrawer(false);
    setTimeout(() => {
      if (step === "done") setStep("cart");
    }, 300);
  };

  /* ---------------------------------------------------------------
     UI
  ---------------------------------------------------------------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F3F7F2] text-[#1B1B2F]">
        {/* HEADER */}
        <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F3F7F2]/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <h1 className="text-xl font-black tracking-tight">
              Tiffin<span className="text-[#E63946]">Express</span>
            </h1>

            <div className="relative ml-auto hidden flex-1 max-w-xs sm:block">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes"
                className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none transition focus:border-[#FFB400] focus:ring-2 focus:ring-[#FFB400]/40"
              />
            </div>

            <motion.button
              ref={cartBtnRef}
              animate={cartControls}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setStep("cart");
                setDrawer(true);
              }}
              className="relative ml-auto rounded-full bg-[#1B1B2F] px-5 py-2 text-sm font-bold text-white sm:ml-0"
              aria-label="Open cart"
            >
              🛒 Cart
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14 }}
                    className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-[#E63946] px-1 text-xs"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-28">
          {/* HERO */}
          <section className="mb-8 mt-6 overflow-hidden rounded-[2rem] bg-[#1B1B2F] p-6 text-white sm:p-10">
            <div className="flex items-center justify-between gap-6">
              <div>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-4xl font-black leading-[1.05] sm:text-6xl"
                >
                  Hot food,
                  <br />
                  at your door.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 max-w-sm text-white/70"
                >
                  Free delivery above {inr(FREE_DELIVERY_ABOVE)}. Try code{" "}
                  <b className="text-[#FFB400]">SAVE20</b> at checkout.
                </motion.p>
              </div>
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="hidden select-none text-[8rem] sm:block"
              >
                🍕
              </motion.div>
            </div>
          </section>

          {/* mobile search */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes"
            className="mb-4 w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-[#FFB400] sm:hidden"
          />

          {/* FILTERS */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex flex-1 gap-1 overflow-x-auto pb-1">
              {CATS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className="relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold"
                >
                  {cat === c && (
                    <motion.span
                      layoutId="cat-pill"
                      className="absolute inset-0 rounded-full bg-[#FFB400]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{c}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setVegOnly((v) => !v)}
              className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold"
              aria-pressed={vegOnly}
            >
              Veg only
              <span
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                  vegOnly ? "bg-green-600 justify-end" : "bg-neutral-300 justify-start"
                }`}
              >
                <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="h-5 w-5 rounded-full bg-white" />
              </span>
            </button>
          </div>

          {/* MENU GRID */}
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((m) => (
                <motion.article
                  layout
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  className="flex flex-col rounded-3xl bg-white p-4 shadow-sm"
                >
                  <div className="relative mb-3 grid h-32 place-items-center rounded-2xl bg-[#EAF6EF] text-7xl">
                    <motion.span whileHover={{ scale: 1.15, rotate: -6 }}>{m.emoji}</motion.span>
                    <span
                      className={`absolute left-3 top-3 grid h-5 w-5 place-items-center rounded border-2 bg-white ${
                        m.veg ? "border-green-600" : "border-red-600"
                      }`}
                      title={m.veg ? "Veg" : "Non-veg"}
                    >
                      <span className={`h-2 w-2 rounded-full ${m.veg ? "bg-green-600" : "bg-red-600"}`} />
                    </span>
                  </div>
                  <h3 className="font-bold leading-snug">{m.name}</h3>
                  <p className="mt-1 flex-1 text-xs text-neutral-500">{m.desc}</p>
                  <p className="mt-2 text-xs text-neutral-600">
                    ⭐ {m.rating} · {m.time} min
                  </p>

                  <div className="mt-3 flex h-10 items-center justify-between">
                    <span className="text-lg font-extrabold">{inr(m.price)}</span>

                    <AnimatePresence mode="wait" initial={false}>
                      {cart[m.id] ? (
                        <motion.div
                          key="stepper"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="flex items-center gap-2 rounded-full bg-[#E63946] px-1 py-1 text-white"
                        >
                          <button onClick={() => change(m.id, -1)} className="h-7 w-7 rounded-full text-lg font-bold hover:bg-white/20" aria-label="Remove one">−</button>
                          <motion.span key={cart[m.id]} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-5 text-center text-sm font-bold">
                            {cart[m.id]}
                          </motion.span>
                          <button onClick={(e) => addWithFly(m, e)} className="h-7 w-7 rounded-full text-lg font-bold hover:bg-white/20" aria-label="Add one">+</button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="add"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => addWithFly(m, e)}
                          className="rounded-full border-2 border-[#E63946] px-5 py-1.5 text-sm font-bold text-[#E63946] transition hover:bg-[#E63946] hover:text-white"
                        >
                          Add
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {items.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center text-neutral-500">
              No dishes match your search. Try clearing the filters.
            </motion.p>
          )}
        </main>

        {/* FLOATING CART BAR (mobile friendly) */}
        <AnimatePresence>
          {count > 0 && !drawer && (
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={() => {
                setStep("cart");
                setDrawer(true);
              }}
              className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl bg-[#E63946] px-5 py-4 font-bold text-white shadow-xl"
            >
              <span>{count} item{count > 1 ? "s" : ""}</span>
              <span>View cart · {inr(subtotal)}</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* FLYING EMOJIS */}
        {flyers.map((f) => (
          <motion.div
            key={f.key}
            initial={{ x: f.from.x, y: f.from.y, scale: 1, opacity: 1 }}
            animate={{ x: f.to.x, y: f.to.y, scale: 0.35, opacity: 0.7 }}
            transition={{ duration: 0.7, ease: [0.5, 0, 0.75, 0] }}
            onAnimationComplete={() => removeFlyer(f.key)}
            className="pointer-events-none fixed left-0 top-0 z-50 text-3xl"
          >
            {f.emoji}
          </motion.div>
        ))}

        {/* TOAST */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 rounded-full bg-[#1B1B2F] px-5 py-2 text-sm font-semibold text-white shadow-lg"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* DRAWER */}
        <AnimatePresence>
          {drawer && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDrawer}
                className="fixed inset-0 z-30 bg-black/50"
              />
              <motion.aside
                key="panel"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 34 }}
                className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col bg-white"
              >
                <div className="flex items-center justify-between border-b border-black/5 p-5">
                  <h2 className="text-xl font-black">
                    {step === "cart" && "Your order"}
                    {step === "details" && "Delivery details"}
                    {step === "done" && "Order confirmed"}
                  </h2>
                  <button onClick={closeDrawer} className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-xl" aria-label="Close">×</button>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {/* ---------- STEP 1: CART ---------- */}
                  {step === "cart" && (
                    <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-1 flex-col overflow-hidden">
                      <div className="flex-1 space-y-3 overflow-y-auto p-5">
                        {lines.length === 0 ? (
                          <div className="grid h-full place-items-center text-center text-neutral-500">
                            <div>
                              <div className="text-6xl">🍽️</div>
                              <p className="mt-3">Your cart is empty. Add something tasty.</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* free delivery progress */}
                            <div className="rounded-2xl bg-[#EAF6EF] p-3 text-sm">
                              {freeLeft > 0 ? (
                                <>Add <b>{inr(freeLeft)}</b> more for free delivery</>
                              ) : (
                                <b>You've unlocked free delivery 🎉</b>
                              )}
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                                <motion.div
                                  className="h-full rounded-full bg-green-600"
                                  animate={{ width: `${Math.min((subtotal / FREE_DELIVERY_ABOVE) * 100, 100)}%` }}
                                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                />
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {lines.map((m) => (
                                <motion.div
                                  layout
                                  key={m.id}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0, x: 60 }}
                                  className="overflow-hidden"
                                >
                                  <div className="flex items-center gap-3 py-1">
                                    <span className="text-3xl">{m.emoji}</span>
                                    <div className="flex-1">
                                      <p className="font-semibold leading-tight">{m.name}</p>
                                      <p className="text-sm text-neutral-500">{inr(m.price)} each</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => change(m.id, -1)} className="h-8 w-8 rounded-full bg-neutral-100 font-bold">−</button>
                                      <motion.span key={cart[m.id]} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-5 text-center font-bold">
                                        {cart[m.id]}
                                      </motion.span>
                                      <button onClick={() => change(m.id, 1)} className="h-8 w-8 rounded-full bg-neutral-100 font-bold">+</button>
                                    </div>
                                    <span className="w-16 text-right font-bold">{inr(m.price * cart[m.id])}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {/* promo */}
                            <div className="pt-2">
                              {promo ? (
                                <div className="flex items-center justify-between rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                                  <span><b>{promo}</b> applied: {PROMOS[promo].label}</span>
                                  <button onClick={() => setPromo(null)} className="font-bold">Remove</button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex gap-2">
                                    <input
                                      value={promoInput}
                                      onChange={(e) => setPromoInput(e.target.value)}
                                      placeholder="Promo code"
                                      className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm uppercase outline-none focus:border-[#FFB400]"
                                    />
                                    <button onClick={applyPromo} className="rounded-xl bg-[#FFB400] px-4 text-sm font-bold">Apply</button>
                                  </div>
                                  {promoMsg && <p className="mt-1 text-xs text-red-600">{promoMsg}</p>}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {lines.length > 0 && (
                        <div className="space-y-1 border-t border-black/5 p-5 text-sm">
                          <Row label="Subtotal" value={inr(subtotal)} />
                          {discount > 0 && <Row label="Discount" value={"−" + inr(discount)} green />}
                          <Row label="GST (5%)" value={inr(tax)} />
                          <Row label="Delivery" value={delivery === 0 ? "Free" : inr(delivery)} />
                          <div className="flex justify-between pt-2 text-lg font-black">
                            <span>Total</span>
                            <motion.span key={total} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>{inr(total)}</motion.span>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setStep("details")}
                            className="mt-3 w-full rounded-2xl bg-[#1B1B2F] py-3.5 font-bold text-white"
                          >
                            Continue to checkout
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ---------- STEP 2: DETAILS ---------- */}
                  {step === "details" && (
                    <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-1 flex-col overflow-y-auto p-5">
                      <Field label="Name" error={errors.name}>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Your name" />
                      </Field>
                      <Field label="Mobile number" error={errors.phone}>
                        <input value={form.phone} inputMode="numeric" maxLength={10} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} className="input" placeholder="10-digit number" />
                      </Field>
                      <Field label="Delivery address" error={errors.address}>
                        <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" placeholder="House no, street, area, city" />
                      </Field>

                      <div className="mt-auto space-y-2 pt-4">
                        <p className="flex justify-between text-lg font-black"><span>To pay</span><span>{inr(total)}</span></p>
                        <p className="text-xs text-neutral-500">Cash on delivery</p>
                        <motion.button whileTap={{ scale: 0.96 }} onClick={placeOrder} className="w-full rounded-2xl bg-[#E63946] py-3.5 font-bold text-white">
                          Place order
                        </motion.button>
                        <button onClick={() => setStep("cart")} className="w-full py-2 text-sm font-semibold text-neutral-600">Back to cart</button>
                      </div>
                    </motion.div>
                  )}

                  {/* ---------- STEP 3: DONE ---------- */}
                  {step === "done" && (
                    <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid flex-1 place-items-center p-8 text-center">
                      <div>
                        <motion.svg viewBox="0 0 52 52" className="mx-auto h-28 w-28" initial="hidden" animate="show">
                          <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#16a34a" strokeWidth="3" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.6 } } }} />
                          <motion.path d="M14 27 l8 8 l16 -17" fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { delay: 0.5, duration: 0.4 } } }} />
                        </motion.svg>
                        <motion.h3 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="mt-5 text-2xl font-black">
                          Order placed!
                        </motion.h3>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-2 text-neutral-600">
                          Order ID <b>{orderId}</b>
                          <br />
                          Arriving in about 30 minutes.
                        </motion.p>
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.3 }}
                          onClick={closeDrawer}
                          className="mt-6 rounded-2xl bg-[#1B1B2F] px-6 py-3 font-bold text-white"
                        >
                          Order more
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* tiny shared style for form inputs */}
        <style>{`
          .input{width:100%;border:1px solid rgba(0,0,0,.12);border-radius:.75rem;padding:.6rem .8rem;outline:none;font-size:.9rem}
          .input:focus{border-color:#FFB400;box-shadow:0 0 0 3px rgba(255,180,0,.3)}
        `}</style>
      </div>
    </MotionConfig>
  );
}

/* ---------- small helpers ---------- */
function Row({ label, value, green }) {
  return (
    <div className={`flex justify-between ${green ? "text-green-600" : "text-neutral-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1 block text-xs text-red-600">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}