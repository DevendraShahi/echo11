"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Fraunces, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { ROOMS, STAY_ROOMS, EXPERIENCES, STORIES, MENU_LINKS, type RoomKey } from "./data";
import { useLaltinMotion } from "./use-laltin-motion";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-laltin-display",
  display: "swap",
});
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-laltin-sans",
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-laltin-mono",
  display: "swap",
});

const EASE_UI = [0.22, 1, 0.36, 1] as const;
const EASE_CINE = [0.76, 0, 0.24, 1] as const;

function Img({
  name,
  w,
  h,
  alt,
  className,
  eager,
  hero,
  ...rest
}: {
  name: string;
  w: number;
  h: number;
  alt: string;
  className?: string;
  eager?: boolean;
  hero?: boolean;
  [key: string]: unknown;
}) {
  return (
    <picture>
      <source type="image/webp" srcSet={`/laltin/assets/img/${name}.webp`} />
      <img
        src={`/laltin/assets/img/${name}.jpg`}
        width={w}
        height={h}
        alt={alt}
        className={className}
        loading={eager ? undefined : "lazy"}
        fetchPriority={hero ? "high" : undefined}
        {...rest}
      />
    </picture>
  );
}

export function LaltinApp() {
  const rootRef = useRef<HTMLDivElement>(null);
  useLaltinMotion(rootRef);

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuBg, setMenuBg] = useState<string>("stay");
  const [roomOpen, setRoomOpen] = useState<RoomKey | null>(null);
  const [storyOpen, setStoryOpen] = useState<string | null>(null);
  const [activeExp, setActiveExp] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [night, setNight] = useState(false);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [guests, setGuests] = useState(2);
  const [bookingError, setBookingError] = useState("");
  const [bookingSummary, setBookingSummary] = useState("");
  const [today, setToday] = useState("");

  const chipRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const menuFocusBack = useRef<HTMLElement | null>(null);

  const activeRoom = roomOpen ? ROOMS[roomOpen] : null;
  const activeStory = storyOpen ? STORIES[storyOpen] : null;

  /* Active ritual observer for Section 05 reading rail */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const chapters = root.querySelectorAll<HTMLElement>("[data-ritual-index]");
    if (!chapters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-ritual-index") || "0", 10);
            setActiveExp(idx);
          }
        });
      },
      {
        rootMargin: "-20% 0px -45% 0px",
        threshold: 0.1,
      }
    );

    chapters.forEach((ch) => observer.observe(ch));
    return () => observer.disconnect();
  }, []);

  /* SSR-safe date floor */
  useEffect(() => {
    const d = new Date();
    const iso = (x: Date) =>
      `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
    setToday(iso(d));
  }, []);

  /* nav scrolled / night state (ported) */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let ticking = false;

    const overDark = (rect: DOMRect, h: number) => rect.top <= h && rect.bottom > h;

    const update = () => {
      ticking = false;
      const y = window.scrollY || 0;
      const nav = el.querySelector<HTMLElement>("[data-nav]");
      const hero = el.querySelector<HTMLElement>(".hero");
      const dusk = el.querySelector<HTMLElement>(".dusk");
      const h = nav?.offsetHeight ?? 72;
      const pastHero = hero ? hero.offsetHeight - 90 : 60;
      setScrolled(y > Math.max(pastHero, 40));

      let isNight = false;
      const darks = el.querySelectorAll<HTMLElement>(".stay, .laltin-night, .journal, .reserve, .footer");
      darks.forEach((s) => {
        if (overDark(s.getBoundingClientRect(), h)) isNight = true;
      });
      if (!isNight && dusk) {
        const d = dusk.getBoundingClientRect();
        if (overDark(d, h)) {
          isNight = (h - d.top) / d.height >= 0.62;
        }
      }
      setNight(isNight);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* menu focus management */
  useEffect(() => {
    if (!menuOpen) return;
    menuCloseRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      menuFocusBack.current?.focus?.();
    };
  }, [menuOpen]);

  /* dialog escape */
  useEffect(() => {
    if (!roomOpen && !storyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRoomOpen(null);
        setStoryOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [roomOpen, storyOpen]);

  const openRoom = (key: RoomKey) => setRoomOpen(key);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arrival || !departure) {
      setBookingError("Please choose both arrival and departure dates.");
      setBookingSummary("");
      return;
    }
    if (today && arrival < today) {
      setBookingError("Arrival cannot be in the past.");
      setBookingSummary("");
      return;
    }
    if (departure <= arrival) {
      setBookingError("Departure must be after arrival.");
      setBookingSummary("");
      return;
    }
    setBookingError("");
    const label = (v: string) =>
      new Date(v + "T00:00:00")
        .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
        .toUpperCase()
        .replace(/\./g, "");
    setBookingSummary(
      `${label(arrival)} → ${label(departure)} · ${guests} ${guests === 1 ? "guest" : "guests"}`
    );
  };

  const navClass = useMemo(
    () => `nav${scrolled ? " is-scrolled" : ""}${night ? " is-night" : ""}`,
    [scrolled, night]
  );

  return (
    <div
      ref={rootRef}
      className={`laltin-scope ${fraunces.variable} ${instrumentSans.variable} ${ibmPlexMono.variable}`}
      data-laltin-root
    >
      <a className="skip" href="#laltin-main">
        Skip to content
      </a>

      {/* ============================ NAV (§32) ============================ */}
      <header className={navClass} data-nav>
        <div className="nav__inner shell">
          <a className="nav__logo" href="#top" aria-label="LALTIN home">
            LALTIN
          </a>
          <nav className="nav__links" aria-label="Primary">
            <a href="#stay">Stay</a>
            <a href="#experience">Experience</a>
            <a href="#eat">Eat</a>
            <a href="#place">Place</a>
            <a href="#people">Story</a>
          </nav>
          <div className="nav__actions">
            <a className="nav__reserve" href="#reserve">
              Reserve
            </a>
            <button
              ref={menuBtnRef}
              className="nav__menu-btn"
              type="button"
              onClick={() => {
                menuFocusBack.current = document.activeElement as HTMLElement;
                setMenuOpen(true);
              }}
              aria-expanded={menuOpen}
              aria-controls="laltin-menu"
            >
              <span className="bars" aria-hidden="true">
                <i />
                <i />
              </span>{" "}
              Menu
            </button>
          </div>
        </div>
        <div
          data-nav-progress
          className="nav__progress"
          aria-hidden="true"
        />
      </header>

      {/* ======================== FULLSCREEN MENU (§33) ===================== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="menu is-open"
            id="laltin-menu"
            aria-hidden="false"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{}}
          >
            <div className="menu__bg" aria-hidden="true">
              {(["stay", "eat", "place"] as const).map((key) => (
                <motion.div
                  key={key}
                  className={`menu__bg-img${menuBg === key ? " is-active" : ""}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: menuBg === key ? 1 : 0 }}
                  transition={{ duration: 0.75, ease: EASE_UI }}
                >
                  <Img
                    name={key === "stay" ? "room-cottage" : key === "eat" ? "table" : "place-main"}
                    w={key === "stay" ? 1023 : key === "eat" ? 2200 : 2200}
                    h={key === "stay" ? 681 : key === "eat" ? 1542 : 1466}
                    alt=""
                    eager
                  />
                </motion.div>
              ))}
            </div>
            <motion.div
              className="menu__sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.85, ease: EASE_CINE }}
            >
              <div className="menu__top">
                <span className="nav__logo">Laltin</span>
                <button
                  ref={menuCloseRef}
                  className="menu__close"
                  type="button"
                  onClick={() => setMenuOpen(false)}
                >
                  Close ✕
                </button>
              </div>
              <div className="menu__body">
                <nav className="menu__list" aria-label="Menu">
                  {MENU_LINKS.map((item, i) => (
                    <motion.a
                      key={item.href}
                      className="menu__link"
                      href={item.href}
                      data-menu-img={item.bg ?? undefined}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.06, duration: 0.55, ease: EASE_UI }}
                      onMouseEnter={() => item.bg && setMenuBg(item.bg)}
                      onFocus={() => item.bg && setMenuBg(item.bg)}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="idx">{item.idx}</span>
                      <span className="label">{item.label}</span>
                      <span className="arrow" aria-hidden="true">
                        →
                      </span>
                    </motion.a>
                  ))}
                </nav>
                <motion.div
                  className="menu__aside"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6, ease: EASE_UI }}
                >
                  <p className="mono">
                    Laltin EcoResort · Nepal
                    <br />
                    27.7172° N — 85.3240° E
                  </p>
                  <div className="menu__aside-links">
                    <a href="#getting-here" onClick={() => setMenuOpen(false)}>
                      Getting here <span aria-hidden="true">→</span>
                    </a>
                    <a href="#contact" onClick={() => setMenuOpen(false)}>
                      Contact <span aria-hidden="true">→</span>
                    </a>
                    <a href="#reserve" onClick={() => setMenuOpen(false)}>
                      Reserve <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="laltin-main">
        {/* ==================== 00 · ARRIVAL — COVER NOT OVERLAY ==================== */}
        <section className="hero" id="top" aria-label="Arrival">
          <div className="hero__photo-stage">
            <picture>
              <source media="(max-width: 639px)" srcSet="/laltin/assets/img/hero-mobile.webp" type="image/webp" />
              <source media="(max-width: 639px)" srcSet="/laltin/assets/img/hero-mobile.jpg" />
              <source srcSet="/showcase/laltin/laltin-hero-cinematic.webp" type="image/webp" />
              <img
                src="/showcase/laltin/laltin-hero-cinematic.webp"
                alt="Mountain ridge and morning light above Laltin, Nepal"
                width={2352}
                height={1008}
                fetchPriority="high"
                decoding="async"
                data-hero-img
              />
            </picture>
            <div className="hero__photo-fade" aria-hidden="true" />
            <div className="hero__location mono" data-hero-location>
              Nepal
            </div>
          </div>
          <div className="hero__type-panel" data-hero-panel>
            <div className="hero__panel-inner">
              <div className="hero__brand">
                <h1 className="hero__title" id="hero-title">
                  LALTIN
                </h1>
              </div>
              <div className="hero__meta" data-hero-meta>
                <p className="hero__descriptor mono">EcoResort · Nepal</p>
                <div className="hero__actions">
                  <a className="btn btn--ember hero__reserve" href="#reserve">
                    Reserve a stay
                  </a>
                  <a
                    className="hero__scroll mono"
                    href="#interruption"
                    aria-label="Scroll to begin"
                    data-hero-cue
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById("interruption");
                      if (target) {
                        target.scrollIntoView({ behavior: "smooth" });
                      } else {
                        window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
                      }
                    }}
                  >
                    Scroll ↓
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 01 · INTERRUPTION ==================== */}
        <section className="interruption" id="interruption" aria-label="Statement">
          <div className="interruption__inner">
            <div className="interruption__top">
              <div className="interruption__rail" data-interruption-rail>
                <span className="interruption__rail-num mono">01</span>
                <span className="interruption__rail-dash mono" aria-hidden="true">—</span>
                <span className="interruption__rail-label mono">INTERRUPTION</span>
              </div>
              <div className="interruption__main">
                <h2 className="interruption__statement" data-interruption-statement>
                  <span className="interruption__line">There are places</span>{" "}
                  <span className="interruption__line">you visit.</span>{" "}
                  <span className="interruption__line">And places that</span>{" "}
                  <span className="interruption__line">change your pace.</span>
                </h2>
              </div>
            </div>

            <div className="interruption__footnote-wrap" data-interruption-footnote>
              <div className="interruption__rule" aria-hidden="true" />
              <div className="interruption__footnote">
                <p className="interruption__footnote-label mono">MORNING</p>
                <p className="interruption__note">
                  Morning arrives slowly here. First through the trees, then across the cottages, and finally onto the
                  breakfast table.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 02 · THE PLACE ==================== */}
        <section className="place" id="place" aria-labelledby="place-title">
          <div className="place__inner">
            <header className="place__header">
              <p className="place__eyebrow mono">02 / THE PLACE</p>
              <p className="place__coords mono">29.52917° N, 82.09306° E</p>
            </header>

            <figure className="place__main-photo" data-place-main>
              <picture>
                <source type="image/webp" srcSet="/images/laltin/rara-lake-main.webp" />
                <img
                  src="/images/laltin/rara-lake-main.jpg"
                  width={2048}
                  height={1152}
                  alt="Rara Lake"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </figure>

            <div className="place__editorial" data-place-editorial>
              <div className="place__headline-col">
                <h2 className="place__title" id="place-title">
                  <span className="place__title-line">Somewhere</span>{" "}
                  <span className="place__title-line">between</span>{" "}
                  <span className="place__title-line">forest and sky.</span>
                </h2>
              </div>
              <div className="place__copy-col">
                <p className="place__lead">
                  Laltin was created around the rhythms already here.
                </p>
                <a className="place__link" href="#stay">
                  Explore the place <span className="place__link-arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            <figure className="place__secondary" data-place-secondary>
              <picture>
                <source type="image/webp" srcSet="/images/laltin/rara-cabin.webp" />
                <img
                  src="/images/laltin/rara-cabin.jpg"
                  width={1792}
                  height={1344}
                  alt="A lakeshore cabin at Rara Lake"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </figure>
          </div>
        </section>

        {/* ==================== 03 · STAY (Full-Screen Room Journey) ==================== */}
        <section className="stay stay--journey" id="stay" aria-labelledby="stay-title">
          <div className="stay__header-wrap">
            <header className="stay__header">
              <p className="stay__eyebrow mono">03 / STAY</p>
              <h2 className="stay__title" id="stay-title">
                Spaces shaped around stillness.
              </h2>
              <div className="stay__disclaimer-wrap">
                <div className="stay__disclaimer-rule" aria-hidden="true" />
                <p className="stay__disclaimer mono">
                  ROOM DETAILS PROVISIONAL — AWAITING PROPERTY CONFIRMATION
                </p>
              </div>
            </header>
          </div>

          <div className="stay__journey" data-stay-journey>
            <div className="stay__stage-pin" data-stay-stage>
              {STAY_ROOMS.map((room, idx) => (
                <article
                  key={room.key}
                  className={`stay__slide ${idx === 0 ? "is-first" : ""}`}
                  data-stay-slide={idx}
                >
                  <figure className="stay__slide-photo-wrap">
                    <picture>
                      <source srcSet={room.imageSrc} type="image/webp" />
                      <img
                        src={room.imageSrc}
                        alt={room.alt}
                        width={2560}
                        height={1440}
                        className="stay__slide-photo"
                        loading={idx === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </picture>
                    <div className="stay__slide-vignette" aria-hidden="true" />
                  </figure>

                  <div className="stay__slide-content">
                    <div className="stay__slide-header">
                      <span className="stay__slide-num mono">{room.num}</span>
                      <h3 className="stay__slide-name">{room.name}</h3>
                    </div>
                    <p className="stay__slide-spec mono">{room.spec}</p>
                    <div className="stay__slide-actions">
                      <button
                        className="stay__slide-btn"
                        type="button"
                        onClick={() => openRoom(room.key)}
                        aria-label={`View ${room.name} details`}
                      >
                        View room
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="stay__bottom-spacer" aria-hidden="true" />
        </section>

        {/* ==================== 04 · MORNING (Dawn Sequence) ==================== */}
        <section
          className="morning morning--dawn"
          id="morning"
          aria-labelledby="morning-title"
          data-morning
        >
          <div className="morning__header-wrap" data-morning-header>
            <p className="morning__eyebrow mono" data-morning-eyebrow>
              04 / MORNING
            </p>
            <h2 className="morning__title" id="morning-title" data-morning-title>
              The first light.
            </h2>
          </div>

          <figure className="morning__photo-wrap" data-morning-photo-wrap>
            <picture>
              <source type="image/webp" srcSet="/laltin/assets/img/morning.webp" />
              <img
                src="/laltin/assets/img/morning.jpg"
                width={2200}
                height={1467}
                alt="First light and steam — a morning interior"
                className="morning__photo"
                data-morning-photo
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="morning__mist" data-morning-mist aria-hidden="true" />
          </figure>

          <div className="morning__editorial" data-morning-editorial>
            <div className="morning__rule" aria-hidden="true" />
            <div className="morning__facts">
              <span className="morning__time mono" data-morning-time>
                06:14
              </span>
              <span className="morning__stamp mono" data-morning-stamp>
                Morning / Laltin
              </span>
            </div>
          </div>
        </section>

        {/* ==================== 05 · EXPERIENCE (Ritual Journey) ==================== */}
        <section
          className="section experience experience--rituals"
          id="experience"
          aria-labelledby="exp-title"
          data-experience
        >
          <div className="experience__inner">
            <header className="experience__header">
              <p className="experience__eyebrow mono">05 / EXPERIENCE</p>
              <div className="experience__rule" aria-hidden="true" />
              <h2 className="experience__title" id="exp-title">
                Experience
              </h2>
              <p className="experience__intro">
                Five ways the days pass
              </p>
            </header>

            <div className="experience__layout">
              {/* Left Column: Sticky Reading Rail Index (Desktop >= 1024px) */}
              <aside className="experience__rail" aria-label="Rituals index">
                <nav className="experience__index">
                  {EXPERIENCES.map((exp, i) => (
                    <button
                      key={exp.id}
                      type="button"
                      className={`experience__index-row ${activeExp === i ? "is-active" : ""}`}
                      onClick={() => {
                        const target = document.getElementById(`ritual-${exp.id}`);
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      aria-current={activeExp === i ? "true" : undefined}
                    >
                      <span className="experience__index-num mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="experience__index-label">
                        {exp.label}
                      </span>
                    </button>
                  ))}
                </nav>
              </aside>

              {/* Right Column: 5 Ritual Chapters */}
              <div className="experience__chapters">
                {EXPERIENCES.map((exp, i) => (
                  <article
                    key={exp.id}
                    id={`ritual-${exp.id}`}
                    className="experience__chapter"
                    data-ritual-index={i}
                  >
                    <div className="experience__chapter-header">
                      <span className="experience__chapter-num mono">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="experience__chapter-title">
                        {exp.label}
                      </h3>
                    </div>

                    <p className="experience__chapter-copy">
                      {exp.caption}
                    </p>

                    <figure className="experience__chapter-media">
                      <picture>
                        <source type="image/webp" srcSet={exp.mobileWebp} />
                        <img
                          src={exp.mobileImg}
                          alt={exp.alt}
                          width={2200}
                          height={1466}
                          className="experience__chapter-photo"
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </figure>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 06 · EAT (§24–25) ==================== */}
        <section className="section eat" id="eat" aria-labelledby="eat-title">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow lbl-reveal">06 / Eat</p>
              <p className="mono muted lbl-reveal">Garden → kitchen → table</p>
            </div>
            <div className="eat__intro g12">
              <h2 className="display eat__title" id="eat-title">
                <span className="line-mask">
                  <span>From</span>
                </span>
                <span className="line-mask">
                  <span>this land.</span>
                </span>
              </h2>
              <figure className="eat__hands win media-hover" data-parallax>
                <Img name="eat-hands" w={2200} h={1473} alt="Hands preparing the evening's food" />
              </figure>
            </div>

            <ol className="eat__flow">
              {[
                { name: "garden", label: "Garden", alt: "What the garden gave that morning", w: 2200, h: 1456 },
                { name: "kitchen", label: "Kitchen", alt: "The kitchen mid-preparation", w: 2200, h: 1391 },
                { name: "table", label: "Table", alt: "The table laid for the evening", w: 2200, h: 1542 },
              ].map((step) => (
                <li key={step.name} className="eat__step">
                  <figure className="win">
                    <Img name={step.name} w={step.w} h={step.h} alt={step.alt} />
                  </figure>
                  <p className="mono">{step.label}</p>
                </li>
              ))}
            </ol>

            <div className="eat__tonight">
              <p className="mono eat__tonight-label">Tonight</p>
              <ol className="menu-list">
                <li className="menu-list__item">
                  <span className="mono menu-list__idx">01</span>
                  <div>
                    <h3 className="menu-list__name">Wood-fired trout</h3>
                    <p className="menu-list__desc">local greens · fermented chilli · lemon</p>
                  </div>
                </li>
                <li className="menu-list__item">
                  <span className="mono menu-list__idx">02</span>
                  <div>
                    <h3 className="menu-list__name">Seasonal thali</h3>
                    <p className="menu-list__desc">garden vegetables · lentils · rice · achar</p>
                  </div>
                </li>
              </ol>
              <p className="mono muted eat__sample">Sample · seasonal — the menu changes with what is ready</p>
            </div>
          </div>
        </section>

        {/* ==================== 07 · PEOPLE (§27) ==================== */}
        <section className="section people" id="people" aria-labelledby="people-title">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow lbl-reveal">07 / People</p>
              <p className="mono muted lbl-reveal">Hosts, cooks, guides</p>
            </div>
            <h2 className="h2 people__title" id="people-title">
              <span className="line-mask">
                <span>People of</span>
              </span>
              <span className="line-mask">
                <span>Laltin</span>
              </span>
            </h2>
            <div className="people__grid g12">
              <figure className="person person--lead">
                <div className="person__media win media-hover">
                  <Img name="people-01" w={1377} h={2200} alt="Maya in the kitchen doorway" />
                </div>
                <figcaption className="person__cap">
                  <span className="person__name">Maya</span>
                  <span className="mono person__role">Kitchen / Garden</span>
                  <blockquote className="person__quote">[ Quote to be recorded ]</blockquote>
                </figcaption>
              </figure>
              <figure className="person">
                <div className="person__media win media-hover">
                  <Img name="people-02" w={2200} h={1643} alt="A host on the paths around the resort" />
                </div>
                <figcaption className="person__cap">
                  <span className="person__name mono">[ Host name ]</span>
                  <span className="mono person__role">[ Role — to be listed ]</span>
                </figcaption>
              </figure>
              <figure className="person">
                <div className="person__media win media-hover">
                  <Img name="people-03" w={1650} h={2200} alt="A guide paused on the ridge trail" />
                </div>
                <figcaption className="person__cap">
                  <span className="person__name mono">[ Host name ]</span>
                  <span className="mono person__role">[ Role — to be listed ]</span>
                </figcaption>
              </figure>
            </div>
            <p className="mono muted people__note">Real names, roles and words only — nothing here will be invented.</p>
          </div>
        </section>

        {/* ==================== 08 · FOOTPRINT (§26) ==================== */}
        <section className="section footprint" id="footprint" aria-labelledby="footprint-title">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow lbl-reveal">08 / Our footprint</p>
              <p className="mono muted lbl-reveal">Documented, not advertised</p>
            </div>
            <div className="footprint__intro">
              <h2 className="h2" id="footprint-title">
                <span className="line-mask">
                  <span>Not badges.</span>
                </span>
                <span className="line-mask">
                  <span>A record.</span>
                </span>
              </h2>
              <p className="lead" data-reveal>
                How the place actually runs — published only once each practice is verified. Specificity creates
                credibility.
              </p>
            </div>
            <ul className="footprint__list">
              {["Build", "Water", "Energy", "Food", "Waste", "Community"].map((cat) => (
                <li key={cat} className="fact">
                  <span className="mono fact__cat">{cat}</span>
                  <span className="fact__body">[ Practice to be confirmed ]</span>
                  <span className="mono fact__status">To confirm</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ==================== 09 · GETTING HERE ==================== */}
        <section className="section journey" id="getting-here" aria-labelledby="journey-title">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow lbl-reveal">09 / Getting here</p>
              <p className="mono muted lbl-reveal">Place / data</p>
            </div>
            <div className="journey__grid g12">
              <div className="journey__coords">
                <p className="mono">27.7172° N</p>
                <p className="mono">85.3240° E</p>
                <p className="mono journey__alt">Alt / 1,850 m</p>
              </div>
              <div className="journey__text">
                <h2 className="h2" id="journey-title">
                  <span className="line-mask">
                    <span>The way here</span>
                  </span>
                  <span className="line-mask">
                    <span>is part of it.</span>
                  </span>
                </h2>
                <p data-reveal>
                  Routes, transfers and directions are published once they are confirmed with the property — an honest
                  journey beats a fast claim.
                </p>
                <p className="mono muted">[ Travel details — to be confirmed ]</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 10 · DUSK (§28) ==================== */}
        <section className="dusk" id="dusk" aria-label="Day to dusk">
          <div className="shell dusk__head">
            <p className="eyebrow lbl-reveal">10 / Dusk</p>
          </div>
          {[
            { name: "dusk-01", w: 2200, h: 1650, alt: "Morning light on the far ridgeline", chip: "Daylight", mod: "a" },
            { name: "dusk-02", w: 2200, h: 1467, alt: "Green hills under full afternoon sun", chip: "Afternoon", mod: "b" },
            { name: "dusk-03", w: 2200, h: 1466, alt: "The valley held in golden hour", chip: "Golden hour", mod: "a" },
            { name: "dusk-04", w: 4863, h: 3242, alt: "Blue hour settling over the hills", chip: "Blue hour", mod: "b" },
            { name: "dusk-05", w: 2200, h: 1461, alt: "Night over the valley with scattered lights", chip: "Night", mod: "a" },
          ].map((band) => (
            <figure key={band.name} className={`dusk__band dusk__band--${band.mod} win`}>
              <Img name={band.name} w={band.w} h={band.h} alt={band.alt} />
              <figcaption className="dusk__chip mono">{band.chip}</figcaption>
            </figure>
          ))}
        </section>

        {/* ==================== 11 · LALTIN / LANTERN (§29) ==================== */}
        <section className="section--lg laltin-night on-dark" id="laltin" aria-labelledby="lantern-title">
          <div className="shell laltin-night__inner">
            <figure className="lantern lantern--one win" data-lantern="1">
              <Img name="lantern-01" w={2200} h={1650} alt="One lantern burning against the dark" />
            </figure>
            <h2 className="h2 lantern__statement" id="lantern-title">
              <span className="line-mask">
                <span>Some places</span>
              </span>
              <span className="line-mask">
                <span>become quieter</span>
              </span>
              <span className="line-mask">
                <span>after dark.</span>
              </span>
            </h2>
            <div className="lantern__more">
              <figure className="win lantern lantern--two" data-lantern="2">
                <Img name="lantern-02" w={2200} h={1631} alt="Warm light appearing at a window" />
              </figure>
              <figure className="win lantern lantern--three" data-lantern="3">
                <Img name="lantern-03" w={1024} h={683} alt="Another light further along the path" />
              </figure>
            </div>
            <p className="display laltin-wordmark" aria-hidden="true">
              <span className="line-mask">
                <span>LALTIN</span>
              </span>
            </p>
            <p className="mono laltin-night__tag lbl-reveal">
              A place where life becomes quieter as the light becomes warmer
            </p>
          </div>
        </section>

        {/* ==================== 12 · JOURNAL (§56) ==================== */}
        <section className="section journal on-dark" id="journal" aria-labelledby="journal-title">
          <div className="shell">
            <div className="section-head">
              <p className="eyebrow eyebrow--dark lbl-reveal">12 / Journal</p>
              <p className="mono journal__hint lbl-reveal">Stories from the hillside</p>
            </div>
            <h2 className="visually-hidden" id="journal-title">
              Journal
            </h2>
            <div className="journal__grid">
              {(
                [
                  { key: "monsoon", img: "journal-01", w: 2200, h: 1237, alt: "Rain moving through the forest canopy" },
                  { key: "kitchen", img: "journal-02", w: 2200, h: 1466, alt: "Steam rising in the early kitchen" },
                  { key: "path", img: "journal-03", w: 2200, h: 1650, alt: "The narrow path continuing past the last building" },
                ] as const
              ).map((card) => {
                const s = STORIES[card.key];
                return (
                  <article key={card.key} className="story">
                    <button
                      className="story__media win media-hover"
                      type="button"
                      onClick={() => setStoryOpen(card.key)}
                      aria-label={`Read: ${s.title}`}
                    >
                      <Img name={card.img} w={card.w} h={card.h} alt={card.alt} />
                    </button>
                    <div className="story__meta mono">
                      <span>{s.cat}</span>
                      <span>Read →</span>
                    </div>
                    <h3 className="story__title">
                      <button type="button" onClick={() => setStoryOpen(card.key)}>
                        {s.title}
                      </button>
                    </h3>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== 13 · RESERVE (§30–31) ==================== */}
        <section className="section reserve on-dark section--last" id="reserve" aria-labelledby="reserve-title">
          <div className="shell reserve__grid">
            <div className="reserve__intro">
              <p className="eyebrow eyebrow--dark lbl-reveal">13 / Reserve</p>
              <h2 className="display" id="reserve-title">
                <span className="line-mask">
                  <span>Stay</span>
                </span>
                <span className="line-mask">
                  <span>a little</span>
                </span>
                <span className="line-mask">
                  <span>longer.</span>
                </span>
              </h2>
            </div>

            <form className="booking" noValidate onSubmit={handleBooking}>
              <div className="booking__fields">
                <label className="booking__field">
                  <span className="mono">Arrival</span>
                  <input
                    type="date"
                    name="arrival"
                    required
                    min={today || undefined}
                    value={arrival}
                    onChange={(e) => {
                      setArrival(e.target.value);
                      setBookingError("");
                    }}
                  />
                </label>
                <label className="booking__field">
                  <span className="mono">Departure</span>
                  <input
                    type="date"
                    name="departure"
                    required
                    min={arrival ? nextDay(arrival) : today || undefined}
                    value={departure}
                    onChange={(e) => {
                      setDeparture(e.target.value);
                      setBookingError("");
                    }}
                  />
                </label>
                <div className="booking__field booking__guests">
                  <span className="mono" id="guests-label">
                    Guests
                  </span>
                  <div className="stepper" role="group" aria-labelledby="guests-label">
                    <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))}>
                      −
                    </button>
                    <output aria-live="polite">{guests}</output>
                    <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(8, g + 1))}>
                      +
                    </button>
                  </div>
                </div>
                <button className="btn btn--light booking__submit" type="submit">
                  Check availability <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className="booking__error mono" role="alert" hidden={!bookingError}>
                {bookingError}
              </p>
              <div className="booking__result" role="status" hidden={!bookingSummary}>
                <p className="mono booking__result-head">Your stay request</p>
                <p className="booking__result-dates">{bookingSummary}</p>
                <p className="mono booking__result-note">
                  Illustrative stay planner only. No request is sent, no reservation is made, and live availability is not connected.
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* ==================== 14 · FOOTER ==================== */}
      <footer className="footer on-dark" id="contact">
        <div className="shell">
          <div className="footer__grid">
            <div className="footer__brand">
              <span className="nav__logo">Laltin</span>
              <p>EcoResort · Nepal. A place where life becomes quieter as the light becomes warmer.</p>
            </div>
            <div className="footer__col">
              <h4>Explore</h4>
              <ul>
                <li>
                  <a href="#stay">Stay</a>
                </li>
                <li>
                  <a href="#experience">Experience</a>
                </li>
                <li>
                  <a href="#eat">Eat</a>
                </li>
                <li>
                  <a href="#place">Place</a>
                </li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>More</h4>
              <ul>
                <li>
                  <a href="#people">Our story</a>
                </li>
                <li>
                  <a href="#journal">Journal</a>
                </li>
                <li>
                  <a href="#getting-here">Getting here</a>
                </li>
                <li>
                  <a href="#reserve">Reserve</a>
                </li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Contact</h4>
              <ul>
                <li>
                  <a href="/contact?reference=laltin">Discuss a website like LALTIN ↗</a>
                </li>
                <li>
                  <span className="mono muted">Imagined mountain retreat</span>
                </li>
                <li>
                  <a href="/showcase">Explore Echo11’s work ↗</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer__base mono">
            <span>© 2026 Echo11 · LALTIN studio concept</span>
            <span>Stays, rates and travel details are illustrative. No reservations accepted.</span>
          </div>
        </div>
      </footer>

      {/* ==================== ROOM DETAIL DIALOG (§20) ==================== */}
      <AnimatePresence>
        {activeRoom && (
          <motion.div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-dialog-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="dialog__backdrop" onClick={() => setRoomOpen(null)} />
            <motion.div
              className="dialog__panel"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.99 }}
              transition={{ duration: 0.45, ease: EASE_UI }}
            >
              <button className="dialog__close" type="button" onClick={() => setRoomOpen(null)} aria-label="Close room details">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <figure className="dialog__hero win">
                <Image src={activeRoom.img} alt="" width={2200} height={1467} sizes="(min-width: 1024px) 75vw, 100vw" />
              </figure>
              <div className="dialog__body">
                <p className="mono dialog__index">{activeRoom.index}</p>
                <h3 className="h2" id="room-dialog-title">
                  {activeRoom.name}
                </h3>
                <p className="lead">{activeRoom.desc}</p>
                <div className="dialog__pair" aria-hidden="true">
                  <Image src={activeRoom.img} alt="" width={800} height={800} sizes="40vw" />
                  <Image
                    sizes="40vw"
                    src={activeRoom.img}
                    alt=""
                    width={800}
                    height={800}
                    data-room-dialog-pair-b
                    style={{ objectFit: "none", objectPosition: activeRoom.crop }}
                  />
                </div>
                <ul className="room__facts mono">
                  {activeRoom.facts.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <ul className="dialog__amenities">
                  {activeRoom.amenities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                <button
                  className="btn btn--light"
                  type="button"
                  onClick={() => {
                    setRoomOpen(null);
                    window.setTimeout(() => {
                      document.getElementById("reserve")?.scrollIntoView();
                    }, 50);
                  }}
                >
                  Check availability <span aria-hidden="true">→</span>
                </button>
                <p className="mono muted dialog__provisional">
                  Details provisional — confirmed with the property before publication
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== JOURNAL OVERLAY ==================== */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            className="dialog dialog--story"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-dialog-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="dialog__backdrop" onClick={() => setStoryOpen(null)} />
            <motion.div
              className="dialog__panel"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: EASE_UI }}
            >
              <button className="dialog__close" type="button" onClick={() => setStoryOpen(null)} aria-label="Close article">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="dialog__body story-body">
                <p className="mono story-body__cat">{activeStory.cat}</p>
                <h3 className="h2" id="story-dialog-title">
                  {activeStory.title}
                </h3>
                <p className="lead">[ Opening paragraph — editorial in progress ]</p>
                <p className="mono muted">[ Full story — editorial in progress ]</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* pointer label for room media (§19) */}
      <div ref={chipRef} className="pointer-chip mono" aria-hidden="true">
        View
      </div>
    </div>
  );
}

function nextDay(value: string) {
  const d = new Date(value + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
