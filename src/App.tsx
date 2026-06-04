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

const milestoneOptions: Array<{ label: string; category: MilestoneCategory; defaultImportance: number }> = [
  { label: 'Wedding Day', category: 'Wedding', defaultImportance: 5 },
  { label: 'Anniversary', category: 'Wedding', defaultImportance: 4 },
  { label: 'Engagement', category: 'Wedding', defaultImportance: 4 },
  { label: 'First Date', category: 'Wedding', defaultImportance: 3 },
  { label: 'Birth', category: 'Baby', defaultImportance: 5 },
  { label: 'New Baby', category: 'Baby', defaultImportance: 5 },
  { label: 'First Birthday', category: 'Baby', defaultImportance: 4 },
  { label: 'First Home', category: 'Home', defaultImportance: 4 },
  { label: 'Move-In Day', category: 'Home', defaultImportance: 4 },
  { label: 'New Home', category: 'Home', defaultImportance: 4 },
  { label: 'Graduation', category: 'Personal', defaultImportance: 4 },
  { label: 'Career Milestone', category: 'Personal', defaultImportance: 3 },
  { label: 'Retirement', category: 'Personal', defaultImportance: 4 },
  { label: 'Family Vacation', category: 'Family', defaultImportance: 3 },
  { label: 'Family Reunion', category: 'Family', defaultImportance: 3 },
  { label: 'Memorial', category: 'Family', defaultImportance: 5 },
  { label: 'Major Achievement', category: 'Personal', defaultImportance: 4 },
  { label: 'Custom Milestone', category: 'Other', defaultImportance: 3 },
];

function getMilestoneOption(label: string) {
  return milestoneOptions.find((option) => option.label === label) ?? milestoneOptions[milestoneOptions.length - 1];
}

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

function buildRosettePath(
  cx: number,
  cy: number,
  radius: number,
  amplitude: number,
  petals: number,
  twist: number,
  points = 720,
) {
  const commands: string[] = [];

  for (let i = 0; i <= points; i += 1) {
    const t = (Math.PI * 2 * i) / points;
    const wobble =
      Math.sin(t * petals + twist) * amplitude +
      Math.cos(t * (petals + 5) - twist) * amplitude * 0.28;
    const r = radius + wobble;
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;

    commands.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return `${commands.join(' ')} Z`;
}

function buildSpiroFlowerPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  lobeRadius: number,
  rotations: number,
  points = 920,
) {
  const commands: string[] = [];

  for (let i = 0; i <= points; i += 1) {
    const t = (Math.PI * 2 * rotations * i) / points;
    const ratio = (outerRadius - innerRadius) / Math.max(innerRadius, 1);
    const x =
      cx +
      (outerRadius - innerRadius) * Math.cos(t) +
      lobeRadius * Math.cos(ratio * t);
    const y =
      cy +
      (outerRadius - innerRadius) * Math.sin(t) -
      lobeRadius * Math.sin(ratio * t);

    commands.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return commands.join(' ');
}

function labelDigitSeed(label: string, date: string) {
  return digitSum(`${label}${date}`) || 8;
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
    return {
      guideRings: [] as Array<{ cx: number; cy: number; r: number; color: string; opacity: number }>,
      blooms: [] as Array<{
        id: number;
        x: number;
        y: number;
        color: string;
        strokeWidth: number;
        opacity: number;
        mainPath: string;
        innerPath: string;
        rotate: number;
        importance: number;
      }>,
      connectorPath: '',
    };
  }

  const dates = [anchorDate, ...validMilestones.map((m) => m.date)].map((date) =>
    new Date(date + 'T00:00:00').getTime(),
  );
  const minTime = Math.min(...dates);
  const maxTime = Math.max(...dates);
  const totalRange = Math.max(maxTime - minTime, 86400000 * 30);
  const anchorSeed = digitSum(anchorDate);

  const centerX = 320;
  const centerY = 316;
  const goldenAngle = 137.507764;

  const basePositions = [
    { x: 430, y: 222, scale: 1.55 }, // dominant upper-right bloom
    { x: 220, y: 345, scale: 1.25 }, // dark left bloom
    { x: 436, y: 422, scale: 0.96 }, // warm lower-right bloom
    { x: 338, y: 366, scale: 0.84 }, // pale center bloom
    { x: 284, y: 280, scale: 0.74 }, // light bridge bloom
    { x: 506, y: 326, scale: 0.66 }, // outer accent
    { x: 168, y: 248, scale: 0.68 }, // far-left accent
  ];

  const blooms = validMilestones.map((milestone, index) => {
    const time = new Date(milestone.date + 'T00:00:00').getTime();
    const normalizedTime = clamp((time - minTime) / totalRange, 0, 1);
    const importance = clamp(milestone.importance, 1, 5);
    const seed = labelDigitSeed(milestone.label, milestone.date);
    const base = basePositions[index % basePositions.length];

    const spiralDrift = (normalizedTime - 0.5) * 78;
    const angle = index * goldenAngle + seed * 4.7 + anchorSeed;
    const dateNudge = polarToCartesian(0, 0, 20 + normalizedTime * 34, angle);

    const x = base.x + dateNudge.x + Math.cos(index + anchorSeed) * spiralDrift * 0.32;
    const y = base.y + dateNudge.y + Math.sin(index * 1.7 + anchorSeed) * spiralDrift * 0.26;

    const color = palette.lines[categoryColorIndex[milestone.category] % palette.lines.length];

    const outerRadius = (24 + importance * 8 + (seed % 9)) * base.scale;
    const innerRadius = Math.max(8, outerRadius * (0.38 + (seed % 4) * 0.035));
    const lobeRadius = outerRadius * (0.42 + importance * 0.035);
    const rotations = 8 + importance * 2 + (seed % 7);

    const rosetteRadius = outerRadius * (0.74 + (seed % 3) * 0.05);
    const amplitude = outerRadius * (0.16 + importance * 0.018);
    const petals = 9 + (seed % 18);

    return {
      id: milestone.id,
      x,
      y,
      color,
      strokeWidth: 0.72 + importance * 0.16,
      opacity: 0.48 + importance * 0.075,
      mainPath: buildSpiroFlowerPath(x, y, outerRadius, innerRadius, lobeRadius, rotations),
      innerPath: buildRosettePath(x, y, rosetteRadius, amplitude, petals, seed / 7),
      rotate: (seed * 19 + normalizedTime * 110) % 360,
      importance,
    };
  });

  const connectorPath = blooms
    .map((bloom, index) => `${index === 0 ? 'M' : 'L'} ${bloom.x.toFixed(2)} ${bloom.y.toFixed(2)}`)
    .join(' ');

  const guideRings = [
    { cx: centerX - 24, cy: centerY + 4, r: 132, color: palette.lines[3], opacity: 0.14 },
    { cx: centerX + 16, cy: centerY - 22, r: 214, color: palette.lines[3], opacity: 0.11 },
    { cx: centerX + 6, cy: centerY - 18, r: 318, color: palette.lines[3], opacity: 0.085 },
    { cx: centerX + 64, cy: centerY - 20, r: 89, color: palette.lines[0], opacity: 0.12 },
  ];

  return { guideRings, blooms, connectorPath };
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
  const artwork = useMemo(
    () => generateArtworkNodes(milestones, primaryDate, palette),
    [milestones, primaryDate, palette],
  );

  return (
    <div className="preview-sheet-wrap">
      <div className="frame-mockup">
        <div className="frame-inner-shadow">
          <div className="art-paper" style={{ background: palette.paper }}>
            <svg viewBox="0 0 640 640" className="art-svg full-art-svg" aria-label="Generated interpretive artwork preview">
              <rect x="0" y="0" width="640" height="640" fill="#ffffff" />

              {artwork.guideRings.map((ring, index) => (
                <circle
                  key={`ring-${index}`}
                  cx={ring.cx}
                  cy={ring.cy}
                  r={ring.r}
                  fill="none"
                  stroke={ring.color}
                  strokeOpacity={ring.opacity}
                  strokeWidth="1"
                />
              ))}

              {artwork.connectorPath && (
                <path
                  d={artwork.connectorPath}
                  fill="none"
                  stroke={palette.ink}
                  strokeOpacity="0.18"
                  strokeWidth="1.2"
                  strokeDasharray="7 13"
                />
              )}

              {artwork.blooms
                .slice()
                .sort((a, b) => a.importance - b.importance)
                .map((node) => (
                  <g key={node.id} transform={`rotate(${node.rotate} ${node.x} ${node.y})`}>
                    <path
                      d={node.mainPath}
                      fill="none"
                      stroke={node.color}
                      strokeOpacity={node.opacity}
                      strokeWidth={node.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={node.innerPath}
                      fill="none"
                      stroke={node.color}
                      strokeOpacity={Math.max(0.32, node.opacity - 0.22)}
                      strokeWidth={Math.max(0.6, node.strokeWidth - 0.25)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx={node.x} cy={node.y} r={2.4 + node.importance * 0.45} fill={node.color} fillOpacity="0.62" />
                  </g>
                ))}
            </svg>
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

  function updateMilestoneLabel(id: number, label: string) {
    const selected = getMilestoneOption(label);

    setMilestones((current) =>
      current.map((m) =>
        m.id === id
          ? {
              ...m,
              label,
              category: selected.category,
              importance: selected.defaultImportance,
            }
          : m,
      ),
    );
  }

  function addMilestone() {
    const today = new Date();
    const date = today.toISOString().slice(0, 10);
    setMilestones((current) => [
      ...current,
      {
        id: Date.now(),
        label: 'Custom Milestone',
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
          border-radius: 18px; padding: 10px; box-shadow:
            inset 0 0 0 1px rgba(117,72,27,.25),
            inset 0 8px 22px rgba(255,255,255,.26),
            0 18px 45px rgba(83,55,22,.14);
          aspect-ratio: 1 / 1;
        }
        .frame-inner-shadow {
          width: 100%; height: 100%; background: linear-gradient(180deg, rgba(0,0,0,.04), rgba(255,255,255,.04));
          border-radius: 12px; padding: 16px; box-shadow: inset 0 0 0 1px rgba(73,48,24,.14);
        }
        .art-paper {
          width:100%; height:100%; background:#fff; border-radius: 2px; box-shadow:
            0 0 0 16px rgba(255,255,255,.96),
            0 0 0 17px rgba(16,16,16,.04),
            inset 0 0 24px rgba(0,0,0,.02);
          position: relative; overflow: hidden; padding: 0;
        }
        .art-topline { display:flex; justify-content:space-between; align-items:center; font-size: 14px; letter-spacing: .18em; font-weight: 900; color:#9a6d37; }
        .art-svg { width: 100%; height: 100%; display:block; margin: 0; }
        .full-art-svg { background: #ffffff; }
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
                    <div className="panel-sub">Each milestone affects the artwork. Time influences placement, importance controls scale, and milestone type drives color behavior.</div>
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
                        <label>Milestone</label>
                        <select
                          value={milestone.label}
                          onChange={(e) => updateMilestoneLabel(milestone.id, e.target.value)}
                        >
                          {milestoneOptions.map((option) => (
                            <option key={option.label} value={option.label}>
                              {option.label}
                            </option>
                          ))}
                        </select>
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
                  <li><strong>Milestone type:</strong> affects the line color used for that moment.</li>
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
