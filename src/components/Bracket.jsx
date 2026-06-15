import { useState, useEffect } from "react";
import { fetchGroupsForBracket } from "../data/api";
import { teamFacts } from "../data/teamFacts";

// Layout constants
const SLOT_H  = 72;   // height of one R32 slot (px)
const CARD_W  = 142;  // match card width
const CARD_H  = 54;   // match card height (2 teams)
const CON_W   = 18;   // connector column width between rounds
const LINE     = "rgba(255,255,255,0.22)";

// 2026 WC bracket seedings — FIFA pre-set group matchup pairings
// Left half of bracket (matches 1–8)
const LEFT_SEEDS = [
  { home: { g: "A", p: 1 }, away: { g: "B", p: 2 } },
  { home: { g: "B", p: 1 }, away: { g: "A", p: 2 } },
  { home: { g: "C", p: 1 }, away: { g: "D", p: 2 } },
  { home: { g: "D", p: 1 }, away: { g: "C", p: 2 } },
  { home: { g: "E", p: 1 }, away: { g: "F", p: 2 } },
  { home: { g: "F", p: 1 }, away: { g: "E", p: 2 } },
  { home: { g: "G", p: 1 }, away: { g: "H", p: 2 } },
  { home: { g: "H", p: 1 }, away: { g: "G", p: 2 } },
];

// Right half (matches 9–12 known; 13–16 are best 3rd-place teams — TBD)
const RIGHT_SEEDS = [
  { home: { g: "I", p: 1 }, away: { g: "J", p: 2 } },
  { home: { g: "J", p: 1 }, away: { g: "I", p: 2 } },
  { home: { g: "K", p: 1 }, away: { g: "L", p: 2 } },
  { home: { g: "L", p: 1 }, away: { g: "K", p: 2 } },
  { tbd: "Best 3rd" },
  { tbd: "Best 3rd" },
  { tbd: "Best 3rd" },
  { tbd: "Best 3rd" },
];

// ── Compact team row inside a match card ──────────────────────────────────────
function TeamRow({ team, tbd }) {
  const rank = team && teamFacts[team.abbreviation]?.fifaRank;
  if (tbd) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
        <span className="text-xs text-white/25 flex-1 italic">TBD</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {team?.logo
        ? <img src={team.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
        : <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />}
      <span className="text-xs font-medium text-white/90 flex-1 truncate">
        {team?.abbreviation ?? "TBD"}
      </span>
      {rank && <span className="text-[10px] text-yellow-400/60">#{rank}</span>}
    </div>
  );
}

// ── Single match card ─────────────────────────────────────────────────────────
function MatchCard({ homeTeam, awayTeam, isTbd, label }) {
  if (isTbd) {
    return (
      <div
        style={{ width: CARD_W, height: CARD_H }}
        className="rounded-lg border border-dashed border-white/15 bg-white/3 flex items-center justify-center"
      >
        <span className="text-[10px] text-white/25 italic">{label ?? "TBD"}</span>
      </div>
    );
  }
  const homeRank = (homeTeam && teamFacts[homeTeam.abbreviation]?.fifaRank) ?? 999;
  const awayRank = (awayTeam && teamFacts[awayTeam.abbreviation]?.fifaRank) ?? 999;
  const hasFavorite = homeTeam && awayTeam;
  const favoriteIsHome = homeRank < awayRank;

  return (
    <div style={{ width: CARD_W, height: CARD_H }}
      className="rounded-lg border border-white/20 bg-[#0d2044] overflow-hidden"
    >
      <div className={hasFavorite && favoriteIsHome ? "bg-yellow-400/10" : ""}>
        <TeamRow team={homeTeam} />
      </div>
      <div className="border-t border-white/10" />
      <div className={hasFavorite && !favoriteIsHome ? "bg-yellow-400/10" : ""}>
        <TeamRow team={awayTeam} />
      </div>
    </div>
  );
}

// ── One column of matches in a round ─────────────────────────────────────────
// slotH = vertical height allocated per match in this round
// each match card is centered in its slot
function RoundColumn({ matches, slotH, label }) {
  return (
    <div style={{ width: CARD_W }}>
      {label && (
        <div className="text-center text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1"
          style={{ height: 16 }}>
          {label}
        </div>
      )}
      <div style={{ position: "relative", height: slotH * matches.length }}>
        {matches.map((m, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * slotH + (slotH - CARD_H) / 2,
              left: 0,
            }}
          >
            <MatchCard
              homeTeam={m?.home}
              awayTeam={m?.away}
              isTbd={!m || m.tbd != null}
              label={m?.tbd ?? (m ? undefined : "Winner")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SVG connector between two adjacent round columns ─────────────────────────
// leftCount = number of matches in the LEFT round (higher count)
// rightCount = number of matches in the RIGHT round (half of left)
// slotH = slot height of the LEFT round
// side: "left" = connectors go right (standard); "right" = connectors go left (mirrored bracket)
function Connector({ leftCount, slotH, side = "left", label }) {
  const totalH = leftCount * slotH;
  const rightCount = leftCount / 2;

  return (
    <div style={{ width: CON_W, position: "relative" }}>
      {label && <div style={{ height: 16 }} />}
      <svg
        width={CON_W}
        height={totalH}
        style={{ display: "block", overflow: "visible" }}
      >
        {Array.from({ length: rightCount }).map((_, i) => {
          const topY   = (i * 2 + 0.5) * slotH;       // center of upper match
          const botY   = (i * 2 + 1.5) * slotH;       // center of lower match
          const midY   = (topY + botY) / 2;            // center of next-round match
          const vx     = side === "left" ? 0 : CON_W; // vertical line x
          const hxEnd  = side === "left" ? CON_W : 0; // horizontal end x

          return (
            <g key={i}>
              {/* Horizontal line from top match to vertical spine */}
              <line x1={vx} y1={topY} x2={hxEnd} y2={topY} stroke={LINE} strokeWidth={1.5} />
              {/* Horizontal line from bottom match to vertical spine */}
              <line x1={vx} y1={botY} x2={hxEnd} y2={botY} stroke={LINE} strokeWidth={1.5} />
              {/* Vertical spine connecting the two */}
              <line x1={hxEnd} y1={topY} x2={hxEnd} y2={botY} stroke={LINE} strokeWidth={1.5} />
              {/* Horizontal line to next round */}
              <line x1={vx} y1={midY} x2={hxEnd} y2={midY} stroke={LINE} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Final match in center ────────────────────────────────────────────────────
function FinalColumn({ totalH, label }) {
  return (
    <div style={{ width: CARD_W }}>
      {label && (
        <div className="text-center text-[10px] font-semibold text-yellow-400/70 uppercase tracking-wider mb-1"
          style={{ height: 16 }}>
          {label}
        </div>
      )}
      <div style={{ position: "relative", height: totalH }}>
        <div style={{ position: "absolute", top: (totalH - CARD_H) / 2 - 12, left: 0, right: 0 }}>
          <div className="text-center text-xs text-yellow-400/60 mb-1">🏆 Final</div>
          <MatchCard isTbd label="Two finalists" />
        </div>
      </div>
    </div>
  );
}

// ── SF connector stub into Final ──────────────────────────────────────────────
function FinalConnector({ totalH, side, label }) {
  const midY = totalH / 2;
  return (
    <div style={{ width: CON_W, position: "relative" }}>
      {label && <div style={{ height: 16 }} />}
      <svg width={CON_W} height={totalH} style={{ display: "block" }}>
        <line
          x1={side === "left" ? 0 : CON_W}
          y1={midY}
          x2={side === "left" ? CON_W : 0}
          y2={midY}
          stroke={LINE}
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}

// ── Main Bracket component ────────────────────────────────────────────────────
export default function Bracket() {
  const [groupMap, setGroupMap] = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    fetchGroupsForBracket()
      .then(groups => {
        const map = {};
        groups.forEach(g => {
          map[g.letter] = {};
          g.teams.forEach((team, i) => { map[g.letter][i + 1] = team; });
        });
        setGroupMap(map);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center text-white/50 py-12">
      <div className="text-3xl mb-3 animate-spin">⚽</div>
      <p>Building bracket...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-center text-red-300">
      <p className="font-semibold mb-1">Couldn't load bracket</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  // Resolve seedings into actual team objects
  function resolve(seed) {
    if (!seed || seed.tbd != null) return seed ?? { tbd: "Best 3rd" };
    return {
      home: groupMap[seed.home.g]?.[seed.home.p] ?? null,
      away: groupMap[seed.away.g]?.[seed.away.p] ?? null,
    };
  }

  const leftR32  = LEFT_SEEDS.map(resolve);
  const rightR32 = RIGHT_SEEDS.map(resolve);

  // Projected next-round matches = just TBD placeholders (winners unknown)
  const tbd = (n) => Array.from({ length: n }, () => null);

  const totalH = 8 * SLOT_H; // total bracket height
  const showLabel = true;

  return (
    <div>
      <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-3 mb-4">
        <p className="text-yellow-400 font-semibold text-sm">🏆 Road to the Final</p>
        <p className="text-white/50 text-xs mt-0.5">
          Based on current group standings · Updates live · 🟡 = higher-ranked team
        </p>
      </div>

      {/* Horizontally scrollable bracket */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            width: "fit-content",
            minWidth: "100%",
          }}
        >
          {/* ── LEFT HALF ── */}
          <RoundColumn matches={leftR32}  slotH={SLOT_H}       label="Round of 32" />
          <Connector   leftCount={8}      slotH={SLOT_H}       side="left" label={showLabel} />
          <RoundColumn matches={tbd(4)}   slotH={SLOT_H * 2}   label="Round of 16" />
          <Connector   leftCount={4}      slotH={SLOT_H * 2}   side="left" label={showLabel} />
          <RoundColumn matches={tbd(2)}   slotH={SLOT_H * 4}   label="Quarters" />
          <Connector   leftCount={2}      slotH={SLOT_H * 4}   side="left" label={showLabel} />
          <RoundColumn matches={tbd(1)}   slotH={SLOT_H * 8}   label="Semis" />
          <FinalConnector totalH={totalH} side="left"          label={showLabel} />

          {/* ── FINAL ── */}
          <FinalColumn totalH={totalH} label={showLabel ? "Final" : undefined} />

          {/* ── RIGHT HALF (mirrored) ── */}
          <FinalConnector totalH={totalH} side="right"         label={showLabel} />
          <RoundColumn matches={tbd(1)}   slotH={SLOT_H * 8}   label="Semis" />
          <Connector   leftCount={2}      slotH={SLOT_H * 4}   side="right" label={showLabel} />
          <RoundColumn matches={tbd(2)}   slotH={SLOT_H * 4}   label="Quarters" />
          <Connector   leftCount={4}      slotH={SLOT_H * 2}   side="right" label={showLabel} />
          <RoundColumn matches={tbd(4)}   slotH={SLOT_H * 2}   label="Round of 16" />
          <Connector   leftCount={8}      slotH={SLOT_H}       side="right" label={showLabel} />
          <RoundColumn matches={rightR32} slotH={SLOT_H}       label="Round of 32" />
        </div>
      </div>

      <div className="mt-3 text-xs text-white/30 text-center">
        Matches 13–16 involve the 8 best 3rd-place teams · Confirmed after group stage ends
      </div>
    </div>
  );
}
