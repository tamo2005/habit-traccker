import { habitAssets } from "@/lib/assets";
import { ArrowRight, CalendarClock, Check, Clock3, Upload } from "lucide-react";
import { Link } from "wouter";

const previewTasks = [
  ["Draft client brief", "high", "09:30"],
  ["Walk without headphones", "medium", "12:15"],
  ["Close the week", "low", "17:45"],
] as const;

export default function Landing() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Primary navigation">
        <Link href="/" className="landing-brand" aria-label="Signal / Streak home">
          <img src={habitAssets.logo} alt="" />
          <span>Habit<i>.</i></span>
          <small>signal / streak</small>
        </Link>
        <Link href="/app" className="landing-nav-link">Open workspace <ArrowRight size={15} /></Link>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-kicker">A quieter daily system</p>
          <h1>Make space for<br /><em>what matters next.</em></h1>
          <p className="landing-intro">Signal / Streak pairs the rituals you repeat with a small, time-aware plan for the work you want to protect.</p>
          <div className="landing-actions">
            <Link href="/app" className="landing-primary">Enter your workspace <ArrowRight size={17} /></Link>
            <a href="#how-it-works" className="landing-secondary">See how it works</a>
          </div>
          <p className="landing-note"><span>Private by default</span> — begin on this device, sign in whenever you want to carry your board elsewhere.</p>
        </div>
        <div className="landing-visual" aria-label="Example planned task card">
          <img src={habitAssets.weekIllustration} alt="Abstract paper illustration with an orange signal field" />
          <div className="landing-plan-card">
            <div className="landing-card-top"><span>Today’s plan</span><strong>3 cues</strong></div>
            {previewTasks.map(([task, priority, time], index) => <div className="landing-task-preview" key={task}>
              <span className={`landing-task-index priority-${priority}`}>0{index + 1}</span>
              <span>{task}<small>{priority} priority</small></span>
              <time>{time}</time>
            </div>)}
            <div className="landing-card-foot"><span><Check size={14} /> One clear next move</span><Clock3 size={15} /></div>
          </div>
        </div>
      </section>

      <section className="landing-method" id="how-it-works" aria-labelledby="method-heading">
        <div className="landing-section-heading"><p className="landing-kicker">The practice</p><h2 id="method-heading">A week is more than a list.</h2></div>
        <div className="landing-method-grid">
          <article><span className="landing-step">01</span><Upload size={22} /><h3>Bring a rough plan.</h3><p>Paste the shorthand you already use — <code>task:priority:time</code> — or upload a JSON file when the list is longer.</p></article>
          <article><span className="landing-step">02</span><CalendarClock size={22} /><h3>Give it a place.</h3><p>Review the day as a calm sequence of cues, priorities, and times rather than a pile of tabs.</p></article>
          <article><span className="landing-step">03</span><Clock3 size={22} /><h3>Work, then recover.</h3><p>Use a focused interval, let the clock tell you when to pause, and make a real break part of the plan.</p></article>
        </div>
      </section>

      <section className="landing-closing">
        <p className="landing-kicker">Start where you are</p>
        <h2>Keep the signal<br /><em>moving.</em></h2>
        <Link href="/app" className="landing-primary">Open the board <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}
