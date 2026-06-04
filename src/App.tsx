import React, { useMemo, useState } from 'react';

type StoryType =
  | 'Family Timeline'
  | 'Wedding & Anniversary'
  | 'New Baby'
  | 'New Home'
  | 'Personal Milestones';

type MilestoneCategory =
  | 'Family'
  | 'Wedding'
  | 'Baby'
  | 'Home'
  | 'Personal'
  | 'Other';

type Milestone = {
  id: number;
  label: string;
  date: string;
  importance: number;
  category: MilestoneCategory;
};

type PaletteName = 'Sage & Sand' | 'Clay & Linen' | 'Midnight & Parchment';

type Palette = {
  name: PaletteName;
  paper: string;
  ink: string;
  frame: string;
  lines: string[];
  accent: string;
};

const palettes: Record<PaletteName, Palette> = {
  'Sage & Sand': {
    name: 'Sage & Sand',
    paper: '#ffffff',
    ink: '#1f1815',
    frame: '#c79a63',
    lines: ['#6B7D6D', '#B88B52', '#D5B85A', '#7BA7BE', '#D98A54', '#6C7A92'],
    accent: '#A56F35',
  },
  'Clay & Linen': {
    name: 'Clay & Linen',
    paper: '#ffffff',
    ink: '#231b18',
    frame: '#bc9061',
    lines: ['#C87454', '#D9A25F', '#8BA089', '#7B90B5', '#B66F76', '#947E5B'],
    accent: '#9B633D',
  },
  'Midnight & Parchment': {
    name: 'Midnight & Parchment',
    paper: '#ffffff',
    ink: '#16181d',
    frame: '#a88458',
    lines: ['#24364F', '#4F6F8A', '#A88342', '#8E6AA8', '#76857C', '#C98D62'],
    accent: '#74562E',
  },
};

const storyPresets: Record<StoryType, { subtitle: string; price: number; suggestions: MilestoneCategory[] }> = {
  'Family Timeline': {
    subtitle: 'Birthdays, anniversaries, homes, children, and family chapters.',
    price: 219,
    suggestions: ['Family', 'Wedding', 'Home', 'Baby', 'Other'],
  },
  'Wedding & Anniversary': {
    subtitle: 'A relationship story told through dates and milestones.',
    price: 219,
    suggestions: ['Wedding', 'Family', 'Home', 'Other', 'Personal'],
  },
  'New Baby': {
    subtitle: 'Birth details, firsts, and the opening chapter of a growing family.',
    price: 219,
    suggestions: ['Baby', 'Family', 'Other', 'Home', 'Personal'],
  },
  'New Home': {
    subtitle: 'Move-in, meaningful renovations, and the story of a place.',
    price: 219,
    suggestions: ['Home', 'Family', 'Other', 'Personal', 'Wedding'],
  },
  'Personal Milestones': {
    subtitle: 'Achievements, career moments, travels, and personal turning points.',
    price: 219,
    suggestions: ['Personal', 'Other', 'Family', 'Home', 'Wedding'],
  },
};

const categoryLabelMap: Record<MilestoneCategory, string> = {
  Family: 'Family',
  Wedding: 'Wedding',
  Baby: 'Baby',
  Home: 'Home',
  Personal: 'Personal',
  Other: 'Other',
};

const categoryColorIndex: Record<MilestoneCategory, number> = {
  Family: 0,
  Wedding: 1,
  Baby: 3,
  Home: 2,
  Personal: 5,
  Other: 4,
};

const defaultMilestones: Milestone[] = [
  { id: 1, label: 'Wedding Day', date: '2010-06-12', importance: 5, category: 'Wedding' },
  { id: 2, label: 'Lucas Born', date: '2012-03-22', importance: 5, category: 'Baby' },
  { id: 3, label: 'First Home', date: '2014-09-18', importance: 4, category: 'Home' },
];

function formatDisplayDate(dateString: string) {
  if (!dateString) return '—';
  const d = new Date(dateString + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function digitSum(input: string) {
  return input.replace(/\D/g, '').split('').reduce((sum, d) => sum + Number(d), 0);
}

function daysBetween(a: string, b: string) {
  const one = new Date(a + 'T00:00:00').getTime();
  const two = new Date(b + 'T00:00:00').getTime();
  return Math.round((two - one) / 86400000);
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildSpiroPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  offsetRadius: number,
  rotations: number,
  points: number,
) {
  const pts: string[] = [];

  for (let i = 0; i <= points; i += 1) {
    const t = (Math.PI * 2 * rotations * i) / points;
    const ratio = (outerRadius - innerRadius) / innerRadius;
    const x =
      cx +
      (outerRadius - innerRadius) * Math.cos(t) +
      offsetRadius * Math.cos(ratio * t);
    const y =
      cy +
      (outerRadius - innerRadius) * Math.sin(t) -
      offsetRadius * Math.sin(ratio * t);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return `${pts.join(' ')} Z`;
}

function generateArtworkNodes(
  milestones: Milestone[],
  anchorDate: string,
  palette: Palette,
) {
  const validMilestones = milestones
    .filter((m) => m.label.trim() && m.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!validMilestones.length || !anchorDate) {
    return [] as Array<{
      id: number;
      x: number;
      y: number;
      color: string;
      strokeWidth: number;
      opacity: number;
      path: string;
      orbitRadius: number;
      ringColor: string;
      importance: number;
    }>;
  }

  const dates = [anchorDate, ...validMilestones.map((m) => m.date)].map((date) =>
    new Date(date + 'T00:00:00').getTime(),
  );
  const minTime = Math.min(...dates);
  const maxTime = Math.max(...dates);
  const totalRange = Math.max(maxTime - minTime, 86400000 * 30);

  const cx = 320;
  const cy = 320;
  const goldenAngle = 137.5;

  return validMilestones.map((milestone, index) => {
    const time = new Date(milestone.date + 'T00:00:00').getTime();
    const normalizedTime = clamp((time - minTime) / totalRange, 0, 1);
    const daysFromAnchor = Math.abs(daysBetween(anchorDate, milestone.date));
    const normalizedAnchorDistance = clamp(daysFromAnchor / (totalRange / 86400000), 0, 1);
    const importance = clamp(milestone.importance, 1, 5);

    const orbitRadius = 56 + normalizedTime * 150 + importance * 10;
    const angle = index * goldenAngle + digitSum(milestone.date) * 3.5;
    const { x, y } = polarToCartesian(cx, cy, orbitRadius * (0.68 + normalizedAnchorDistance * 0.32), angle);

    const color = palette.lines[categoryColorIndex[milestone.category] % palette.lines.length];
    const petalsSeed = 8 + (digitSum(milestone.date) % 11);
    const outerRadius = 12 + importance * 4 + (digitSum(milestone.label) % 5);
    const innerRadius = Math.max(4, Math.round(outerRadius * (0.34 + ((index % 3) * 0.06))));
    const offsetRadius = outerRadius * (0.42 + (petalsSeed % 5) * 0.035);
    const rotations = 8 + (petalsSeed % 7) + importance;
    const points = 380;
    const path = buildSpiroPath(x, y, outerRadius, innerRadius, offsetRadius, rotations, points);

    return {
      id: milestone.id,
      x,
      y,
      color,
      strokeWidth: 0.8 + importance * 0.18,
      opacity: 0.55 + importance * 0.08,
      path,
      orbitRadius,
      ringColor: color,
      importance,
    };
  });
}

function ArtworkPreview({
  storyType,
  title,
  subtitle,
  primaryDate,
  milestones,
  palette,
}: {
  storyType: StoryType;
  title: string;
  subtitle: string;
  primaryDate: string;
  milestones: Milestone[];
  palette: Palette;
}) {
  const nodes = useMemo(
    () => generateArtworkNodes(milestones, primaryDate, palette),
    [milestones, primaryDate, palette],
  );

  const faintRings = [110, 170, 230];
  const anchorDigits = primaryDate ? primaryDate.replace(/-/g, ' · ') : '—';

  return (
    <div className="preview-sheet-wrap">
      <div className="frame-mockup">
        <div className="frame-inner-shadow">
          <div className="art-paper" style={{ background: palette.paper }}>
            <div className="art-topline">
              <span>{storyType.toUpperCase()}</span>
              <span>{palette.name.toUpperCase()}</span>
            </div>

            <svg viewBox="0 0 640 640" className="art-svg" aria-label="Generated interpretive artwork preview">
              {faintRings.map((r) => (
                <circle
                  key={r}
                  cx="320"
                  cy="320"
                  r={r}
                  fill="none"
                  stroke={palette.ink}
                  strokeOpacity="0.08"
                  strokeWidth="1"
                />
              ))}

              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.importance * 2.1 + 2}
                    fill={node.color}
                    fillOpacity="0.12"
                  />
                  <path
                    d={node.path}
                    fill="none"
                    stroke={node.color}
                    strokeOpacity={node.opacity}
                    strokeWidth={node.strokeWidth}
                  />
                </g>
              ))}

              <circle cx="320" cy="320" r="3.8" fill={palette.ink} fillOpacity="0.45" />
            </svg>

            <div className="art-center-caption">{anchorDigits}</div>

            <div className="art-title-block">
              <h3>{title || 'Your Milestone Artwork'}</h3>
              <p>{subtitle || 'Your story in dates'}</p>
            </div>

            <div className="milestone-summary">
              <div className="summary-row">
                <span>Anchor Date</span>
                <span>{primaryDate || '—'}</span>
              </div>
              {milestones
                .filter((m) => m.label.trim() && m.date)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((m) => (
                  <div className="summary-row" key={m.id}>
                    <span>{m.label}</span>
                    <span>{m.date}</span>
                  </div>
                ))}
            </div>

            <div className="frame-caption">FLOATING MAPLE FRAME · 20 × 20</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [storyType, setStoryType] = useState<StoryType>('Family Timeline');
  const [title, setTitle] = useState('The Applin Family');
  const [subtitle, setSubtitle] = useState('Our story in dates');
  const [primaryDate, setPrimaryDate] = useState('2010-06-12');
  const [paletteName, setPaletteName] = useState<PaletteName>('Sage & Sand');
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);

  const preset = storyPresets[storyType];
  const palette = palettes[paletteName];

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [milestones],
  );

  function updateMilestone(id: number, patch: Partial<Milestone>) {
    setMilestones((current) => current.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function addMilestone() {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    setMilestones((current) => [
      ...current,
      {
        id: Date.now(),
        label: 'New Milestone',
        date,
        importance: 3,
        category: preset.suggestions[0] ?? 'Other',
      },
    ]);
  }

  function removeMilestone(id: number) {
    setMilestones((current) => current.filter((m) => m.id !== id));
  }

  const totalMilestones = milestones.filter((m) => m.label.trim() && m.date).length;

  return (
    <>
      <style>{`
        :root {
          --bg: #efe6d8;
          --panel: #f8f5ef;
          --card: #fdfbf7;
          --line: #dbcdbc;
          --text: #201815;
          --muted: #6f6258;
          --accent: #201815;
          --gold: #a56f35;
        }
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; min-height: 100%; background: linear-gradient(180deg,#f5f0e8 0%, #eee5d7 100%); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        a { color: inherit; text-decoration: none; }
        .site-shell { min-height: 100vh; }
        .topbar {
          height: 72px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; border-bottom: 1px solid rgba(32,24,21,0.08); background: rgba(255,255,255,0.48);
          backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 5;
        }
        .brand { display:flex; align-items:center; gap: 12px; font-weight: 800; }
        .brand-mark { width: 38px; height: 38px; border-radius: 999px; background:#201815; color:#fff; display:flex; align-items:center; justify-content:center; font-weight: 800; }
        .brand-sub { display:block; font-size: 12px; letter-spacing: 0.16em; color: #6e6257; margin-top: 2px; font-weight: 700; }
        .nav { display:flex; gap: 28px; align-items:center; font-weight: 700; color: #6d6157; }
        .cta { background:#201815; color:#fff; border:none; border-radius: 999px; padding: 14px 24px; font-weight: 800; cursor:pointer; }
        .page { max-width: 1560px; margin: 0 auto; padding: 34px 26px 46px; }
        .back-link { color: #a56f35; font-weight: 800; display:inline-flex; align-items:center; gap:8px; margin-bottom: 18px; }
        .hero-grid { display:grid; grid-template-columns: minmax(760px, 1.2fr) minmax(360px, .8fr); gap: 26px; align-items: start; }
        .eyebrow { font-size: 14px; letter-spacing: .24em; font-weight: 900; color: #7a6959; margin-bottom: 12px; }
        .hero-copy h1 { margin: 0; font-size: clamp(54px, 6vw, 84px); line-height: .92; letter-spacing: -0.05em; max-width: 940px; }
        .hero-copy p { font-size: 18px; line-height: 1.7; color: #6f6258; max-width: 820px; margin: 18px 0 0; }
        .price-card { background: rgba(255,255,255,.76); border: 1px solid rgba(32,24,21,.08); border-radius: 28px; padding: 22px; box-shadow: 0 10px 30px rgba(75, 49, 18, 0.05); }
        .price-card .small { color: #7a6d64; font-size: 14px; margin-bottom: 6px; }
        .price-card h3 { margin: 0 0 12px; font-size: 20px; }
        .price-card .detail { color: #6f6258; margin-bottom: 18px; }
        .price-card .price { font-size: 54px; line-height: 1; font-weight: 900; }
        .content-grid { display:grid; grid-template-columns: minmax(760px, 1.05fr) minmax(360px, .95fr); gap: 26px; align-items: start; margin-top: 22px; }
        .left-col { display:grid; gap: 22px; }
        .tabs { display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .tab { background: rgba(255,255,255,.58); border: 1px solid rgba(32,24,21,.08); border-radius: 999px; padding: 14px 18px; text-align: center; font-weight: 800; color: #7a6c63; }
        .tab.active { background:#201815; color:#fff; }
        .panel { background: rgba(255,255,255,.68); border: 1px solid rgba(32,24,21,.08); border-radius: 30px; padding: 26px; box-shadow: 0 14px 35px rgba(58,39,18,.05); }
        .panel h2 { margin: 0; font-size: 22px; }
        .panel-sub { margin-top: 8px; color:#6f6258; font-size: 16px; }
        .section-index { width: 40px; height: 40px; border-radius: 999px; background:#201815; color:#fff; display:flex; align-items:center; justify-content:center; font-weight: 900; flex: 0 0 auto; }
        .section-header { display:flex; gap: 16px; align-items:flex-start; margin-bottom: 20px; }
        .story-grid { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
        .story-card { border: 1px solid #d7c7b6; border-radius: 20px; padding: 18px; background: #f9f5ed; cursor:pointer; }
        .story-card.active { border-color:#b89163; background:#f5eee2; box-shadow: inset 0 0 0 1px rgba(184,145,99,.35); }
        .story-card strong { display:block; font-size: 16px; margin-bottom: 6px; }
        .story-card span { color:#6f6258; line-height: 1.5; }
        .field-grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .field { display:grid; gap: 8px; }
        .field label { font-size: 14px; color:#6f6258; font-weight: 700; }
        .field input, .field select {
          width:100%; border:1px solid #d9cec4; border-radius: 16px; background:#fff; padding: 14px 16px; font-size:16px; color:#201815;
        }
        .field.full { grid-column: 1 / -1; }
        .milestones-head { display:flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .mini-btn { background:#201815; color:#fff; border:none; border-radius: 999px; padding: 12px 18px; font-weight: 800; cursor:pointer; }
        .milestone-list { display:grid; gap: 14px; }
        .milestone-row {
          display:grid; grid-template-columns: 48px 1.2fr 180px 150px 150px 108px; gap: 12px; align-items:end;
          padding: 14px; border-radius: 22px; background: rgba(241,233,221,.8); border:1px solid rgba(32,24,21,.06);
        }
        .milestone-num { width: 36px; height: 36px; border-radius:999px; background:#eadfce; color:#9a6d37; font-weight:900; display:flex; align-items:center; justify-content:center; margin-bottom: 10px; }
        .remove-btn { border:none; border-radius: 16px; background:#e8dfd3; padding: 14px 12px; font-weight: 800; cursor:pointer; }
        .importance-note { margin-top: 16px; color:#6f6258; font-size: 14px; }
        .preview-panel { background: rgba(255,255,255,.74); border: 1px solid rgba(32,24,21,.08); border-radius: 30px; padding: 18px 18px 22px; position: sticky; top: 92px; }
        .preview-top { display:flex; justify-content: space-between; align-items:end; gap: 10px; margin-bottom: 10px; }
        .preview-top .eyebrow { margin: 0 0 6px; }
        .preview-top .meta { color:#6f6258; font-weight: 700; }
        .preview-price { font-size: 28px; font-weight: 900; }
        .preview-sheet-wrap { padding: 6px 4px 2px; }
        .frame-mockup {
          background: linear-gradient(145deg, #d7b185 0%, #b8844f 42%, #d5ad7d 100%);
          border-radius: 30px; padding: 12px; box-shadow:
            inset 0 0 0 1px rgba(117,72,27,.25),
            inset 0 8px 22px rgba(255,255,255,.26),
            0 18px 45px rgba(83,55,22,.14);
          aspect-ratio: 1 / 1;
        }
        .frame-inner-shadow {
          width: 100%; height: 100%; background: linear-gradient(180deg, rgba(0,0,0,.04), rgba(255,255,255,.04));
          border-radius: 22px; padding: 18px; box-shadow: inset 0 0 0 1px rgba(73,48,24,.14);
        }
        .art-paper {
          width:100%; height:100%; background:#fff; border-radius: 4px; box-shadow:
            0 0 0 16px rgba(255,255,255,.96),
            0 0 0 17px rgba(16,16,16,.04),
            inset 0 0 24px rgba(0,0,0,.02);
          position: relative; overflow: hidden; padding: 28px 26px 22px;
        }
        .art-topline { display:flex; justify-content:space-between; align-items:center; font-size: 14px; letter-spacing: .18em; font-weight: 900; color:#9a6d37; }
        .art-svg { width: 100%; height: calc(100% - 172px); display:block; margin-top: 12px; }
        .art-center-caption { text-align:center; margin-top: -8px; color:#201815; font-size: 18px; letter-spacing: .08em; }
        .art-title-block { text-align:center; margin: 10px 0 14px; }
        .art-title-block h3 { margin:0; font-size: 26px; line-height:1.1; }
        .art-title-block p { margin: 4px 0 0; font-size: 14px; color:#6f6258; }
        .milestone-summary { display:grid; gap: 0; }
        .summary-row { display:grid; grid-template-columns: 1fr auto; gap: 16px; padding: 7px 0; border-bottom:1px solid rgba(32,24,21,.08); font-size: 14px; }
        .summary-row span:first-child { font-weight: 700; }
        .summary-row span:last-child { color:#6f6258; }
        .frame-caption { text-align:center; margin-top: 12px; color:#9a6d37; letter-spacing: .18em; font-size: 14px; font-weight: 900; }
        .explain-box { margin-top: 18px; padding: 16px 18px; background:#f6f1e9; border-radius: 18px; border:1px solid rgba(32,24,21,.06); }
        .explain-box h4 { margin:0 0 10px; font-size: 15px; letter-spacing:.12em; color:#9a6d37; }
        .explain-box ul { margin: 0; padding-left: 20px; color:#6f6258; display:grid; gap: 8px; }

        @media (max-width: 1280px) {
          .hero-grid, .content-grid { grid-template-columns: 1fr; }
          .preview-panel { position: static; }
        }
        @media (max-width: 1040px) {
          .milestone-row { grid-template-columns: 48px 1fr 1fr; }
          .milestone-row .field.full-mobile { grid-column: 2 / -1; }
          .story-grid, .field-grid { grid-template-columns: 1fr; }
          .tabs { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 720px) {
          .topbar { padding: 0 16px; }
          .nav { display:none; }
          .page { padding: 24px 14px 40px; }
          .hero-copy h1 { font-size: 50px; }
          .milestone-row { grid-template-columns: 1fr; }
          .milestone-num { margin-bottom: 0; }
        }
      `}</style>

      <div className="site-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div>
              <div style={{ fontSize: 18 }}>Milestone</div>
              <span className="brand-sub">ART STUDIO</span>
            </div>
          </div>
          <nav className="nav">
            <a href="#">Home</a>
            <a href="#">Collections</a>
            <a href="#">How It Works</a>
            <button className="cta">Start Creating</button>
          </nav>
        </header>

        <main className="page">
          <a className="back-link" href="#">← Back to homepage</a>

          <section className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">ARTWORK BUILDER</div>
              <h1>Create your custom milestone artwork.</h1>
              <p>
                Add the dates and details that shaped the story. The preview updates as you build,
                turning your milestones into interpretive spirograph-inspired artwork influenced by time,
                importance, and milestone type.
              </p>
            </div>

            <aside className="price-card">
              <div className="small">Current piece</div>
              <h3>{storyType}</h3>
              <div className="detail">20 × 20 · Floating Maple Frame</div>
              <div className="price">${preset.price}</div>
            </aside>
          </section>

          <section className="content-grid">
            <div className="left-col">
              <div className="tabs">
                <div className="tab active">Story</div>
                <div className="tab">Dates</div>
                <div className="tab">Style</div>
                <div className="tab">Preview</div>
              </div>

              <section className="panel">
                <div className="section-header">
                  <div className="section-index">1</div>
                  <div>
                    <h2>Choose the story</h2>
                    <div className="panel-sub">Start with the type of artwork. This changes the suggested milestone categories.</div>
                  </div>
                </div>

                <div className="story-grid">
                  {(Object.keys(storyPresets) as StoryType[]).map((type) => (
                    <button
                      key={type}
                      className={`story-card ${storyType === type ? 'active' : ''}`}
                      onClick={() => setStoryType(type)}
                      style={{ textAlign: 'left', border: 'none' }}
                    >
                      <strong>{type}</strong>
                      <span>{storyPresets[type].subtitle}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="section-header">
                  <div className="section-index">2</div>
                  <div>
                    <h2>Name the artwork</h2>
                    <div className="panel-sub">These details appear in the product summary and help personalize the piece.</div>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label>Artwork Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Applin Family" />
                  </div>

                  <div className="field">
                    <label>Subtitle</label>
                    <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Our story in dates" />
                  </div>

                  <div className="field">
                    <label>Anchor Date</label>
                    <input type="date" value={primaryDate} onChange={(e) => setPrimaryDate(e.target.value)} />
                  </div>

                  <div className="field">
                    <label>Color Palette</label>
                    <select value={paletteName} onChange={(e) => setPaletteName(e.target.value as PaletteName)}>
                      {(Object.keys(palettes) as PaletteName[]).map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="section-header">
                  <div className="section-index">3</div>
                  <div>
                    <h2>Add milestone dates</h2>
                    <div className="panel-sub">Each milestone affects the artwork. Time influences placement, importance controls scale, and category drives color behavior.</div>
                  </div>
                </div>

                <div className="milestones-head">
                  <div style={{ color: '#6f6258', fontWeight: 700 }}>{totalMilestones} milestone{totalMilestones === 1 ? '' : 's'} included</div>
                  <button className="mini-btn" onClick={addMilestone}>Add Milestone</button>
                </div>

                <div className="milestone-list">
                  {sortedMilestones.map((milestone, index) => (
                    <div key={milestone.id} className="milestone-row">
                      <div className="milestone-num">{index + 1}</div>

                      <div className="field">
                        <label>Label</label>
                        <input
                          value={milestone.label}
                          onChange={(e) => updateMilestone(milestone.id, { label: e.target.value })}
                          placeholder="Wedding Day"
                        />
                      </div>

                      <div className="field">
                        <label>Date</label>
                        <input
                          type="date"
                          value={milestone.date}
                          onChange={(e) => updateMilestone(milestone.id, { date: e.target.value })}
                        />
                      </div>

                      <div className="field">
                        <label>Importance</label>
                        <select
                          value={milestone.importance}
                          onChange={(e) => updateMilestone(milestone.id, { importance: Number(e.target.value) })}
                        >
                          <option value={1}>1 · Small</option>
                          <option value={2}>2 · Meaningful</option>
                          <option value={3}>3 · Important</option>
                          <option value={4}>4 · Major</option>
                          <option value={5}>5 · Life-changing</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>Category</label>
                        <select
                          value={milestone.category}
                          onChange={(e) => updateMilestone(milestone.id, { category: e.target.value as MilestoneCategory })}
                        >
                          {(Object.keys(categoryLabelMap) as MilestoneCategory[]).map((category) => (
                            <option key={category} value={category}>{categoryLabelMap[category]}</option>
                          ))}
                        </select>
                      </div>

                      <button className="remove-btn" onClick={() => removeMilestone(milestone.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="importance-note">
                  Tip: use <strong>Importance</strong> to tell the system how visually dominant a milestone should feel in the artwork.
                </div>
              </section>
            </div>

            <aside className="preview-panel">
              <div className="preview-top">
                <div>
                  <div className="eyebrow">ARTWORK PREVIEW</div>
                  <div className="meta">20 × 20 · Floating Maple Frame</div>
                </div>
                <div className="preview-price">${preset.price}</div>
              </div>

              <ArtworkPreview
                storyType={storyType}
                title={title}
                subtitle={subtitle}
                primaryDate={primaryDate}
                milestones={milestones}
                palette={palette}
              />

              <div className="explain-box">
                <h4>HOW THE ART IS GENERATED</h4>
                <ul>
                  <li><strong>Date:</strong> affects where each form sits in the composition.</li>
                  <li><strong>Importance:</strong> affects size, density, and prominence.</li>
                  <li><strong>Category:</strong> affects the line color used for that milestone.</li>
                  <li><strong>Anchor date:</strong> acts as the center point the overall composition responds to.</li>
                </ul>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </>
  );
}
