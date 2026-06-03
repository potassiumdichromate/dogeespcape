import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import fullHero from "../assets/full-hero.png";
import dogeEscapeLogo from "../assets/DogeEscape-logo.png";
import oldHeroIcon from "../assets/old.png";
import ogLogoAsset from "../assets/OG.png";
import kultLogo from "../assets/kultLogo.png";
import iconLogo from "../assets/Icon-Logo.png";
import dogeTrailer from "../assets/Doge-New.mp4";
import cardFast from "../assets/card-fast.png";
import cardEnemies from "../assets/card-enemies.jpg";
import cardCoins from "../assets/card-coins.jpg";
import cardDogeos from "../assets/card-dogeos.png";
import aiCompanion from "../assets/ai-companion.png";
import zeroGAiDoge from "../assets/zero-g-ai-doge.png";
import roboD from "../assets/robo-d.png";
import { SectionThreeScene } from "../components/SectionThreeScene";
import { useWallet } from "../context/WalletContext";

const iconPaths = {
  Youtube: [
    "M22.5 12.2c0-1.7-.2-3.4-.4-4.3-.2-.9-.9-1.6-1.8-1.9C18.7 5.5 12 5.5 12 5.5s-6.7 0-8.3.5c-.9.3-1.6 1-1.8 1.9-.2.9-.4 2.6-.4 4.3s.2 3.4.4 4.3c.2.9.9 1.6 1.8 1.9 1.6.5 8.3.5 8.3.5s6.7 0 8.3-.5c.9-.3 1.6-1 1.8-1.9.2-.9.4-2.6.4-4.3Z",
    "m10 9 5.2 3L10 15V9Z",
  ],
  Zap: ["M13 2L4 14h7l-1 8 9-12h-7l1-8z"],
  Check: ["M20 6L9 17l-5-5"],
  Trophy: ["M8 21h8", "M12 17v4", "M7 4h10v6a5 5 0 0 1-10 0V4z", "M5 6H3v2a4 4 0 0 0 4 4", "M19 6h2v2a4 4 0 0 1-4 4"],
  Rocket: ["M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5", "M9 15l-3 3", "M14 4c3-2 6-1 6-1s1 3-1 6l-8 8-5-5 8-8z", "M15 9h.01"],
  Flame: ["M8.5 14.5A3.5 3.5 0 0 0 12 22a7 7 0 0 0 7-7c0-5-4-7-4-11-2.5 1.6-4 4-4 7-1.6-.8-2.3-2.1-2.5-3.5C6.7 9 5 11.3 5 14a7 7 0 0 0 7 8"],
  Shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  Wrench: ["M14.7 6.3a4 4 0 0 0-5 5L3 18v3h3l6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.6-2.6 2-2.8Z"],
  Sparkles: ["M12 3l1.5 5L18 10l-4.5 2L12 17l-1.5-5L6 10l4.5-2L12 3Z", "M5 3v4", "M3 5h4", "M19 17v4", "M17 19h4"],
  Crosshair: ["M12 2v4", "M12 18v4", "M2 12h4", "M18 12h4", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"],
  Plus: ["M12 5v14", "M5 12h14"],
  Magnet: ["M6 4v8a6 6 0 0 0 12 0V4", "M6 4h4", "M14 4h4", "M6 8h4", "M14 8h4"],
  Gamepad2: ["M6 12h4", "M8 10v4", "M15 13h.01", "M18 11h.01", "M7 7h10a5 5 0 0 1 4.7 3.4l1.1 3.5a4 4 0 0 1-6.6 4l-1.8-1.9H9.6l-1.8 1.9a4 4 0 0 1-6.6-4l1.1-3.5A5 5 0 0 1 7 7z"],
  Brain: ["M8 6a3 3 0 0 1 5-2.2A3 3 0 0 1 18 6a3 3 0 0 1 1 5.8A3 3 0 0 1 16 17h-1a3 3 0 0 1-6 0H8a3 3 0 0 1-3-5.2A3 3 0 0 1 8 6z", "M12 4v14", "M8 10h4", "M12 13h4"],
  Box: ["M21 8l-9-5-9 5 9 5 9-5z", "M3 8v8l9 5 9-5V8", "M12 13v8"],
  ShieldCheck: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-5"],
  Crown: ["M3 7l4 4 5-7 5 7 4-4v11H3V7z", "M3 18h18"],
  ChevronRight: ["M9 18l6-6-6-6"],
  Volume2: ["M11 5 6 9H2v6h4l5 4V5Z", "M15.5 8.5a5 5 0 0 1 0 7", "M18.5 5.5a9 9 0 0 1 0 13"],
  VolumeX: ["M11 5 6 9H2v6h4l5 4V5Z", "M22 9l-6 6", "M16 9l6 6"],
  Bot: ["M12 8V4", "M8 4h8", "M6 8h12a2 2 0 0 1 2 2v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a2 2 0 0 1 2-2z", "M9 13h.01", "M15 13h.01", "M9 17h6"],
};

function Icon({ name, size = 24, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {(iconPaths[name] || []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const makeIcon = (name) => ({ size, className }) => (
  <Icon name={name} size={size} className={className} />
);

const Youtube = makeIcon("Youtube");
const Zap = makeIcon("Zap");
const Check = makeIcon("Check");
const Trophy = makeIcon("Trophy");
const Rocket = makeIcon("Rocket");
const Flame = makeIcon("Flame");
const Shield = makeIcon("Shield");
const Wrench = makeIcon("Wrench");
const Sparkles = makeIcon("Sparkles");
const Crosshair = makeIcon("Crosshair");
const Plus = makeIcon("Plus");
const Magnet = makeIcon("Magnet");
const Gamepad2 = makeIcon("Gamepad2");
const Brain = makeIcon("Brain");
const Box = makeIcon("Box");
const ShieldCheck = makeIcon("ShieldCheck");
const Crown = makeIcon("Crown");
const ChevronRight = makeIcon("ChevronRight");
const Volume2 = makeIcon("Volume2");
const VolumeX = makeIcon("VolumeX");
const Bot = makeIcon("Bot");

const navItems = [
  { label: "GAMEPLAY", href: "#gameplay" },
  { label: "FEATURES", href: "#features" },
  { label: "RANK", href: "#leaderboard" },
];

function OGLogo({ className = "inline h-5 w-auto align-[-0.2em]" }) {
  return <img src={ogLogoAsset} alt="OG" className={className} />;
}

const zgColorMap = {
  purple: { border: "border-purple-400/40", bg: "from-purple-950/40 to-black", title: "text-purple-400", icon: "text-purple-300 bg-purple-500/10 border-purple-400/40", glow: "shadow-[0_0_30px_rgba(168,85,247,0.2)]" },
  blue: { border: "border-sky-400/40", bg: "from-sky-950/40 to-black", title: "text-sky-400", icon: "text-sky-300 bg-sky-500/10 border-sky-400/40", glow: "shadow-[0_0_30px_rgba(56,189,248,0.2)]" },
  green: { border: "border-green-400/40", bg: "from-green-950/40 to-black", title: "text-green-400", icon: "text-green-300 bg-green-500/10 border-green-400/40", glow: "shadow-[0_0_30px_rgba(74,222,128,0.2)]" },
};

const podiumMap = {
  yellow: {
    border: "border-yellow-400/60",
    glow: "shadow-[0_0_50px_rgba(255,200,0,0.25)]",
    badge: "from-yellow-300 to-amber-600",
    name: "text-yellow-300",
    avatarBg: "from-yellow-500/30 to-amber-700/20 border-yellow-400/40",
    coin: "text-yellow-400",
    rewardBg: "border-yellow-400/40",
    rewardText: "text-yellow-300",
  },
  purple: {
    border: "border-purple-400/60",
    glow: "shadow-[0_0_50px_rgba(168,85,247,0.25)]",
    badge: "from-purple-400 to-fuchsia-700",
    name: "text-purple-300",
    avatarBg: "from-purple-500/30 to-fuchsia-700/20 border-purple-400/40",
    coin: "text-purple-400",
    rewardBg: "border-purple-400/40",
    rewardText: "text-purple-300",
  },
  orange: {
    border: "border-orange-400/60",
    glow: "shadow-[0_0_50px_rgba(255,120,40,0.25)]",
    badge: "from-orange-400 to-red-700",
    name: "text-orange-300",
    avatarBg: "from-orange-500/30 to-red-700/20 border-orange-400/40",
    coin: "text-orange-400",
    rewardBg: "border-orange-400/40",
    rewardText: "text-orange-300",
  },
};

function Nav({ onConnect, isConnecting }) {
  return (
    <header className="absolute inset-x-0 top-5 z-20 mx-auto flex max-w-7xl items-center justify-between bg-transparent px-4 py-3 sm:top-3 sm:px-6">
      <a href="#" className="flex items-center">
        <img
          src={dogeEscapeLogo}
          alt="Doge Escape"
          width={900}
          height={900}
          className="h-10 w-10 object-contain sm:h-14 sm:w-14"
        />
      </a>
      <nav className="hidden gap-6 text-xs font-bold uppercase tracking-widest text-yellow-200/90 lg:flex">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="premium-link hover:text-yellow-400"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="hidden items-center gap-3 sm:flex">
        <span className="premium-cta-shell premium-cta-shell-primary">
          <button
            type="button"
            onClick={onConnect}
            className="premium-cta premium-cta-primary clip-arcade-button font-pixel shrink-0 bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 px-3 py-2 text-[8px] uppercase tracking-[0.06em] text-black transition min-[380px]:text-[9px] sm:px-4 sm:text-[11px]"
          >
            <span className="premium-cta-label">{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        </span>
      </div>
    </header>
  );
}

function Hero({ onWatchTrailer, onConnect, isConnecting }) {
  return (
    <section
      className="relative min-h-[660px] overflow-hidden bg-cover bg-[76%_top] bg-no-repeat pt-28 sm:min-h-[720px] sm:bg-top sm:pt-28 lg:min-h-[760px] lg:pt-32"
      style={{ backgroundImage: `url(${fullHero})` }}
    >

      <SectionThreeScene variant="hero" className="z-0 opacity-70 mix-blend-screen" />
      <div className="relative z-10 mx-auto grid min-h-[calc(660px-7rem)] max-w-7xl content-end gap-8 px-4 pb-0 pt-8 sm:min-h-0 sm:content-normal sm:px-6 sm:pb-16 sm:pt-10 lg:items-center lg:pt-12">
        <div className="relative mx-auto max-w-[92vw] sm:mx-0 sm:max-w-xl">
          <h1 className="text-center font-doge-title text-[2.55rem] leading-[0.95] min-[380px]:text-5xl sm:text-left sm:text-7xl md:text-[6.25rem]">
            DOG<span className="relative">E
              <span className="absolute -right-2 -top-2 text-xl sm:-top-3 sm:text-2xl">🐾</span>
            </span>
          </h1>
          <h2 className="mt-3 text-center font-doge-escape text-[1.95rem] leading-none min-[380px]:text-4xl sm:mt-4 sm:text-left sm:text-5xl md:text-6xl">
            ESCAPE
          </h2>
          <p className="mt-7 max-w-none whitespace-nowrap font-pixel-display text-[10px] leading-relaxed text-primary drop-shadow-[2px_2px_0_oklch(0.13_0.04_255)] min-[380px]:text-xs sm:mt-8 sm:text-base">
            BREAK FREE. SECURE THE DOGE.
          </p>
          <p className="font-pixel-body mt-4 hidden max-w-[18rem] text-lg leading-snug text-foreground/85 min-[380px]:text-xl sm:block sm:max-w-md sm:text-2xl">
            A wild arcade adventure on DogeOS. Survive the waves, defeat enemies,
            collect coins and escape!
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="premium-cta-shell premium-cta-shell-primary w-full min-[460px]:w-auto">
              <button
                type="button"
                onClick={onConnect}
                className="premium-cta premium-cta-primary clip-arcade-button font-pixel inline-flex min-h-[48px] w-full items-center justify-center gap-3 bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-black transition sm:min-h-[52px] sm:w-auto sm:px-6 sm:py-4 sm:text-[12px]"
              >
                <span className="premium-cta-label">{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            </span>
            <span className="premium-cta-shell premium-cta-shell-secondary w-full min-[460px]:w-auto">
              <button
                type="button"
                onClick={onWatchTrailer}
                className="premium-cta premium-cta-secondary trailer-glow clip-arcade-button w-full bg-yellow-400/75 p-[2px] transition sm:w-auto"
              >
                <span className="premium-cta-label clip-arcade-button font-pixel inline-flex min-h-[48px] w-full items-center justify-center gap-3 bg-black/90 px-5 py-3 text-[12px] uppercase tracking-[0.08em] text-yellow-100 sm:min-h-[52px] sm:px-6 sm:py-4 sm:text-[12px]">
                  Watch Trailer <Youtube size={16} className="text-destructive" />
                </span>
              </button>
            </span>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 font-pixel-display text-[8px] text-foreground/70 sm:text-[10px]">
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border-2 border-primary bg-primary shadow-[2px_2px_0_oklch(0.13_0.04_255)]">
              <img
                src={oldHeroIcon}
                alt=""
                width={1024}
                height={1024}
                className="h-full w-full object-cover"
              />
            </span>
            BUILT FOR DOGEOS
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    { kind: "dogeos" },
    { kind: "og" },
    { kind: "kult" },
    { kind: "dogeos" },
    { kind: "og" },
    { kind: "kult" },
  ];
  return (
    <div className="relative z-20 overflow-hidden border-y-2 border-primary/30 bg-[oklch(0.1_0.04_255)] py-3 sm:py-4">
      <div className="marquee-track flex w-max gap-6 whitespace-nowrap sm:gap-10">
        {[...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-6 font-pixel-display text-[10px] text-foreground/90 sm:gap-10 sm:text-xs"
          >
            {item.kind === "dogeos" && (
              <span>
                BUILT ON <span className="text-primary">DOGEOS</span>
              </span>
            )}
            {item.kind === "og" && (
              <span className="inline-flex items-center gap-3">
                POWERED BY
                <OGLogo className="h-5 w-auto sm:h-6" />
              </span>
            )}
            {item.kind === "kult" && (
              <span className="inline-flex items-center gap-3">
                BUILT BY
                <img src={kultLogo} alt="Kult Games" width={143} height={50} className="h-4 w-auto object-contain sm:h-5" />
              </span>
            )}
            <Zap size={16} className="text-primary" fill="currentColor" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Teaser() {
  const teaserVideoRef = useRef(null);
  const [teaserMuted, setTeaserMuted] = useState(true);
  const [teaserVolume, setTeaserVolume] = useState(0.65);
  const [isTeaserAudioOpen, setIsTeaserAudioOpen] = useState(false);

  const syncTeaserAudio = (volume, muted) => {
    const video = teaserVideoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted;
    if (!muted) {
      video.play().catch(() => undefined);
    }
  };

  return (
    <section id="gameplay" className="relative mx-auto max-w-[92rem] overflow-hidden px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 md:pt-24 xl:px-8">
      <SectionThreeScene variant="teaser" className="z-0 opacity-45 mix-blend-screen" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:gap-10 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="pixel-border scanlines group relative aspect-video overflow-hidden rounded-md">
          <video
            ref={teaserVideoRef}
            src={dogeTrailer}
            aria-label="Doge Escape gameplay teaser"
            width={1024}
            height={768}
            autoPlay
            muted={teaserMuted}
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={() => syncTeaserAudio(teaserVolume, teaserMuted)}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-3 right-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Open teaser volume controls"
              onClick={() => setIsTeaserAudioOpen(!isTeaserAudioOpen)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border-2 border-primary/70 bg-card text-primary shadow-[3px_3px_0_oklch(0.1_0.04_255)] transition hover:bg-primary hover:text-primary-foreground sm:h-12 sm:w-12"
            >
              {teaserMuted || teaserVolume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            {isTeaserAudioOpen && (
              <div className="flex items-center gap-3 rounded-sm border-2 border-primary/50 bg-[oklch(0.08_0.03_260_/_0.9)] px-3 py-2 shadow-[3px_3px_0_oklch(0.1_0.04_255)]">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={teaserMuted ? 0 : teaserVolume}
                  onChange={(event) => {
                    const v = Number(event.target.value);
                    setTeaserVolume(v);
                    setTeaserMuted(v === 0);
                    syncTeaserAudio(v, v === 0);
                  }}
                  className="h-2 w-20 accent-[oklch(0.85_0.18_85)] sm:w-32"
                />
              </div>
            )}
          </div>
        </div>
        <div className="text-center lg:text-left">
          <p className="font-pixel-display text-xs tracking-widest text-primary">
            OFFICIAL TEASER
          </p>
          <h2 className="mx-auto mt-4 max-w-[20rem] font-pixel-display text-[15px] leading-relaxed text-foreground min-[420px]:text-xl sm:max-w-none sm:text-3xl lg:mx-0">
            CAN YOU ESCAPE...
            <br />
            <span className="text-primary">AND SECURE THE DOGE?</span>
          </h2>
          <p className="font-pixel-body mx-auto mt-5 max-w-[20rem] text-lg leading-snug text-foreground/80 sm:max-w-md sm:text-xl lg:mx-0">
            Enemies everywhere. Coins calling.
            <br />
            Only one mission — escape & secure the Doge!
          </p>
        </div>
      </div>
    </section>
  );
}

const features = [
  { img: cardFast, title: "FAST & ADDICTIVE", body: "Quick runs, non-stop action. Perfect for short sessions." },
  { img: cardEnemies, title: "EPIC ENEMIES", body: "Face crazy foes and chaotic bosses." },
  { img: cardCoins, title: "COLLECT & UPGRADE", body: "Stack coins, upgrade weapons, and become unstoppable." },
  { img: cardDogeos, title: "BUILT FOR DOGEOS", body: "Native. Fast. Fun. Made for the Doge community." },
];

function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl overflow-hidden px-4 py-14 sm:px-6 sm:py-16">
      <SectionThreeScene variant="features" className="z-0 opacity-50 mix-blend-screen" />
      <div className="relative z-10 mb-10 text-center">
        <h2 className="font-pixel text-2xl leading-tight tracking-tight min-[380px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-white">GAME </span>
          <span className="bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">FEATURES</span>
        </h2>
      </div>
      <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <article
            key={f.title}
            className="premium-hover pixel-card overflow-hidden rounded-sm p-3"
          >
            <div className="overflow-hidden rounded-sm border-2 border-primary/30">
              <img
                src={f.img}
                alt={f.title}
                className="h-64 w-full object-cover object-top min-[420px]:h-72 sm:h-64 md:h-72 lg:h-44"
              />
            </div>
            <h3 className="mt-5 text-center font-pixel-display text-xs text-primary">
              {f.title}
            </h3>
            <p className="font-pixel-body mt-3 text-center text-lg text-foreground/75">
              {f.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FlowStep({ icon, title, color, desc }) {
  return (
    <div className="premium-hover relative flex min-h-[132px] flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] px-3 py-4 text-center shadow-[0_12px_34px_rgba(0,0,0,0.28)] min-[420px]:min-h-[150px] sm:min-h-0 sm:overflow-visible sm:rounded-sm sm:border-0 sm:bg-transparent sm:p-2 sm:shadow-none">
      <div className={`flex justify-center drop-shadow-[0_0_16px_currentColor] sm:pt-3 ${color}`}>{icon}</div>
      <div className={`mt-2 text-center text-[12px] font-black uppercase tracking-[0.18em] min-[420px]:text-sm sm:tracking-wider ${color}`}>{title}</div>
      <div className="mt-2 max-w-[11rem] text-center text-[9px] leading-relaxed tracking-[0.12em] text-yellow-100/70 min-[420px]:text-[10px] sm:mt-1 sm:text-[11px] sm:leading-tight sm:tracking-normal sm:text-yellow-100/60">{desc}</div>
    </div>
  );
}

function ZGCard({ color, icon, title, subtitle, desc }) {
  const c = zgColorMap[color];
  return (
    <div className={`premium-hover flex flex-col items-center gap-4 rounded-2xl border bg-gradient-to-br p-5 text-center sm:flex-row sm:items-start sm:text-left ${c.border} ${c.bg} ${c.glow}`}>
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border font-pixel text-xl sm:h-20 sm:w-20 ${c.icon}`}>{icon}</div>
      <div className="min-w-0">
        <h4 className={`flex flex-wrap items-center justify-center gap-2 break-words font-pixel text-base uppercase sm:justify-start sm:text-xl ${c.title}`}>{title}</h4>
        <div className="mt-1 text-xs font-bold uppercase tracking-widest text-white/80">{subtitle}</div>
        <p className="mt-2 text-sm leading-relaxed text-yellow-100/60">{desc}</p>
      </div>
    </div>
  );
}

function ZeroGSection() {
  return (
    <section id="zero-g" className="relative mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 sm:py-20 md:px-12 md:py-24">
      <SectionThreeScene variant="zeroG" className="z-0 opacity-55 mix-blend-screen" />
      <div className="relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-yellow-300/55 bg-black/70 px-4 py-2 text-[9px] font-black uppercase tracking-[0.26em] text-yellow-300 shadow-[0_0_28px_rgba(255,211,74,0.18)] sm:rounded-md sm:border-yellow-400/40 sm:bg-black/60 sm:px-3 sm:py-1.5 sm:text-[11px] sm:tracking-[0.3em] sm:shadow-none">
              Built On <OGLogo className="h-5 w-auto" />
            </span>
            <h2 className="mx-auto mt-7 max-w-[22rem] font-pixel text-[2.25rem] leading-[1.05] tracking-tight min-[380px]:text-[2.65rem] sm:mt-6 sm:max-w-none sm:text-5xl sm:leading-[1.15] md:text-6xl lg:text-7xl">
              <div className="text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.22)]">AI POWERED</div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-yellow-300 drop-shadow-[0_0_24px_rgba(255,200,0,0.26)] sm:mt-0 sm:gap-4 lg:justify-start">
                <span>BY</span>
                <OGLogo className="h-[0.78em] w-auto" />
              </div>
            </h2>
            <p className="mx-auto mt-6 max-w-[20rem] text-[12px] font-black uppercase leading-relaxed tracking-[0.16em] text-white sm:max-w-none sm:text-lg sm:tracking-wider">
              Your doge doesn't just run. <span className="text-yellow-400">It learns.</span>
            </p>
            <p className="mx-auto mt-4 max-w-[21rem] text-[13px] leading-loose tracking-[0.11em] text-yellow-100/70 sm:mt-3 sm:max-w-lg sm:text-base sm:leading-normal sm:tracking-normal lg:mx-0">
              Doge Escape uses <span className="inline-flex items-center gap-1 font-bold text-purple-400"><OGLogo /> Compute</span> for AI training
              and <span className="inline-flex items-center gap-1 font-bold text-sky-400"><OGLogo /> Storage</span> to store verified AI companion models.
            </p>

            <div className="premium-hover mt-8 rounded-[1.4rem] border border-yellow-300/45 bg-[linear-gradient(180deg,rgba(255,210,46,0.08),rgba(0,0,0,0.74)_22%,rgba(0,0,0,0.88))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur sm:rounded-2xl sm:border-yellow-400/30 sm:bg-black/60 sm:bg-none sm:p-6 sm:shadow-none">
              <div className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.32em] text-yellow-300 drop-shadow-[0_0_18px_rgba(255,210,46,0.35)] sm:mb-5 sm:text-[11px] sm:tracking-[0.3em] sm:text-yellow-400 sm:drop-shadow-none">How It Works</div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                <FlowStep icon={<Gamepad2 className="h-7 w-7" />} title="PLAY" color="text-yellow-400" desc="Gameplay creates behavior data." />
                <FlowStep icon={<Brain className="h-7 w-7" />} title="TRAIN" color="text-purple-400" desc={<>AI companions learn using <span className="inline-flex items-center gap-1"><OGLogo className="h-3.5 w-auto" /> Compute.</span></>} />
                <FlowStep icon={<Box className="h-7 w-7" />} title="STORE" color="text-sky-400" desc={<>Updated models are saved on <span className="inline-flex items-center gap-1"><OGLogo className="h-3.5 w-auto" /> Storage.</span></>} />
                <FlowStep icon={<Check className="h-7 w-7" />} title="VERIFY" color="text-green-400" desc="Each model version gets a verified hash." />
              </div>
            </div>
          </div>

          <div className="premium-hover relative rounded-3xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.5),transparent_70%)] blur-3xl" />
            <img src={zeroGAiDoge} alt="AI Doge Companion" className="relative h-full w-full rounded-2xl border border-purple-400/30 object-cover shadow-[0_30px_80px_rgba(168,85,247,0.4)] lg:rounded-3xl" />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-3">
          <ZGCard color="purple" icon={<OGLogo className="h-12 w-auto" />} title={<><OGLogo className="h-6 w-auto" /> COMPUTE</>} subtitle="AI TRAINING" desc="Decentralized compute powering the training of smarter AI companions." />
          <ZGCard color="blue" icon={<OGLogo className="h-12 w-auto" />} title={<><OGLogo className="h-6 w-auto" /> STORAGE</>} subtitle="MODEL STORAGE" desc="Secure, decentralized storage for AI models and training outputs." />
          <ZGCard color="green" icon={<ShieldCheck className="h-10 w-10" />} title="VERIFIED HASHES" subtitle="TRANSPARENT AI" desc="Every AI update is linked to a verifiable hash for full transparency." />
        </div>

        <div className="mt-10 flex items-center justify-between gap-6">
          <Crown className="hidden h-8 w-8 text-yellow-400/60 md:block" />
          <a
            href="https://app.0g.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="premium-cta premium-cta-primary mx-auto inline-flex min-h-12 flex-1 flex-wrap items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-700 px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-black shadow-[0_8px_30px_rgba(255,180,0,0.5)] ring-2 ring-yellow-200/60 transition sm:gap-3 sm:px-10 sm:py-4 sm:text-sm md:flex-none"
          >
            Learn How <OGLogo className="h-5 w-auto" /> Powers AI
            <ChevronRight className="h-5 w-5" />
          </a>
          <Trophy className="hidden h-8 w-8 text-yellow-400/60 md:block" />
        </div>
      </div>
    </section>
  );
}

function PodiumCard({ rank, accent, name, score, wins, games, winRate, earned, reward }) {
  const c = podiumMap[accent];
  return (
    <div className={`premium-hover relative rounded-2xl border-2 bg-gradient-to-b from-black/80 to-zinc-950/80 p-4 backdrop-blur sm:p-5 ${c.border} ${c.glow}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-10 w-12 items-center justify-center rounded-md bg-gradient-to-b font-pixel text-base text-black shadow-lg sm:h-12 sm:w-14 sm:text-xl ${c.badge}`}>
          {rank}
        </div>
        <div className={`truncate font-pixel text-sm tracking-wider sm:text-lg md:text-xl ${c.name}`}>{name}</div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4">
        <div className={`flex aspect-square items-center justify-center rounded-xl border bg-gradient-to-br p-4 ${c.avatarBg}`}>
          <img
            src={iconLogo}
            alt={`${name} avatar`}
            width={1000}
            height={1000}
            loading="lazy"
            className="h-full w-full object-contain drop-shadow-[0_0_24px_rgba(255,200,0,0.3)]"
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <Row label="SCORE" value={score} accent={c.coin} />
          <Row label="WINS" value={String(wins)} accent={c.coin} />
          <Row label="GAMES" value={String(games)} accent={c.coin} />
          <Row label="WIN RATE" value={winRate} accent={c.coin} />
          <Row label="EARNED" value={`◎ ${earned}`} accent={c.coin} />
        </div>
      </div>
      <div className={`mt-5 flex items-center justify-between gap-2 rounded-xl border bg-black/50 px-3 py-2.5 sm:px-4 ${c.rewardBg}`}>
        <div className="flex min-w-0 items-center gap-2">
          <Trophy className={`h-4 w-4 shrink-0 ${c.coin}`} />
          <span className="font-pixel text-[9px] uppercase tracking-widest text-white/70 sm:text-[11px]">Reward</span>
        </div>
        <span className={`whitespace-nowrap font-pixel text-sm sm:text-base ${c.rewardText}`}>💎 {reward}</span>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-pixel text-[8px] uppercase tracking-widest text-white/50 sm:text-[10px]">{label}</span>
      <span className={`whitespace-nowrap font-pixel text-[10px] sm:text-sm ${accent}`}>{value}</span>
    </div>
  );
}

function WeeklyToppers() {
  return (
    <section id="leaderboard" className="relative overflow-hidden px-4 py-14 sm:px-6 sm:py-20 md:px-12 md:py-24">
      <SectionThreeScene variant="leaderboard" className="z-0 opacity-45 mix-blend-screen" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-md border border-yellow-400/40 bg-black/60 px-3 py-1.5 font-pixel text-[9px] uppercase tracking-[0.25em] text-yellow-300 sm:text-[11px]">
            Powered By <span className="text-yellow-400">DOGEOS</span>
          </span>
          <h2 className="mt-6 flex flex-wrap items-center justify-center gap-3 font-pixel text-xl leading-[1.2] min-[380px]:text-2xl sm:gap-5 sm:text-4xl md:text-6xl lg:text-7xl">
            <Trophy className="h-7 w-7 shrink-0 text-yellow-400 drop-shadow-[0_0_20px_rgba(255,200,0,0.6)] sm:h-10 sm:w-10 md:h-14 md:w-14" />
            <span className="text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.18)]">WEEKLY</span>
            <span className="bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent">TOPPERS</span>
            <Rocket className="h-7 w-7 shrink-0 text-yellow-400 drop-shadow-[0_0_20px_rgba(255,200,0,0.6)] sm:h-10 sm:w-10 md:h-14 md:w-14" />
          </h2>
          <p className="font-pixel mt-5 text-xs uppercase leading-relaxed tracking-wider text-yellow-100/70 sm:text-base md:text-lg">
            Top Players. Epic Skills. <span className="text-yellow-400">Real Rewards.</span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
          <PodiumCard rank={1} accent="yellow" name="DOGE MASTER" score="999,999" wins={128} games={156} winRate="82%" earned="12,500" reward="5,000" />
          <PodiumCard rank={2} accent="purple" name="SHIBRAIDER" score="850,420" wins={96} games={128} winRate="75%" earned="8,000" reward="3,000" />
          <PodiumCard rank={3} accent="orange" name="MOONWALKER" score="678,230" wins={75} games={112} winRate="67%" earned="5,000" reward="2,000" />
        </div>
      </div>
    </section>
  );
}

function AICompanion() {
  const stats = [
    { label: "FIREPOWER", filled: 5, total: 6, icon: Flame, color: "oklch(0.7 0.22 45)" },
    { label: "DEFENSE", filled: 4, total: 6, icon: Shield, color: "oklch(0.7 0.18 230)" },
    { label: "UTILITY", filled: 4, total: 6, icon: Wrench, color: "oklch(0.72 0.2 145)" },
    { label: "LUCK", filled: 3, total: 6, icon: Sparkles, color: "oklch(0.85 0.18 85)" },
  ];
  const abilities = [
    { name: "TARGET LOCK", desc: "Highlights threats and prioritizes enemies.", icon: Crosshair, color: "oklch(0.7 0.18 230)" },
    { name: "REPAIR DRONE", desc: "Restores hull HP over time during battle.", icon: Plus, color: "oklch(0.72 0.2 145)" },
    { name: "COIN MAGNET", desc: "Automatically collects coins nearby.", icon: Magnet, color: "oklch(0.65 0.22 310)" },
  ];
  return (
    <section id="companion" className="relative mx-auto max-w-7xl overflow-hidden px-4 py-14 sm:px-6 sm:py-16">
      <SectionThreeScene variant="ai" className="z-0 opacity-45 mix-blend-screen" />
      <div className="relative z-10 mb-10 text-center">
        <h2 className="font-pixel bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-2xl leading-tight text-transparent drop-shadow-[0_5px_0_rgba(0,0,0,0.9)] min-[380px]:text-3xl sm:text-5xl md:text-6xl">
          AI COMPANION
        </h2>
        <p className="font-pixel-display mx-auto mt-5 max-w-xl text-[10px] leading-relaxed tracking-widest text-foreground/80 sm:text-sm">
          YOUR LOYAL CO-PILOT. ALWAYS BY YOUR SIDE. <span className="text-primary">🐾</span>
        </p>
      </div>
      <div className="premium-hover pixel-card relative z-10 rounded-md p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="premium-hover scanlines relative overflow-hidden rounded-sm border-2 border-primary/40">
            <img src={aiCompanion} alt="AI Companion" className="aspect-[4/3] h-full w-full object-cover sm:aspect-auto" />
            <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-2 rounded-sm border-2 border-[oklch(0.7_0.18_230)] bg-[oklch(0.13_0.04_255_/_0.85)] px-2 py-2 shadow-[3px_3px_0_oklch(0.13_0.04_255)] sm:bottom-3 sm:left-3 sm:max-w-[78%] sm:gap-3 sm:px-3">
              <img src={roboD} alt="Robo-D" className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
              <p className="font-pixel-display text-[6px] leading-relaxed text-[oklch(0.78_0.13_220)] min-[380px]:text-[7px] sm:text-[8px]">
                "BARK DETECTED. THREATS NEUTRALIZED.<br />VICTORY PROBABILITY: 99.99% WOOF!"
              </p>
            </div>
          </div>
          <div className="premium-hover rounded-sm border-2 border-primary/40 bg-[oklch(0.14_0.04_255)] p-4 shadow-[4px_4px_0_oklch(0.1_0.04_255)] sm:p-5">
            <div className="-mt-8 mb-4 flex justify-center sm:-mt-9">
              <div className="btn-pixel inline-flex items-center gap-2 rounded-sm bg-primary px-3 py-2 font-pixel-display text-[8px] text-primary-foreground min-[380px]:text-[9px] sm:px-5 sm:text-[11px]">COMPANION: ROBO-D 🐾</div>
            </div>
            <p className="font-pixel-body text-lg leading-snug text-foreground/85">Robo-D is your AI copilot, optimized for survival. It analyzes, assists, and evolves with every run.</p>
            <div className="my-5 h-[2px] w-full bg-primary/30" />
            <ul className="space-y-3">
              {stats.map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full border-2" style={{ borderColor: s.color, color: s.color }}><s.icon size={14} /></span>
                  <span className="font-pixel-display flex-1 text-[8px] tracking-widest text-foreground min-[380px]:text-[9px] sm:text-[10px]">{s.label}</span>
                  <span className="flex gap-1">
                    {Array.from({ length: s.total }).map((_, i) => (
                      <span key={i} className="h-3 w-3 border-2 sm:h-4 sm:w-4" style={{ borderColor: s.color, background: i < s.filled ? s.color : "transparent" }} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <div className="my-5 h-[2px] w-full bg-primary/30" />
            <p className="text-center font-pixel-display text-[10px] tracking-widest text-primary">
              ACTIVE ABILITIES
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {abilities.map(({ name, desc, icon: Icon, color }) => (
                <div
                  key={name}
                  className="premium-hover rounded-sm border-2 bg-[oklch(0.18_0.05_255_/_0.76)] p-3 text-center"
                  style={{ borderColor: color }}
                >
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border-2" style={{ borderColor: color, color }}>
                    <Icon size={18} />
                  </span>
                  <p className="mt-3 font-pixel-display text-[8px]" style={{ color }}>{name}</p>
                  <p className="font-pixel-body mt-2 text-sm leading-tight text-foreground/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialLogo({ name }) {
  if (name === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M21.8 4.1 18.5 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.9 13.5.9 12c-1.1-.3-1.1-1.1.2-1.6L20.6 3c.9-.3 1.7.2 1.2 1.1Z" />
      </svg>
    );
  }

  if (name === "discord") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M19.5 5.2A16 16 0 0 0 15.5 4l-.5 1.1a14.8 14.8 0 0 0-6 0L8.5 4a16 16 0 0 0-4 1.2C2 8.9 1.3 12.5 1.7 16a16.2 16.2 0 0 0 5 2.5l1.1-1.8c-.6-.2-1.1-.5-1.6-.8l.4-.3a11.5 11.5 0 0 0 10.8 0l.4.3c-.5.3-1 .6-1.6.8l1.1 1.8a16.2 16.2 0 0 0 5-2.5c.5-4.1-.7-7.7-2.8-10.8ZM8.3 13.8c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M18.9 2h3.3l-7.3 8.3L23.5 22h-6.7l-5.2-6.8L5.6 22H2.3l7.8-8.9L1.8 2h6.9l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.7 3.9h-2L17.7 20Z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer id="community" className="relative overflow-hidden border-t-2 border-border/60">
      <SectionThreeScene variant="footer" className="z-0 opacity-45 mix-blend-screen" />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-10 text-center sm:grid-cols-2 sm:px-6 sm:text-left lg:grid-cols-4">
        <div className="premium-hover rounded-sm p-2">
          <p className="font-pixel-display text-[10px] tracking-widest text-foreground/60">BUILT BY</p>
          <img src={kultLogo} alt="Kult Games" className="mx-auto mt-3 h-10 w-auto sm:mx-0" />
        </div>
        <div className="premium-hover rounded-sm p-2">
          <p className="font-pixel-display text-[10px] tracking-widest text-foreground/60">POWERED BY</p>
          <img src={ogLogoAsset} alt="0G Labs" className="mx-auto mt-3 h-9 w-auto sm:mx-0" />
        </div>
        <div className="premium-hover rounded-sm p-2">
          <p className="font-pixel-display text-[10px] tracking-widest text-foreground/60">BUILT ON</p>
          <p className="mt-3 font-pixel-display text-lg text-foreground"><span className="text-primary">Ð</span> DogeOS</p>
        </div>
        <div className="premium-hover rounded-sm p-2">
          <p className="font-pixel-display text-[10px] tracking-widest text-foreground/60">FOLLOW US</p>
          <div className="mt-3 flex justify-center gap-3 sm:justify-start">
            {[
              { name: "telegram", href: "https://t.me/KultGamesOfficial", label: "Telegram" },
              { name: "discord", href: "https://discord.com/invite/Cge7rrCyUB", label: "Discord" },
              { name: "x", href: "https://x.com/_KultGames", label: "X" },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="premium-hover grid h-10 w-10 place-items-center rounded-sm border-2 border-border bg-card text-foreground/80 transition hover:border-primary hover:text-primary"
              >
                <SocialLogo name={social.name} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="relative z-10 px-4 pb-8 text-center font-pixel-display text-[8px] leading-relaxed text-foreground/50 sm:text-[9px]">© 2026 KULT GAMES. ALL RIGHTS RESERVED.</p>
    </footer>
  );
}

function TrailerModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[oklch(0.02_0.01_255_/_0.86)] px-4 py-8">
      <div className="relative w-full max-w-5xl rounded-sm border-2 border-primary bg-[oklch(0.08_0.03_260)] p-2 shadow-[6px_6px_0_oklch(0.1_0.04_255)] sm:p-4">
        <button
          type="button"
          aria-label="Close trailer"
          onClick={onClose}
          className="clip-arcade-button font-pixel absolute -right-2 -top-2 z-10 grid h-9 w-9 place-items-center border-2 border-[oklch(0.1_0.04_255)] bg-primary text-[10px] text-primary-foreground shadow-[3px_3px_0_oklch(0.1_0.04_255)] sm:h-10 sm:w-10"
        >
          X
        </button>
        <video
          src={dogeTrailer}
          controls
          autoPlay
          playsInline
          className="aspect-video w-full rounded-sm bg-black object-contain"
        />
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const { connectWallet, isConnecting, isConnected } = useWallet();
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [waitingForWallet, setWaitingForWallet] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (isConnected) {
      setWaitingForWallet(false);
      navigate("/Home");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
      setScrollProgress(Math.min(Math.max(nextProgress, 0), 1));
    };

    document.documentElement.classList.add("landing-hide-scrollbar");
    document.body.classList.add("landing-hide-scrollbar");
    updateScrollProgress();

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      document.documentElement.classList.remove("landing-hide-scrollbar");
      document.body.classList.remove("landing-hide-scrollbar");
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  const handleConnect = async () => {
    setWaitingForWallet(true);
    try {
      const account = await connectWallet();
      if (account) {
        navigate("/Home");
      } else {
        window.setTimeout(() => setWaitingForWallet(false), 350);
      }
    } catch (error) {
      setWaitingForWallet(false);
      console.error("Wallet connection failed", error);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed left-0 top-0 z-[80] h-1.5 w-full border-b border-yellow-300/70 bg-black/85 shadow-[0_0_20px_rgba(255,200,0,0.42)] sm:h-2">
        <div
          className="h-full origin-left bg-gradient-to-r from-yellow-100 via-yellow-400 to-amber-600 shadow-[0_0_24px_rgba(255,220,80,0.95)]"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
        <img
          src={dogeEscapeLogo}
          alt=""
          className="absolute -bottom-4 h-8 w-8 -translate-x-1/2 rounded-full border-2 border-yellow-300 bg-black/90 object-contain p-1 shadow-[0_0_16px_rgba(255,200,0,0.85)] sm:-bottom-5 sm:h-9 sm:w-9"
          style={{ left: `${Math.min(Math.max(scrollProgress * 100, 2), 98)}%` }}
        />
      </div>
      <Nav onConnect={handleConnect} isConnecting={isConnecting || waitingForWallet} />
      <Hero
        onConnect={handleConnect}
        isConnecting={isConnecting || waitingForWallet}
        onWatchTrailer={() => setIsTrailerOpen(true)}
      />
      <Marquee />
      <Teaser />
      <Features />
      <AICompanion />
      <ZeroGSection />
      <WeeklyToppers />
      <Footer />
      {isTrailerOpen && <TrailerModal onClose={() => setIsTrailerOpen(false)} />}
    </div>
  );
}

export default LandingPage;
