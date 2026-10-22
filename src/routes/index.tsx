import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site-chrome";
import { FeatureGrid, Steps, PricingGrid, FaqList, SectionTitle } from "@/components/marketing";
import { HERO_IMAGE, ACCOUNT_MGMT_URL } from "@/lib/site";
import heroReel from "@/assets/quantum-matrix-hero.mp4.asset.json";
import heroReelWebm from "@/assets/quantum-matrix-hero.webm.asset.json";

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
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[350px]">
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-[4rem] bg-primary/10 blur-3xl" />
      <div aria-hidden className="absolute -right-5 -top-5 -z-10 hidden h-full w-full rounded-[2.4rem] border border-primary/30 sm:block" />

      <div className="animate-qmam-float relative rounded-[2.3rem] border border-primary/40 bg-primary p-1.5 shadow-[var(--shadow-glow)]">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-card">
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
            <button
              type="button"
              onClick={togglePlay}
              aria-label={paused ? "Play video" : "Pause video"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition hover:bg-primary-foreground/25"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-primary-foreground/25">
              <div
                className="h-full rounded-full bg-primary-foreground transition-[width] duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground transition hover:bg-primary-foreground/25"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
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

function Index() {
  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Matrix Quantum MT5</p>
          <h1 className="mt-4 bg-[image:var(--gradient-brand)] bg-clip-text font-display text-4xl font-bold leading-tight text-transparent sm:text-6xl">
            Quantum Multi Assets Matrix
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Explore the platform, and discover tools designed for your MT5 trading workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/auth" search={{ mode: "signup" }}>Create Free Account</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/pricing">View Plans</Link></Button>
            <Button size="lg" variant="secondary" asChild><a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">Account Management — Click Here</a></Button>
          </div>
        </div>
        <HeroReel />
      </section>

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
