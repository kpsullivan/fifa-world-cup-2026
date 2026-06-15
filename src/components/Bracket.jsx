import { useState, useEffect } from "react";
import { fetchGroupsForBracket } from "../data/api";
import { teamFacts } from "../data/teamFacts";

// Layout constants
const SLOT_H  = 72;   // height of one R32 slot (px)
const CARD_W  = 142;  // match card width
const CARD_H  = 54;   // match card height (2 teams)
const CON_W   = 18;   // connector column width between rounds
const LINE     = "rgba(255,255,255,0.22)";

// Official 2026 FIFA World Cup R32 bracket — sourced from FIFA.com
// Left half feeds → R16 M89/M90 → QF M97, and R16 M93/M94 → QF M98 → SF M101
// "third" means the best 3rd-place team from those specific groups (TBD until group stage ends)

const LEFT_SEEDS = [
  // M74: Winner E  vs Best 3rd from A,B,C,D,F
  { home: { g: "E", p: 1 }, away: { third: "A·B·C·D·F" } },
  // M77: Winner I  vs Best 3rd from C,D,F,G,H
  { home: { g: "I", p: 1 }, away: { third: "C·D·F·G·H" } },
  // M73: Runner-up A vs Runner-up B
  { home: { g: "A", p: 2 }, away: { g: "B", p: 2 } },
  // M75: Winner F  vs Runner-up C
  { home: { g: "F", p: 1 }, away: { g: "C", p: 2 } },
  // M83: Runner-up K vs Runner-up L
  { home: { g: "K", p: 2 }, away: { g: "L", p: 2 } },
  // M84: Winner H  vs Runner-up J
  { home: { g: "H", p: 1 }, away: { g: "J", p: 2 } },
  // M81: Winner D  vs Best 3rd from B,E,F,I,J
  { home: { g: "D", p: 1 }, away: { third: "B·E·F·I·J" } },
  // M82: Winner G  vs Best 3rd from A,E,H,I,J
  { home: { g: "G", p: 1 }, away: { third: "A·E·H·I·J" } },
];

// Right half feeds → R16 M91/M92 → QF M99, and R16 M95/M96 → QF M100 → SF M102
const RIGHT_SEEDS = [
  // M76: Winner C  vs Runner-up F
  { home: { g: "C", p: 1 }, away: { g: "F", p: 2 } },
  // M78: Runner-up E vs Runner-up I
  { home: { g: "E", p: 2 }, away: { g: "I", p: 2 } },
  // M79: Winner A  vs Best 3rd from C,E,F,H,I
  { home: { g: "A", p: 1 }, away: { third: "C·E·F·H·I" } },
  // M80: Winner L  vs Best 3rd from E,H,I,J,K
  { home: { g: "L", p: 1 }, away: { third: "E·H·I·J·K" } },
  // M85: Winner B  vs Best 3rd from E,F,G,I,J
  { home: { g: "B", p: 1 }, away: { third: "E·F·G·I·J" } },
  // M86: Winner J  vs Runner-up H
  { home: { g: "J", p: 1 }, away: { g: "H", p: 2 } },
  // M87: Winner K  vs Best 3rd from D,E,I,J,L
  { home: { g: "K", p: 1 }, away: { third: "D·E·I·J·L" } },
  // M88: Runner-up D vs Runner-up G
  { home: { g: "D", p: 2 }, away: { g: "G", p: 2 } },
];

// ── Compact team row inside a match card ──────────────────────────────────────
function TeamRow({ team }) {
  // team can be: a real team object, { thirdFrom: "A·B·C" }, or null (TBD winner)
  if (!team) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
        <span className="text-xs text-white/25 flex-1 italic">Winner</span>
      </div>
    );
  }
  if (team.thirdFrom) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1">
        <div className="w-4 h-4 rounded-full bg-white/5 border border-dashed border-white/20 flex-shrink-0" />
        <span className="text-[10px] text-white/40 flex-1 leading-tight">
          Best 3rd<br />{team.thirdFrom}
        </span>
      </div>
    );
  }
  const rank = teamFacts[team.abbreviation]?.fifaRank;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {team.logo
        ? <img src={team.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
        : <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />}
      <span className="text-xs font-medium text-white/90 flex-1 truncate">
        {team.abbreviation ?? "TBD"}
      </span>
      {rank && <span className="text-[10px] text-yellow-400/60">#{rank}</span>}
    </div>
  );
}

// ── Single match card ─────────────────────────────────────────────────────────
function MatchCard({ homeTeam, awayTeam }) {
  const homeRank = (homeTeam && !homeTeam.thirdFrom && teamFacts[homeTeam.abbreviation]?.fifaRank) ?? 999;
  const awayRank = (awayTeam && !awayTeam.thirdFrom && teamFacts[awayTeam.abbreviation]?.fifaRank) ?? 999;
  const bothKnown = homeTeam && awayTeam && !homeTeam.thirdFrom && !awayTeam.thirdFrom;
  const favoriteIsHome = homeRank < awayRank;

  return (
    <div style={{ width: CARD_W, height: CARD_H }}
      className="rounded-lg border border-white/20 bg-[#0d2044] overflow-hidden"
    >
      <div className={bothKnown && favoriteIsHome ? "bg-yellow-400/10" : ""}>
        <TeamRow team={homeTeam} />
      </div>
      <div className="border-t border-white/10" />
      <div className={bothKnown && !favoriteIsHome ? "bg-yellow-400/10" : ""}>
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
              homeTeam={m?.home ?? null}
              awayTeam={m?.away ?? null}
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
          <MatchCard homeTeam={null} awayTeam={null} />
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
  function resolveSlot(slot) {
    if (!slot) return null; // TBD future round winner
    if (slot.third) return { thirdFrom: slot.third }; // best 3rd place — determined after groups
    return groupMap[slot.g]?.[slot.p] ?? null;
  }

  function resolve(seed) {
    if (!seed || seed.tbd != null) return seed ?? { tbd: "Best 3rd" };
    return {
      home: resolveSlot(seed.home),
      away: resolveSlot(seed.away),
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
        3rd-place slots confirmed after group stage ends Jun 26 · Seedings verified vs FIFA.com
      </div>
    </div>
  );
}
