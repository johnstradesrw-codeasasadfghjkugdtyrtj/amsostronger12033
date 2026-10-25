import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Check, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlans } from "@/components/marketing";

const SHOWN_KEY = "qmam-welcome-trial-shown";

/** Instant green welcome popup offering the Trial plan, shown once per session. */
export function WelcomeTrial() {
  const { data: plans } = usePlans();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SHOWN_KEY)) return;
    sessionStorage.setItem(SHOWN_KEY, "1");
    setOpen(true);
  }, []);

  const trial = plans?.find((p) => p.active && p.visible && !p.custom_quote && (p.duration_days ?? 0) <= 3)
    ?? plans?.filter((p) => p.active && p.visible && !p.custom_quote).sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0))[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-primary/40 bg-card shadow-[0_0_60px_-10px_hsl(var(--primary)/0.5)]">
        <DialogHeader>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" /> Welcome offer
          </p>
          <DialogTitle className="font-display text-2xl">
            Start with the {trial?.name ?? "Trial"} plan
          </DialogTitle>
          <DialogDescription>
            {trial
              ? `${trial.currency} ${Number(trial.price).toLocaleString()} for ${trial.duration_days} days — the fastest way to try the Matrix.`
              : "The fastest way to try the Matrix."}
          </DialogDescription>
        </DialogHeader>
        {trial && (
          <ul className="space-y-2 text-sm">
            {trial.features.slice(0, 3).map((f) => (
              <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{f}</li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-col gap-2">
          <Button asChild className="w-full shadow-md" onClick={() => setOpen(false)}>
            <Link to="/dashboard/plans">Get the {trial?.name ?? "Trial"} plan<ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>Maybe later</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
