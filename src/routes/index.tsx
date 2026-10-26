import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, LineChart, Pause, Play, ShieldCheck, Volume2, VolumeX, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site-chrome";
import { FeatureGrid, Steps, PricingGrid, FaqList, SectionTitle } from "@/components/marketing";
import { HERO_IMAGE, ACCOUNT_MGMT_URL } from "@/lib/site";
import { onMediaError } from "@/lib/media";
import heroReel from "@/assets/quantum-matrix-hero.mp4.asset.json";
import heroReelWebm from "@/assets/quantum-matrix-hero.webm.asset.json";
import proof1 from "@/assets/bot-proof-image.jpg.asset.json";
import proof2 from "@/assets/bot-proof-image-2.jpg.asset.json";
import proof3 from "@/assets/bot-proof-image-3.jpg.asset.json";
import proof4 from "@/assets/bot-proof-image-4.jpg.asset.json";
import { PlatformStatus } from '@/components/platform-status';
import { BROKERS } from '@/lib/brokers';
import { HomepageMedia } from '@/components/homepage-media';
import { BotHomepage } from '@/components/bot-marketplace';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantum Multi Assets Matrix — MT5 Trading Platform" },
      { name: "description", content: "Explore the platform, and discover tools for your MT5 trading workflow." },
      { property: "og:title", content: "Quantum Multi Assets Matrix" },
      { property: "og:description", content: "MT5-focused automated trading platform with subscription access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:image", content: HERO_IMAGE },
    ],
  }),
  component: Index,
});

function HeroReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const attempt = v.play();
    if (attempt && typeof attempt.catch === "function") attempt.catch(() => setPaused(true));
  }, []);

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) void v.play().catch(() => {});
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  };

  return (
    <div className="relative mx-auto w-full max-w-[244px] sm:max-w-[264px] lg:max-w-[280px]">
      <div aria-hidden className="absolute -right-5 -top-5 -z-10 hidden h-full w-full rounded-lg border border-editorial/30 sm:block" />

      <div className="animate-qmam-float relative rounded-lg border border-primary/40 bg-primary p-1.5 shadow-[var(--shadow-glow)]">
        <div className="relative overflow-hidden rounded-md bg-card">
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-2.5">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-primary-foreground">
              QMAM
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground/80" />
              matrix reel
            </span>
          </div>

          <video
            ref={videoRef}
            poster={HERO_IMAGE}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Quantum Multi Assets Matrix showcase video"
            className="block aspect-[9/16] w-full bg-card object-cover"
            onError={onMediaError(heroReel)}
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
          >
            <source src={heroReel.url} type="video/mp4" />
            <source src={heroReelWebm.url} type="video/webm" />
          </video>

          <div className="flex items-center gap-3 bg-primary px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              aria-label={paused ? "Play video" : "Pause video"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition hover:bg-primary-foreground/25"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </Button>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-primary-foreground/25">
              <div
                className="h-full rounded-full bg-primary-foreground transition-[width] duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition hover:bg-primary-foreground/25"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="animate-qmam-float-slow absolute -left-8 top-20 hidden rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-primary shadow-sm lg:block">
        MT5 Ready
      </div>
      <div className="animate-qmam-float-slow absolute -right-10 bottom-28 hidden rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-primary shadow-sm lg:block">
        Multi-Asset
      </div>
    </div>
  );
}

const ALBUM = [
  { pointer: proof1, title: "AUDCAD basket", note: "Scaled buy grid, floating profit" },
  { pointer: proof2, title: "GOLD scaling", note: "Layered 10-lot buys on XAUUSD" },
  { pointer: proof3, title: "AUDCAD mid-session", note: "Grid holding through the session" },
  { pointer: proof4, title: "XAUUSD sells", note: "Sell ladder on a $15K account" },
] as const;

function BotAlbum() {
  const [open, setOpen] = useState<number | null>(null);
  const active = open === null ? null : ALBUM[open];

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="MT5 album" title="Shared trading screenshots" />
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
        Community-shared snapshots. These images do not show current connection or bot activity.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ALBUM.map((item, i) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="aspect-[9/16] overflow-hidden">
              <img
                src={item.pointer.url}
                alt={`${item.title} — MT5 screenshot from a bot-connected account`}
                loading="lazy"
                onError={onMediaError(item.pointer)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-3 pt-8">
              <p className="font-display text-xs font-bold text-primary-foreground">{item.title}</p>
              <p className="text-[11px] text-primary-foreground/80">{item.note}</p>
            </div>
            <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary-foreground opacity-0 transition group-hover:opacity-100">
              View
            </span>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <div className="relative max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.pointer.url}
              alt={`${active.title} — full size`}
              onError={onMediaError(active.pointer)}
              className="max-h-[85vh] w-auto rounded-2xl border border-border shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-sm font-bold text-primary-foreground">{active.title}</p>
                <p className="text-xs text-primary-foreground/70">{active.note}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function BrokersSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <SectionTitle eyebrow="Supported brokers" title="Works with the brokers you already use" />
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">
        {BROKERS.length}+ brokers supported — and the list is unlimited. Yours not shown? Contact the admin and we’ll add it.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-2.5">
        {BROKERS.slice(0, 24).map((b) => (
          <span key={b} className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium shadow-sm">
            {b}
          </span>
        ))}
        <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          + {BROKERS.length - 24} more
        </span>
      </div>
      <div className="mt-8 text-center">
        <Button asChild variant="outline" className="gap-2">
          <a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">
            Broker not listed? Contact admin
            <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}

function ConnectMt5Cta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="relative border-y border-primary/30 bg-primary px-6 py-12 text-center sm:px-12">

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/80">Featured</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
          Connect your MT5 account to the Matrix
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
          Subscription approval unlocks eligible MT5 access. Account connection will become available once the secure MT5 service is configured.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" variant="secondary" asChild className="gap-2 font-bold">
            <Link to="/dashboard/mt5">
              <Zap className="h-4 w-4" />
              Connect MT5 Now
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="gap-2 border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/how-it-works">
              See how it works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Subscription-secured", note: "Access is verified on the server for every session." },
            { icon: LineChart, title: "Multi-asset coverage", note: "Forex, metals and more from a single connection." },
            { icon: Zap, title: "Guided setup", note: "Broker, server and account ID — step by step." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-primary-foreground/10 p-4">
              <f.icon className="h-5 w-5 text-primary-foreground" />
              <p className="mt-2 font-display text-sm font-bold text-primary-foreground">{f.title}</p>
              <p className="mt-1 text-xs text-primary-foreground/75">{f.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:py-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-editorial">Matrix Quantum MT5</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-primary sm:text-5xl">
            Quantum Multi Assets Matrix
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Explore the platform, and discover tools designed for your MT5 trading workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/dashboard/mt5"><Zap className="h-4 w-4" />Connect MT5</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/auth" search={{ mode: "signup" }}>Create Free Account</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/pricing">View Plans</Link></Button>
            <Button size="lg" variant="secondary" asChild><a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">Account Management — Click Here</a></Button>
          </div>
        </div>
        <HomepageMedia><HeroReel /></HomepageMedia>
      </section>

      <PlatformStatus />
      <BotHomepage />
      <ConnectMt5Cta />
      <BrokersSection />
      <BotAlbum />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="How it works" title="Five clear steps" />
        <Steps />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Features" title="Built for a serious trading workflow" />
        <FeatureGrid />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Pricing" title="Choose your plan" />
        <PricingGrid />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="FAQ" title="Questions, answered" />
        <FaqList />
      </section>
    </PublicLayout>
  );
}
