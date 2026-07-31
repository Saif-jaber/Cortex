import { useLayoutEffect, useRef, useState } from "react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const INTEGRATIONS = ["Notion", "Slack", "Figma", "Google Drive", "Confluence", "Dropbox"];

const STATS = [
  { value: "2,400+", label: "teams on Cortex" },
  { value: "38M+", label: "documents indexed" },
  { value: "3.2x", label: "faster retrieval" },
  { value: "99.99%", label: "uptime SLA" },
];

const STEPS = [
  {
    icon: PlugIcon,
    title: "Connect your tools",
    copy: "Link Notion, Google Drive, Slack, Figma and 40+ more in minutes with one-click OAuth. No exports, no CSV cleanup, no manual syncing.",
  },
  {
    icon: LayersIcon,
    title: "Cortex learns your stack",
    copy: "Every document is indexed and auto-organized with tags, hierarchy and smart deduplication. Structure builds itself.",
  },
  {
    icon: SparklesIcon,
    title: "Ask anything",
    copy: "Search or chat in plain language. Get answers with citations to the exact source documents, fresh from your own knowledge base.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We moved from six scattered tools to Cortex in a weekend. A search that used to take twenty minutes now takes seconds. It's the closest thing to a shared brain for our team.",
    name: "Sarah Chen",
    role: "VP Engineering, Lumen",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    quote:
      "The semantic search is scary good. It understands the question behind the question. Our onboarding time dropped by 40% in the first quarter.",
    name: "Marcus Bennett",
    role: "Head of Product, Driftline",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    quote:
      "Cortex is the first tool our whole company actually enjoys using. Everyone from design to legal finds what they need without asking around.",
    name: "Priya Sharma",
    role: "COO, Northwind",
    gradient: "from-cyan-400 to-sky-500",
  },
];

const FAQS = [
  {
    q: "What tools does Cortex connect to?",
    a: "Cortex connects to Notion, Google Drive, Slack, Figma, Confluence, Dropbox, Linear and 40+ more. Each integration takes a single OAuth connection, and you can connect or remove tools at any time.",
  },
  {
    q: "How does Cortex AI actually answer questions?",
    a: "Cortex indexes your documents into a semantic search index, then generates answers grounded only in your own sources. Every answer includes citations back to the exact file or message it came from, so you can always verify the source.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Data is encrypted in transit (TLS 1.3) and at rest (AES-256). Cortex is SOC 2 Type II compliant, supports SSO/SAML on Enterprise, and never trains its models on your content.",
  },
  {
    q: "Can I try it before committing?",
    a: "Absolutely. Every plan starts with a free 14-day trial on our Team tier, no credit card required. Your workspace, documents and settings carry over if you decide to upgrade.",
  },
  {
    q: "What makes this different from normal search?",
    a: "Keyword search matches exact words; Cortex understands intent. Ask a question in natural language and get a cited answer pulled from documents across every connected tool, even when the answer spans several sources.",
  },
  {
    q: "Can we self-host Cortex?",
    a: "Yes. Enterprise customers can run Cortex in their own VPC or on-premises with dedicated deployment, custom AI model routing and a single-tenant SLA.",
  },
];

const PLAN_FEATURES = {
  starter: ["3 integrations", "1,000 documents", "Up to 5 team members", "Basic semantic search"],
  team: [
    "Unlimited integrations",
    "Up to 100,000 documents",
    "Unlimited team members",
    "AI chat with cited answers",
    "Smart auto-organization",
    "Advanced analytics",
    "Priority support",
  ],
  enterprise: [
    "Everything in Team",
    "SSO / SAML & SCIM",
    "SOC 2 report & DPA",
    "Custom AI model routing",
    "Dedicated VPC or on-prem",
    "Dedicated success manager",
  ],
};

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0a0e1a] font-sans text-slate-300 antialiased">
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero />
      <LogoCloud />
      <StatsBand />
      <Features />
      <ProductShowcase />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ─── Navigation ─────────────────────────────────────────────── */

function Nav({ menuOpen, setMenuOpen }) {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-ink-900/75 py-2.5 pl-4 pr-2.5 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <a href="#/" className="flex items-center gap-2.5" aria-label="Cortex home">
          <img src="/logo.svg" alt="" className="h-7 w-7" />
          <span className="font-display text-[17px] font-bold tracking-tight text-slate-100">Cortex</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="#/app"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-slate-100"
          >
            Sign in
          </a>
          <a
            href="#/app"
            className="group flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-400 hover:shadow-indigo-500/40"
          >
            Get started
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/[0.06] lg:hidden"
        >
          {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/[0.08] bg-ink-900/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-slate-100"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/[0.08] pt-3">
              <a
                href="#/app"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-white/[0.1] px-4 py-3 text-center text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
              >
                Sign in
              </a>
              <a
                href="#/app"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-indigo-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
              >
                Get started free
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative pt-40 pb-20 sm:pt-44 sm:pb-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid bg-grid-fade absolute inset-0" />
        <div className="absolute -top-32 left-1/2 h-[480px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -right-40 top-40 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[110px]" />
        <div className="absolute -left-40 top-64 h-[360px] w-[360px] rounded-full bg-violet-600/10 blur-[110px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] py-1.5 pl-1.5 pr-4 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-1 text-[11px] font-semibold text-indigo-300">
                <SparklesIcon className="h-3 w-3" /> New
              </span>
              Cortex AI semantic search is here
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-100 sm:text-6xl lg:text-7xl">
              Your team's knowledge,
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                working for you.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Cortex connects Notion, Google Drive, Slack and Figma into one AI-powered knowledge base.
              Ask anything, get answers grounded in your sources, instantly.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#/app"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all duration-200 hover:bg-indigo-400 hover:shadow-indigo-500/45 sm:w-auto"
              >
                Launch the app
                <ArrowRightIcon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#product"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-base font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/[0.08] sm:w-auto"
              >
                See it in action
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-6 text-sm text-slate-500">
              Free 14-day trial · No credit card required · Cancel anytime
            </p>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
          <HeroMockup />
        </Reveal>
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-8 h-full w-[85%] -translate-x-1/2 rounded-[36px] bg-indigo-500/20 blur-[90px]" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-ink-800 shadow-2xl shadow-black/50 ring-1 ring-white/[0.04]">
        <div className="flex items-center gap-3 border-b border-white/[0.07] bg-ink-900/80 px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-4 py-1.5 text-xs text-slate-500">
            <LockIcon className="h-3 w-3" />
            cortex.app / knowledge-base
          </div>
          <div className="ml-auto hidden h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 sm:block" />
        </div>

        <div className="flex">
          <div className="hidden w-12 flex-col items-center gap-2.5 border-r border-white/[0.07] py-4 sm:flex">
            <img src="/logo.svg" alt="" className="mb-1 h-5 w-5" />
            <MiniIcon className="h-4.5 w-4.5 text-indigo-400" />
            <MiniIcon className="h-4.5 w-4.5 text-slate-600" type="db" />
            <MiniIcon className="h-4.5 w-4.5 text-slate-600" type="chat" />
            <MiniIcon className="h-4.5 w-4.5 text-slate-600" type="bars" />
          </div>

          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-ink-700 px-2.5 py-1.5 text-[11px] font-medium text-slate-300">
                <FolderIcon className="h-3.5 w-3.5 text-slate-500" />
                General Knowledge
                <ChevronDownIcon className="h-3 w-3 text-slate-600" />
              </div>
              <div className="ml-auto hidden items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-500 md:flex">
                <SearchIcon className="h-3 w-3" />
                <span>Search everything…</span>
                <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1 text-[9px]">⌘K</kbd>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
              <div className="rounded-xl border border-white/[0.07] bg-ink-700 p-4 lg:col-span-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                    <SparklesIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Cortex AI</p>
                    <p className="text-[10px] text-slate-500">Grounded in 4 sources · just now</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  The Q3 launch plan is driven by the <span className="rounded bg-indigo-500/20 px-1 text-indigo-300">design-system-v2.fig</span>{" "}
                  spec and the roadmap in <span className="rounded bg-indigo-500/20 px-1 text-indigo-300">product-spec.pdf</span>. Marketing
                  starts Aug 15, engineering ships on Sept 2.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["q3-report.docx", "product-spec.pdf", "design-system-v2.fig"].map((f) => (
                    <span key={f} className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">
                      <FileGlyph className="h-3 w-3" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:col-span-2 lg:grid-cols-1">
                {[
                  { name: "Onboarding", meta: "3 files", tone: "from-emerald-500/15" },
                  { name: "Integrations", meta: "7 files", tone: "from-amber-500/15" },
                  { name: "Documents", meta: "15 files", tone: "from-sky-500/15" },
                ].map((f) => (
                  <div key={f.name} className="rounded-xl border border-white/[0.07] bg-ink-700 p-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${f.tone} to-transparent`}>
                      <FolderIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-2 truncate text-[11px] font-medium text-slate-300">{f.name}</p>
                    <p className="text-[10px] text-slate-500">{f.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -left-4 top-24 z-10 hidden items-center gap-2.5 rounded-xl border border-white/[0.1] bg-ink-600/90 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md animate-float-slow xl:flex">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
          <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">Semantic match 98%</p>
          <p className="text-[10px] text-slate-500">query → q3-report.docx</p>
        </div>
      </div>

      <div className="absolute -right-6 bottom-24 z-10 hidden items-center gap-2.5 rounded-xl border border-white/[0.1] bg-ink-600/90 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md animate-float-slower xl:flex">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15">
          <PlugIcon className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">Synced from Slack</p>
          <p className="text-[10px] text-slate-500">#launch-plan · 2m ago</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Logo cloud ─────────────────────────────────────────────── */

function LogoCloud() {
  return (
    <section className="border-y border-white/[0.05] bg-ink-900/40 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Works with your favorite tools
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
            {INTEGRATIONS.map((name) => (
              <span key={name} className="font-display text-lg font-semibold tracking-tight text-slate-600 transition-colors duration-200 hover:text-slate-400">
                {name}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Stats ──────────────────────────────────────────────────── */

function StatsBand() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-4 sm:px-6 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 80} className="text-center">
            <p className="font-display text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              <span className="bg-gradient-to-b from-slate-100 to-slate-400 bg-clip-text text-transparent">{stat.value}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Features (bento grid) ──────────────────────────────────── */

function Features() {
  return (
    <section id="features" className="scroll-mt-28 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionKicker>Everything you need</SectionKicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Stop hunting. Start knowing.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-lg text-slate-400">
              One workspace that gathers every tool, understands every document, and answers every question.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard feature={FEATURES[0]} delay={0} />
          <FeatureCard feature={FEATURES[1]} delay={80} />
          <FeatureCard feature={FEATURES[2]} delay={0} />
          <FeatureCard feature={FEATURES[3]} delay={80} />
          <FeatureCard feature={FEATURES[4]} delay={0} />
          <FeatureCard feature={FEATURES[5]} delay={80} />
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Semantic search, not keywords",
    copy: "Describe what you need in plain language. Cortex understands intent and surfaces the right documents, even when you don't remember the exact name or file.",
    span: "lg:col-span-2",
    visual: <SearchVisual />,
  },
  {
    icon: PlugIcon,
    title: "40+ integrations",
    copy: "Notion, Google Drive, Slack, Figma, Confluence and more. Connect once, search everywhere.",
    span: "lg:col-span-1",
    visual: <IntegrationsVisual />,
  },
  {
    icon: LayersIcon,
    title: "Self-organizing knowledge",
    copy: "Auto-tagging, smart hierarchies and deduplication keep your workspace structured without the busywork.",
    span: "lg:col-span-1",
    visual: <FoldersVisual />,
  },
  {
    icon: ChatIcon,
    title: "AI chat with receipts",
    copy: "Ask anything and get answers that cite their sources. Every claim links back to the exact document, slide or message it came from.",
    span: "lg:col-span-2",
    visual: <ChatVisual />,
  },
  {
    icon: UsersIcon,
    title: "Built for teams",
    copy: "Shared spaces, granular permissions and an activity trail show who added what, so everyone stays in sync.",
    span: "lg:col-span-2",
    visual: <TeamVisual />,
  },
  {
    icon: ShieldIcon,
    title: "Enterprise-grade security",
    copy: "SOC 2 Type II, SSO/SAML, AES-256 encryption and strict controls. Your data is never used to train models.",
    span: "lg:col-span-1",
    visual: <SecurityVisual />,
  },
];

function FeatureCard({ feature, delay }) {
  const Icon = feature.icon;
  return (
    <Reveal delay={delay} className={feature.span}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-700 p-6 transition-all duration-300 hover:border-indigo-500/30 hover:bg-ink-600 hover:shadow-2xl hover:shadow-indigo-950/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-indigo-300 transition-colors duration-300 group-hover:text-indigo-200">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold tracking-tight text-slate-100">{feature.title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{feature.copy}</p>
        <div className={`mt-5 flex-1 ${feature.span === "lg:col-span-2" ? "min-h-[150px]" : "min-h-[120px]"} `}>
          {feature.visual}
        </div>
      </div>
    </Reveal>
  );
}

function SearchVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-ink-800/70 p-4">
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-ink-900/70 px-3 py-2">
        <SearchIcon className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-xs text-slate-300">the launch timeline we agreed on last week</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-indigo-500/25 bg-indigo-500/[0.08] px-3 py-2.5">
        <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-indigo-300" />
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-200">q3-report.docx: "timeline: engineering Sept 2, marketing Aug 15"</p>
          <p className="text-[10px] text-slate-500">98% match · cited source</p>
        </div>
      </div>
    </div>
  );
}

function IntegrationsVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {["Notion", "Slack", "Figma", "Google Drive"].map((t) => (
        <div key={t} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-ink-800/70 px-3 py-2">
          <div className="h-5 w-5 rounded-md bg-white/[0.06] text-[9px] font-bold uppercase text-slate-400 grid place-items-center">
            {t[0]}
          </div>
          <span className="text-xs text-slate-300">{t}</span>
          <span className="ml-auto text-[10px] text-emerald-400">Synced</span>
        </div>
      ))}
      <p className="text-center text-[11px] text-slate-500">+ 36 more</p>
    </div>
  );
}

function FoldersVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-ink-800/70 p-4">
      {[
        { name: "Design", depth: 0, tint: "text-pink-400" },
        { name: "Design / Brand", depth: 1, tint: "text-slate-500" },
        { name: "Design / UX", depth: 1, tint: "text-slate-500" },
        { name: "Engineering", depth: 0, tint: "text-sky-400" },
      ].map((f) => (
        <div key={f.name} className="flex items-center gap-2" style={{ paddingLeft: f.depth * 16 }}>
          <FolderIcon className={`h-3.5 w-3.5 shrink-0 ${f.tint}`} />
          <span className="truncate text-[11px] text-slate-300">{f.name}</span>
          <span className="ml-auto rounded-full bg-white/[0.05] px-1.5 text-[9px] text-slate-500">auto</span>
        </div>
      ))}
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 rounded-xl border border-white/[0.06] bg-ink-800/70 p-4">
      <div className="ml-auto max-w-[70%] rounded-xl rounded-br-sm bg-indigo-500/15 px-3 py-2 text-[11px] text-slate-200">
        Which vendors should we shortlist for Q3?
      </div>
      <div className="flex items-start gap-2 max-w-[85%] rounded-xl rounded-bl-sm bg-ink-900/70 px-3 py-2.5">
        <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-300" />
        <div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Based on the RFP notes and vendor comparison in <span className="text-indigo-300">integrations.md</span>, Apex and Orbit lead on security and cost.
          </p>
          <p className="mt-1 text-[9px] text-slate-500">Sources: 2 documents</p>
        </div>
      </div>
    </div>
  );
}

function TeamVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 rounded-xl border border-white/[0.06] bg-ink-800/70 p-4">
      <div className="flex -space-x-2">
        {[
          "from-sky-400 to-indigo-500",
          "from-violet-400 to-purple-500",
          "from-emerald-400 to-teal-500",
          "from-amber-400 to-orange-500",
          "from-rose-400 to-pink-500",
        ].map((g, i) => (
          <div key={i} className={`h-7 w-7 rounded-full bg-gradient-to-br ${g} ring-2 ring-ink-800`} />
        ))}
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-[9px] font-semibold text-slate-300 ring-2 ring-ink-800">
          +12
        </div>
      </div>
      <div className="space-y-1.5">
        {["Sarah added product-spec.pdf · 2h ago", "James updated onboarding-guide.docx · 5h ago"].map((t) => (
          <div key={t} className="flex items-center gap-2 rounded-lg bg-ink-900/70 px-3 py-2 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded-xl border border-white/[0.06] bg-ink-800/70 p-4">
      {[
        ["SOC 2 Type II", true],
        ["SSO / SAML", true],
        ["AES-256 at rest", true],
        ["Model training on your data", false],
      ].map(([label, ok]) => (
        <div key={label} className="flex items-center gap-2 text-[11px] text-slate-300">
          {ok ? (
            <CheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          ) : (
            <XIcon className="h-3.5 w-3.5 shrink-0 text-slate-600" />
          )}
          <span className={ok ? "" : "text-slate-500 line-through"}>{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Product showcase ───────────────────────────────────────── */

function ProductShowcase() {
  return (
    <section id="product" className="scroll-mt-28 border-t border-white/[0.05] bg-ink-900/40 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div>
            <SectionKicker>Product</SectionKicker>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Ask anything. Get answers with receipts.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Every answer is generated from your own sources and always points back to the exact document,
              slide or message, so your team can trust what it reads and verify what it ships.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Answers grounded in your connected tools, never a public model",
                "Inline citations with one-click jump to the source",
                "Natural-language queries, no syntax, no operators",
                "Works across documents, spreadsheets, designs and messages",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                    <CheckIcon className="h-3 w-3 text-indigo-300" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#/app"
              className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-400"
            >
              Open the app
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <AnswerPanel />
        </Reveal>
      </div>
    </section>
  );
}

function AnswerPanel() {
  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-indigo-500/15 via-violet-500/10 to-sky-500/15 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-ink-800 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
              <SparklesIcon className="h-3 w-3" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Ask Cortex</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">4 sources</span>
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-ink-900/70 px-3.5 py-2.5">
            <SearchIcon className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="text-[13px] text-slate-300">What's the onboarding flow for new hires?</span>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-ink-700 p-4">
            <p className="text-[13px] leading-relaxed text-slate-300">
              New hires start with the welcome checklist in <span className="rounded bg-indigo-500/20 px-1 text-[11px] text-indigo-300">onboarding-guide.docx</span>,
              then pick their tools per the IT policy. Designers also complete brand training before joining design review.
            </p>

            <div className="mt-4 space-y-2">
              {[
                { name: "onboarding-guide.docx", meta: "PDF · page 3", accent: "bg-emerald-500/15 text-emerald-400" },
                { name: "design-system-v2.fig", meta: "Figma · page 2", accent: "bg-pink-500/15 text-pink-400" },
                { name: "team-standup-notes.pdf", meta: "PDF · page 1", accent: "bg-sky-500/15 text-sky-400" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-ink-800/80 px-3 py-2.5 transition-colors hover:bg-ink-800">
                  <FileGlyph className="h-4 w-4 text-slate-500" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-200">{s.name}</p>
                    <p className="text-[10px] text-slate-500">{s.meta}</p>
                  </div>
                  <span className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${s.accent}`}>
                    <CheckIcon className="h-3 w-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── How it works ───────────────────────────────────────────── */

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionKicker>How it works</SectionKicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Live in three steps
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-lg text-slate-400">From scattered tools to a connected knowledge base in an afternoon.</p>
          </Reveal>
        </div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={i * 120}>
                <div className="relative">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-ink-700 text-indigo-300 shadow-lg shadow-black/30">
                    <Icon className="h-5 w-5" />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold tracking-tight text-slate-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.copy}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ───────────────────────────────────────────── */

function Testimonials() {
  return (
    <section className="border-t border-white/[0.05] bg-ink-900/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionKicker>Loved by teams</SectionKicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Teams find answers in seconds, not meetings
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-ink-700 p-6 transition-all duration-300 hover:border-indigo-500/25 hover:bg-ink-600">
                <QuoteIcon className="h-7 w-7 text-indigo-400/60" />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-300">"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white`}>
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────────────── */

function Pricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      tagline: "For individuals getting organized",
      price: "$0",
      period: "forever",
      cta: "Start for free",
      features: PLAN_FEATURES.starter,
      popular: false,
    },
    {
      name: "Team",
      tagline: "For teams that need answers fast",
      price: annual ? "$9" : "$12",
      period: "/ user / month",
      cta: "Start 14-day trial",
      note: annual ? "billed annually" : "billed monthly",
      features: PLAN_FEATURES.team,
      popular: true,
    },
    {
      name: "Enterprise",
      tagline: "For security-conscious organizations",
      price: "Custom",
      period: "",
      cta: "Talk to sales",
      features: PLAN_FEATURES.enterprise,
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="scroll-mt-28 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionKicker>Pricing</SectionKicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Simple pricing that scales with you
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-lg text-slate-400">Start free. Upgrade when your team grows.</p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 inline-flex items-center rounded-xl border border-white/[0.08] bg-ink-700 p-1">
              <button
                onClick={() => setAnnual(false)}
                aria-pressed={!annual}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${!annual ? "bg-white/[0.08] text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                aria-pressed={annual}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${annual ? "bg-white/[0.08] text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                Annual
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Save 25%</span>
              </button>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 90} className="h-full">
              <PricingCard plan={plan} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan }) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl p-7 transition-all duration-300 ${
        plan.popular
          ? "border border-indigo-500/40 bg-ink-600 shadow-2xl shadow-indigo-950/40 lg:-my-3 lg:py-10"
          : "border border-white/[0.07] bg-ink-700 hover:border-white/[0.14]"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/30">
          Most popular
        </span>
      )}
      <h3 className="font-display text-lg font-bold text-slate-100">{plan.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-extrabold tracking-tight text-slate-100">{plan.price}</span>
        {plan.period && <span className="text-sm text-slate-500">{plan.period}</span>}
      </div>
      {plan.note && <p className="mt-1 text-xs text-slate-500">{plan.note}</p>}
      <ul className="mt-7 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
            <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
              <CheckIcon className="h-2.5 w-2.5 text-indigo-300" />
            </span>
            {f}
          </li>
        ))}
      </ul>
      <a
        href="#/app"
        className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
          plan.popular
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400"
            : "border border-white/[0.1] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
        }`}
      >
        {plan.cta}
      </a>
    </div>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────── */

function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-28 border-t border-white/[0.05] bg-ink-900/40 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <Reveal>
            <SectionKicker>FAQ</SectionKicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Questions, answered
            </h2>
          </Reveal>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 50}>
                <div className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${isOpen ? "border-indigo-500/30 bg-ink-700" : "border-white/[0.07] bg-ink-700/60 hover:border-white/[0.14]"}`}>
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-[15px] font-semibold text-slate-200">{item.q}</span>
                    <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div id={`faq-panel-${i}`} role="region" className={isOpen ? "block" : "hidden"}>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ──────────────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.1] bg-ink-800 px-6 py-16 text-center sm:px-12 sm:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="bg-grid absolute inset-0 opacity-60" />
              <div className="absolute left-1/2 top-0 h-[300px] w-[600px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/25 blur-[100px]" />
              <div className="absolute bottom-0 left-8 h-[200px] w-[200px] rounded-full bg-sky-500/15 blur-[80px]" />
              <div className="absolute bottom-0 right-8 h-[200px] w-[200px] rounded-full bg-violet-500/15 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-100 sm:text-5xl">
                Give your team a brain that never forgets
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
                Connect your tools today and let Cortex turn your knowledge into answers.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#/app"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-ink-900 transition-colors duration-200 hover:bg-slate-200 sm:w-auto"
                >
                  Get started free
                  <ArrowRightIcon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#pricing"
                  className="flex w-full items-center justify-center rounded-xl border border-white/[0.14] px-7 py-3.5 text-base font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/[0.06] sm:w-auto"
                >
                  View pricing
                </a>
              </div>
              <p className="mt-6 text-sm text-slate-500">No credit card required · Set up in under 10 minutes</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */

const FOOTER_COLUMNS = [
  { title: "Product", links: [["Features", "#features"], ["Pricing", "#pricing"], ["Integrations", "#features"], ["Changelog", "#"] ] },
  { title: "Company", links: [["About", "#"], ["Blog", "#"], ["Careers", "#"], ["Press", "#"]] },
  { title: "Resources", links: [["Documentation", "#"], ["Help center", "#"], ["API reference", "#"], ["System status", "#"]] },
  { title: "Legal", links: [["Privacy", "#"], ["Terms", "#"], ["Security", "#"], ["DPA", "#"]] },
];

const SOCIALS = [
  { name: "GitHub", icon: <GitHubIcon className="h-4.5 w-4.5" /> },
  { name: "X", icon: <XSocialIcon className="h-4 w-4" /> },
  { name: "Discord", icon: <DiscordIcon className="h-4.5 w-4.5" /> },
  { name: "Bluesky", icon: <BlueskyIcon className="h-4 w-4" /> },
];

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-ink-900/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <a href="#/" className="flex items-center gap-2.5" aria-label="Cortex home">
              <img src="/logo.svg" alt="" className="h-7 w-7" />
              <span className="font-display text-[17px] font-bold tracking-tight text-slate-100">Cortex</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              The AI-powered knowledge base that connects your tools, organizes your knowledge and makes everything searchable.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-slate-500 transition-colors duration-200 hover:border-white/[0.16] hover:text-slate-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-slate-400 transition-colors hover:text-slate-100">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.05] pt-8 sm:flex-row">
          <p className="text-sm text-slate-600">© {new Date().getFullYear()} Cortex, Inc. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Shared bits ────────────────────────────────────────────── */

function SectionKicker({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/[0.08] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-300">
      {children}
    </span>
  );
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    setShown(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(26px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: shown ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Icons ──────────────────────────────────────────────────── */

function Svg({ children, className, sw = 1.7 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <Svg className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <Svg className={className} sw={1.5}>
      <path d="M12 3l1.9 5.7a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-2a2 2 0 001.3-1.3L12 3z" />
      <path d="M19 3v4M21 5h-4M5 17v3M6.5 18.5h-3" strokeWidth={1.3} />
    </Svg>
  );
}

function SearchIcon({ className }) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

function PlugIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M9 2v6M15 2v6" />
      <path d="M5 8h14v3a7 7 0 01-7 7 7 7 0 01-7-7V8z" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </Svg>
  );
}

function LayersIcon({ className }) {
  return (
    <Svg className={className}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </Svg>
  );
}

function ChatIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </Svg>
  );
}

function UsersIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </Svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </Svg>
  );
}

function FolderIcon({ className }) {
  return (
    <Svg className={className} sw={1.6}>
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" />
    </Svg>
  );
}

function LockIcon({ className }) {
  return (
    <Svg className={className} sw={1.6}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </Svg>
  );
}

function CheckIcon({ className }) {
  return (
    <Svg className={className} sw={2.4}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

function XIcon({ className }) {
  return (
    <Svg className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

function MenuIcon({ className }) {
  return (
    <Svg className={className}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </Svg>
  );
}

function ChevronDownIcon({ className }) {
  return (
    <Svg className={className} sw={1.8}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

function QuoteIcon({ className }) {
  return (
    <Svg className={className} sw={1.4}>
      <path d="M3 21c3-1 5-3 5-6V5H3v10h4c0 3-1.5 4.5-4 6z" />
      <path d="M16 21c3-1 5-3 5-6V5h-5v10h4c0 3-1.5 4.5-4 6z" />
    </Svg>
  );
}

function MiniIcon({ className, type = "home" }) {
  const paths = {
    home: <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />,
    db: <path d="M12 3c4.42 0 8 1.34 8 3s-3.58 3-8 3-8-1.34-8-3 3.58-3 8-3z" />,
    chat: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
    bars: <path d="M3 12h18M3 6h18M3 18h18" />,
  };
  return <Svg className={className} sw={1.5}>{paths[type]}</Svg>;
}

function FileGlyph({ className }) {
  return (
    <Svg className={className} sw={1.6}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </Svg>
  );
}

function GitHubIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.21.67.8.55A11.51 11.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function XSocialIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DiscordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.369A19.79 19.79 0 0016.367 2.9a15.8 15.8 0 00-.74 1.516 18.28 18.28 0 00-5.254 0 15.8 15.8 0 00-.746-1.516 19.73 19.73 0 00-3.954 1.47C1.73 8.895 1.004 13.3 1.367 17.65a19.83 19.83 0 003.314 1.676 13.7 13.7 0 001.57-2.56 12.7 12.7 0 01-2.47-1.19c.21-.153.415-.313.612-.477a14.06 14.06 0 0011.221 0c.197.164.402.324.612.477a12.7 12.7 0 01-2.473 1.19 13.7 13.7 0 001.57 2.56 19.76 19.76 0 003.313-1.676c.43-5.03-.734-9.4-3.075-13.281zM8.02 14.92c-.992 0-1.81-.907-1.81-2.021 0-1.114.794-2.02 1.81-2.02 1.012 0 1.834.912 1.81 2.02 0 1.114-.797 2.021-1.81 2.021zm7.96 0c-.992 0-1.81-.907-1.81-2.021 0-1.114.797-2.02 1.81-2.02 1.012 0 1.834.912 1.81 2.02 0 1.114-.798 2.021-1.81 2.021z" />
    </svg>
  );
}

function BlueskyIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 10.854c-1.7-3.36-4.52-5.997-6.742-6.667-2.042-.615-3.258.134-3.258 1.443 0 .42.256 3.512.504 4.64.627 2.874 2.92 3.712 5.6 3.437-3.885.577-4.63 2.66-2.593 3.814 1.894 1.076 3.434.52 4.526-1.237h1.926c1.092 1.757 2.632 2.313 4.526 1.237 2.037-1.154 1.292-3.237-2.593-3.814 2.68.275 4.973-.563 5.6-3.437.248-1.128.504-4.22.504-4.64 0-1.31-1.216-2.058-3.258-1.443-2.221.67-5.042 3.307-6.742 6.667z" />
    </svg>
  );
}
