import React, { useMemo, useState } from "react";
import "./App.css";

type MilestoneType =
  | "birth"
  | "firstDate"
  | "engagement"
  | "marriage"
  | "child"
  | "home"
  | "anniversary10"
  | "anniversary20";

type Milestone = {
  id: string;
  type: MilestoneType;
  date: string;
  importance: number;
};

const EVENT_LABELS: Record<MilestoneType, string> = {
  birth: "Birth",
  firstDate: "First Date",
  engagement: "Engagement",
  marriage: "Marriage",
  child: "Child",
  home: "Home Purchase",
  anniversary10: "10th Anniversary",
  anniversary20: "20th Anniversary",
};

const MONTH_COLORS = [
  "#1f4e79",
  "#7b5ea7",
  "#6b8f71",
  "#a8b86f",
  "#d6aa3f",
  "#c97932",
  "#b85b45",
  "#c47757",
  "#426f73",
  "#b8893b",
  "#8f4e3f",
  "#b9aa8d",
];

const FIB = [13, 21, 34, 55, 89, 144, 233, 377, 610];

function sumDigits(value: string) {
  return value
    .replace(/\D/g, "")
    .split("")
    .reduce((sum, n) => sum + Number(n), 0);
}

function nearestFib(n: number) {
  return FIB.reduce((prev, curr) =>
    Math.abs(curr - n) < Math.abs(prev - n) ? curr : prev
  );
}

function dateParts(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    dateObj: d,
  };
}

function getShapeFamily(type: MilestoneType) {
  switch (type) {
    case "marriage":
      return "union";
    case "engagement":
      return "rings";
    case "child":
      return "nested";
    case "home":
      return "home";
    case "anniversary10":
    case "anniversary20":
      return "halo";
    default:
      return "bloom";
  }
}

function SpiroBloom({
  cx,
  cy,
  size,
  color,
  type,
  date,
  opacity = 0.74,
}: {
  cx: number;
  cy: number;
  size: number;
  color: string;
  type: MilestoneType;
  date: string;
  opacity?: number;
}) {
  const { day } = dateParts(date);
  const seed = sumDigits(date);
  const family = getShapeFamily(type);

  const petals = Math.max(7, Math.min(28, day + (seed % 9)));
  const loops = family === "halo" ? 4 : family === "union" ? 5 : 3;
  const points = 900;

  const paths = Array.from({ length: loops }).map((_, layer) => {
    const rot = (layer * 360) / loops + seed * 3;
    const amp = size * (0.34 + layer * 0.035);
    const wobble = family === "rings" ? 0.42 : family === "home" ? 0.22 : 0.32;
    let d = "";

    for (let i = 0; i <= points; i++) {
      const t = (Math.PI * 2 * i) / points;
      const r =
        amp *
        (1 +
          wobble * Math.sin(petals * t) +
          0.09 * Math.cos((seed % 11 + 3) * t));
      const x = cx + r * Math.cos(t + (rot * Math.PI) / 180);
      const y = cy + r * Math.sin(t + (rot * Math.PI) / 180);
      d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    }

    return (
      <path
        key={layer}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={family === "home" ? 0.85 : 0.65}
        opacity={opacity - layer * 0.08}
      />
    );
  });

  return (
    <g>
      {paths}

      {family === "union" && (
        <>
          <circle
            cx={cx - size * 0.17}
            cy={cy}
            r={size * 0.31}
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.45"
          />
          <circle
            cx={cx + size * 0.17}
            cy={cy}
            r={size * 0.31}
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.45"
          />
        </>
      )}

      {family === "home" && (
        <g opacity="0.65">
          <path
            d={`M ${cx - size * 0.18} ${cy + size * 0.12}
                L ${cx - size * 0.18} ${cy - size * 0.08}
                L ${cx} ${cy - size * 0.24}
                L ${cx + size * 0.18} ${cy - size * 0.08}
                L ${cx + size * 0.18} ${cy + size * 0.12}
                Z`}
            fill="none"
            stroke={color}
            strokeWidth="1.1"
          />
        </g>
      )}

      <circle cx={cx} cy={cy} r={Math.max(2.5, size * 0.035)} fill={color} />
    </g>
  );
}

function generateArtwork(milestones: Milestone[]) {
  const valid = milestones
    .filter((m) => m.date)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

  if (!valid.length) return [];

  const marriageIndex = valid.findIndex((m) => m.type === "marriage");
  const centerIndex = marriageIndex >= 0 ? marriageIndex : Math.floor(valid.length / 2);
  const centerDate = new Date(valid[centerIndex].date).getTime();

  const goldenAngle = 137.507764;
  const cx = 500;
  const cy = 500;

  return valid.map((m, i) => {
    const parts = dateParts(m.date);
    const monthColor = MONTH_COLORS[parts.month - 1];

    const gapYears =
      Math.abs(new Date(m.date).getTime() - centerDate) /
      (1000 * 60 * 60 * 24 * 365.25);

    const radiusBase = nearestFib(Math.max(13, Math.round(gapYears * 18 + 34)));
    const radius = m.type === "marriage" ? 0 : Math.min(radiusBase * 0.72, 360);

    const angle = ((i + 1) * goldenAngle * Math.PI) / 180;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    const dateSignature = sumDigits(m.date);
    const size =
      m.type === "marriage"
        ? 260
        : Math.min(210, 72 + nearestFib(dateSignature) * 0.8 + m.importance * 8);

    return {
      ...m,
      x,
      y,
      size,
      color: monthColor,
      ringRadius: radius,
    };
  });
}

export default function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: crypto.randomUUID(), type: "birth", date: "", importance: 6 },
  ]);

  const artwork = useMemo(() => generateArtwork(milestones), [milestones]);

  function updateMilestone(id: string, patch: Partial<Milestone>) {
    setMilestones((items) =>
      items.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }

  function addMilestone() {
    setMilestones((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        type: "birth",
        date: "",
        importance: 6,
      },
    ]);
  }

  function removeMilestone(id: string) {
    setMilestones((items) => items.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#f4efe7] text-[#27231d]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[420px_1fr]">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight">
            Milestone Studio
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Enter life events. Each date creates one unique bloom using
            Fibonacci placement, golden-angle spacing, and Spirograph geometry.
          </p>

          <div className="mt-6 space-y-4">
            {milestones.map((m, index) => (
              <div
                key={m.id}
                className="rounded-2xl border border-neutral-200 bg-[#faf8f3] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Milestone {index + 1}
                  </span>
                  <button
                    onClick={() => removeMilestone(m.id)}
                    className="text-xs text-neutral-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <label className="text-xs text-neutral-500">Type</label>
                <select
                  value={m.type}
                  onChange={(e) =>
                    updateMilestone(m.id, {
                      type: e.target.value as MilestoneType,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                >
                  {Object.entries(EVENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <label className="mt-3 block text-xs text-neutral-500">
                  Date
                </label>
                <input
                  type="date"
                  value={m.date}
                  onChange={(e) =>
                    updateMilestone(m.id, { date: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm"
                />

                <label className="mt-3 block text-xs text-neutral-500">
                  Importance
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={m.importance}
                  onChange={(e) =>
                    updateMilestone(m.id, {
                      importance: Number(e.target.value),
                    })
                  }
                  className="mt-2 w-full"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addMilestone}
            className="mt-5 w-full rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white hover:bg-[#111827]"
          >
            Add Milestone
          </button>
        </section>

        <section className="flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-[820px] rounded-[28px] bg-[#f8f3e9] p-6 shadow-xl">
            <div className="absolute inset-0 rounded-[28px] border-[18px] border-[#c79b68]" />
            <div className="absolute inset-[30px] rounded-[16px] border border-black/20" />

            <svg
              viewBox="0 0 1000 1000"
              className="relative z-10 h-full w-full"
            >
              <rect width="1000" height="1000" fill="#f7f1e6" />

              {artwork.length === 0 ? (
                <text
                  x="500"
                  y="500"
                  textAnchor="middle"
                  fill="#9a8f7d"
                  fontSize="24"
                  fontFamily="serif"
                >
                  Add milestone dates to create artwork
                </text>
              ) : (
                <>
                  <g opacity="0.24">
                    {[55, 89, 144, 233, 377].map((r) => (
                      <circle
                        key={r}
                        cx="500"
                        cy="500"
                        r={r}
                        fill="none"
                        stroke="#bda46a"
                        strokeWidth="0.7"
                      />
                    ))}
                  </g>

                  <path
                    d={artwork
                      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#b9903c"
                    strokeWidth="1.25"
                    opacity="0.36"
                  />

                  {artwork.map((p) => (
                    <SpiroBloom
                      key={p.id}
                      cx={p.x}
                      cy={p.y}
                      size={p.size}
                      color={p.color}
                      type={p.type}
                      date={p.date}
                    />
                  ))}
                </>
              )}
            </svg>
          </div>
        </section>
      </div>
    </div>
  );
}
