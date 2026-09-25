import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { TRUST_STATS } from "@/lib/constants";

const HERO_IMG =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80";

const STEPS = [
  {
    n: "01",
    title: "Tell us what you want to build",
    body: "Share your locality, plot details, budget, and timeline.",
  },
  {
    n: "02",
    title: "Discover relevant builders",
    body: "See construction companies matched to your project.",
  },
  {
    n: "03",
    title: "Receive and compare quotations",
    body: "Review proposals side by side — cost, rate, and timeline.",
  },
  {
    n: "04",
    title: "Choose the builder that's right for you",
    body: "Shortlist and select with clarity, not guesswork.",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-[#f7f6f3]">
      <SiteHeader />

      <section className="relative min-h-[100dvh] overflow-hidden">
        <Image
          src={HERO_IMG}
          alt="Modern residential home exterior"
          fill
          priority
          className="object-cover object-[70%_center] sm:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/55 to-ink-900/30 md:bg-gradient-to-r md:from-ink-900/80 md:via-ink-900/55 md:to-ink-900/25" />
        <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-end page-pad pb-[max(4rem,env(safe-area-inset-bottom))] pt-24 sm:pt-28 md:justify-center md:pb-24">
          <p className="animate-fade-up font-display text-xs tracking-[0.2em] text-brand-200 uppercase sm:text-sm">
            BuilderOne
          </p>
          <h1 className="animate-fade-up heading-hero mt-3 max-w-2xl font-display text-white">
            Build your home.
            <br />
            Choose the right builder.
          </h1>
          <p className="animate-fade-up-delay mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base md:text-lg">
            BuilderOne connects homeowners with construction companies across
            Bengaluru so you can discover builders, compare proposals, and make
            a more informed decision.
          </p>
          <div className="animate-fade-up-delay mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:max-w-md sm:flex-row md:max-w-none">
            <Link href="/get-started?role=customer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                I want to build a home
              </Button>
            </Link>
            <Link href="/get-started?role=builder" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:w-auto"
              >
                I&apos;m a builder
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/55 sm:mt-6">
            Build better. Choose smarter.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="page-container page-pad py-16 sm:py-20 md:py-24">
        <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
          How BuilderOne works
        </p>
        <h2 className="heading-section mt-3 max-w-xl font-display text-ink-900">
          From plot to proposal — in four clear steps.
        </h2>
        <div className="mt-10 grid gap-8 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.n} className="group">
              <div className="font-display text-3xl text-brand-200 transition group-hover:text-brand-500 sm:text-4xl">
                {step.n}
              </div>
              <h3 className="mt-3 text-base font-semibold text-ink-900 sm:mt-4 sm:text-lg">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="for-homeowners" className="border-y border-ink-100 bg-white">
        <div className="page-container page-pad grid items-center gap-8 py-16 sm:gap-12 sm:py-20 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
              For homeowners
            </p>
            <h2 className="heading-section mt-3 font-display text-ink-900">
              Find builders who fit your project — not the other way around.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-ink-600 sm:mt-8 sm:text-base">
              {[
                "Find relevant builders for your locality",
                "Compare experience and past projects",
                "View portfolios with real completed homes",
                "Compare quotations side by side",
                "Make an informed decision",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/get-started?role=customer"
              className="mt-8 inline-block w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto">
                Find a builder
              </Button>
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[4/5] sm:rounded-[2rem]">
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80"
              alt="Home interior under construction"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section id="for-builders" className="bg-[#f7f6f3]">
        <div className="page-container page-pad grid items-center gap-8 py-16 sm:gap-12 sm:py-20 md:grid-cols-2 md:py-24">
          <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[4/5] sm:rounded-[2rem] md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=80"
              alt="Construction site architecture plans"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="text-sm font-medium tracking-wide text-brand-600 uppercase">
              For builders
            </p>
            <h2 className="heading-section mt-3 font-display text-ink-900">
              Reach homeowners who are ready to build.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-ink-600 sm:mt-8 sm:text-base">
              {[
                "Create your company profile",
                "Showcase previous projects",
                "Reach relevant customers in your service areas",
                "Discover construction opportunities",
                "Submit quotations with clarity",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/get-started?role=builder"
              className="mt-8 inline-block w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto">
                Join as a builder
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-white">
        <div className="page-container page-pad grid gap-8 py-14 sm:py-20 md:grid-cols-3">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <div className="font-display text-4xl text-ink-900 sm:text-5xl">
                {stat.value}
              </div>
              <p className="mt-2 text-sm text-ink-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container page-pad py-16 sm:py-20 md:py-24">
        <div className="rounded-2xl bg-ink-900 px-5 py-12 text-center text-white sm:rounded-[2rem] sm:px-8 sm:py-16 md:px-16">
          <h2 className="heading-section font-display">
            Ready to start building?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/70 sm:text-base">
            BuilderOne is a marketplace — we connect you with construction
            companies. We don&apos;t build homes ourselves.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/get-started?role=customer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Start your project
              </Button>
            </Link>
            <Link href="/get-started?role=builder" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                Register as a builder
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 bg-white pb-safe">
        <div className="page-container page-pad flex flex-col items-start justify-between gap-4 py-10 text-sm text-ink-500 md:flex-row md:items-center">
          <div>
            <span className="font-display text-lg text-ink-900">BuilderOne</span>
            <p className="mt-1">Build better. Choose smarter.</p>
          </div>
          <p>© {new Date().getFullYear()} BuilderOne. Bengaluru, India.</p>
        </div>
      </footer>
    </div>
  );
}
