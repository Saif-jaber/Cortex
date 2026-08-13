import { useEffect, useLayoutEffect, useRef, useState } from "react";
import SignInModal from "./SignInModal";
import SignUpModal from "./SignUpModal";
import { ArrowRightIcon, GitHubIcon, XIcon } from "./icons";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const FILE_FORMATS = ["PDF", "DOCX", "DOC", "PPTX", "PPT"];

const STATS = [
  { value: "5", label: "file formats supported" },
  { value: "100%", label: "private, local AI" },
  { value: "∞", label: "questions on your documents" },
  { value: "$0", label: "subscriptions or AI fees" },
];

const STEPS = [
  {
    icon: UploadIcon,
    title: "Upload your documents",
    copy: "Drag in PDFs, Word docs and PowerPoint decks. They're stored in your private workspace, ready to search.",
  },
  {
    icon: LayersIcon,
    title: "Cortex reads & indexes",
    copy: "Text is extracted and embedded into a semantic index, so related ideas are found even when you don't use the exact wording.",
  },
  {
    icon: SparklesIcon,
    title: "Ask anything, with receipts",
    copy: "Ask in plain language. Answers are grounded in your files and cite the exact source document, so you can verify anything in seconds.",
  },
];

const FAQS = [
  {
    q: "What file types does Cortex support?",
    a: "PDF, Word (DOCX) and PowerPoint (PPTX) files. You upload them, Cortex stores them, and the AI can read their content. Legacy .doc and .ppt files can be stored but aren't readable by the AI yet.",
  },
  {
    q: "How does Cortex AI actually answer questions?",
    a: "Each uploaded file is read, split into chunks and embedded into a semantic index. When you ask a question, Cortex finds the most relevant chunks, then generates an answer grounded only in those sources, with citations back to the exact file it came from.",
  },
  {
    q: "Where does the AI run?",
    a: "On your own machine. Cortex uses Ollama with local models, so your documents are never sent to a third-party AI service to be processed.",
  },
  {
    q: "Is my data private?",
    a: "The AI never sees outside your machine; no external model APIs are used. Your files live in your own cloud storage, and each account's library is scoped to that account alone.",
  },
  {
    q: "Do I need my own hardware?",
    a: "Yes. Because the AI runs locally, you need a machine capable of running Ollama models (an embedding model plus a chat model). A decent GPU helps with larger models, but CPU-only setups work fine for smaller ones.",
  },
  {
    q: "Is Cortex free?",
    a: "The application is free to self-host. You only pay for what you already use: your own cloud object storage and the electricity it takes to run your local models.",
  },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const openSignIn = () => setShowSignIn(true);
  const openSignUp = () => setShowSignUp(true);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#0a0e1a] font-sans text-slate-300 antialiased">
      <ScrollToTopButton visible={showScrollTop} />
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} onSignIn={openSignIn} onSignUp={openSignUp} />
      <Hero onSignUp={openSignUp} />
      <LogoCloud />
      <StatsBand />
      <Features />
      <ProductShowcase onSignUp={openSignUp} />
      <HowItWorks />
      <Pricing onSignUp={openSignUp} />
      <Faq />
      <FinalCta onSignUp={openSignUp} />
      <Footer />
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
        />
      )}
      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
        />
      )}
    </div>
  );
}

/* ─── Navigation ─────────────────────────────────────────────── */

function Nav({ menuOpen, setMenuOpen, onSignIn, onSignUp }) {
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
          <button
            type="button"
            onClick={onSignIn}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-slate-100"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={onSignUp}
            className="group flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-400 hover:shadow-indigo-500/40"
          >
            Get started
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
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
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSignIn();
                }}
                className="rounded-xl border border-white/[0.1] px-4 py-3 text-center text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSignUp();
                }}
                className="rounded-xl bg-indigo-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
              >
                Get started free
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Scroll to top ──────────────────────────────────────────── */

function ScrollToTopButton({ visible }) {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-ink-700/90 text-slate-200 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 hover:bg-ink-600 hover:text-white ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" />
    </button>
  );
}

/* ─── Hero ───────────────────────────────────────────────────── */

function Hero({ onSignUp }) {
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
              Cortex AI answers from your own files
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-100 sm:text-6xl lg:text-7xl">
              Your documents hold the answers.
              <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                Now they answer back.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              Cortex stores your PDFs, Word docs and slides, then answers your questions in plain language, grounded in your files and
              cited, powered by a private AI that runs on your machine.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onSignUp}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all duration-200 hover:bg-indigo-400 hover:shadow-indigo-500/45 sm:w-auto"
              >
                Launch the app
                <ArrowRightIcon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
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
              Free to self-host · Your data stays yours · No AI subscription
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
            cortex.local / my-library
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
                All Folders
                <ChevronDownIcon className="h-3 w-3 text-slate-600" />
              </div>
              <div className="ml-auto hidden items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-500 md:flex">
                <SearchIcon className="h-3 w-3" />
                <span>Search files…</span>
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
                  The Q3 launch plan is driven by the <span className="rounded bg-indigo-500/20 px-1 text-indigo-300">design-notes.docx</span>{" "}
                  spec and the roadmap in <span className="rounded bg-indigo-500/20 px-1 text-indigo-300">product-spec.pdf</span>. Marketing
                  starts Aug 15, engineering ships on Sept 2.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["q3-report.docx", "product-spec.pdf", "launch-plan.pptx"].map((f) => (
                    <span key={f} className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">
                      <FileGlyph className="h-3 w-3" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:col-span-2 lg:grid-cols-1">
                {[
                  { name: "General", meta: "3 files", tone: "from-emerald-500/15" },
                  { name: "Design", meta: "7 files", tone: "from-amber-500/15" },
                  { name: "Reports", meta: "15 files", tone: "from-sky-500/15" },
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
          <p className="text-xs font-semibold text-slate-200">Cited from 3 files</p>
          <p className="text-[10px] text-slate-500">question → product-spec.pdf</p>
        </div>
      </div>

      <div className="absolute -right-6 bottom-24 z-10 hidden items-center gap-2.5 rounded-xl border border-white/[0.1] bg-ink-600/90 px-3.5 py-2.5 shadow-xl shadow-black/40 backdrop-blur-md animate-float-slower xl:flex">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15">
          <UploadIcon className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">Private local AI</p>
          <p className="text-[10px] text-slate-500">Ollama · on your machine</p>
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
            Reads the formats you already use
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
            {FILE_FORMATS.map((name) => (
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
              Ask your files. Get receipts.
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-lg text-slate-400">
              A private library that reads every document you upload and answers questions with the source attached.
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
    title: "AI chat grounded in your files",
    copy: "Ask anything in plain language. Answers come from your documents, not the open web, and they cite the exact source.",
    span: "lg:col-span-2",
    visual: <SearchVisual />,
  },
  {
    icon: UploadIcon,
    title: "Upload once, access anywhere",
    copy: "PDF, Word and PowerPoint files store straight into your private cloud space. No exports, no cleanup.",
    span: "lg:col-span-1",
    visual: <UploadVisual />,
  },
  {
    icon: LayersIcon,
    title: "Organized your way",
    copy: "Sort files into folders and filter with one click. No tags to maintain, no hierarchies to babysit.",
    span: "lg:col-span-1",
    visual: <FoldersVisual />,
  },
  {
    icon: ChatIcon,
    title: "Answers with citations",
    copy: "Every reply links back to the file it came from, so you can verify anything in seconds.",
    span: "lg:col-span-2",
    visual: <ChatVisual />,
  },
  {
    icon: ShieldIcon,
    title: "Private by design",
    copy: "The AI runs locally on your machine with Ollama. Your documents are never sent to a third-party model.",
    span: "lg:col-span-2",
    visual: <SecurityVisual />,
  },
  {
    icon: LockIcon,
    title: "Your own workspace",
    copy: "Each account gets a private library. Files and folders are scoped to you alone.",
    span: "lg:col-span-1",
    visual: <WorkspaceVisual />,
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

function UploadVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {[
        { name: "product-spec.pdf", ext: "PDF" },
        { name: "onboarding-guide.docx", ext: "DOCX" },
        { name: "launch-plan.pptx", ext: "PPTX" },
      ].map((f) => (
        <div key={f.name} className="flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-ink-800/70 px-3 py-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-[8px] font-bold text-slate-400">
            {f.ext}
          </div>
          <span className="truncate text-xs text-slate-300">{f.name}</span>
          <span className="ml-auto text-[10px] text-emerald-400">Stored</span>
        </div>
      ))}
      <p className="text-center text-[11px] text-slate-500">Uploaded to your private library</p>
    </div>
  );
}

function FoldersVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-ink-800/70 p-4">
      {[
        { name: "General", depth: 0, tint: "text-indigo-400", files: "3 files" },
        { name: "Design", depth: 0, tint: "text-pink-400", files: "7 files" },
        { name: "Design / Brand", depth: 1, tint: "text-slate-500", files: "2 files" },
        { name: "Reports", depth: 0, tint: "text-sky-400", files: "15 files" },
      ].map((f) => (
        <div key={f.name} className="flex items-center gap-2" style={{ paddingLeft: f.depth * 16 }}>
          <FolderIcon className={`h-3.5 w-3.5 shrink-0 ${f.tint}`} />
          <span className="truncate text-[11px] text-slate-300">{f.name}</span>
          <span className="ml-auto rounded-full bg-white/[0.05] px-1.5 text-[9px] text-slate-500">{f.files}</span>
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
            Based on the RFP notes and vendor comparison in <span className="text-indigo-300">vendor-eval.docx</span>, Apex and Orbit lead on security and cost.
          </p>
          <p className="mt-1 text-[9px] text-slate-500">Sources: 2 documents</p>
        </div>
      </div>
    </div>
  );
}

function WorkspaceVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 rounded-xl border border-white/[0.06] bg-ink-800/70 p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[10px] font-bold text-white">
          Y
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-200">Your library</p>
          <p className="text-[10px] text-slate-500">Private · just you</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {["You added product-spec.pdf · 2h ago", "You created folder Reports · yesterday"].map((t) => (
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
        ["AI runs locally (Ollama)", true],
        ["No third-party model APIs", true],
        ["Files scoped to your account", true],
        ["Documents sent to a public model", false],
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

function ProductShowcase({ onSignUp }) {
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
              Every answer is generated from your own uploaded files and always points back to the exact document,
              page or slide, so you can trust what you read and verify what you share.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Answers grounded in your uploaded files, never a public model",
                "Inline citations with one-click jump to the source file",
                "Natural-language questions, no syntax, no operators",
                "Semantic retrieval across PDF, Word and PowerPoint files",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                    <CheckIcon className="h-3 w-3 text-indigo-300" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onSignUp}
              className="group mt-9 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-400"
            >
              Open the app
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
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
                { name: "onboarding-guide.docx", meta: "Word · section 1", accent: "bg-emerald-500/15 text-emerald-400" },
                { name: "launch-plan.pptx", meta: "PPTX · slide 2", accent: "bg-pink-500/15 text-pink-400" },
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
            <p className="mt-4 text-lg text-slate-400">From a folder of files to an answerable knowledge base in minutes.</p>
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

/* ─── Pricing ────────────────────────────────────────────────── */

const PRICING_FEATURES = [
  "Free to self-host, no subscriptions",
  "Unlimited questions on your documents",
  "Local AI with Ollama, no API fees",
  "Your own cloud storage, no vendor lock-in",
  "Uploads across PDF, Word and PowerPoint",
];

function Pricing({ onSignUp }) {
  return (
    <section id="pricing" className="scroll-mt-28 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <SectionKicker>Pricing</SectionKicker>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
              Free, because it's yours
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-4 text-lg text-slate-400">
              Cortex is a self-hosted app. You only pay for what you already run: your storage and your machine.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-12 max-w-lg">
          <Reveal>
            <div className="relative flex flex-col rounded-2xl border border-indigo-500/40 bg-ink-600 p-7 shadow-2xl shadow-indigo-950/40 lg:p-9">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-1 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/30">
                Self-hosted
              </span>
              <h3 className="font-display text-lg font-bold text-slate-100">Cortex</h3>
              <p className="mt-1 text-sm text-slate-500">Your documents, your AI, your data.</p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold tracking-tight text-slate-100">$0</span>
                <span className="text-sm text-slate-500">/ forever</span>
              </div>
              <ul className="mt-7 flex-1 space-y-3">
                {PRICING_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15">
                      <CheckIcon className="h-2.5 w-2.5 text-indigo-300" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onSignUp}
                className="mt-8 block w-full rounded-xl bg-indigo-500 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:bg-indigo-400"
              >
                Create your free account
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
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

function FinalCta({ onSignUp }) {
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
                Turn your documents into answers
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
                Upload your files today and let a private, local AI answer anything you ask about them.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onSignUp}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-ink-900 transition-colors duration-200 hover:bg-slate-200 sm:w-auto"
                >
                  Get started free
                  <ArrowRightIcon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                <a
                  href="#how-it-works"
                  className="flex w-full items-center justify-center rounded-xl border border-white/[0.14] px-7 py-3.5 text-base font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/[0.06] sm:w-auto"
                >
                  How it works
                </a>
              </div>
              <p className="mt-6 text-sm text-slate-500">Free to self-host · No AI subscription · Set up in minutes</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────── */

const FOOTER_COLUMNS = [
  { title: "Product", links: [["Features", "#features"], ["Product", "#product"], ["How it works", "#how-it-works"], ["FAQ", "#faq"]] },
  { title: "Resources", links: [["Documentation", "#"], ["Help center", "#"], ["GitHub", "https://github.com/Saif-jaber/Cortex"], ["System status", "#"]] },
  { title: "Legal", links: [["Privacy", "#"], ["Terms", "#"], ["Security", "#"]] },
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
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <a href="#/" className="flex items-center gap-2.5" aria-label="Cortex home">
              <img src="/logo.svg" alt="" className="h-7 w-7" />
              <span className="font-display text-[17px] font-bold tracking-tight text-slate-100">Cortex</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              A private knowledge base that reads your PDFs, Word docs and slides, then answers your questions with a local AI, cited and grounded in your own files.
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

function UploadIcon({ className }) {
  return (
    <Svg className={className}>
      <path d="M4 14.9A7 7 0 1115.7 8h1.8a4.5 4.5 0 010 9H12" />
      <polyline points="16 14 12 10 8 14" />
      <line x1="12" y1="10" x2="12" y2="21" />
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

function ArrowUpIcon({ className }) {
  return (
    <Svg className={className} sw={2}>
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
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
