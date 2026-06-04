import React, { useEffect, useMemo, useState } from "react";

type Collection = "Family Timeline" | "Wedding & Anniversary" | "New Baby" | "New Home" | "Personal Milestones";

type Milestone = {
  id: number;
  label: string;
  date: string;
};

function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function usePath() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const updatePath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", updatePath);
    return () => window.removeEventListener("popstate", updatePath);
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
      <button className="brand-button" onClick={() => navigateTo("/")}>
        <span className="brand-mark">M</span>
        <span className="brand-text">
          <strong>Milestone</strong>
          <em>Art Studio</em>
        </span>
      </button>

      <nav className="desktop-nav">
        <button onClick={() => navigateTo("/")}>Home</button>
        <a href="/#collections">Collections</a>
        <a href="/#how">How It Works</a>
        <button className="nav-cta" onClick={() => navigateTo("/create")}>
          Start Creating
        </button>
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
          <div className="home-copy">
            <p className="eyebrow">Custom milestone artwork</p>
            <h1>
              Turn life’s biggest numbers into <span>timeless wall art.</span>
            </h1>
            <p>
              Create custom artwork from the dates, names, places, and milestones
              that shaped your family, relationship, home, or next big chapter.
            </p>

            <div className="button-row">
              <button className="primary-button" onClick={() => navigateTo("/create")}>
                Create Your Artwork
              </button>
              <a className="secondary-button" href="#collections">
                View Collections
              </a>
            </div>

            <div className="trust-row">
              <span>Personalized preview</span>
              <span>Premium framing</span>
              <span>Made to order</span>
            </div>
          </div>

          <div className="home-image-card">
            <img src={heroImageUrl} alt="Framed art in a living room" />
            <div className="home-image-note">
              <strong>Your story, numbered.</strong>
              <span>Dates transformed into clean gallery-style artwork.</span>
            </div>
          </div>
        </section>

        <section className="section" id="collections">
          <div className="section-heading">
            <p className="eyebrow">Collections</p>
            <h2>Choose the story you want to tell.</h2>
            <p>
              Start with a guided collection. Each one asks for the details that
              make sense for that moment.
            </p>
          </div>

          <div className="collection-grid">
            {[
              ["Family Timeline", "Birthdays, anniversaries, homes, moves, and meaningful family dates."],
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
            <p className="eyebrow">How it works</p>
            <h2>Simple to create. Personal by design.</h2>
          </div>

          <div className="steps-grid">
            <div><b>1</b><h3>Pick your story</h3><p>Choose family, wedding, baby, home, or personal milestones.</p></div>
            <div><b>2</b><h3>Add dates</h3><p>Enter the milestones that should appear in the artwork.</p></div>
            <div><b>3</b><h3>Preview</h3><p>Watch the piece take shape as details are added.</p></div>
            <div><b>4</b><h3>Choose finish</h3><p>Select size, palette, and frame before ordering.</p></div>
          </div>
        </section>

        <section className="section final-cta">
          <p className="eyebrow">Start creating</p>
          <h2>Your dates already mean something. Make them visible.</h2>
          <button className="primary-button" onClick={() => navigateTo("/create")}>
            Open the Artwork Builder
          </button>
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
  const [palette, setPalette] = useState("Gallery Modern");
  const [size, setSize] = useState("16 x 16");
  const [finish, setFinish] = useState("Floating Maple Frame");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, label: "Wedding Day", date: "2010-06-12" },
    { id: 2, label: "First Home", date: "2014-09-18" },
    { id: 3, label: "Lucas Born", date: "2012-03-22" },
  ]);

  const storyPrompt = getStoryPrompt(collection);

  const encodedNumber = useMemo(() => {
    const numbers = [primaryDate, ...milestones.map((m) => m.date)]
      .join("")
      .replace(/\D/g, "");

    return numbers.padEnd(12, "0").slice(0, 12);
  }, [primaryDate, milestones]);

  const price = getPrice(size, finish);

  const previewMilestones = milestones.filter((item) => item.label || item.date).slice(0, 6);

  function selectCollection(nextCollection: Collection) {
    setCollection(nextCollection);

    const preset = collectionPresets[nextCollection];
    setTitle(preset.title);
    setSubtitle(preset.subtitle);
    setMilestones(preset.milestones);
  }

  function updateMilestone(id: number, field: keyof Milestone, value: string) {
    setMilestones((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function addMilestone() {
    setMilestones((items) => [
      ...items,
      { id: Date.now(), label: "", date: "" },
    ]);
  }

  function removeMilestone(id: number) {
    setMilestones((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className="page creator-page">
      <Styles />
      <Header />

      <main className="creator-main">
        <section className="creator-hero">
          <button className="back-link" onClick={() => navigateTo("/")}>← Back to homepage</button>

          <div className="creator-hero-grid">
            <div>
              <p className="eyebrow">Artwork builder</p>
              <h1>Create your custom milestone artwork.</h1>
              <p>
                Add the dates and details that shaped the story. The preview updates
                as you build, so the customer always understands what they are creating.
              </p>
            </div>

            <div className="mini-summary-card">
              <span>Current piece</span>
              <strong>{collection}</strong>
              <p>{size} · {finish}</p>
              <b>${price}</b>
            </div>
          </div>
        </section>

        <section className="studio-layout">
          <div className="studio-form">
            <div className="progress-strip">
              <span className="active">Story</span>
              <span>Dates</span>
              <span>Style</span>
              <span>Preview</span>
            </div>

            <section className="studio-card">
              <div className="card-heading">
                <span>1</span>
                <div>
                  <h2>Choose the story</h2>
                  <p>Start with the type of artwork. This changes the suggested fields.</p>
                </div>
              </div>

              <div className="story-grid">
                {(["Family Timeline", "Wedding & Anniversary", "New Baby", "New Home", "Personal Milestones"] as Collection[]).map((item) => (
                  <button
                    key={item}
                    className={collection === item ? "story-choice selected" : "story-choice"}
                    onClick={() => selectCollection(item)}
                  >
                    <strong>{item}</strong>
                    <small>{getShortDescription(item)}</small>
                  </button>
                ))}
              </div>

              <div className="guidance-box">
                <strong>{collection}</strong>
                <p>{storyPrompt}</p>
              </div>
            </section>

            <section className="studio-card">
              <div className="card-heading">
                <span>2</span>
                <div>
                  <h2>Name the artwork</h2>
                  <p>This is the text that appears most prominently on the piece.</p>
                </div>
              </div>

              <div className="two-col">
                <label>
                  Artwork title
                  <input value={title} onChange={(e) => setTitle(e.target.value)} />
                </label>

                <label>
                  Subtitle
                  <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                </label>
              </div>

              <label>
                Anchor date
                <input type="date" value={primaryDate} onChange={(e) => setPrimaryDate(e.target.value)} />
              </label>
            </section>

            <section className="studio-card">
              <div className="card-heading between">
                <div className="heading-left">
                  <span>3</span>
                  <div>
                    <h2>Add milestone dates</h2>
                    <p>Use simple labels like Wedding Day, First Home, Birth, or Graduation.</p>
                  </div>
                </div>

                <button className="small-dark-button" onClick={addMilestone}>
                  Add date
                </button>
              </div>

              <div className="milestone-list">
                {milestones.map((milestone, index) => (
                  <div className="milestone-row" key={milestone.id}>
                    <div className="milestone-index">{index + 1}</div>

                    <label>
                      Milestone label
                      <input
                        value={milestone.label}
                        placeholder="Wedding Day"
                        onChange={(e) => updateMilestone(milestone.id, "label", e.target.value)}
                      />
                    </label>

                    <label>
                      Date
                      <input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => updateMilestone(milestone.id, "date", e.target.value)}
                      />
                    </label>

                    {milestones.length > 1 && (
                      <button className="remove-button" onClick={() => removeMilestone(milestone.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="studio-card">
              <div className="card-heading">
                <span>4</span>
                <div>
                  <h2>Choose the finish</h2>
                  <p>Make the buying choices obvious before checkout.</p>
                </div>
              </div>

              <div className="three-col">
                <label>
                  Color palette
                  <select value={palette} onChange={(e) => setPalette(e.target.value)}>
                    <option>Gallery Modern</option>
                    <option>Warm Neutral</option>
                    <option>Classic Black & Cream</option>
                    <option>Sage & Sand</option>
                    <option>Soft Blue</option>
                    <option>Rose Clay</option>
                  </select>
                </label>

                <label>
                  Size
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
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
                  <select value={finish} onChange={(e) => setFinish(e.target.value)}>
                    <option>Fine Art Print Only</option>
                    <option>Floating Maple Frame</option>
                    <option>Shadow Box Frame</option>
                    <option>Digital Proof Only</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="order-panel">
              <div>
                <span>Estimated price</span>
                <strong>${price}</strong>
                <p>Checkout is the next integration step. For now, this confirms the builder flow.</p>
              </div>

              <button className="primary-button">Continue to Order</button>
            </section>
          </div>

          <aside className="preview-side">
            <div className="preview-shell">
              <div className="preview-topline">
                <div>
                  <p className="eyebrow">Live proof</p>
                  <strong>{size} · {finish}</strong>
                </div>
                <span>${price}</span>
              </div>

              <div className={`art-proof ${paletteClass(palette)}`}>
                <div className="proof-meta">
                  <span>{collection}</span>
                  <span>{palette}</span>
                </div>

                <div className="proof-geometry">
                  <div className="shape shape-one" />
                  <div className="shape shape-two" />
                  <div className="shape shape-three" />
                  <div className="shape shape-four" />
                  <div className="proof-number">{formatNumber(encodedNumber)}</div>
                </div>

                <div className="proof-title">
                  <h2>{title || "Your Artwork Title"}</h2>
                  <p>{subtitle || "A story in dates"}</p>
                </div>

                <div className="proof-dates">
                  <div>
                    <strong>Anchor Date</strong>
                    <span>{primaryDate || "Add a date"}</span>
                  </div>

                  {previewMilestones.map((milestone) => (
                    <div key={milestone.id}>
                      <strong>{milestone.label || "Milestone"}</strong>
                      <span>{milestone.date || "Add a date"}</span>
                    </div>
                  ))}
                </div>

                <div className="proof-footer">
                  <span>{finish}</span>
                </div>
              </div>

              <div className="what-happens-next">
                <h3>What happens next?</h3>
                <ol>
                  <li>Customer reviews the proof.</li>
                  <li>Customer chooses size and frame.</li>
                  <li>Checkout collects payment and order details.</li>
                  <li>Final print-ready artwork is generated for fulfillment.</li>
                </ol>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

const collectionPresets: Record<Collection, { title: string; subtitle: string; milestones: Milestone[] }> = {
  "Family Timeline": {
    title: "The Applin Family",
    subtitle: "Our story in dates",
    milestones: [
      { id: 1, label: "Wedding Day", date: "2010-06-12" },
      { id: 2, label: "First Home", date: "2014-09-18" },
      { id: 3, label: "Lucas Born", date: "2012-03-22" },
    ],
  },
  "Wedding & Anniversary": {
    title: "Thomas & Leah",
    subtitle: "The dates that built us",
    milestones: [
      { id: 1, label: "First Date", date: "" },
      { id: 2, label: "Wedding Day", date: "2010-06-12" },
      { id: 3, label: "First Home", date: "" },
    ],
  },
  "New Baby": {
    title: "Lucas",
    subtitle: "A first chapter",
    milestones: [
      { id: 1, label: "Birth Date", date: "" },
      { id: 2, label: "Birth Time", date: "" },
      { id: 3, label: "Homecoming", date: "" },
    ],
  },
  "New Home": {
    title: "Our First Home",
    subtitle: "The place our story grew",
    milestones: [
      { id: 1, label: "Offer Accepted", date: "" },
      { id: 2, label: "Move-In Day", date: "" },
      { id: 3, label: "First Holiday", date: "" },
    ],
  },
  "Personal Milestones": {
    title: "A Life in Motion",
    subtitle: "Moments worth remembering",
    milestones: [
      { id: 1, label: "Graduation", date: "" },
      { id: 2, label: "Career Start", date: "" },
      { id: 3, label: "Big Achievement", date: "" },
    ],
  },
};

function getShortDescription(collection: Collection) {
  const descriptions: Record<Collection, string> = {
    "Family Timeline": "Family dates and shared milestones",
    "Wedding & Anniversary": "A couple’s story in dates",
    "New Baby": "Birth details and first moments",
    "New Home": "Move-in, address, and home story",
    "Personal Milestones": "A personal journey or achievement",
  };

  return descriptions[collection];
}

function getStoryPrompt(collection: Collection) {
  const prompts: Record<Collection, string> = {
    "Family Timeline": "Best for birthdays, anniversaries, homes, children, moves, and shared family chapters.",
    "Wedding & Anniversary": "Best for wedding gifts, anniversaries, proposals, first homes, and relationship milestones.",
    "New Baby": "Best for birth date, time, weight, length, birthplace, parent names, and nursery keepsakes.",
    "New Home": "Best for move-in dates, first home gifts, renovations, addresses, and housewarming moments.",
    "Personal Milestones": "Best for graduations, recovery stories, career moments, travel, and personal achievements.",
  };

  return prompts[collection];
}

function formatNumber(value: string) {
  const padded = value.padEnd(12, "0");
  return `${padded.slice(0, 4)} · ${padded.slice(4, 8)} · ${padded.slice(8, 12)}`;
}

function paletteClass(palette: string) {
  return `palette-${palette.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`;
}

function getPrice(size: string, finish: string) {
  const baseBySize: Record<string, number> = {
    "8 x 8": 49,
    "10 x 10": 69,
    "12 x 12": 89,
    "16 x 16": 129,
    "20 x 20": 189,
    "30 x 30": 329,
  };

  const finishAdd: Record<string, number> = {
    "Digital Proof Only": 19,
    "Fine Art Print Only": 0,
    "Floating Maple Frame": 90,
    "Shadow Box Frame": 120,
  };

  return (baseBySize[size] || 129) + (finishAdd[finish] || 0);
}

function Styles() {
  return (
    <style>{`
      :root {
        --cream: #f7f1e8;
        --cream-soft: #fffaf2;
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

      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        background: var(--cream);
        color: var(--ink);
      }

      button, input, select { font: inherit; }

      button { border: 0; }

      .page {
        min-height: 100vh;
        overflow-x: hidden;
        background:
          radial-gradient(circle at 12% 0%, rgba(184, 137, 87, 0.18), transparent 32%),
          linear-gradient(135deg, #f8f1e7 0%, #efe1cf 100%);
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

      .brand-button {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: transparent;
        color: var(--ink);
        cursor: pointer;
        padding: 0;
        text-align: left;
      }

      .brand-mark {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--ink);
        color: var(--cream);
        display: grid;
        place-items: center;
        font-weight: 900;
      }

      .brand-text strong {
        display: block;
        font-size: 18px;
        letter-spacing: -0.04em;
        line-height: 1;
      }

      .brand-text em {
        display: block;
        font-size: 12px;
        color: var(--muted);
        font-style: normal;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-top: 3px;
      }

      .desktop-nav {
        display: flex;
        align-items: center;
        gap: 26px;
      }

      .desktop-nav a,
      .desktop-nav button {
        color: var(--muted);
        background: transparent;
        text-decoration: none;
        cursor: pointer;
        font-weight: 850;
      }

      .desktop-nav .nav-cta {
        min-height: 44px;
        padding: 0 20px;
        border-radius: 999px;
        color: white;
        background: var(--ink);
        box-shadow: 0 14px 32px rgba(31, 26, 23, 0.16);
      }

      .home-hero {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 54px;
        align-items: center;
        padding: 150px 7% 90px;
      }

      .home-copy { max-width: 690px; }

      .eyebrow {
        margin: 0 0 16px;
        color: var(--maple-dark);
        font-size: 13px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.14em;
      }

      .home-copy h1,
      .creator-hero h1,
      .section-heading h2,
      .final-cta h2 {
        margin: 0;
        font-size: clamp(44px, 6vw, 86px);
        line-height: 0.94;
        letter-spacing: -0.075em;
      }

      .home-copy h1 span { color: var(--maple-dark); }

      .home-copy p,
      .creator-hero p,
      .section-heading p {
        color: var(--muted);
        font-size: 19px;
        line-height: 1.65;
      }

      .button-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 34px;
      }

      .primary-button,
      .secondary-button {
        min-height: 56px;
        padding: 0 30px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        text-decoration: none;
        cursor: pointer;
      }

      .primary-button {
        color: white;
        background: var(--ink);
        box-shadow: 0 18px 44px rgba(31, 26, 23, 0.18);
      }

      .secondary-button {
        color: var(--ink);
        background: rgba(255, 255, 255, 0.74);
        border: 1px solid var(--line);
      }

      .trust-row {
        margin-top: 26px;
        display: flex;
        gap: 18px;
        flex-wrap: wrap;
        color: var(--muted);
        font-weight: 850;
      }

      .trust-row span::before {
        content: "•";
        color: var(--maple-dark);
        margin-right: 8px;
      }

      .home-image-card {
        position: relative;
        border-radius: 34px;
        overflow: hidden;
        background: #eee1d0;
        box-shadow: var(--shadow);
      }

      .home-image-card img {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        filter: contrast(1.05) saturate(1.03);
      }

      .home-image-note {
        position: absolute;
        left: 24px;
        bottom: 24px;
        width: min(280px, calc(100% - 48px));
        padding: 18px;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.86);
        backdrop-filter: blur(14px);
        box-shadow: 0 16px 40px rgba(31, 26, 23, 0.14);
      }

      .home-image-note span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.45;
      }

      .section { padding: 96px 7%; }

      .soft-section { background: rgba(255, 250, 242, 0.72); }

      .section-heading {
        max-width: 780px;
        margin-bottom: 42px;
      }

      .section-heading h2,
      .final-cta h2 {
        font-size: clamp(38px, 5vw, 68px);
      }

      .collection-grid,
      .steps-grid {
        display: grid;
        gap: 22px;
      }

      .collection-grid { grid-template-columns: repeat(3, 1fr); }

      .steps-grid { grid-template-columns: repeat(4, 1fr); }

      .collection-card,
      .steps-grid div {
        text-align: left;
        min-height: 230px;
        border-radius: 28px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.66);
        padding: 26px;
        box-shadow: 0 16px 44px rgba(31, 26, 23, 0.06);
      }

      .collection-card {
        color: var(--ink);
        cursor: pointer;
      }

      .collection-card span {
        display: block;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: -0.04em;
      }

      .collection-card p,
      .steps-grid p {
        color: var(--muted);
        line-height: 1.6;
      }

      .collection-card strong { color: var(--maple-dark); }

      .steps-grid b {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--ink);
        color: white;
      }

      .final-cta { text-align: center; }

      .final-cta .primary-button { margin-top: 28px; }

      .creator-main {
        padding: 136px 7% 90px;
      }

      .back-link {
        margin-bottom: 28px;
        background: transparent;
        color: var(--maple-dark);
        font-weight: 900;
        cursor: pointer;
      }

      .creator-hero-grid {
        display: grid;
        grid-template-columns: 1fr 260px;
        gap: 28px;
        align-items: end;
        margin-bottom: 38px;
      }

      .creator-hero h1 { max-width: 940px; }

      .mini-summary-card {
        padding: 22px;
        border-radius: 26px;
        background: rgba(255, 255, 255, 0.74);
        border: 1px solid var(--line);
        box-shadow: 0 18px 50px rgba(31, 26, 23, 0.08);
      }

      .mini-summary-card span,
      .mini-summary-card p {
        color: var(--muted);
        font-size: 14px;
      }

      .mini-summary-card strong,
      .mini-summary-card b {
        display: block;
      }

      .mini-summary-card strong {
        margin: 8px 0 6px;
        font-size: 20px;
      }

      .mini-summary-card b {
        font-size: 34px;
        letter-spacing: -0.05em;
      }

      .studio-layout {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(390px, 0.95fr);
        gap: 28px;
        align-items: start;
      }

      .studio-form {
        display: grid;
        gap: 20px;
      }

      .progress-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }

      .progress-strip span {
        padding: 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.55);
        color: var(--muted);
        text-align: center;
        font-size: 13px;
        font-weight: 900;
      }

      .progress-strip .active {
        background: var(--ink);
        color: white;
      }

      .studio-card,
      .order-panel,
      .preview-shell {
        border-radius: 30px;
        border: 1px solid var(--line);
        background: rgba(255, 255, 255, 0.76);
        box-shadow: 0 18px 50px rgba(31, 26, 23, 0.08);
      }

      .studio-card { padding: 26px; }

      .card-heading,
      .heading-left {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }

      .card-heading {
        margin-bottom: 22px;
      }

      .card-heading.between {
        justify-content: space-between;
        align-items: center;
      }

      .card-heading span,
      .heading-left span {
        flex: 0 0 auto;
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: var(--ink);
        color: white;
        font-weight: 900;
      }

      .card-heading h2,
      .heading-left h2,
      .order-panel strong {
        margin: 0 0 5px;
        font-size: 25px;
        letter-spacing: -0.045em;
      }

      .card-heading p,
      .heading-left p {
        margin: 0;
        color: var(--muted);
        line-height: 1.55;
      }

      .story-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .story-choice {
        text-align: left;
        padding: 16px;
        border-radius: 20px;
        border: 1px solid var(--line);
        background: rgba(247, 241, 232, 0.72);
        color: var(--ink);
        cursor: pointer;
      }

      .story-choice.selected {
        border-color: rgba(143, 98, 56, 0.55);
        background: rgba(184, 137, 87, 0.16);
        box-shadow: inset 0 0 0 1px rgba(143, 98, 56, 0.18);
      }

      .story-choice strong,
      .story-choice small {
        display: block;
      }

      .story-choice small {
        margin-top: 6px;
        color: var(--muted);
        line-height: 1.4;
      }

      .guidance-box {
        margin-top: 16px;
        padding: 16px;
        border-radius: 18px;
        background: rgba(31, 26, 23, 0.06);
      }

      .guidance-box p {
        margin: 5px 0 0;
        color: var(--muted);
        line-height: 1.5;
      }

      label {
        display: grid;
        gap: 8px;
        margin-bottom: 16px;
        color: var(--muted);
        font-size: 14px;
        font-weight: 900;
      }

      input,
      select {
        width: 100%;
        min-height: 50px;
        border-radius: 15px;
        border: 1px solid rgba(31, 26, 23, 0.14);
        background: rgba(255, 255, 255, 0.92);
        color: var(--ink);
        padding: 0 14px;
        outline: none;
      }

      input:focus,
      select:focus {
        border-color: var(--maple-dark);
        box-shadow: 0 0 0 4px rgba(184, 137, 87, 0.13);
      }

      .two-col,
      .three-col {
        display: grid;
        gap: 14px;
      }

      .two-col { grid-template-columns: repeat(2, 1fr); }

      .three-col { grid-template-columns: repeat(3, 1fr); }

      .small-dark-button {
        min-height: 42px;
        padding: 0 17px;
        border-radius: 999px;
        background: var(--ink);
        color: white;
        font-weight: 900;
        cursor: pointer;
      }

      .milestone-list {
        display: grid;
        gap: 12px;
      }

      .milestone-row {
        display: grid;
        grid-template-columns: 38px 1fr 180px auto;
        gap: 12px;
        align-items: end;
        padding: 14px;
        border-radius: 20px;
        background: rgba(247, 241, 232, 0.74);
        border: 1px solid rgba(31, 26, 23, 0.06);
      }

      .milestone-row label { margin: 0; }

      .milestone-index {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--cream-soft);
        color: var(--maple-dark);
        display: grid;
        place-items: center;
        font-weight: 900;
        margin-bottom: 7px;
      }

      .remove-button {
        min-height: 50px;
        padding: 0 12px;
        border-radius: 15px;
        background: rgba(31, 26, 23, 0.08);
        color: var(--ink);
        cursor: pointer;
        font-weight: 900;
      }

      .order-panel {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: center;
        padding: 26px;
        background: var(--ink);
        color: white;
      }

      .order-panel span {
        color: rgba(255, 255, 255, 0.66);
        font-weight: 800;
      }

      .order-panel strong {
        display: block;
        margin-top: 4px;
        color: white;
        font-size: 38px;
      }

      .order-panel p {
        max-width: 520px;
        margin: 6px 0 0;
        color: rgba(255, 255, 255, 0.72);
      }

      .order-panel .primary-button {
        color: var(--ink);
        background: white;
        box-shadow: none;
      }

      .preview-side { position: relative; }

      .preview-shell {
        position: sticky;
        top: 112px;
        padding: 22px;
      }

      .preview-topline {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: center;
        margin-bottom: 14px;
      }

      .preview-topline .eyebrow { margin-bottom: 6px; }

      .preview-topline strong {
        color: var(--muted);
        font-size: 13px;
      }

      .preview-topline span {
        font-size: 28px;
        font-weight: 900;
        letter-spacing: -0.05em;
      }

      .art-proof {
        min-height: 660px;
        border-radius: 28px;
        padding: 32px;
        border: 13px solid #d0a16e;
        background:
          radial-gradient(circle at 50% 28%, rgba(184, 137, 87, 0.16), transparent 37%),
          #fffaf2;
        box-shadow: inset 0 0 0 1px rgba(31, 26, 23, 0.08);
        display: flex;
        flex-direction: column;
      }

      .palette-classic-black-and-cream {
        background:
          radial-gradient(circle at 50% 28%, rgba(31, 26, 23, 0.10), transparent 37%),
          #fbf7ef;
        border-color: #1f1a17;
      }

      .palette-sage-and-sand {
        background:
          radial-gradient(circle at 50% 28%, rgba(113, 132, 99, 0.18), transparent 37%),
          #f5f1e6;
        border-color: #9aa27c;
      }

      .palette-soft-blue {
        background:
          radial-gradient(circle at 50% 28%, rgba(100, 132, 160, 0.16), transparent 37%),
          #f2f5f7;
        border-color: #9eb4c5;
      }

      .palette-rose-clay {
        background:
          radial-gradient(circle at 50% 28%, rgba(168, 94, 86, 0.15), transparent 37%),
          #faf1ec;
        border-color: #be8a7e;
      }

      .proof-meta {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        color: var(--maple-dark);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 11px;
        font-weight: 900;
      }

      .proof-geometry {
        position: relative;
        width: 300px;
        height: 300px;
        margin: 48px auto 34px;
      }

      .shape {
        position: absolute;
        inset: 0;
        border: 1px solid rgba(31, 26, 23, 0.24);
        border-radius: 49% 51% 44% 56%;
      }

      .shape-one { transform: rotate(11deg); }
      .shape-two { transform: rotate(62deg) scale(0.84); }
      .shape-three { transform: rotate(119deg) scale(0.66); }
      .shape-four { transform: rotate(160deg) scale(0.48); }

      .proof-number {
        position: absolute;
        inset: 50%;
        transform: translate(-50%, -50%);
        width: 138px;
        height: 138px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        padding: 18px;
        text-align: center;
        background: var(--ink);
        color: var(--cream);
        font-size: 15px;
        line-height: 1.3;
        letter-spacing: 0.06em;
        font-weight: 900;
      }

      .proof-title {
        text-align: center;
      }

      .proof-title h2 {
        margin: 0;
        font-size: 36px;
        line-height: 1;
        letter-spacing: -0.055em;
      }

      .proof-title p {
        margin: 8px 0 0;
        color: var(--muted);
      }

      .proof-dates {
        margin-top: auto;
        display: grid;
        gap: 8px;
      }

      .proof-dates div {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(31, 26, 23, 0.08);
        font-size: 14px;
      }

      .proof-dates strong { color: var(--ink); }

      .proof-dates span { color: var(--muted); }

      .proof-footer {
        text-align: center;
        margin-top: 24px;
        color: var(--maple-dark);
        font-size: 12px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .what-happens-next {
        padding: 20px 4px 2px;
      }

      .what-happens-next h3 {
        margin: 0 0 10px;
      }

      .what-happens-next ol {
        margin: 0;
        padding-left: 20px;
        color: var(--muted);
        line-height: 1.65;
        font-size: 14px;
      }

      @media (max-width: 1100px) {
        .home-hero,
        .studio-layout,
        .creator-hero-grid {
          grid-template-columns: 1fr;
        }

        .preview-shell {
          position: static;
        }

        .collection-grid,
        .steps-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 760px) {
        .site-header {
          padding: 16px 5%;
        }

        .desktop-nav {
          display: none;
        }

        .home-hero,
        .creator-main {
          padding: 118px 5% 68px;
        }

        .home-copy h1,
        .creator-hero h1 {
          font-size: clamp(42px, 13vw, 64px);
        }

        .button-row,
        .order-panel {
          flex-direction: column;
          align-items: stretch;
        }

        .primary-button,
        .secondary-button {
          width: 100%;
        }

        .section {
          padding: 74px 5%;
        }

        .collection-grid,
        .steps-grid,
        .story-grid,
        .two-col,
        .three-col,
        .progress-strip {
          grid-template-columns: 1fr;
        }

        .milestone-row {
          grid-template-columns: 38px 1fr;
        }

        .milestone-row label,
        .milestone-row .remove-button {
          grid-column: 2;
        }

        .art-proof {
          min-height: 580px;
          padding: 22px;
        }

        .proof-geometry {
          width: 230px;
          height: 230px;
        }

        .proof-number {
          width: 118px;
          height: 118px;
          font-size: 13px;
        }
      }
    `}</style>
  );
}
