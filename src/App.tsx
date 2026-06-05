import React, { useMemo, useState } from "react";

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

const TRADITION_WEIGHT: Record<MilestoneType, number> = {
  birth: 9,
  firstDate: 5,
  engagement: 7,
  marriage: 10,
  child: 10,
  home: 7,
  anniversary10: 8,
  anniversary20: 9,
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
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

function SpiroBloom({
  cx,
  cy,
  size,
  color,
  type,
  date,
}: {
  cx: number;
  cy: number;
  size: number;
  color: string;
  type: MilestoneType;
  date: string;
}) {
  const { day } = dateParts(date);
  const seed = sumDigits(date);
  const petals = Math.max(8, Math.min(32, day + (seed % 8)));
  const layers =
    type === "marriage"
      ? 7
      : type === "child"
      ? 5
      : type.includes("anniversary")
      ? 6
      : 4;

  return (
    <g>
      {Array.from({ length: layers }).map((_, layer) => {
        let d = "";
        const points = 900;
        const amp = size * (0.28 + layer * 0.025);
        const rotation = layer * 17 + seed * 2;

        for (let i = 0; i <= points; i++) {
          const t = (Math.PI * 2 * i) / points;
          const r =
            amp *
            (1 +
              0.34 * Math.sin(petals * t) +
              0.08 * Math.cos((seed % 13) * t));

          const x = cx + r * Math.cos(t + rotation);
          const y = cy + r * Math.sin(t + rotation);

          d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
        }

        return (
          <path
            key={layer}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={0.65}
            opacity={0.62 - layer * 0.06}
          />
        );
      })}

      {type === "marriage" && (
        <>
          <circle
            cx={cx - size * 0.16}
            cy={cy}
            r={size * 0.28}
            fill="none"
            stroke={color}
            opacity="0.38"
          />
          <circle
            cx={cx + size * 0.16}
            cy={cy}
            r={size * 0.28}
            fill="none"
            stroke={color}
            opacity="0.38"
          />
        </>
      )}

      {type === "home" && (
        <path
          d={`M ${cx - size * 0.18} ${cy + size * 0.1}
              L ${cx - size * 0.18} ${cy - size * 0.08}
              L ${cx} ${cy - size * 0.24}
              L ${cx + size * 0.18} ${cy - size * 0.08}
              L ${cx + size * 0.18} ${cy + size * 0.1}
              Z`}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.55"
        />
      )}

      <circle cx={cx} cy={cy} r={Math.max(2.5, size * 0.025)} fill={color} />
    </g>
  );
}

function generateArtwork(milestones: Milestone[]) {
  const valid = milestones
    .filter((m) => m.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!valid.length) return [];

  const marriageIndex = valid.findIndex((m) => m.type === "marriage");
  const centerIndex =
    marriageIndex >= 0 ? marriageIndex : Math.floor(valid.length / 2);

  const centerTime = new Date(valid[centerIndex].date).getTime();

  const goldenAngle = 137.507764;
  const centerX = 500;
  const centerY = 500;

  return valid.map((m, index) => {
    const parts = dateParts(m.date);

    const gapYears =
      Math.abs(new Date(m.date).getTime() - centerTime) /
      (1000 * 60 * 60 * 24 * 365.25);

    const fibRadius = nearestFib(Math.round(gapYears * 18 + 34));
    const radius = m.type === "marriage" ? 0 : Math.min(fibRadius * 0.72, 360);
    const angle = ((index + 1) * goldenAngle * Math.PI) / 180;

    const tradition = TRADITION_WEIGHT[m.type];
    const dateSignature = nearestFib(sumDigits(m.date));

    return {
      ...m,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      size:
        m.type === "marriage"
          ? 245
          : Math.min(205, 58 + tradition * 9 + dateSignature * 0.45),
      color: MONTH_COLORS[parts.month - 1],
    };
  });
}

export default function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: crypto.randomUUID(), type: "birth", date: "" },
  ]);

  const artwork = useMemo(() => generateArtwork(milestones), [milestones]);

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "birth", date: "" },
    ]);
  }

  function updateMilestone(id: string, patch: Partial<Milestone>) {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  }

  function removeMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f5efe6;
          color: #231b17;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .app {
          display: grid;
          grid-template-columns: minmax(420px, 560px) 1fr;
          gap: 48px;
          padding: 48px;
          min-height: 100vh;
        }

        .controls h1 {
          font-size: 42px;
          margin: 0 0 12px;
        }

        .controls p {
          font-size: 18px;
          line-height: 1.45;
          color: #6e6258;
          margin-bottom: 36px;
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .milestone-header button,
        .remove {
          border: 0;
          border-radius: 999px;
          background: #211814;
          color: white;
          font-weight: 700;
          padding: 14px 24px;
          cursor: pointer;
        }

        .milestone-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .milestone-row {
          display: grid;
          grid-template-columns: 54px 1fr 1.4fr auto;
          gap: 20px;
          align-items: center;
          background: #eee6da;
          border: 1px solid #ded4c5;
          border-radius: 24px;
          padding: 22px;
        }

        .number {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #e1d1b8;
          display: grid;
          place-items: center;
          color: #a67534;
          font-weight: 800;
          font-size: 22px;
        }

        label {
          display: flex;
          flex-direction: column;
          font-weight: 800;
          color: #6b5f55;
          gap: 8px;
        }

        select,
        input {
          font-size: 18px;
          border-radius: 14px;
          border: 1px solid #d2c7b8;
          padding: 12px 14px;
          background: white;
        }

        .remove {
          background: #e1d8ca;
          color: #2a211d;
        }

        .preview-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #d9d9d4;
          padding: 48px;
        }

        .maple-frame {
          width: min(78vh, 760px);
          aspect-ratio: 1 / 1;
          padding: 18px;
          border-radius: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,.28), rgba(0,0,0,.10)),
            repeating-linear-gradient(
              90deg,
              #d7a870 0px,
              #e2b97f 7px,
              #c9935b 14px,
              #e6c089 22px
            );
          box-shadow:
            18px 24px 34px rgba(0,0,0,.22),
            inset 0 0 0 1px rgba(91,55,28,.32),
            inset 0 0 0 3px rgba(255,255,255,.18);
        }

        .black-reveal {
          width: 100%;
          height: 100%;
          background: #171412;
          padding: 7px;
          border-radius: 0;
          box-shadow: inset 0 0 8px rgba(0,0,0,.75);
        }

        .paper-border {
          width: 100%;
          height: 100%;
          background: #f8f5ee;
          padding: 42px;
          border-radius: 0;
          box-shadow:
            inset 0 0 0 1px rgba(0,0,0,.08),
            inset 0 0 18px rgba(0,0,0,.04);
        }

        .artwork {
          width: 100%;
          height: 100%;
          display: block;
          background: #f3eee4;
          border-radius: 0;
        }

        @media (max-width: 1100px) {
          .app {
            grid-template-columns: 1fr;
          }

          .preview-wrap {
            padding: 28px;
          }
        }
      `}</style>

      <main className="app">
        <section className="controls">
          <h1>Add milestone dates</h1>
          <p>
            Each date becomes one unique bloom. The system automatically
            calculates scale, shape, color, and placement using milestone
            tradition, Fibonacci spacing, and golden-angle positioning.
          </p>

          <div className="milestone-header">
            <strong>{milestones.length} milestones included</strong>
            <button onClick={addMilestone}>Add Milestone</button>
          </div>

          <div className="milestone-list">
            {milestones.map((m, index) => (
              <div className="milestone-row" key={m.id}>
                <div className="number">{index + 1}</div>

                <label>
                  Milestone
                  <select
                    value={m.type}
                    onChange={(e) =>
                      updateMilestone(m.id, {
                        type: e.target.value as MilestoneType,
                      })
                    }
                  >
                    {Object.entries(EVENT_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Date
                  <input
                    type="date"
                    value={m.date}
                    onChange={(e) =>
                      updateMilestone(m.id, { date: e.target.value })
                    }
                  />
                </label>

                <button className="remove" onClick={() => removeMilestone(m.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="preview-wrap">
          <div className="maple-frame">
            <div className="black-reveal">
              <div className="paper-border">
                <svg viewBox="0 0 1000 1000" className="artwork">
                  <rect width="1000" height="1000" fill="#f3eee4" />

                  {artwork.length === 0 ? (
                    <text
                      x="500"
                      y="500"
                      textAnchor="middle"
                      fill="#a89d8c"
                      fontSize="24"
                      fontFamily="serif"
                    >
                      Add milestone dates to create your artwork
                    </text>
                  ) : (
                    <>
                      <g opacity="0.12">
                        {[55, 89, 144, 233, 377].map((r) => (
                          <circle
                            key={r}
                            cx="500"
                            cy="500"
                            r={r}
                            fill="none"
                            stroke="#b69a5f"
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
                        strokeWidth="1"
                        opacity="0.22"
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
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
