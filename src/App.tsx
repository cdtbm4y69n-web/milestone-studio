import React, { useEffect, useMemo, useState } from "react";

type Milestone = {
  id: number;
  label: string;
  date: string;
};

function navigate(path: string) {
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
    return <CreatePage />;
  }

  return <HomePage />;
}

function Header() {
  return (
    <header className="header">
      <button className="brand" onClick={() => navigate("/")}>
        <span className="brandMark">M</span>
        <span>Milestone Art Studio</span>
      </button>

      <nav className="nav">
        <a href="/#collections">Collections</a>
        <a href="/#how">How It Works</a>
        <a href="/#quality">Quality</a>
        <button onClick={() => navigate("/create")}>Start Creating</button>
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
        <section className="hero">
          <div className="heroCopy">
            <p className="kicker">Custom milestone artwork</p>
            <h1>
              Turn life's biggest numbers into <span>timeless wall art.</span>
            </h1>
            <p>
              Create personalized artwork from the dates, places, names, and milestones that shaped your story. Designed for homes, families, anniversaries, weddings, new babies, and unforgettable chapters.
            </p>

            <div className="buttonRow">
              <button className="primary" onClick={() => navigate("/create")}>Create Your Artwork</button>
              <a className="secondary" href="#collections">View Collections</a>
            </div>

            <div className="trustRow">
              <span>‚Ä¢ Personalized preview</span>
              <span>‚Ä¢ Premium maple framing</span>
              <span>‚Ä¢ Made to order</span>
            </div>
          </div>

          <div className="heroImageWrap">
            <img src={heroImageUrl} alt="Living room with framed artwork" />
          </div>
        </section>

        <section className="section" id="collections">
          <p className="kicker">Collections</p>
          <h2>Artwork for every chapter.</h2>
          <p className="sectionIntro">Choose a starting point, then customize the details until it feels unmistakably yours.</p>

          <div className="cards">
            <button className="card" onClick={() => navigate("/create")}> 
              <span>01</span>
              <h3>Family Timeline</h3>
              <p>Birthdays, anniversaries, homes, moves, and meaningful dates arranged into one family story.</p>
              <strong>Create a family piece</strong>
            </button>

            <button className="card" onClick={() => navigate("/create")}> 
              <span>02</span>
              <h3>Wedding & Anniversary</h3>
              <p>Celebrate the date everything changed with elegant number-based artwork made for gifting.</p>
              <strong>Design an anniversary piece</strong>
            </button>

            <button className="card" onClick={() => navigate("/create")}> 
              <span>03</span>
              <h3>New Baby</h3>
              <p>Name, birth date, time, weight, location, and first little details turned into modern nursery art.</p>
              <strong>Create a baby piece</strong>
            </button>
          </div>
        </section>

        <section className="section pale" id="how">
          <p className="kicker">How it works</p>
          <h2>Simple to create. Hard to forget.</h2>
          <div className="steps">
            <div><b>1</b><h3>Pick a collection</h3><p>Choose family, wedding, baby, home, or personal milestone artwork.</p></div>
            <div><b>2</b><h3>Add your details</h3><p>Enter the dates, names, places, and milestones that matter most.</p></div>
            <div><b>3</b><h3>Preview the artwork</h3><p>See your story take shape before ordering.</p></div>
            <div><b>4</b><h3>Order your piece</h3><p>Receive a polished, made-to-order artwork ready for display.</p></div>
          </div>
        </section>

        <section className="section" id="quality">
          <div className="darkBand">
            <div>
              <p className="kicker">Premium finish</p>
              <h2>Designed to feel personal, not homemade.</h2>
              <p>Each piece uses clean typography, balanced spacing, and a gallery-style presentation that fits beautifully into a real home.</p>
            </div>
            <ul>
              <li>Fine art paper presentation</li>
              <li>Maple shadow box frame option</li>
              <li>Modern layouts from real milestones</li>
              <li>Meaningful gift-ready artwork</li>
            </ul>
          </div>
        </section>

        <section className="section final" id="start">
          <p className="kicker">Start creating</p>
          <h2>Your dates already mean something. Make them visible.</h2>
          <p className="sectionIntro">Build a custom number-based artwork from the milestones that shaped your family, home, relationship, or next big chapter.</p>
          <div className="buttonRow center">
            <button className="primary" onClick={() => navigate("/create")}>Create Your Artwork</button>
            <a className="secondary" href="#collections">Browse Collections</a>
          </div>
        </section>
      </main>
    </div>
  );
}

function CreatePage() {
  const [collection, setCollection] = useState("Family Timeline");
  const [title, setTitle] = useState("The Applin Family");
  const [primaryDate, setPrimaryDate] = useState("2010-06-12");
  const [style, setStyle] = useState("Warm Minimal");
  const [frame, setFrame] = useState("Floating Maple Frame");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, label: "Wedding Day", date: "2010-06-12" },
    { id: 2, label: "First Home", date: "2014-09-18" },
    { id: 3, label: "Lucas Born", date: "2012-03-22" },
  ]);

  const dateCode = useMemo(() => {
    return [primaryDate, ...milestones.map((m) => m.date)]
      .join("")
      .replaceAll("-", "")
      .replace(/\D/g, "")
      .slice(0, 16) || "00000000";
  }, [primaryDate, milestones]);

  function updateMilestone(id: number, field: keyof Milestone, value: string) {
    setMilestones((items) => items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  function addMilestone() {
    setMilestones((items) => [...items, { id: Date.now(), label: "New Milestone", date: "" }]);
  }

  function removeMilestone(id: number) {
    setMilestones((items) => items.filter((item) => item.id !== id));
  }

  return (
    <div className="page builderPage">
      <Styles />
      <Header />

      <main className="builderMain">
        <section className="builderIntro">
          <p className="kicker">Artwork builder</p>
          <h1>Create your custom milestone artwork.</h1>
          <p>Enter your important dates and life moments. This first version creates a simple live preview. Next, we can make the visual engine more advanced and connect checkout.</p>
        </section>

        <section className="builderGrid">
          <div className="builderForm">
            <div className="formPanel">
              <h2>1. Choose your starting point</h2>
              <label>Collection Type
                <select value={collection} onChange={(e) => setCollection(e.target.value)}>
                  <option>Family Timeline</option>
                  <option>Wedding & Anniversary</option>
                  <option>New Baby</option>
                  <option>New Home</option>
                  <option>Personal Milestones</option>
                </select>
              </label>
              <label>Artwork Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Applin Family" />
              </label>
              <label>Primary Date
                <input type="date" value={primaryDate} onChange={(e) => setPrimaryDate(e.target.value)} />
              </label>
            </div>

            <div className="formPanel">
              <div className="panelHeader">
                <h2>2. Add milestones</h2>
                <button className="smallButton" onClick={addMilestone}>Add Milestone</button>
              </div>

              {milestones.map((milestone, index) => (
                <div className="milestone" key={milestone.id}>
                  <strong>{index + 1}</strong>
                  <label>Label
                    <input value={milestone.label} onChange={(e) => updateMilestone(milestone.id, "label", e.target.value)} />
                  </label>
                  <label>Date
                    <input type="date" value={milestone.date} onChange={(e) => updateMilestone(milestone.id, "date", e.target.value)} />
                  </label>
                  {milestones.length > 1 && <button className="removeButton" onClick={() => removeMilestone(milestone.id)}>Remove</button>}
                </div>
              ))}
            </div>

            <div className="formPanel">
              <h2>3. Choose finish</h2>
              <label>Artwork Style
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option>Warm Minimal</option>
                  <option>Classic Black & Cream</option>
                  <option>Soft Neutral</option>
                  <option>Gallery Modern</option>
                </select>
              </label>
              <label>Frame / Product
                <select value={frame} onChange={(e) => setFrame(e.target.value)}>
                  <option>Floating Maple Frame</option>
                  <option>Fine Art Print Only</option>
                  <option>Shadow Box Frame</option>
                  <option>Digital Proof Only</option>
                </select>
              </label>
            </div>

            <div className="buttonRow">
              <button className="secondary" onClick={() => navigate("/")}>Back to Homepage</button>
              <button className="primary">Continue to Order</button>
            </div>
          </div>

          <aside className="previewColumn">
            <div className="previewCard">
              <p className="kicker">Live Preview</p>
              <div className="artCard">
                <div className="artMeta"><span>{collection}</span><span>{style}</span></div>
                <div className="orbit">
                  <span className="ring r1" />
                  <span className="ring r2" />
                  <span className="ring r3" />
                  <strong>{dateCode.slice(0, 8)}</strong>
                </div>
                <h2>{title || "Your Artwork Title"}</h2>
                <div className="dateList">
                  <p><b>Primary Date</b><span>{primaryDate || "Add a date"}</span></p>
                  {milestones.slice(0, 5).map((m) => <p key={m.id}><b>{m.label || "Milestone"}</b><span>{m.date || "Add a date"}</span></p>)}
                </div>
                <footer>{frame}</footer>
              </div>
              <p className="previewNote">This is the first working builder. The next upgrade is to make the artwork geometry react more dramatically to each date.</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function Styles() {
  return (
    <style>{`
      :root {
        --cream: #f7f1e8;
        --warm: #efe3d2;
        --ink: #1f1a17;
        --muted: #6f6258;
        --maple: #8f6238;
        --white: #ffffff;
        --shadow: 0 24px 70px rgba(31, 26, 23, 0.16);
      }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; background: var(--cream); color: var(--ink); }
      button, input, select { font: inherit; }
      button { cursor: pointer; }
      .page { min-height: 100vh; background: var(--cream); }
      .header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 22px 7%; background: rgba(247, 241, 232, .88); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(31,26,23,.06); }
      .brand { display: flex; align-items: center; gap: 10px; background: transparent; border: 0; color: var(--ink); font-size: 22px; font-weight: 900; letter-spacing: -.04em; }
      .brandMark { width: 34px; height: 34px; border-radius: 999px; background: var(--ink); color: var(--cream); display: grid; place-items: center; font-size: 14px; }
      .nav { display: flex; align-items: center; gap: 28px; font-weight: 800; color: var(--muted); }
      .nav a { color: inherit; text-decoration: none; }
      .nav button { min-height: 42px; border: 0; border-radius: 999px; padding: 0 18px; background: var(--ink); color: white; font-weight: 900; }
      .hero { min-height: 100vh; display: grid; grid-template-columns: .95fr 1.05fr; gap: 52px; align-items: center; padding: 150px 7% 90px; background: radial-gradient(circle at 18% 20%, rgba(184,137,87,.16), transparent 34%), linear-gradient(135deg, #f8f1e7, #efe1cf); }
      .heroCopy { max-width: 650px; }
      .kicker { margin: 0 0 18px; color: var(--maple); font-size: 13px; font-weight: 900; letter-spacing: .13em; text-transform: uppercase; }
      .hero h1, .builderIntro h1 { margin: 0 0 26px; font-size: clamp(46px, 6.4vw, 88px); line-height: .93; letter-spacing: -.075em; }
      .hero h1 span { color: var(--maple); }
      .hero p, .builderIntro p, .sectionIntro { color: var(--muted); font-size: 19px; line-height: 1.65; }
      .buttonRow { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin: 34px 0; }
      .center { justify-content: center; }
      .primary, .secondary { min-height: 54px; border-radius: 999px; padding: 0 28px; font-size: 16px; font-weight: 900; border: 0; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
      .primary { background: var(--ink); color: white; box-shadow: 0 12px 30px rgba(31,26,23,.22); }
      .secondary { background: rgba(255,255,255,.76); color: var(--ink); border: 1px solid rgba(31,26,23,.12); }
      .trustRow { display: flex; gap: 22px; flex-wrap: wrap; color: var(--muted); font-weight: 800; }
      .heroImageWrap { border-radius: 34px; overflow: hidden; box-shadow: var(--shadow); background: var(--warm); }
      .heroImageWrap img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; filter: contrast(1.06) saturate(1.04); }
      .section { padding: 96px 7%; }
      .section h2 { font-size: clamp(36px, 4.5vw, 62px); line-height: 1; letter-spacing: -.06em; margin: 0 0 18px; }
      .pale { background: #fffaf2; }
      .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; margin-top: 44px; }
      .card { text-align: left; background: rgba(255,255,255,.65); border: 1px solid rgba(31,26,23,.08); border-radius: 28px; padding: 26px; min-height: 260px; box-shadow: 0 15px 42px rgba(31,26,23,.06); color: var(--ink); }
      .card span { width: 46px; height: 46px; border-radius: 50%; background: var(--warm); display: grid; place-items: center; color: var(--maple); font-weight: 900; margin-bottom: 22px; }
      .card h3 { font-size: 24px; margin: 0 0 12px; }
      .card p { color: var(--muted); line-height: 1.65; }
      .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 44px; }
      .steps div { background: white; border-radius: 26px; padding: 26px; box-shadow: 0 15px 42px rgba(31,26,23,.055); }
      .steps b { width: 34px; height: 34px; border-radius: 50%; background: var(--ink); color: white; display: grid; place-items: center; }
      .darkBand { display: grid; grid-template-columns: 1fr 1fr; gap: 44px; background: var(--ink); color: white; border-radius: 38px; padding: 54px; }
      .darkBand p { color: rgba(255,255,255,.72); line-height: 1.7; }
      .darkBand li { margin: 14px 0; background: rgba(255,255,255,.08); padding: 16px; border-radius: 18px; }
      .final { text-align: center; }
      .final .sectionIntro { max-width: 780px; margin: 0 auto; }
      .builderMain { padding: 140px 7% 90px; }
      .builderIntro { max-width: 860px; margin-bottom: 44px; }
      .builderGrid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(360px, .95fr); gap: 28px; align-items: start; }
      .builderForm { display: grid; gap: 20px; }
      .formPanel { background: rgba(255,255,255,.74); border: 1px solid rgba(31,26,23,.08); border-radius: 28px; padding: 26px; box-shadow: 0 15px 42px rgba(31,26,23,.06); }
      .formPanel h2 { margin: 0 0 20px; }
      .panelHeader { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
      label { display: grid; gap: 8px; margin-bottom: 16px; color: var(--muted); font-size: 14px; font-weight: 900; }
      input, select { width: 100%; min-height: 48px; border-radius: 14px; border: 1px solid rgba(31,26,23,.14); background: rgba(255,255,255,.9); color: var(--ink); padding: 0 14px; outline: none; }
      input:focus, select:focus { border-color: var(--maple); box-shadow: 0 0 0 4px rgba(184,137,87,.13); }
      .smallButton { min-height: 40px; padding: 0 16px; border-radius: 999px; background: var(--ink); color: white; border: 0; font-weight: 900; }
      .milestone { display: grid; grid-template-columns: 36px 1fr 180px auto; gap: 12px; align-items: end; padding: 14px; border-radius: 18px; background: rgba(247,241,232,.75); margin-top: 14px; }
      .milestone strong { width: 34px; height: 34px; border-radius: 50%; background: var(--warm); display: grid; place-items: center; color: var(--maple); margin-bottom: 7px; }
      .milestone label { margin: 0; }
      .removeButton { min-height: 48px; border-radius: 14px; border: 0; padding: 0 14px; background: rgba(31,26,23,.08); font-weight: 900; }
      .previewColumn { position: relative; }
      .previewCard { position: sticky; top: 115px; }
      .artCard { min-height: 620px; background: radial-gradient(circle at 50% 28%, rgba(184,137,87,.14), transparent 38%), #fffaf2; border: 12px solid #d1a36f; border-radius: 30px; padding: 34px; box-shadow: var(--shadow); display: flex; flex-direction: column; }
      .artMeta { display: flex; justify-content: space-between; color: var(--maple); text-transform: uppercase; letter-spacing: .12em; font-size: 11px; font-weight: 900; }
      .orbit { position: relative; width: 280px; height: 280px; margin: 46px auto 34px; }
      .ring { position: absolute; inset: 0; border: 1px solid rgba(31,26,23,.22); border-radius: 48% 52% 45% 55%; }
      .r1 { transform: rotate(12deg); } .r2 { transform: rotate(63deg) scale(.84); } .r3 { transform: rotate(127deg) scale(.62); }
      .orbit strong { position: absolute; inset: 50%; transform: translate(-50%, -50%); width: 122px; height: 122px; border-radius: 50%; background: var(--ink); color: var(--cream); display: grid; place-items: center; letter-spacing: .08em; }
      .artCard h2 { text-align: center; font-size: 34px; margin: 0 0 24px; letter-spacing: -.05em; }
      .dateList { margin-top: auto; }
      .dateList p { display: flex; justify-content: space-between; gap: 14px; border-bottom: 1px solid rgba(31,26,23,.08); padding: 10px 0; margin: 0; }
      .dateList span { color: var(--muted); }
      .artCard footer { text-align: center; margin-top: 24px; color: var(--maple); font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; }
      .previewNote { color: var(--muted); line-height: 1.55; }
      @media (max-width: 1050px) { .hero, .builderGrid { grid-template-columns: 1fr; } .cards, .steps, .darkBand { grid-template-columns: 1fr 1fr; } .milestone { grid-template-columns: 36px 1fr; } }
      @media (max-width: 760px) { .header { padding: 18px 5%; } .nav { display: none; } .hero, .builderMain { padding: 125px 5% 70px; } .hero h1, .builderIntro h1 { font-size: clamp(42px, 13vw, 66px); } .buttonRow { flex-direction: column; align-items: stretch; } .primary, .secondary { width: 100%; } .section { padding: 74px 5%; } .cards, .steps, .darkBand { grid-template-columns: 1fr; } .darkBand { padding: 34px 24px; } .artCard { min-height: 560px; padding: 24px; } .orbit { width: 230px; height: 230px; } }
    `}</style>
  );
}

