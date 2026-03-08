import {
  Briefcase,
  Loader2,
  Shield,
  Network,
  Building2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

const TRUST_NAMES = [
  "DFINITY",
  "OpenChat",
  "dmail.ai",
  "ICP Hub",
  "Taggr",
  "Kinic",
];

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Profiles",
    desc: "Every profile is cryptographically tied to an Internet Identity. No fake accounts, no impersonation — your professional reputation secured on-chain.",
  },
  {
    icon: Network,
    title: "Smart Connections",
    desc: "Discover professionals in your field with intelligent suggestions. Endorse skills, send connection requests, and grow a meaningful network.",
  },
  {
    icon: Building2,
    title: "Decentralized Jobs",
    desc: "Post and find job opportunities stored entirely on the Internet Computer. Applications go directly to employers — no intermediary fees.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Sign in with Internet Identity",
    desc: "Use ICP's secure, anonymous authentication. No personal data, no email, no password required.",
  },
  {
    step: "2",
    title: "Build your profile",
    desc: "Add experience, skills, and education. Your profile is stored on-chain and always under your control.",
  },
  {
    step: "3",
    title: "Connect and grow",
    desc: "Join industry groups, apply for jobs, and build a verified professional network.",
  },
];

const RECRUITER_PERKS = [
  "Search candidates by skill, location, and experience",
  "Receive direct applications with cover letters",
  "Every candidate identity is verified on-chain",
];

export function LandingPage({ onLogin, isLoggingIn }: LandingPageProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-landing flex flex-col overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-landing/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center shadow-sm">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-xl tracking-tight">
              NetPro
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollTo("features")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo("how-it-works")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo("recruiters")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              For Recruiters
            </button>
          </nav>

          <div className="hidden md:block" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-5 sm:px-6 py-20 sm:py-36 overflow-hidden">
        {/* Geometric diamond decorations - hidden on mobile to avoid overflow */}
        <div className="pointer-events-none absolute left-[-100px] top-[12%] w-[420px] h-[420px] rotate-45 border-2 border-border/25 bg-primary/5 rounded-3xl hidden sm:block" />
        <div className="pointer-events-none absolute right-[-90px] top-[5%] w-[360px] h-[360px] rotate-45 border-2 border-border/20 rounded-3xl hidden sm:block" />
        <div className="pointer-events-none absolute left-[8%] bottom-[8%] w-[180px] h-[180px] rotate-45 border border-border/20 rounded-xl hidden sm:block" />

        <div className="relative max-w-3xl mx-auto flex flex-col items-center gap-6">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
            <span className="text-xs">✦</span>
            <span>The Professional Network on ICP</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay-1 text-3xl sm:text-5xl md:text-7xl font-bold text-foreground leading-[1.08] tracking-tight">
            Stop cold outreach, let the right{" "}
            <span className="text-primary">connections</span> come to you
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-up-delay-2 text-lg text-muted-foreground max-w-xl leading-relaxed">
            NetPro is a decentralized professional network built on the Internet
            Computer. Own your career data — no middlemen, no data harvesting.
          </p>

          {/* CTA */}
          <div className="animate-fade-up-delay-3 mt-2">
            <Button
              size="lg"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="rounded-full w-full sm:w-auto sm:min-w-[280px] uppercase tracking-wide text-sm font-semibold"
            >
              {isLoggingIn && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoggingIn ? "Connecting..." : "Sign In with Internet Identity"}
            </Button>
          </div>

          {/* Social proof */}
          <p className="animate-fade-up-delay-3 text-sm text-muted-foreground">
            Trusted by{" "}
            <span className="font-semibold text-foreground">500+</span>{" "}
            professionals on the Internet Computer
          </p>
        </div>
      </section>

      {/* Trust logos */}
      <div className="border-y border-border/50 py-10 px-6 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-muted-foreground/70 uppercase tracking-widest mb-6">
            Built for professionals across the ICP ecosystem
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {TRUST_NAMES.map((name) => (
              <span
                key={name}
                className="text-muted-foreground/50 font-semibold text-sm tracking-wide hover:text-muted-foreground transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* App preview */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <div className="w-3 h-3 rounded-full bg-green-400/60" />
              <div className="flex-1 mx-4">
                <div className="bg-muted/60 rounded px-3 py-1 text-xs text-muted-foreground text-center max-w-[200px] mx-auto">
                  netpro.caffeine.ai
                </div>
              </div>
            </div>

            {/* Preview content */}
            <div className="bg-background p-8 min-h-[300px] flex items-center justify-center gap-6 flex-wrap">
              {/* Feed post card */}
              <div className="flex-1 min-w-[240px] max-w-sm bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">JS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-foreground">
                      John Smith
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Senior Engineer · ICP
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Excited to join the ICP ecosystem! Looking to connect with
                  fellow builders and designers...
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    React
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Motoko
                  </span>
                </div>
              </div>

              {/* Connection suggestion cards */}
              <div className="hidden sm:flex flex-col gap-3">
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3 w-64">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-primary-foreground font-bold text-xs">
                      AK
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">
                      Alice Kim
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Product Designer
                    </div>
                  </div>
                  <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full shrink-0 font-medium">
                    Connect
                  </span>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3 w-64">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-secondary-foreground font-bold text-xs">
                      MB
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">
                      Mark Brown
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Blockchain Developer
                    </div>
                  </div>
                  <span className="text-xs border border-border text-foreground px-3 py-1 rounded-full shrink-0 font-medium">
                    Connect
                  </span>
                </div>
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-3 w-64">
                  <div className="w-9 h-9 rounded-full bg-chart-2/20 flex items-center justify-center shrink-0">
                    <span className="text-chart-2 font-bold text-xs">SR</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">
                      Sara Reyes
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Startup Founder
                    </div>
                  </div>
                  <span className="text-xs border border-border text-foreground px-3 py-1 rounded-full shrink-0 font-medium">
                    Connect
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-6 py-20 bg-muted/30 border-t border-border"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              Everything you need to grow professionally
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powered by the Internet Computer — your data is yours, forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
              Get up and running in minutes
            </h2>
            <p className="text-muted-foreground">
              No passwords. No email. No data sold to advertisers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-sm">
                  {step}
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruiters CTA */}
      <section
        id="recruiters"
        className="relative px-6 py-20 bg-primary overflow-hidden"
      >
        <div className="pointer-events-none absolute right-[-60px] top-[-60px] w-[280px] h-[280px] rotate-45 bg-white/5 rounded-2xl" />
        <div className="pointer-events-none absolute left-[-40px] bottom-[-40px] w-[200px] h-[200px] rotate-45 bg-white/5 rounded-2xl" />

        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-primary-foreground">
              For Recruiters
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              Post verified job listings that reach real professionals. Every
              applicant has a cryptographically verified identity — no bots, no
              fake profiles.
            </p>
            <ul className="flex flex-col gap-2.5">
              {RECRUITER_PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-2 text-sm text-primary-foreground/90"
                >
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Button
              size="lg"
              variant="secondary"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="min-w-[220px] rounded-full font-semibold"
            >
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post a Job Today
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 bg-landing">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Briefcase className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">NetPro</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © 2026. Built with ❤️ using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            Your data. Your career. On-chain.
          </p>
        </div>
      </footer>
    </div>
  );
}
