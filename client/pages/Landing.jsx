import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ArrowRight,
  BarChart3,
  IndianRupee,
  Bell,
  Zap,
  Shield,
  PieChart,
  CheckCircle2,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────── */
const features = [
  {
    icon: <BarChart3 size={20} />,
    title: "Smart Analytics",
    desc: "Monthly income vs expense charts that actually make sense.",
  },
  {
    icon: <IndianRupee size={20} />,
    title: "Transaction Tracking",
    desc: "Log every rupee — searchable, filterable, paginated.",
  },
  {
    icon: <PieChart size={20} />,
    title: "Budget Insights",
    desc: "Set budgets per account. Get alerted at 80% and 100%.",
  },
  {
    icon: <Bell size={20} />,
    title: "Monthly Reports",
    desc: "Automated HTML email summaries on the 1st of every month.",
  },
  {
    icon: <Zap size={20} />,
    title: "AI Receipt Scanner",
    desc: "Gemini 2.0 Flash reads receipts and fills your form.",
  },
  {
    icon: <Shield size={20} />,
    title: "Secure & Private",
    desc: "JWT auth, bcrypt hashing. Your data stays yours.",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "₹2Cr+", label: "Tracked Monthly" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "User Rating" },
];

const perks = [
  "No credit card required",
  "Recurring transactions on autopilot",
  "Export transactions to PDF",
];

/* ─── Component ─────────────────────────────────────────────────── */
const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans overflow-x-hidden">

      {/* Google Font — loaded inline so no extra config needed */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .font-display { font-family: 'DM Serif Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        /* mesh background */
        .mesh-bg {
          background:
            radial-gradient(ellipse 80% 60% at 20% -10%, #e0f2fe 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 10%,  #fef9c3 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 90%,  #f0fdf4 0%, transparent 60%),
            #ffffff;
        }

        /* staggered fade-up */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up          { animation: fadeUp .65s ease both; }
        .delay-1          { animation-delay: .10s; }
        .delay-2          { animation-delay: .22s; }
        .delay-3          { animation-delay: .34s; }
        .delay-4          { animation-delay: .46s; }
        .delay-5          { animation-delay: .58s; }

        /* feature card hover */
        .feature-card {
          transition: box-shadow .2s, transform .2s;
        }
        .feature-card:hover {
          box-shadow: 0 8px 32px -8px rgba(0,0,0,.12);
          transform: translateY(-3px);
        }

        /* pill badge */
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          border: 1px solid #e4e4e7;
          background: rgba(255,255,255,.8);
          font-size: .75rem;
          font-weight: 500;
          color: #52525b;
          backdrop-filter: blur(4px);
        }

        /* stat divider */
        .stat-item + .stat-item {
          border-left: 1px solid #e4e4e7;
        }
      `}</style>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur font-body">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="bg-zinc-900 p-1.5 rounded-lg">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-display text-lg leading-none">
              Smart<span className="text-zinc-400">Spend</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition rounded-lg hover:bg-zinc-50">
                Sign in
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition">
                Get started
              </button>
            </Link>
          </div>

        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="mesh-bg font-body">
        <div className="max-w-6xl mx-auto px-5 pt-24 pb-28 flex flex-col items-center text-center">

          <div className="pill fade-up mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered · Free Forever · Built for India
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.08] tracking-tight text-zinc-900 max-w-3xl fade-up delay-1">
            Your money,<br />
            <em className="text-zinc-400 not-italic">finally</em> organised.
          </h1>

          <p className="mt-6 text-zinc-500 text-lg max-w-md leading-relaxed fade-up delay-2">
            Track expenses, set budgets, scan receipts with AI, and get
            beautiful monthly reports — all in one place.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 fade-up delay-3">
            <Link to="/register">
              <button className="flex items-center gap-2 px-7 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-700 transition shadow-lg shadow-zinc-900/10">
                Start for free <ArrowRight size={15} />
              </button>
            </Link>
            <Link to="/login">
              <button className="px-7 py-3 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition bg-white/70">
                Sign in
              </button>
            </Link>
          </div>

          {/* perks row */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 fade-up delay-4">
            {perks.map((p) => (
              <span key={p} className="flex items-center gap-1.5 text-xs text-zinc-500">
                <CheckCircle2 size={13} className="text-emerald-500" />
                {p}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section className="border-y border-zinc-100 bg-zinc-50 font-body">
        <div className="max-w-3xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-item text-center py-2 px-4">
              <p className="font-display text-3xl text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-1 tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 py-28 font-body">

        <div className="mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-3">Features</p>
          <h2 className="font-display text-4xl sm:text-5xl text-zinc-900 max-w-sm leading-tight">
            Everything<br />you need.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card rounded-2xl border border-zinc-100 bg-white p-7"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 mb-5">
                {f.icon}
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2 text-sm">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* ── CTA banner ─────────────────────────────────────────── */}
      <section className="mx-4 mb-24 rounded-3xl overflow-hidden font-body" style={{
        background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)"
      }}>
        <div className="max-w-2xl mx-auto px-8 py-20 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">Get started today</p>
          <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-5">
            Stop guessing.<br />
            <em className="text-zinc-400">Start knowing.</em>
          </h2>
          <p className="text-zinc-400 text-sm mb-10 max-w-sm mx-auto">
            Join thousands of users who finally know where their money goes every month.
          </p>
          <Link to="/register">
            <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-100 transition shadow-xl">
              Create free account <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 font-body">
        <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 p-1 rounded-md">
              <TrendingUp size={12} className="text-white" />
            </div>
            <span className="font-display text-sm text-zinc-700">SmartSpend</span>
          </div>
          <span>© 2025 SmartSpend. All rights reserved.</span>
          <span>Built with ❤️ for placement</span>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
