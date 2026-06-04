import React, { useEffect, useMemo, useState } from "react";

type Milestone = {
  id: number;
  label: string;
  date: string;
};

type Collection = "Family Timeline" | "Wedding & Anniversary" | "New Baby" | "New Home" | "Personal Milestones";

function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return path;
}

export default function App() {
  const path = usePath();

  if (path === "/create") {
    return <CreatorPage />;
  }

  return <HomePage />;
}

function Header() {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigateTo("/") }>
        <span className="brand-mark">M</span>
        <span>
          <strong>Milestone</strong>
          <em>Art Studio</em>
        </span>
      </button>

      <nav className="nav-links">
        <button onClick={() => navigateTo("/")}>Home</button>
        <a href="/#collections">Collections</a>
        <a href="/#how">How It Works</a>
        <button className="nav-pill" onClick={() => navigateTo("/create")}>Start Creating</button>
      </nav>
    </header>
  );
}

function HomePage() {
  const heroImageUrl =
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=90";

  return (
    <div className="page">
      <Styles />
      <Header />

      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <p className="kicker">Custom milestone artwork</p>
            <h1>Turn life’s biggest numbers into <span>timeless wall art.</span></h1>
            <p>
              Create custom artwork from the dates, names, places, and milestones that shaped your family,
              relationship, home, or next big chapter.
            </p>

            <div className="button-row">
              <button className="primary-button" onClick={() => navigateTo("/create")}>Create Your Artwork</button>
              <a className="secondary-button" href="#collections">View Collections</a>
            </div>

            <div className="trust-strip">
              <span>Personalized preview</span>
              <span>Maple frame option</span>
              <span>Made to order</span>
            </div>
          </div>

          <div className="hero-image-shell">
            <img src={heroImageUrl} alt="Framed artwork in a living room" />
            <div className="image-note">
              <strong>Your story, numbered.</strong>
              <span>Dates transformed into clean gallery-style artwork.</span>
            </div>
          </div>
        </section>

        <section className="section" id="collections">
          <div className="section-heading">
            <p className="kicker">Collections</p>
            <h2>Choose the story you want to tell.</h2>
            <p>Start with a guided collection. Each one asks for different details so the experience feels clear instead of generic.</p>
          </div>

          <div className="collection-grid">
            {[
              ["Family Timeline", "Birthdays, anniversaries, homes, moves, and meaningful family moments."],
              ["Wedding & Anniversary", "A couple’s story told through the dates that shaped the relationship."],
              ["New Baby", "Birth date, time, weight, length, and first little details for nursery art."],
            ].map(([title, text]) => (
              <button key={title} className="collection-card" onClick={() => navigateTo("/create")}>
                <span>{title}</span>
                <p>{text}</p>
                <strong>Start this collection</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="section soft-section" id="how">
          <div className="section-heading">
            <p className="kicker">How it works</p>
            <h2>A simple studio flow.</h2>
          </div>

          <div className="steps-grid">
            <div><b>1</b><h3>Pick a collection</h3><p>Choose the type of milestone artwork you want to create.</p></div>
            <div><b>2</b><h3>Add dates</h3><p>Enter names, dates, milestones, and meaningful details.</p></div>
            <div><b>3</b><h3>Preview</h3><p>See a live art preview update as you build.</p></div>
            <div><b>4</b><h3>Order</h3><p>Choose size, frame, and finish before checkout.</p></div>
          </div>
        </section>

        <section className="section final-cta">
          <p className="kicker">Start creating</p>
          <h2>Your dates already mean something. Make them visible.</h2>
          <button className="primary-button" onClick={() => navigateTo("/create")}>Open the Artwork Builder</button>
        </section>
      </main>
    </div>
  );
}

function CreatorPage() {
  const [collection, setCollection] = useState<Collection>("Family Timeline");
  const [title, setTitle] = useState("The Applin Family");
  const [subtitle, setSubtitle] = useState("Our story in dates");
  const [primaryDate, setPrimaryDate] = useState("2010-06-12");
  const [palette, setPalette] = useState("Warm Neutral");
  const [size, setSize] = useState("16 x 16");
  const [finish, setFinish] = useState("Floating Maple Frame");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, label: "Wedding Day", date: "2010-06-12" },
    { id: 2, label: "First Home", date: "2014-09-18" },
    { id: 3, label: "Lucas Born", date: "2012-03-22" },
  ]);

  const collectionHelp = getCollectionHelp(collection);

  const encodedNumber = useMemo(() => {
    const raw = [primaryDate, ...milestones.map((m) => m.date)].join("").replace(/\D/g, "");
    return raw.length ? raw.slice(0, 12) : "000000000000";
  }, [primaryDate, milestones]);

  const completedMilestones = milestones.filter((item) => item.label || item.date);

  function updateMilestone(id: number, field: keyof Milestone, value: string) {
    setMilestones((items) => items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function addMilestone() {
    setMilestones((items) => [...items, { id: Date.now(), label: "", date: "" }]);
  }

  function removeMilestone(id: number) {
    setMilestones((items) => items.filter((item) => item.id !== id));
  }

  function handleCollectionChange(value: Collection) {
    setCollection(value);

    if (value === "Wedding & Anniversary") {
      setTitle("Thomas & Leah");
      setSubtitle("The dates that built us");
      setMilestones([
        { id: 1, label: "First Date", date: "" },
        { id: 2, label: "Wedding Day", date: primaryDate },
        { id: 3, label: "First Home", date: "" },
      ]);
    }

    if (value === "New Baby") {
      setTitle("Lucas");
      setSubtitle("A first chapter");
      setMilestones([
        { id: 1, label: "Birth Date", date: primaryDate },
        { id: 2, label: "Birth Time", date: "" },
        { id: 3, label: "Homecoming", date: "" },
      ]);
    }

    if (value === "Family Timeline") {
      setTitle("The Applin Family");
      setSubtitle("Our story in dates");
      setMilestones([
        { id: 1, label: "Wedding Day", date: "2010-06-12" },
        { id: 2, label: "First Home", date: "2014-09-18" },
        { id: 3, label: "Lucas Born", date: "2012-03-22" },
      ]);
    }
  }

  return (
    <div className="page creator-page">
      <Styles />
      <Header />

      <main className="creator-main">
        <section className="creator-intro">
          <button className="back-link" onClick={() => navigateTo("/")}>← Back to homepage</button>
          <p className="kicker">Artwork builder</p>
          <h1>Create a piece from the dates that matter.</h1>
          <p>
            This guided builder collects the story details first, then turns them into a clean preview.
            The goal is simple: make it obvious what the customer should enter and why it matters.
          </p>
        </section>

        <section className="builder-layout">
          <div className="builder-left">
            <div className="builder-progress">
              <span className="active">1 Story</span>
              <span>2 Dates</span>
              <span>3 Style</span>
              <span>4 Preview</span>
            </div>

            <section className="builder-card">
              <div className="card-title">
                <span>1</span>
                <div>
                  <h2>Choose your artwork story</h2>
                  <p>Pick the collection that best matches the gift or moment.</p>
                </div>
              </div>

              <div className="choice-grid">
                {(["Family Timeline", "Wedding & Anniversary", "New Baby", "New Home", "Personal Milestones"] as Collection[]).map((item) => (
                  <button
                    key={item}
                    className={collection === item ? "choice-card selected" : "choice-card"}
                    onClick={() => handleCollectionChange(item)}
                  >
                    <strong>{item}</strong>
                    <small>{getShortCollectionText(item)}</small>
                  </button>
                ))}
              </div>

              <div className="help-note">
                <strong>{collection}</strong>
                <span>{collectionHelp}</span>
              </div>
            </section>

            <section className="builder-card">
              <div className="card-title">
                <span>2</span>
                <div>
                  <h2>Name the piece</h2>
                  <p>This appears on the artwork preview.</p>
                </div>
              </div>

              <div className="two-column">
                <label>
                  Artwork title
                  <input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>

                <label>
                  Subtitle
                  <input value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
                </label>
              </div>

              <label>
                Anchor date
                <input type="date" value={primaryDate} onChange={(event) => setPrimaryDate(event.target.value)} />
              </label>
            </section>

            <section className="builder-card">
              <div className="card-title card-title-row">
                <div className="card-title-left">
                  <span>3</span>
                  <div>
                    <h2>Add milestone dates</h2>
                    <p>Use plain labels customers understand. They can add more if needed.</p>
                  </div>
                </div>
                <button className="mini-button" onClick={addMilestone}>Add milestone</button>
              </div>

              <div className="milestone-stack">
                {milestones.map((milestone, index) => (
                  <div className="milestone-editor" key={milestone.id}>
                    <div className="milestone-badge">{index + 1}</div>

                    <label>
                      Milestone label
                      <input
                        value={milestone.label}
                        onChange={(event) => updateMilestone(milestone.id, "label", event.target.value)}
                        placeholder="Wedding Day"
                      />
                    </label>

                    <label>
                      Date
                      <input
                        type="date"
                        value={milestone.date}
                        onChange={(event) => updateMilestone(milestone.id, "date", event.target.value)}
                      />
                    </label>

                    {milestones.length > 1 && (
                      <button className="text-button" onClick={() => removeMilestone(milestone.id)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="builder-card">
              <div className="card-title">
                <span>4</span>
                <div>
                  <h2>Choose finish and style</h2>
                  <p>This helps the customer understand what they are buying.</p>
                </div>
              </div>

              <div className="three-column">
                <label>
                  Color palette
                  <select value={palette} onChange={(event) => setPalette(event.target.value)}>
                    <option>Warm Neutral</option>
                    <option>Classic Black & Cream</option>
                    <option>Sage & Sand</option>
                    <option>Soft Blue</option>
                    <option>Rose Clay</option>
                  </select>
                </label>

                <label>
                  Size
                  <select value={size} onChange={(event) => setSize(event.target.value)}>
                    <option>8 x 8</option>
                    <option>10 x 10</option>
                    <option>12 x 12</option>
                    <option>16 x 16</option>
                    <option>20 x 20</option>
                    <option>30 x 30</option>
                  </select>
                </label>

                <label>
                  Finish
                  <select value={finish} onChange={(event) => setFinish(event.target.value)}>
                    <option>Floating Maple Frame</option>
                    <option>Fine Art Print Only</option>
                    <option>Shadow Box Frame</option>
                    <option>Digital Proof Only</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="next-card">
              <div>
                <h2>Next: connect checkout</h2>
                <p>
                  This button is ready visually, but we should connect it to Stripe only after the preview and product choices are finalized.
                </p>
              </div>
              <button className="primary-button" type="button">Continue to Order</button>
            </section>
          </div>

          <aside className="preview-column">
            <div className="preview-card">
              <div className="preview-heading">
                <p className="kicker">Live preview</p>
                <span>{size} · {finish}</span>
              </div>

              <div className={`art-board palette-${palette.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`}>
                <div className="art-meta">
                  <span>{collection}</span>
                  <span>{palette}</span>
                </div>

                <div className="geometry-wrap">
                  <div className="ring ring-a" />
                  <div className="ring ring-b" />
                  <div className="ring ring-c" />
                  <div className="ring ring-d" />
                  <div className="number-core">{formatNumber(encodedNumber)}</div>
                </div>

                <div className="art-title">
                  <h3>{title || "Your Artwork Title"}</h3>
                  <p>{subtitle || "A story in dates"}</p>
                </div>

                <div className="art-dates">
                  <div>
                    <strong>Anchor date</strong>
                    <span>{primaryDate || "Add a date"}</span>
                  </div>

                  {completedMilestones.slice(0, 5).map((milestone) => (
                    <div key={milestone.id}>
                      <strong>{milestone.label || "Milestone"}</strong>
                      <span>{milestone.date || "Add a date"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="preview-explainer">
                <h3>What the customer sees</h3>
                <p>
                  A clear proof of the story, palette, size, and frame choice. Later, the geometry can become more advanced and truly date-generated.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function getCollectionHelp(collection: Collection) {
  const help: Record<Collection, string> = {
    "Family Timeline": "Best for birthdays, anniversaries, homes, children, moves, and shared family chapters.",
    "Wedding & Anniversary": "Best for couples, wedding gifts, anniversaries, proposals, first homes, and relationship milestones.",
    "New Baby": "Best for birth date, time, weight, length, birthplace, parents, and nursery keepsakes.",
    "New Home": "Best for move-in dates, addresses, renovation milestones, and housewarming gifts.",
    "Personal Milestones": "Best for graduations, recovery stories, career moments, travel, and personal achievements.",
  };

  return help[collection];
}

function getShortCollectionText(collection: Collection) {
  const text: Record<Collection, string> = {
    "Family Timeline": "Family dates and milestones",
    "Wedding & Anniversary": "Couple story and anniversary",
    "New Baby": "Birth details and first chapter",
    "New Home": "Address and move-in story",
    "Personal Milestones": "A personal life timeline",
  };

  return text[collection];
}

function formatNumber(value: string) {
  const padded = value.padEnd(12, "0");
  return `${padded.slice(0, 4)} · ${padded.slice(4, 8)} · ${padded.slice(8, 12)}`;
}

function Styles() {
  return (
    <style>{`
      :root {
        --cream: #f7f1e8;
        --cream-2: #fffaf2;
        --ink: #1f1a17;
        --muted: #70645c;
        --maple: #b88957;
        --maple-dark: #8f6238;
        --white: #ffffff;
        --line: rgba(31, 26, 23, 0.1);
        --shadow: 0 24px 70px rgba(31, 26, 23, 0.14);
      }

      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; background: var(--cream); color: var(--ink); }
      button, input, select { font: inherit; }
      button { border: 0; }

      .page {
        min-height: 100vh;
        overflow-x: hidden;
        background: radial-gradient(circle at 10% 0%, rgba(184, 137, 87, 0.16), transparent 32%), var(--cream);
      }

      .site-header {
        position: fixed;
        z-index: 100;
        top: 0;
        left: 0;
        width: 100%;
        padding: 20px 7%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        background: rgba(247, 241, 232, 0.88);
        backdrop-filter: blur(18px);
        border-bottom: 1px solid rgba(31, 26, 23, 0.06);
      }

      .brand { display: inline-flex; align-items: center; gap: 12px; background: transparent; color: var(--ink); cursor: pointer; padding: 0; text-align: left; }
      .brand-mark { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; background: var(--ink); color: var(--cream); font-weight: 900; }
      .brand strong { display: block; font-size: 18px; letter-spacing: -0.04em; line-height: 1; }
      .brand em { display: block; font-size: 12px; color: var(--muted); font-style: normal; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 3px; }

      .nav-links { display: flex; align-items: center; gap: 26px; }
      .nav-links a, .nav-links button { color: var(--muted); text-decoration: none; background: transparent; cursor: pointer; font-weight: 800; }
      .nav-links .nav-pill { min-height: 44px; padding: 0 20px; border-radius: 999px; background: var(--ink); color: white; box-shadow: 0 14px 32px rgba(31, 26, 23, 0.16); }

      .home-hero { min-height: 100vh; display: grid; grid-template-columns: 0.95fr 1.05fr; gap: 54px; align-items: center; padding: 150px 7% 90px; }
      .hero-copy { max-width: 680px; }
      .kicker { margin: 0 0 16px; color: var(--maple-dark); font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.14em; }
      .hero-copy h1, .creator-intro h1, .section-heading h2, .final-cta h2 { margin: 0; font-size: clamp(44px, 6vw, 86px); line-height: 0.94; letter-spacing: -0.075em; }
      .hero-copy h1 span { color: var(--maple-dark); }
      .hero-copy p, .creator-intro p, .section-heading p { color: var(--muted); font-size: 19px; line-height: 1.65; }
      .button-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 34px; }
      .primary-button, .secondary-button { min-height: 56px; padding: 0 30px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; text-decoration: none; cursor: pointer; }
      .primary-button { background: var(--ink); color: white; box-shadow: 0 18px 44px rgba(31, 26, 23, 0.18); }
      .secondary-button { background: rgba(255, 255, 255, 0.74); color: var(--ink); border: 1px solid var(--line); }
      .trust-strip { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 28px; color: var(--muted); font-weight: 800; }
      .trust-strip span::before { content: "•"; color: var(--maple-dark); margin-right: 8px; }

      .hero-image-shell { position: relative; border-radius: 34px; overflow: hidden; box-shadow: var(--shadow); background: #eee1d0; }
      .hero-image-shell img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; filter: contrast(1.05) saturate(1.03); }
      .image-note { position: absolute; left: 24px; bottom: 24px; width: min(260px, calc(100% - 48px)); padding: 18px; border-radius: 20px; background: rgba(255, 255, 255, 0.86); backdrop-filter: blur(14px); box-shadow: 0 16px 40px rgba(31, 26, 23, 0.14); }
      .image-note strong, .image-note span { display: block; }
      .image-note span { margin-top: 6px; color: var(--muted); font-size: 13px; line-height: 1.45; }

      .section { padding: 96px 7%; }
      .soft-section { background: rgba(255, 250, 242, 0.72); }
      .section-heading { max-width: 760px; margin-bottom: 42px; }
      .section-heading h2, .final-cta h2 { font-size: clamp(38px, 5vw, 68px); }
      .collection-grid, .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
      .steps-grid { grid-template-columns: repeat(4, 1fr); }
      .collection-card, .steps-grid div { text-align: left; min-height: 230px; border-radius: 28px; border: 1px solid var(--line); background: rgba(255, 255, 255, 0.66); padding: 26px; box-shadow: 0 16px 44px rgba(31, 26, 23, 0.06); }
      .collection-card { cursor: pointer; }
      .collection-card span { display: block; font-size: 24px; font-weight: 900; letter-spacing: -0.04em; }
      .collection-card p, .steps-grid p { color: var(--muted); line-height: 1.6; }
      .collection-card strong { color: var(--maple-dark); }
      .steps-grid b { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; background: var(--ink); color: white; }
      .steps-grid h3 { margin-bottom: 8px; font-size: 21px; }
      .final-cta { text-align: center; }
      .final-cta .primary-button { margin-top: 28px; }

      .creator-main { padding: 136px 7% 90px; }
      .creator-intro { max-width: 920px; margin-bottom: 38px; }
      .back-link { margin-bottom: 28px; background: transparent; color: var(--maple-dark); font-weight: 900; cursor: pointer; }
      .creator-intro h1 { max-width: 900px; }
      .builder-layout { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(390px, 0.95fr); gap: 28px; align-items: start; }
      .builder-left { display: grid; gap: 20px; }
      .builder-progress { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .builder-progress span { padding: 12px; border-radius: 999px; background: rgba(255, 255, 255, 0.55); border: 1px solid var(--line); text-align: center; color: var(--muted); font-size: 13px; font-weight: 900; }
      .builder-progress .active { background: var(--ink); color: white; }
      .builder-card, .next-card, .preview-card { border-radius: 30px; border: 1px solid var(--line); background: rgba(255, 255, 255, 0.74); box-shadow: 0 18px 50px rgba(31, 26, 23, 0.08); }
      .builder-card { padding: 26px; }
      .card-title { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 22px; }
      .card-title-row { justify-content: space-between; }
      .card-title-left { display: flex; gap: 16px; }
      .card-title span, .card-title-left span { flex: 0 0 auto; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 50%; background: var(--ink); color: white; font-weight: 900; }
      .card-title h2, .card-title-left h2, .next-card h2 { margin: 0 0 5px; font-size: 25px; letter-spacing: -0.045em; }
      .card-title p, .card-title-left p, .next-card p { margin: 0; color: var(--muted); line-height: 1.55; }
      .choice-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .choice-card { text-align: left; padding: 16px; border-radius: 20px; border: 1px solid var(--line); background: rgba(247, 241, 232, 0.72); color: var(--ink); cursor: pointer; }
      .choice-card.selected { border-color: rgba(143, 98, 56, 0.55); background: rgba(184, 137, 87, 0.16); box-shadow: inset 0 0 0 1px rgba(143, 98, 56, 0.18); }
      .choice-card strong { display: block; margin-bottom: 6px; }
      .choice-card small { color: var(--muted); line-height: 1.4; }
      .help-note { display: grid; gap: 4px; margin-top: 16px; padding: 16px; border-radius: 18px; background: rgba(31, 26, 23, 0.06); }
      .help-note span { color: var(--muted); line-height: 1.5; }

      label { display: grid; gap: 8px; margin-bottom: 16px; color: var(--muted); font-size: 14px; font-weight: 900; }
      input, select { width: 100%; min-height: 50px; border-radius: 15px; border: 1px solid rgba(31, 26, 23, 0.14); background: rgba(255, 255, 255, 0.9); color: var(--ink); padding: 0 14px; outline: none; }
      input:focus, select:focus { border-color: var(--maple-dark); box-shadow: 0 0 0 4px rgba(184, 137, 87, 0.13); }
      .two-column, .three-column { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
      .three-column { grid-template-columns: repeat(3, 1fr); }
      .mini-button { min-height: 40px; padding: 0 16px; border-radius: 999px; background: var(--ink); color: white; font-weight: 900; cursor: pointer; }
      .milestone-stack { display: grid; gap: 12px; }
      .milestone-editor { display: grid; grid-template-columns: 38px 1fr 180px auto; gap: 12px; align-items: end; padding: 14px; border-radius: 20px; background: rgba(247, 241, 232, 0.74); border: 1px solid rgba(31, 26, 23, 0.06); }
      .milestone-editor label { margin: 0; }
      .milestone-badge { width: 36px; height: 36px; border-radius: 50%; background: var(--cream-2); color: var(--maple-dark); display: grid; place-items: center; font-weight: 900; margin-bottom: 7px; }
      .text-button { min-height: 50px; padding: 0 12px; border-radius: 15px; background: rgba(31, 26, 23, 0.08); color: var(--ink); cursor: pointer; font-weight: 900; }
      .next-card { display: flex; justify-content: space-between; gap: 20px; align-items: center; padding: 26px; background: var(--ink); color: white; }
      .next-card p { color: rgba(255, 255, 255, 0.72); }
      .next-card .primary-button { background: white; color: var(--ink); box-shadow: none; }
      .preview-column { position: relative; }
      .preview-card { position: sticky; top: 110px; padding: 22px; }
      .preview-heading { display: flex; justify-content: space-between; gap: 18px; align-items: baseline; margin-bottom: 14px; }
      .preview-heading span { color: var(--muted); font-size: 13px; font-weight: 900; }
      .art-board { min-height: 640px; border-radius: 28px; padding: 32px; border: 12px solid #d0a16e; background: radial-gradient(circle at 50% 28%, rgba(184, 137, 87, 0.16), transparent 37%), #fffaf2; box-shadow: inset 0 0 0 1px rgba(31, 26, 23, 0.08); display: flex; flex-direction: column; }
      .palette-classic-black-and-cream { background: radial-gradient(circle at 50% 28%, rgba(31, 26, 23, 0.10), transparent 37%), #fbf7ef; border-color: #1f1a17; }
      .palette-sage-and-sand { background: radial-gradient(circle at 50% 28%, rgba(113, 132, 99, 0.18), transparent 37%), #f5f1e6; border-color: #9aa27c; }
      .palette-soft-blue { background: radial-gradient(circle at 50% 28%, rgba(100, 132, 160, 0.16), transparent 37%), #f2f5f7; border-color: #9eb4c5; }
      .palette-rose-clay { background: radial-gradient(circle at 50% 28%, rgba(168, 94, 86, 0.15), transparent 37%), #faf1ec; border-color: #be8a7e; }
      .art-meta { display: flex; justify-content: space-between; gap: 12px; color: var(--maple-dark); text-transform: uppercase; letter-spacing: 0.12em; font-size: 11px; font-weight: 900; }
      .geometry-wrap { position: relative; width: 285px; height: 285px; margin: 48px auto 34px; }
      .ring { position: absolute; inset: 0; border: 1px solid rgba(31, 26, 23, 0.25); border-radius: 49% 51% 44% 56%; }
      .ring-a { transform: rotate(11deg); }
      .ring-b { transform: rotate(62deg) scale(0.84); }
      .ring-c { transform: rotate(119deg) scale(0.66); }
      .ring-d { transform: rotate(160deg) scale(0.48); }
      .number-core { position: absolute; inset: 50%; transform: translate(-50%, -50%); width: 132px; height: 132px; border-radius: 50%; display: grid; place-items: center; padding: 18px; text-align: center; background: var(--ink); color: var(--cream); font-size: 15px; line-height: 1.3; letter-spacing: 0.06em; font-weight: 900; }
      .art-title { text-align: center; }
      .art-title h3 { margin: 0; font-size: 34px; line-height: 1; letter-spacing: -0.055em; }
      .art-title p { margin: 8px 0 0; color: var(--muted); }
      .art-dates { margin-top: auto; display: grid; gap: 8px; }
      .art-dates div { display: flex; justify-content: space-between; gap: 14px; padding: 10px 0; border-bottom: 1px solid rgba(31, 26, 23, 0.08); font-size: 14px; }
      .art-dates strong { color: var(--ink); }
      .art-dates span { color: var(--muted); }
      .preview-explainer { padding: 18px 4px 4px; }
      .preview-explainer h3 { margin: 0 0 8px; }
      .preview-explainer p { margin: 0; color: var(--muted); line-height: 1.55; font-size: 14px; }

      @media (max-width: 1050px) {
        .home-hero, .builder-layout { grid-template-columns: 1fr; }
        .hero-copy { max-width: 780px; }
        .collection-grid, .steps-grid { grid-template-columns: repeat(2, 1fr); }
        .preview-card { position: static; }
      }

      @media (max-width: 760px) {
        .site-header { padding: 16px 5%; }
        .nav-links { display: none; }
        .home-hero, .creator-main { padding: 118px 5% 68px; }
        .hero-copy h1, .creator-intro h1 { font-size: clamp(42px, 13vw, 64px); }
        .button-row, .next-card { flex-direction: column; align-items: stretch; }
        .primary-button, .secondary-button { width: 100%; }
        .section { padding: 74px 5%; }
        .collection-grid, .steps-grid, .choice-grid, .two-column, .three-column, .builder-progress { grid-template-columns: 1fr; }
        .milestone-editor { grid-template-columns: 38px 1fr; }
        .milestone-editor label, .milestone-editor .text-button { grid-column: 2; }
        .art-board { min-height: 560px; padding: 22px; }
        .geometry-wrap { width: 230px; height: 230px; }
      }
    `}</style>
  );
}
