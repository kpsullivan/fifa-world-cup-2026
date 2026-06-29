import { useState, useEffect } from "react";
import { fetchFIFABracket, fetchGroupsForBracket, computeBest3rd, fetchAllTournamentMatches, computeClinchStatuses, FIFA_NAME_TO_ABBR } from "../data/api";
import { teamFacts } from "../data/teamFacts";
import { useTeamNav } from "../context/TeamNav";

// Layout constants
const SLOT_H  = 72;
const CARD_W  = 142;
const CARD_H  = 54;
const CON_W   = 18;
const LINE    = "rgba(255,255,255,0.22)";

// R32 match numbers in correct bracket order (verified vs FIFA.com)
const LEFT_ORDER  = [74, 77, 73, 75, 83, 84, 81, 82];
const RIGHT_ORDER = [76, 78, 79, 80, 86, 88, 85, 87];

// ── Team row ──────────────────────────────────────────────────────────────────
function TeamRow({ team, status }) {
  const { navigateToTeam } = useTeamNav();

  const rowBg = status === "clinched"   ? "bg-emerald-400/15"
    : status === "provisional" ? "bg-yellow-400/10"
    : "";

  if (!team) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 ${rowBg}`}>
        <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
        <span className="text-xs text-white/25 flex-1 italic">Winner</span>
      </div>
    );
  }

  const rank = teamFacts[team.abbreviation]?.fifaRank;
  return (
    <button
      onClick={() => navigateToTeam({ id: team.id, displayName: team.name, abbreviation: team.abbreviation, logo: team.logo })}
      className={`flex items-center gap-1.5 px-2 py-1 w-full text-left hover:brightness-125 transition-all ${rowBg}`}
    >
      {team.logo
        ? <img src={team.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
        : <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />}
      <span className="text-xs font-medium text-white/90 flex-1 truncate">
        {team.abbreviation ?? team.name ?? "TBD"}
      </span>
      {rank && <span className="text-[10px] text-yellow-400/60">#{rank}</span>}
    </button>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ homeTeam, homeStatus, awayTeam, awayStatus, homeScore, awayScore, isLive, isDone }) {
  return (
    <div style={{ width: CARD_W, height: CARD_H }}
      className="rounded-lg border border-white/20 bg-[#0d2044] overflow-hidden"
    >
      <div className="relative">
        <TeamRow team={homeTeam} status={homeStatus} />
        {isDone && homeScore != null && (
          <span className="absolute right-1 top-0.5 text-[10px] font-bold text-yellow-400/80">{homeScore}</span>
        )}
      </div>
      <div className="border-t border-white/10" />
      <div className="relative">
        <TeamRow team={awayTeam} status={awayStatus} />
        {isDone && awayScore != null && (
          <span className="absolute right-1 top-0.5 text-[10px] font-bold text-yellow-400/80">{awayScore}</span>
        )}
      </div>
    </div>
  );
}

// ── Round column ──────────────────────────────────────────────────────────────
function RoundColumn({ matches, slotH, label }) {
  return (
    <div style={{ width: CARD_W }}>
      {label && (
        <div className="text-center text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1" style={{ height: 16 }}>
          {label}
        </div>
      )}
      <div style={{ position: "relative", height: slotH * matches.length }}>
        {matches.map((m, i) => (
          <div key={i} style={{ position: "absolute", top: i * slotH + (slotH - CARD_H) / 2, left: 0 }}>
            <MatchCard
              homeTeam={m?.homeTeam ?? null}
              homeStatus={m?.homeStatus ?? null}
              awayTeam={m?.awayTeam ?? null}
              awayStatus={m?.awayStatus ?? null}
              homeScore={m?.homeScore}
              awayScore={m?.awayScore}
              isDone={m?.isDone}
              isLive={m?.isLive}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SVG connector ─────────────────────────────────────────────────────────────
function Connector({ leftCount, slotH, side = "left", label }) {
  const totalH = leftCount * slotH;
  const rightCount = leftCount / 2;
  return (
    <div style={{ width: CON_W, position: "relative" }}>
      {label && <div style={{ height: 16 }} />}
      <svg width={CON_W} height={totalH} style={{ display: "block", overflow: "visible" }}>
        {Array.from({ length: rightCount }).map((_, i) => {
          const topY = (i * 2 + 0.5) * slotH;
          const botY = (i * 2 + 1.5) * slotH;
          const midY = (topY + botY) / 2;
          const vx   = side === "left" ? 0 : CON_W;
          const hxE  = side === "left" ? CON_W : 0;
          return (
            <g key={i}>
              <line x1={vx} y1={topY} x2={hxE} y2={topY} stroke={LINE} strokeWidth={1.5} />
              <line x1={vx} y1={botY} x2={hxE} y2={botY} stroke={LINE} strokeWidth={1.5} />
              <line x1={hxE} y1={topY} x2={hxE} y2={botY} stroke={LINE} strokeWidth={1.5} />
              <line x1={vx} y1={midY} x2={hxE} y2={midY} stroke={LINE} strokeWidth={1.5} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function FinalColumn({ totalH, label }) {
  return (
    <div style={{ width: CARD_W }}>
      {label && <div className="text-center text-[10px] font-semibold text-yellow-400/70 uppercase tracking-wider mb-1" style={{ height: 16 }}>{label}</div>}
      <div style={{ position: "relative", height: totalH }}>
        <div style={{ position: "absolute", top: (totalH - CARD_H) / 2 - 12, left: 0, right: 0 }}>
          <div className="text-center text-xs text-yellow-400/60 mb-1">🏆 Final</div>
          <MatchCard homeTeam={null} awayTeam={null} />
        </div>
      </div>
    </div>
  );
}

function FinalConnector({ totalH, side, label }) {
  const midY = totalH / 2;
  return (
    <div style={{ width: CON_W, position: "relative" }}>
      {label && <div style={{ height: 16 }} />}
      <svg width={CON_W} height={totalH} style={{ display: "block" }}>
        <line x1={side === "left" ? 0 : CON_W} y1={midY} x2={side === "left" ? CON_W : 0} y2={midY} stroke={LINE} strokeWidth={1.5} />
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Bracket() {
  const [leftR32, setLeftR32]   = useState([]);
  const [rightR32, setRightR32] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    Promise.all([
      fetchFIFABracket(),
      fetchGroupsForBracket(),
      fetchAllTournamentMatches(),
    ]).then(([fifaMatches, groups, allMatches]) => {
      // Build abbreviation → team data map from ESPN standings
      const abbrMap = {};
      for (const g of groups) {
        for (const t of g.teams) {
          abbrMap[t.abbreviation] = { id: t.id, name: t.name, abbreviation: t.abbreviation, logo: t.logo };
        }
      }

      // Clinch statuses from ESPN simulation
      const clinchStatuses = computeClinchStatuses(groups, allMatches);

      // Index FIFA matches by match number
      const byNum = {};
      for (const m of fifaMatches) {
        byNum[m.MatchNumber] = m;
      }

      function buildMatchCard(matchNum) {
        const m = byNum[matchNum];
        if (!m) return null;

        function resolveTeam(side) {
          const sideObj = side === "home" ? m.Home : m.Away;
          if (!sideObj) return null;
          const names = sideObj.TeamName ?? [];
          const fifaName = names[0]?.Description ?? "";
          const abbr = FIFA_NAME_TO_ABBR[fifaName] ?? "";
          const espnTeam = abbrMap[abbr] ?? { name: fifaName, abbreviation: abbr, logo: null, id: null };
          return espnTeam;
        }

        const homeTeam = resolveTeam("home");
        const awayTeam = resolveTeam("away");
        const homeScore = m.Home?.Score ?? null;
        const awayScore = m.Away?.Score ?? null;
        const isDone = homeScore !== null && awayScore !== null;

        return {
          homeTeam,
          homeStatus: homeTeam?.id ? (clinchStatuses[homeTeam.id] ?? null) : null,
          awayTeam,
          awayStatus: awayTeam?.id ? (clinchStatuses[awayTeam.id] ?? null) : null,
          homeScore,
          awayScore,
          isDone,
        };
      }

      setLeftR32(LEFT_ORDER.map(buildMatchCard));
      setRightR32(RIGHT_ORDER.map(buildMatchCard));
    })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
  }, []);

  const tbd = (n) => Array.from({ length: n }, () => null);
  const totalH = 8 * SLOT_H;

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

  return (
    <div>
      <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-3 mb-4">
        <p className="text-yellow-400 font-semibold text-sm">🏆 Road to the Final</p>
        <p className="text-white/50 text-xs mt-0.5">
          Source: FIFA.com · 🟢 Clinched · 🟡 Provisional
        </p>
      </div>

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div style={{ display: "flex", alignItems: "flex-start", width: "fit-content", minWidth: "100%" }}>
          <RoundColumn matches={leftR32}  slotH={SLOT_H}     label="Round of 32" />
          <Connector   leftCount={8}      slotH={SLOT_H}     side="left" label={true} />
          <RoundColumn matches={tbd(4)}   slotH={SLOT_H * 2} label="Round of 16" />
          <Connector   leftCount={4}      slotH={SLOT_H * 2} side="left" label={true} />
          <RoundColumn matches={tbd(2)}   slotH={SLOT_H * 4} label="Quarters" />
          <Connector   leftCount={2}      slotH={SLOT_H * 4} side="left" label={true} />
          <RoundColumn matches={tbd(1)}   slotH={SLOT_H * 8} label="Semis" />
          <FinalConnector totalH={totalH} side="left"        label={true} />

          <FinalColumn totalH={totalH} label="Final" />

          <FinalConnector totalH={totalH} side="right"       label={true} />
          <RoundColumn matches={tbd(1)}   slotH={SLOT_H * 8} label="Semis" />
          <Connector   leftCount={2}      slotH={SLOT_H * 4} side="right" label={true} />
          <RoundColumn matches={tbd(2)}   slotH={SLOT_H * 4} label="Quarters" />
          <Connector   leftCount={4}      slotH={SLOT_H * 2} side="right" label={true} />
          <RoundColumn matches={tbd(4)}   slotH={SLOT_H * 2} label="Round of 16" />
          <Connector   leftCount={8}      slotH={SLOT_H}     side="right" label={true} />
          <RoundColumn matches={rightR32} slotH={SLOT_H}     label="Round of 32" />
        </div>
      </div>

      <div className="mt-3 text-xs text-white/30 text-center">
        Bracket sourced from FIFA.com · Updates live
      </div>
    </div>
  );
}
