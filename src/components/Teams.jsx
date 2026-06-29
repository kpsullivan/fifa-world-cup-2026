import { useState, useEffect } from "react";
import { fetchTeams, fetchTeamSchedule, fetchMatchSummary } from "../data/api";
import { teamFacts } from "../data/teamFacts";
import { useTeamNav } from "../context/TeamNav";

function localTime(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function safeScore(val) {
  const n = parseInt(val);
  return isNaN(n) ? null : n;
}

function statBullets(myAbbr, oppAbbr, myScore, oppScore, won, drew, teamStats) {
  const bullets = [];
  const my = teamStats[myAbbr] ?? {};
  const opp = teamStats[oppAbbr] ?? {};

  const myPoss = parseFloat(my.possessionPct);
  const oppPoss = parseFloat(opp.possessionPct);
  const myShots = parseInt(my.totalShots);
  const oppShots = parseInt(opp.totalShots);
  const mySOT = parseInt(my.shotsOnTarget);
  const oppSOT = parseInt(opp.shotsOnTarget);
  const myRed = parseInt(my.redCards) || 0;
  const oppRed = parseInt(opp.redCards) || 0;
  const margin = Math.abs(myScore - oppScore);

  // Possession-based narrative
  if (!isNaN(myPoss) && !isNaN(oppPoss)) {
    if (oppPoss >= 60 && drew) {
      bullets.push(`Resolute defending — withstood ${oppAbbr}'s ${Math.round(oppPoss)}% possession and ${oppShots} shots to earn a hard-fought point.`);
    } else if (oppPoss >= 60 && won) {
      bullets.push(`Classic counter-punch — ${oppAbbr} had ${Math.round(oppPoss)}% possession but ${myAbbr} were clinical on the break.`);
    } else if (oppPoss >= 60 && !won && !drew) {
      bullets.push(`${oppAbbr} controlled the match with ${Math.round(oppPoss)}% possession and ${oppShots} shots, converting their pressure into goals.`);
    } else if (myPoss >= 60 && won) {
      bullets.push(`Dominant display — ${Math.round(myPoss)}% possession, ${myShots} shots, and ${mySOT} on target in a commanding win.`);
    } else if (myPoss >= 60 && drew) {
      bullets.push(`Dominated the ball (${Math.round(myPoss)}% possession, ${myShots} shots) but ${oppAbbr}'s keeper and defense held firm.`);
    } else if (myPoss >= 60 && !won) {
      bullets.push(`Despite ${Math.round(myPoss)}% possession and ${myShots} shots, couldn't convert — ${oppAbbr} punished the missed chances.`);
    } else if (won) {
      bullets.push(margin >= 2
        ? `Efficient performance — made the most of ${myShots} shots with ${mySOT} on target.`
        : `Edged a closely contested match — ${myShots} shots vs ${oppShots} in a tight battle.`);
    } else if (drew) {
      bullets.push(`Even contest — ${myShots} shots vs ${oppShots}, neither side could find a winner.`);
    } else {
      bullets.push(`${oppAbbr} were sharper — their ${oppSOT} shots on target proved decisive.`);
    }
  } else {
    // Fallback if no stats
    const m = margin;
    if (drew) bullets.push(myScore === 0 ? "Neither side could find the net." : "Points shared after a competitive contest.");
    else if (won) bullets.push(m >= 3 ? "Dominant performance from start to finish." : m === 2 ? "Comfortable win with a two-goal cushion." : "Hard-fought victory in a tight match.");
    else bullets.push(m >= 3 ? "Difficult defeat on the day." : m === 2 ? "Struggled to find a way back into the game." : "Narrow defeat in a tight contest.");
  }

  // Red card note
  if (myRed > 0) bullets.push(`${myAbbr} played with ${myRed === 1 ? "ten" : "nine"} men after a red card.`);
  if (oppRed > 0) bullets.push(`${oppAbbr} were reduced to ${oppRed === 1 ? "ten" : "nine"} men — ${myAbbr} had the numerical advantage.`);

  return bullets;
}

function upcomingMatchBullets(myAbbr, oppAbbr) {
  const myRank = teamFacts[myAbbr]?.fifaRank;
  const oppRank = teamFacts[oppAbbr]?.fifaRank;
  const bullets = [];

  if (myRank && oppRank) {
    const diff = Math.abs(myRank - oppRank);
    if (diff <= 4) {
      bullets.push(`Closely matched on paper — ${myAbbr} (#${myRank} FIFA) vs ${oppAbbr} (#${oppRank}). Could go either way.`);
    } else if (myRank < oppRank) {
      bullets.push(`${myAbbr} enter as favorites (#${myRank} FIFA) but ${oppAbbr} (#${oppRank}) are capable of an upset.`);
    } else {
      bullets.push(`${oppAbbr} (#${oppRank} FIFA) are the higher-ranked side — ${myAbbr} (#${myRank}) will need a big performance.`);
    }
  }

  const myPlayer = teamFacts[myAbbr]?.players?.[0];
  const oppPlayer = teamFacts[oppAbbr]?.players?.[0];
  if (myPlayer) bullets.push(`Watch ${myAbbr}: ${myPlayer}`);
  if (oppPlayer) bullets.push(`Watch ${oppAbbr}: ${oppPlayer}`);

  const trending = teamFacts[oppAbbr]?.trending;
  if (trending) bullets.push(`💬 ${trending}`);

  return bullets;
}

function Bullets({ items }) {
  if (!items.length) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((b, i) => (
        <li key={i} className="flex gap-1.5 text-xs text-white/50 leading-snug">
          <span className="text-white/25 flex-shrink-0 mt-0.5">•</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function ScheduleSection({ team }) {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);
  const { navigateToTeam } = useTeamNav();

  useEffect(() => {
    if (!team.id) return;
    fetchTeamSchedule(team.id)
      .then(setMatches)
      .catch(e => setError(e.message));
  }, [team.id]);

  if (error) return (
    <div className="text-xs text-white/30 text-center py-3">Match schedule unavailable</div>
  );
  if (!matches) return (
    <div className="text-xs text-white/40 text-center py-4 animate-pulse">Loading matches...</div>
  );

  const past = matches.filter(m => m.statusState === "post");
  const live = matches.filter(m => m.statusState === "in");
  const upcoming = matches.filter(m => m.statusState === "pre");

  function dedupGoals(list) {
    const map = {};
    for (const g of list) {
      if (!map[g.player]) map[g.player] = { ...g, clocks: [] };
      map[g.player].clocks.push(g.clock + (g.isPenalty ? " (pen)" : ""));
    }
    return Object.values(map);
  }

  function OpponentRow({ match, isHome }) {
    const me = isHome ? match.home : match.away;
    const opp = isHome ? match.away : match.home;
    const myScore = safeScore(me.score);
    const oppScore = safeScore(opp.score);
    const scoresKnown = myScore !== null && oppScore !== null;
    const isLive = match.statusState === "in";
    const isPost = match.statusState === "post";
    const won = isPost && me.winner;
    const drew = isPost && scoresKnown && !me.winner && !opp.winner;
    const resultLabel = isLive ? "●" : won ? "W" : drew ? "D" : "L";
    const resultBg = isLive ? "bg-red-500/20 text-red-400 animate-pulse"
      : won ? "bg-emerald-400/20 text-emerald-400"
      : drew ? "bg-white/10 text-white/60"
      : "bg-red-400/20 text-red-400";
    const scoreColor = isLive ? "text-yellow-400"
      : won ? "text-emerald-400"
      : drew ? "text-white/60"
      : "text-red-400";

    const [summary, setSummary] = useState({ teamStats: {}, goals: [] });

    useEffect(() => {
      if (!isPost && !isLive) return;
      fetchMatchSummary(match.id)
        .then(setSummary)
        .catch(() => {});
    }, [match.id, isPost, isLive]);

    const { teamStats, goals } = summary;

    // Use teamAbbr (from roster lookup) — reliable even when team name strings differ
    const myGoals   = dedupGoals(goals.filter(g => g.teamAbbr === me.abbreviation));
    const oppGoals  = dedupGoals(goals.filter(g => g.teamAbbr === opp.abbreviation));
    const unknownGoals = dedupGoals(goals.filter(g =>
      g.teamAbbr !== me.abbreviation && g.teamAbbr !== opp.abbreviation
    ));
    const hasGoals = goals.length > 0;

    const bullets = isPost && scoresKnown
      ? statBullets(team.abbreviation, opp.abbreviation, myScore, oppScore, won, drew, teamStats)
      : [];

    return (
      <div className="py-3 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${resultBg}`}>
            {resultLabel}
          </div>
          <button
            onClick={() => navigateToTeam({ id: opp.id, displayName: opp.name, abbreviation: opp.abbreviation, logo: opp.logo })}
            className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-70 transition-opacity"
          >
            {opp.logo
              ? <img src={opp.logo} alt={opp.name} className="w-5 h-5 object-contain flex-shrink-0" />
              : <div className="w-5 h-5 bg-white/10 rounded-full flex-shrink-0" />}
            <span className="text-sm truncate text-white/80">{opp.name}</span>
          </button>
          {scoresKnown
            ? <span className={`text-sm font-bold flex-shrink-0 ${scoreColor}`}>
                {myScore}–{oppScore}
                {isLive && <span className="text-xs font-normal ml-1">{match.clock || match.statusShort}</span>}
              </span>
            : <span className="text-sm text-white/30 flex-shrink-0">–</span>
          }
        </div>

        {/* Scorers — split me left, opponent right */}
        {hasGoals && (
          <div className="mt-1.5 pl-9 space-y-0.5">
            {myGoals.map((g, i) => (
              <div key={i} className="text-xs text-white/50">
                ⚽ {g.player} <span className="text-white/30">{g.clocks.join(", ")}</span>
              </div>
            ))}
            {oppGoals.map((g, i) => (
              <div key={i} className="text-xs text-white/40 text-right pr-1">
                <span className="text-white/25">{g.clocks.join(", ")}</span> {g.player} ⚽
              </div>
            ))}
            {unknownGoals.map((g, i) => (
              <div key={i} className="text-xs text-white/40">
                ⚽ {g.player} <span className="text-white/25">{g.clocks.join(", ")}</span>
              </div>
            ))}
          </div>
        )}

        <Bullets items={bullets} />
      </div>
    );
  }

  function UpcomingRow({ match }) {
    const isHome = match.home.id === team.id;
    const opp = isHome ? match.away : match.home;
    const bullets = upcomingMatchBullets(team.abbreviation, opp.abbreviation);

    return (
      <div className="py-3 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigateToTeam({ id: opp.id, displayName: opp.name, abbreviation: opp.abbreviation, logo: opp.logo })}
            className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-70 transition-opacity"
          >
            {opp.logo
              ? <img src={opp.logo} alt={opp.name} className="w-5 h-5 object-contain flex-shrink-0" />
              : <div className="w-5 h-5 bg-white/10 rounded-full flex-shrink-0" />}
            <span className="text-sm font-semibold text-white">{opp.name}</span>
          </button>
          <span className="text-xs text-white/40 flex-shrink-0">{localTime(match.isoDate)}</span>
        </div>
        {match.note && <div className="text-xs text-yellow-400/70 mb-1">{match.note}</div>}
        <Bullets items={bullets} />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-5">
      {live.length > 0 && (
        <div>
          <div className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" /> Live Now
          </div>
          <div className="bg-white/5 rounded-xl px-3">
            {live.map(m => {
              const isHome = m.home.id === team.id;
              return <OpponentRow key={m.id} match={m} isHome={isHome} />;
            })}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Past Results</div>
          <div className="bg-white/5 rounded-xl px-3">
            {past.slice(-5).map(m => {
              const isHome = m.home.id === team.id;
              return <OpponentRow key={m.id} match={m} isHome={isHome} />;
            })}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div>
          <div className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Upcoming</div>
          <div className="bg-white/5 rounded-xl px-3">
            {upcoming.slice(0, 3).map(m => (
              <UpcomingRow key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}

      {past.length === 0 && upcoming.length === 0 && live.length === 0 && (
        <div className="text-xs text-white/30 text-center py-2">No matches found yet</div>
      )}
    </div>
  );
}

function TeamCard({ team, onClick }) {
  const extra = teamFacts[team.abbreviation] ?? {};
  const logo = team.logos?.[0]?.href ?? team.logo;

  return (
    <button
      onClick={onClick}
      className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 text-left hover:bg-white/15 active:scale-95 transition-all w-full"
    >
      <div className="flex items-center gap-3">
        {logo
          ? <img src={logo} alt={team.displayName} className="w-10 h-10 object-contain" />
          : <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold">{team.abbreviation}</div>
        }
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{team.displayName ?? team.name}</div>
          <div className="text-xs text-white/50">{team.abbreviation}</div>
        </div>
        {extra.fifaRank && (
          <div className="text-right flex-shrink-0">
            <div className="text-yellow-400 font-bold text-lg">#{extra.fifaRank}</div>
            <div className="text-xs text-white/40">FIFA Rank</div>
          </div>
        )}
        <span className="text-white/30 ml-1">›</span>
      </div>
    </button>
  );
}

function TeamDetail({ team, onBack }) {
  const extra = teamFacts[team.abbreviation] ?? {};
  const logo = team.logos?.[0]?.href ?? team.logo;
  const rankColor = !extra.fifaRank ? "text-white/60"
    : extra.fifaRank <= 5 ? "text-yellow-400"
    : extra.fifaRank <= 15 ? "text-emerald-400"
    : "text-blue-400";

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors text-sm">
        ← All Teams
      </button>

      <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
        <div className="text-center mb-5">
          {logo
            ? <img src={logo} alt={team.displayName} className="w-20 h-20 object-contain mx-auto mb-3" />
            : <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold">{team.abbreviation}</div>
          }
          <h2 className="text-2xl font-bold">{team.displayName ?? team.name}</h2>
        </div>

        {extra.fifaRank && (
          <div className="bg-white/10 rounded-xl p-3 text-center mb-4">
            <div className={`text-3xl font-bold ${rankColor}`}>#{extra.fifaRank}</div>
            <div className="text-xs text-white/50 mt-1">FIFA World Rank</div>
          </div>
        )}

        {extra.coach && (
          <div className="mb-4">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1.5">Head Coach</div>
            <div className="text-white font-medium text-sm">👨‍💼 {extra.coach}</div>
          </div>
        )}

        {extra.facts?.length > 0 && (
          <div className="mb-1">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Quick Facts</div>
            <div className="space-y-2">
              {extra.facts.map((fact, i) => (
                <div key={i} className="flex gap-2 bg-white/5 rounded-xl p-3">
                  <span className="text-yellow-400 flex-shrink-0">⚡</span>
                  <span className="text-sm text-white/80">{fact}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match history + upcoming */}
        <ScheduleSection team={team} />
      </div>
    </div>
  );
}

export default function Teams({ externalSelected, clearExternal }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rank");

  useEffect(() => {
    fetchTeams()
      .then(data => {
        if (!data.length) throw new Error("API returned 0 teams");
        setTeams(data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // When another tab navigates to a team, open its detail page
  useEffect(() => {
    if (externalSelected) setSelected(externalSelected);
  }, [externalSelected]);

  const activeTeam = selected;

  function handleBack() {
    setSelected(null);
    if (clearExternal) clearExternal();
  }

  if (activeTeam) {
    return <TeamDetail team={activeTeam} onBack={handleBack} />;
  }

  if (loading) return (
    <div className="text-center text-white/50 py-12">
      <div className="text-3xl mb-3 animate-spin">⚽</div>
      <p>Loading teams...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-center text-red-300">
      <p className="font-semibold mb-1">Couldn't load teams</p>
      <p className="text-sm opacity-80">{error}</p>
    </div>
  );

  const filtered = teams
    .filter(t => (t.displayName ?? t.name ?? "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "rank") {
        const ra = teamFacts[a.abbreviation]?.fifaRank ?? 999;
        const rb = teamFacts[b.abbreviation]?.fifaRank ?? 999;
        return ra - rb;
      }
      return (a.displayName ?? "").localeCompare(b.displayName ?? "");
    });

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder={`Search ${teams.length} teams...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-yellow-400/50 text-sm"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none"
        >
          <option value="rank">By Rank</option>
          <option value="name">A–Z</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(team => (
          <TeamCard key={team.id} team={team} onClick={() => setSelected(team)} />
        ))}
      </div>
    </div>
  );
}
