"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  Minus,
  Plus,
  X,
} from "lucide-react";

const pictures = {
  hero: "/pizzaslice/hero-pizza.jpg",
  table: "/pizzaslice/table-pizza.jpg",
  oven: "/pizzaslice/oven.jpg",
  dough: "/pizzaslice/dough.jpg",
  kitchen: "/pizzaslice/kitchen.jpg",
} as const;

interface Pie {
  id: string;
  name: string;
  blurb: string;
  detail: string;
  price: string;
  tag?: string;
}

interface MenuItem {
  id: string;
  name: string;
  note: string;
  price: string;
  group: string;
}

const signatures: Pie[] = [
  {
    id: "m-red-sun",
    name: "The Red Sun",
    blurb: "Tomato, mozzarella, basil, the good olive oil.",
    detail: "The house pie. San Marzano-style tomato, fior di latte torn by hand, basil from the window box, and a last pour of olive oil that does more work than it should.",
    price: "16",
    tag: "House standard",
  },
  {
    id: "m-hot-honey",
    name: "Hot Honey Hour",
    blurb: "Tomato, mozzarella, crisp pepperoni, warm honey.",
    detail: "Cup-and-char pepperoni, a slow drizzle of chili honey, and just enough cheese to hold a grudge. Sweet first, heat second, empty plate third.",
    price: "18",
  },
  {
    id: "m-green-room",
    name: "The Green Room",
    blurb: "Mozzarella, market greens, lemon, garden herbs.",
    detail: "No tomato. Whipped ricotta, roasted greens, lemon zest, and herbs that still remember the stem. Proof that white pies can run the night.",
    price: "17",
  },
];

const menuGroups: { title: string; kicker: string; items: MenuItem[] }[] = [
  {
    title: "Pies",
    kicker: "Ten minutes in a very loud oven",
    items: [
      { id: "m-red-sun", name: "The Red Sun", note: "Tomato · mozzarella · basil · olive oil", price: "16", group: "Pies" },
      { id: "m-hot-honey", name: "Hot Honey Hour", note: "Pepperoni · chili honey · mozzarella", price: "18", group: "Pies" },
      { id: "m-green-room", name: "The Green Room", note: "Whipped ricotta · market greens · lemon", price: "17", group: "Pies" },
      { id: "m-ember", name: "Ember & Anchovy", note: "Tomato · anchovy · oregano · crumb", price: "19", group: "Pies" },
      { id: "m-sunday", name: "Sunday Ricotta", note: "Ricotta · sausage · fennel · honey", price: "18", group: "Pies" },
    ],
  },
  {
    title: "Little things",
    kicker: "For the middle of the table",
    items: [
      { id: "m-knots", name: "Olive-oil knots", note: "Soft dough · garlic oil · flaky salt", price: "7", group: "Little things" },
      { id: "m-leaves", name: "Bitter leaves", note: "Little leaves · sharp dressing · cheese", price: "9", group: "Little things" },
      { id: "m-broccoli", name: "Charred broccoli", note: "Chili · lemon · breadcrumb", price: "10", group: "Little things" },
    ],
  },
  {
    title: "To drink",
    kicker: "Cold enough to matter",
    items: [
      { id: "m-citrus", name: "Citrus soda", note: "House-made · bitter orange · soda", price: "5", group: "To drink" },
      { id: "m-house-red", name: "House red", note: "Light, gluggable, slightly dangerous", price: "9", group: "To drink" },
      { id: "m-lager", name: "Local lager", note: "Cold can · no speech required", price: "6", group: "To drink" },
    ],
  },
];

const methodSteps = [
  {
    n: "01",
    title: "Give it the night.",
    body: "Flour, water, salt, time. The dough sits slow so the crust can blister and the flavor can show up before we do.",
    image: pictures.dough,
    alt: "Hands working fresh pizza dough on a floured counter",
  },
  {
    n: "02",
    title: "Let the oven talk.",
    body: "Hot enough to char the edge in one breath. We turn, we watch, we pull it when it's ready, not when the clock says so.",
    image: pictures.oven,
    alt: "A pizza browning in the mouth of a wood-fired oven",
  },
  {
    n: "03",
    title: "Put it in the middle.",
    body: "No plating theater. Down it goes, in the center, where the good part takes care of itself.",
    image: pictures.kitchen,
    alt: "A cook finishing a fresh pizza in the kitchen",
  },
];

const marqueeWords = [
  "Long ferment",
  "Wood fire",
  "Open late",
  "One more chair",
  "Char on the edge",
  "Honey on the pepperoni",
  "No big occasion",
];

export function PizzaSliceExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const padButtonRef = useRef<HTMLButtonElement>(null);
  const [padOpen, setPadOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [noteCollapsed, setNoteCollapsed] = useState(false);
  const [noteDismissed, setNoteDismissed] = useState(false);
  const [list, setList] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();
  const count = Object.values(list).reduce((sum, n) => sum + n, 0);
  const navLinks = [
    { href: "#signatures", label: "Pies" },
    { href: "#menu", label: "Menu" },
    { href: "#method", label: "Method" },
    { href: "#visit", label: "Visit" },
  ] as const;

  const allItems = menuGroups.flatMap((g) => g.items);
  const listedItems = allItems.filter((item) => list[item.id]);
  const showStickyNote = count > 0 && !noteDismissed && !padOpen;
  const subtotal = listedItems.reduce(
    (sum, item) => sum + Number(item.price) * (list[item.id] ?? 0),
    0
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!padOpen && !navOpen) return;
    const oldOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPadOpen(false);
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [padOpen, navOpen]);

  useEffect(() => {
    if (!padOpen) return;
    const pad = rootRef.current?.querySelector<HTMLElement>(".ps-pad");
    const trigger = padButtonRef.current;
    const close = pad?.querySelector<HTMLElement>(".ps-pad-close");
    close?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !pad) return;
      const focusable = [...pad.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
      } else if (!event.shiftKey && event.target === focusable[focusable.length - 1]) {
        event.preventDefault();
        focusable[0].focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [padOpen]);

  function addItem(name: string, id: string) {
    setList((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    setNoteDismissed(false);
    setNoteCollapsed(false);
    setNotice(`${name} · on the pad`);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function changeQty(id: string, delta: number) {
    setList((c) => {
      const next = { ...c };
      const q = (next[id] ?? 0) + delta;
      if (q < 1) delete next[id];
      else next[id] = q;
      return next;
    });
  }

  const fadeUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 36 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-8% 0px" },
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div ref={rootRef} className="ps-root" id="top">
      <div className="ps-grain" aria-hidden="true" />
      <a className="ps-skip" href="#main">Skip to content</a>

      <header className={`ps-header ${scrolled || navOpen ? "is-scrolled" : ""}`}>
        <div className="ps-header-inner">
          <a className="ps-wordmark" href="#top" aria-label="pizzaslice home">
            pizza<em>slice</em>
          </a>
          <nav className="ps-nav" aria-label="Primary" id="ps-primary-nav">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setNavOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="ps-header-actions">
            <button
              ref={padButtonRef}
              className="ps-pad-button"
              type="button"
              onClick={() => {
                setNavOpen(false);
                setPadOpen(true);
              }}
              aria-label={`Open order pad, ${count} item${count === 1 ? "" : "s"}`}
            >
              <span className="ps-pad-button-label">Order pad</span>
              <span className="ps-pad-button-count" aria-hidden="true">
                {String(count).padStart(2, "0")}
              </span>
            </button>
            <button
              className="ps-nav-toggle"
              type="button"
              onClick={() => setNavOpen((open) => !open)}
              aria-expanded={navOpen}
              aria-controls="ps-primary-nav"
              aria-label={navOpen ? "Close menu" : "Open menu"}
            >
              {navOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        <div className={`ps-nav-sheet ${navOpen ? "is-open" : ""}`} hidden={!navOpen}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setNavOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <main id="main">
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="ps-hero" aria-labelledby="ps-title">
          <div className="ps-hero-media" aria-hidden="true">
            <Image
              src={pictures.hero}
              alt=""
              fill
              priority
              sizes="100vw"
              className="ps-hero-img"
            />
            <div className="ps-hero-scrim" />
          </div>
          <div className="ps-hero-content">
            <p className="ps-eyebrow ps-eyebrow-light">
              <span className="ps-eyebrow-rule" />
              Neighborhood pizzeria, still a concept
            </p>
            <h1 id="ps-title" className="ps-hero-title">
              Char on the edge.
              <br />
              <em>Room for one more.</em>
            </h1>
            <div className="ps-hero-row">
              <p className="ps-hero-lead">
                Long-fermented dough, a properly hot oven, and a table that
                never rushes you. That&apos;s the whole idea.
              </p>
              <div className="ps-hero-actions">
                <a className="ps-btn ps-btn-flame" href="#menu">
                  See the menu <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a className="ps-btn ps-btn-ghost-light" href="#method">
                  How we make it
                </a>
              </div>
            </div>
          </div>
          <p className="ps-hero-stamp" aria-hidden="true">
            Open when
            <br />
            the oven is
          </p>
        </section>

        {/* ── Marquee ────────────────────────────────────────── */}
        <div className="ps-marquee" aria-hidden="true">
          <div className="ps-marquee-track">
            {[...marqueeWords, ...marqueeWords].map((word, i) => (
              <span key={`${word}-${i}`}>
                {word}
                <i className="ps-marquee-slice" />
              </span>
            ))}
          </div>
        </div>

        {/* ── Manifesto ──────────────────────────────────────── */}
        <section className="ps-manifesto" aria-labelledby="ps-manifesto-title">
          <div className="ps-manifesto-grid">
            <div className="ps-manifesto-copy">
              <h2 id="ps-manifesto-title" className="ps-display">
                Not a special occasion.
                <br />
                Just a very good <em>Tuesday.</em>
              </h2>
              <p className="ps-body-lg">
                We like tables a little crowded and crusts a little charred.
                This is a place for the extra slice, the long catch-up, and
                people who came hungry and left happy.
              </p>
              <p className="ps-body">
                No secret handshake. No white tablecloth. Just dough that had
                time, fire that means it, and enough chairs for whoever walks
                in next.
              </p>
            </div>
            <figure className="ps-manifesto-figure">
              <Image
                src={pictures.table}
                alt="A pizza set out to share over a wooden table"
                fill
                sizes="(max-width: 900px) 92vw, 44vw"
              />
              <figcaption>The best seat is the one you share.</figcaption>
            </figure>
          </div>
        </section>

        {/* ── Signatures ─────────────────────────────────────── */}
        <section className="ps-signatures" id="signatures" aria-labelledby="ps-sig-title">
          <div className="ps-section-head">
            <h2 id="ps-sig-title" className="ps-display">
              The ones you&apos;ll
              <br />
              <em>order twice.</em>
            </h2>
          </div>

          <div className="ps-sig-layout">
            <motion.article className="ps-sig-hero" {...fadeUp}>
              <a className="ps-sig-hero-media" href="#menu">
                <Image
                  src={pictures.table}
                  alt="The Red Sun pizza, whole and ready to share"
                  fill
                  sizes="(max-width: 900px) 100vw, 58vw"
                />
              </a>
              <div className="ps-sig-hero-body">
                <div className="ps-sig-meta">
                  <span>{signatures[0].tag ?? "Signature"}</span>
                  <span className="ps-sig-price">${signatures[0].price}</span>
                </div>
                <h3>{signatures[0].name}</h3>
                <p className="ps-sig-detail">{signatures[0].detail}</p>
                <button
                  className="ps-text-add"
                  type="button"
                  onClick={() => addItem(signatures[0].name, signatures[0].id)}
                >
                  Add to pad <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </motion.article>

            <div className="ps-sig-stack">
              {signatures.slice(1).map((pie, i) => (
                <motion.article className="ps-sig-card" key={pie.id} {...fadeUp} data-delay={i}>
                  <a className="ps-sig-card-media" href="#menu">
                    <Image
                      src={i === 0 ? pictures.oven : pictures.kitchen}
                      alt={`${pie.name} coming out of the oven`}
                      fill
                      sizes="(max-width: 900px) 92vw, 30vw"
                    />
                  </a>
                  <div className="ps-sig-card-body">
                    <div className="ps-sig-meta">
                      <span>Signature</span>
                      <span className="ps-sig-price">${pie.price}</span>
                    </div>
                    <h3>{pie.name}</h3>
                    <p>{pie.blurb}</p>
                    <button
                      className="ps-text-add"
                      type="button"
                      onClick={() => addItem(pie.name, pie.id)}
                    >
                      Add to pad <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Menu ───────────────────────────────────────────── */}
        <section className="ps-menu" id="menu" aria-labelledby="ps-menu-title">
          <div className="ps-menu-inner">
            <header className="ps-menu-header">
              <h2 id="ps-menu-title" className="ps-display">
                Made to order.
                <br />
                <em>Made to pass around.</em>
              </h2>
              <p className="ps-menu-aside">
                A first pass at the board. Ingredients, allergens, and final
                prices belong to the real kitchen. This is the sketch that
                keeps us honest until the doors open.
              </p>
            </header>

            <div className="ps-menu-board">
              {menuGroups.map((group) => (
                <div className="ps-menu-group" key={group.title}>
                  <div className="ps-menu-group-head">
                    <h3>{group.title}</h3>
                    <p>{group.kicker}</p>
                  </div>
                  <ul className="ps-menu-list">
                    {group.items.map((item) => (
                      <li key={item.id} className="ps-menu-row">
                        <div className="ps-menu-row-main">
                          <h4>{item.name}</h4>
                          <p>{item.note}</p>
                        </div>
                        <span className="ps-menu-leader" aria-hidden="true" />
                        <span className="ps-menu-price">{item.price}</span>
                        <button
                          className="ps-menu-add"
                          type="button"
                          onClick={() => addItem(item.name, item.id)}
                          aria-label={`Add ${item.name} to order pad`}
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="ps-menu-foot">
              <span className="ps-menu-foot-mark" aria-hidden="true" />
              Concept menu · sample prices · confirm everything with the real
              kitchen before opening night.
            </p>
          </div>
        </section>

        {/* ── Method ─────────────────────────────────────────── */}
        <section className="ps-method" id="method" aria-labelledby="ps-method-title">
          <div className="ps-method-head">
            <p className="ps-eyebrow ps-eyebrow-light">
              <span className="ps-eyebrow-rule" />
              How it&apos;s made
            </p>
            <h2 id="ps-method-title" className="ps-display ps-display-light">
              Dough. Fire.
              <br />
              <em>Then everybody.</em>
            </h2>
          </div>
          <div className="ps-method-rail">
            {methodSteps.map((step) => (
              <motion.article className="ps-method-card" key={step.n} {...fadeUp}>
                <figure>
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    sizes="(max-width: 900px) 88vw, 30vw"
                  />
                  <span className="ps-method-n">{step.n}</span>
                </figure>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ── Visit ──────────────────────────────────────────── */}
        <section className="ps-visit" id="visit" aria-labelledby="ps-visit-title">
          <div className="ps-visit-grid">
            <div className="ps-visit-copy">
              <h2 id="ps-visit-title" className="ps-display">
                A table with
                <br />
                <em>your name on it.</em>
              </h2>
              <p className="ps-body-lg">
                We&apos;re still choosing the corner and the oven. When there&apos;s a
                real address, real hours, and a real opening day, you&apos;ll find
                them here first.
              </p>
              <ul className="ps-visit-facts">
                <li>
                  <span className="ps-visit-label">Where</span>
                  <span>A neighborhood corner. Address when it&apos;s real</span>
                </li>
                <li>
                  <span className="ps-visit-label">When</span>
                  <span>Evenings, once the door opens</span>
                </li>
                <li>
                  <span className="ps-visit-label">How</span>
                  <span>Walk in. Pull up a chair. No reservation theater.</span>
                </li>
              </ul>
              <a className="ps-btn ps-btn-ink" href="#method">
                How we make it <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
            <figure className="ps-visit-figure">
              <Image
                src={pictures.kitchen}
                alt="The kitchen mid-service, pizza ready for the pass"
                fill
                sizes="(max-width: 900px) 92vw, 42vw"
              />
              <figcaption>Room for one more.</figcaption>
            </figure>
          </div>
        </section>

        {/* ── Close ──────────────────────────────────────────── */}
        <section className="ps-close" aria-labelledby="ps-close-title">
          <p className="ps-close-kicker">A good night starts somewhere</p>
          <h2 id="ps-close-title" className="ps-close-title">
            Come hungry.
            <br />
            <em>Leave happy.</em>
          </h2>
          <a className="ps-btn ps-btn-flame" href="#menu">
            See the menu <ArrowRight size={15} aria-hidden="true" />
          </a>
        </section>
      </main>

      <footer className="ps-footer">
        <div className="ps-footer-inner">
          <div className="ps-footer-brand">
            <a className="ps-wordmark ps-wordmark-light" href="#top">
              pizza<em>slice</em>
            </a>
            <p>
              A neighborhood pizza concept by Echo11.
              <br />
              The menu is a sketch. The good company is the point.
            </p>
          </div>
          <div className="ps-footer-links">
            <a href="#menu">Menu</a>
            <a href="#method">Method</a>
            <a href="#visit">Visit</a>
            <span>© Echo11 · Concept study</span>
          </div>
        </div>
      </footer>

      <div className="ps-notice" role="status" aria-live="polite" aria-atomic="true">
        {notice}
      </div>

      {/* ── Sticky order note ─────────────────────────────── */}
      <AnimatePresence>
        {showStickyNote && (
          <motion.aside
            className={`ps-sticky ${noteCollapsed ? "is-collapsed" : ""}`}
            aria-label="Current order pad"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: noteCollapsed ? 0 : -1.2 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="ps-sticky-tape" aria-hidden="true" />
            <header className="ps-sticky-head">
              <div className="ps-sticky-heading">
                <p className="ps-sticky-kicker">On the pad</p>
                <h2>
                  {count} item{count === 1 ? "" : "s"}
                  <span className="ps-sticky-total"> · ${subtotal}</span>
                </h2>
              </div>
              <div className="ps-sticky-actions">
                <button
                  className="ps-sticky-icon"
                  type="button"
                  onClick={() => setNoteCollapsed((c) => !c)}
                  aria-expanded={!noteCollapsed}
                  aria-label={noteCollapsed ? "Expand order note" : "Collapse order note"}
                >
                  <ChevronDown size={15} style={{ transform: noteCollapsed ? "rotate(-90deg)" : "none" }} />
                </button>
                <button
                  className="ps-sticky-icon"
                  type="button"
                  onClick={() => setNoteDismissed(true)}
                  aria-label="Hide order note (items stay on the pad)"
                >
                  <X size={15} />
                </button>
              </div>
            </header>

            {!noteCollapsed && (
              <div className="ps-sticky-body">
                <ul className="ps-sticky-list">
                  {listedItems.map((item) => (
                    <li key={item.id} className="ps-sticky-item">
                      <div className="ps-sticky-item-copy">
                        <h3>{item.name}</h3>
                        <p>
                          <span aria-hidden="true">{list[item.id]}×</span>
                          {item.group}
                        </p>
                      </div>
                      <div className="ps-qty">
                        <button
                          type="button"
                          aria-label={`Remove one ${item.name}`}
                          onClick={() => changeQty(item.id, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span aria-live="polite">{list[item.id]}</span>
                        <button
                          type="button"
                          aria-label={`Add one ${item.name}`}
                          onClick={() => changeQty(item.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="ps-sticky-foot">
                  <button
                    className="ps-sticky-edit"
                    type="button"
                    onClick={() => setPadOpen(true)}
                  >
                    Open full pad
                  </button>
                  <button
                    className="ps-sticky-clear"
                    type="button"
                    onClick={() => {
                      setList({});
                      setNoteDismissed(true);
                    }}
                  >
                    Clear
                  </button>
                </div>
                <p className="ps-sticky-note">Concept only. Nothing is ordered.</p>
              </div>
            )}

            {noteCollapsed && (
              <button
                className="ps-sticky-reopen"
                type="button"
                onClick={() => setNoteCollapsed(false)}
              >
                {listedItems
                  .slice(0, 3)
                  .map((item) => `${list[item.id]}× ${item.name}`)
                  .join(" · ")}
                {listedItems.length > 3 ? ` +${listedItems.length - 3}` : ""}
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Order pad ───────────────────────────────────────── */}
      <AnimatePresence>
        {padOpen && (
          <div className="ps-pad-layer">
            <motion.button
              className="ps-pad-scrim"
              type="button"
              aria-label="Close order pad"
              onClick={() => setPadOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.section
              className="ps-pad"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ps-pad-title"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, rotate: -0.6 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ps-pad-top">
                <div>
                  <p className="ps-pad-kicker">Tonight&apos;s short list</p>
                  <h2 id="ps-pad-title">Order pad</h2>
                </div>
                <button
                  className="ps-pad-close"
                  type="button"
                  aria-label="Close order pad"
                  onClick={() => setPadOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {count === 0 ? (
                <div className="ps-pad-empty">
                  <p className="ps-pad-empty-n">01 · empty</p>
                  <h3>Start with something good.</h3>
                  <p>
                    Tap a pie or a little thing. Nothing is ordered. This pad
                    is just for imagining the table.
                  </p>
                  <button
                    className="ps-btn ps-btn-ink"
                    type="button"
                    onClick={() => {
                      setPadOpen(false);
                      document.getElementById("menu")?.scrollIntoView({
                        behavior: reduceMotion ? "auto" : "smooth",
                      });
                    }}
                  >
                    See the menu <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="ps-pad-body">
                  <ul className="ps-pad-list">
                    {allItems
                      .filter((item) => list[item.id])
                      .map((item) => (
                        <li key={item.id} className="ps-pad-item">
                          <div>
                            <span className="ps-pad-item-group">{item.group}</span>
                            <h3>{item.name}</h3>
                            <p>{item.note}</p>
                          </div>
                          <div className="ps-qty">
                            <button
                              type="button"
                              aria-label={`Remove one ${item.name}`}
                              onClick={() => changeQty(item.id, -1)}
                            >
                              <Minus size={13} />
                            </button>
                            <span aria-live="polite">{list[item.id]}</span>
                            <button
                              type="button"
                              aria-label={`Add one ${item.name}`}
                              onClick={() => changeQty(item.id, 1)}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                  <p className="ps-pad-note">
                    Visual concept only. No order is placed and no pricing is
                    final.
                  </p>
                </div>
              )}
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
