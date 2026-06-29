// ESPN public sports API — no API key required
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const ESPN_V2_BASE = "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world";

// FIFA public API — CORS open, authoritative source for bracket and scorers
const FIFA_API = "https://api.fifa.com/api/v3";
const FIFA_COMPETITION = "17";
const FIFA_SEASON = "285023"; // 2026 WC season ID

// Maps FIFA team names → ESPN abbreviation (for logo lookups) — exported for Bracket
export const FIFA_NAME_TO_ABBR = {
  "South Africa":"RSA","Canada":"CAN","Brazil":"BRA","Japan":"JPN",
  "Germany":"GER","Paraguay":"PAR","Netherlands":"NED","Morocco":"MAR",
  "Côte d'Ivoire":"CIV","Ivory Coast":"CIV","Norway":"NOR",
  "France":"FRA","Sweden":"SWE","Mexico":"MEX","Ecuador":"ECU",
  "England":"ENG","Congo DR":"COD","Congo":"COD","Belgium":"BEL",
  "Senegal":"SEN","United States":"USA","USA":"USA",
  "Bosnia and Herzegovina":"BIH","Spain":"ESP","Austria":"AUT",
  "Portugal":"POR","Croatia":"CRO","Switzerland":"SUI","Algeria":"ALG",
  "Australia":"AUS","Egypt":"EGY","Argentina":"ARG",
  "Cabo Verde":"CPV","Cape Verde":"CPV","Colombia":"COL","Ghana":"GHA",
  "Korea Republic":"KOR","South Korea":"KOR","Czechia":"CZE",
  "Saudi Arabia":"KSA","Curaçao":"CUW","Scotland":"SCO","Haiti":"HAI",
  "Türkiye":"TUR","Turkey":"TUR","Tunisia":"TUN","Iran":"IRN",
  "New Zealand":"NZL","Iraq":"IRQ","Jordan":"JOR","Uzbekistan":"UZB",
  "Qatar":"QAT","Panama":"PAN","Uruguay":"URU",
};

// Fetch the definitive Round of 32 bracket from FIFA's API
export async function fetchFIFABracket() {
  const res = await fetch(`${FIFA_API}/calendar/matches?idCompetition=${FIFA_COMPETITION}&idSeason=${FIFA_SEASON}&count=200&language=en`);
  if (!res.ok) throw new Error("Failed to fetch FIFA bracket");
  const data = await res.json();
  return (data.Results ?? []).filter(m =>
    m.StageName?.[0]?.Description === "Round of 32"
  );
}

// Fetch official Golden Boot top scorers from FIFA's API
export async function fetchFIFAScorers() {
  const res = await fetch(`${FIFA_API}/topscorers?idCompetition=${FIFA_COMPETITION}&idSeason=${FIFA_SEASON}&language=en`);
  if (!res.ok) throw new Error("Failed to fetch FIFA scorers");
  const data = await res.json();
  return data.Results ?? [];
}

// Given the groups array from fetchGroupsForBracket or fetchStandings,
// returns the 8 best 3rd-place teams sorted by points → GD → GF,
// each annotated with which group they came from.
export function computeBest3rd(groups) {
  return groups
    .filter(g => g.teams.length >= 3)
    .map(g => ({ ...g.teams[2], fromGroup: g.letter }))
    .filter(t => t.played > 0)
    .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor)
    .slice(0, 8);
}

function localDateStr() {
  // Use local date (not UTC) so evening users don't jump to the next day
  return new Date().toLocaleDateString("en-CA").replace(/-/g, "");
}

export async function fetchTodayMatches() {
  const today = localDateStr();
  const res = await fetch(`${ESPN_BASE}/scoreboard?dates=${today}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  const data = await res.json();
  return parseMatches(data);
}

export async function fetchMatchesByDate(dateStr) {
  const d = dateStr.replace(/-/g, "");
  const res = await fetch(`${ESPN_BASE}/scoreboard?dates=${d}`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  const data = await res.json();
  return parseMatches(data);
}

export async function fetchStandings() {
  const res = await fetch(`${ESPN_V2_BASE}/standings`);
  if (!res.ok) throw new Error("Failed to fetch standings");
  const data = await res.json();
  return parseStandings(data);
}

// Returns raw group data for the bracket — same source, different shape
export async function fetchGroupsForBracket() {
  const res = await fetch(`${ESPN_V2_BASE}/standings`);
  if (!res.ok) throw new Error("Failed to fetch standings");
  const data = await res.json();
  return (data.children ?? []).map(group => {
    const entries = group.standings?.entries ?? [];
    const teams = entries.map(entry => {
      const stats = {};
      entry.stats?.forEach(s => { stats[s.name] = s.value; });
      return {
        id: entry.team?.id,
        name: entry.team?.displayName ?? entry.team?.name,
        abbreviation: entry.team?.abbreviation,
        logo: entry.team?.logos?.[0]?.href,
        points: stats.points ?? 0,
        goalDiff: stats.pointDifferential ?? 0,
        goalsFor: stats.pointsFor ?? 0,
        played: stats.gamesPlayed ?? 0,
      };
    }).sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    return { name: group.name, letter: group.name.replace("Group ", ""), teams };
  });
}

export async function fetchMatchSummary(eventId) {
  const res = await fetch(`${ESPN_BASE}/summary?event=${eventId}`);
  if (!res.ok) throw new Error(`Summary unavailable (${res.status})`);
  const data = await res.json();

  // Build team stat map keyed by abbreviation
  const teamStats = {};
  for (const t of data.boxscore?.teams ?? []) {
    const abbr = t.team?.abbreviation;
    const s = {};
    for (const stat of t.statistics ?? []) s[stat.name] = stat.displayValue;
    teamStats[abbr] = s;
  }

  // Build athlete_id → team abbreviation from rosters (avoids text name mismatches like
  // "Korea Republic" in keyEvent text vs "South Korea" from scoreboard)
  const athleteTeam = {};
  for (const r of data.rosters ?? []) {
    const abbr = r.team?.abbreviation;
    for (const a of r.roster ?? []) {
      const id = a.athlete?.id;
      if (id) athleteTeam[String(id)] = abbr;
    }
  }

  // Also build abbreviation → displayName from rosters for scorer display
  const abbrToName = {};
  for (const r of data.rosters ?? []) {
    if (r.team?.abbreviation) abbrToName[r.team.abbreviation] = r.team.displayName ?? r.team.abbreviation;
  }

  const goals = [];
  for (const event of data.keyEvents ?? []) {
    const type = event.type?.type;
    if (!["goal", "penalty-goal", "own-goal"].includes(type)) continue;
    const athlete = event.participants?.[0]?.athlete;
    const athleteId = String(athlete?.id ?? "");
    // Prefer roster lookup; fall back to text parsing only if roster lookup fails
    let teamAbbr = athleteTeam[athleteId] ?? null;
    if (!teamAbbr) {
      const textMatch = event.text?.match(/\(([^)]+)\)/);
      teamAbbr = textMatch?.[1] ?? "";
    }
    goals.push({
      player: athlete?.displayName ?? "?",
      athleteId,
      teamAbbr,                                // e.g. "KOR" — reliable via roster lookup
      clock: event.clock?.displayValue ?? "",
      isOwnGoal: type === "own-goal",
      isPenalty: type === "penalty-goal",
    });
  }

  return { teamStats, goals, athleteTeam, abbrToName };
}

export async function fetchTopScorers() {
  const all = await fetchAllTournamentMatches();
  const completed = all.filter(m => m.statusState === "post");

  // Build team name → logo/abbreviation map from match data
  const teamMap = {};
  for (const m of completed) {
    if (m.home.name) teamMap[m.home.name] = { abbreviation: m.home.abbreviation, logo: m.home.logo };
    if (m.away.name) teamMap[m.away.name] = { abbreviation: m.away.abbreviation, logo: m.away.logo };
  }

  const results = await Promise.allSettled(
    completed.map(m => fetchMatchSummary(m.id))
  );

  // Build abbreviation → {logo, name} from match data
  const abbrMap = {};
  for (const m of completed) {
    if (m.home.abbreviation) abbrMap[m.home.abbreviation] = { logo: m.home.logo, name: m.home.name };
    if (m.away.abbreviation) abbrMap[m.away.abbreviation] = { logo: m.away.logo, name: m.away.name };
  }

  const tally = {};
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const goal of r.value.goals ?? []) {
      if (goal.isOwnGoal) continue;
      const key = goal.player;
      const info = abbrMap[goal.teamAbbr] ?? {};
      if (!tally[key]) {
        tally[key] = { name: goal.player, abbreviation: goal.teamAbbr ?? "", team: info.name ?? goal.teamAbbr ?? "", logo: info.logo ?? null, goals: 0 };
      }
      tally[key].goals++;
    }
  }

  return Object.values(tally)
    .filter(s => s.goals > 0)
    .sort((a, b) => b.goals - a.goals);
}

// Simulate all possible remaining outcomes for each group and return clinch status per team.
// "clinched" = team CANNOT finish below their current qualifying position no matter what happens.
// "provisional" = team is currently qualifying but could be overtaken.
// Tiebreaker order: points → GD → GF → H2H points → H2H GD (covers ~99% of real cases).
export function computeClinchStatuses(groups, allMatches) {
  const statuses = {};

  for (const group of groups) {
    const teamIds = new Set(group.teams.map(t => t.id));

    // Intra-group matches only
    const groupMatches = allMatches.filter(
      m => m.home?.id && m.away?.id && teamIds.has(m.home.id) && teamIds.has(m.away.id)
    );
    const completed = groupMatches.filter(m => m.statusState === "post");
    const remaining = groupMatches.filter(m => m.statusState === "pre");

    // Current position in the standings (0-based index in group.teams which is already sorted)
    const currentPos = {};
    group.teams.forEach((t, i) => { currentPos[t.id] = i + 1; });

    function buildStats(extraMatches) {
      const s = {};
      for (const t of group.teams) s[t.id] = { pts: 0, gd: 0, gf: 0, h2h: {} };

      function apply(hId, aId, hg, ag) {
        s[hId].gf += hg; s[aId].gf += ag;
        s[hId].gd += hg - ag; s[aId].gd += ag - hg;
        const [hPts, aPts] = hg > ag ? [3, 0] : hg < ag ? [0, 3] : [1, 1];
        s[hId].pts += hPts; s[aId].pts += aPts;
        s[hId].h2h[aId] = { pts: hPts, gd: hg - ag };
        s[aId].h2h[hId] = { pts: aPts, gd: ag - hg };
      }

      for (const m of [...completed, ...extraMatches]) {
        const hg = parseInt(m.home?.score ?? m._hg ?? 0);
        const ag = parseInt(m.away?.score ?? m._ag ?? 0);
        if (isNaN(hg) || isNaN(ag)) continue;
        apply(m.home.id, m.away.id, hg, ag);
      }
      return s;
    }

    function sortedPositions(stats) {
      return group.teams
        .map(t => ({ id: t.id, ...stats[t.id] }))
        .sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          if (b.gf !== a.gf) return b.gf - a.gf;
          // H2H between exactly these two teams
          const aH = a.h2h[b.id], bH = b.h2h[a.id];
          if (aH && bH) {
            if (bH.pts !== aH.pts) return bH.pts - aH.pts;
            if (bH.gd !== aH.gd) return bH.gd - aH.gd;
          }
          return 0;
        })
        .map((t, i) => ({ id: t.id, pos: i + 1 }));
    }

    // Track worst-case finishing position for each team across all outcome combinations
    const worstPos = {};
    group.teams.forEach(t => { worstPos[t.id] = 0; });

    const n = remaining.length;
    const total = Math.pow(3, n);
    for (let sim = 0; sim < total; sim++) {
      const extras = [];
      let s = sim;
      for (let i = 0; i < n; i++) {
        const outcome = s % 3; s = Math.floor(s / 3);
        const m = remaining[i];
        // outcome 0 = home win, 1 = draw, 2 = away win (use minimal scores to be conservative)
        const [hg, ag] = outcome === 0 ? [1, 0] : outcome === 1 ? [0, 0] : [0, 1];
        extras.push({ home: { id: m.home.id, score: hg }, away: { id: m.away.id, score: ag }, _hg: hg, _ag: ag });
      }
      const stats = buildStats(extras);
      for (const { id, pos } of sortedPositions(stats)) {
        worstPos[id] = Math.max(worstPos[id], pos);
      }
    }

    // Assign clinch status based on worst-case position vs qualifying threshold
    for (const t of group.teams) {
      const curr = currentPos[t.id];
      const worst = worstPos[t.id];
      if (curr === 1 && worst === 1) {
        statuses[t.id] = "clinched";          // locked in 1st
      } else if (curr === 2 && worst <= 2) {
        statuses[t.id] = "clinched";          // locked in top 2
      } else if (curr <= 2) {
        statuses[t.id] = "provisional";       // currently qualifying but not guaranteed
      }
      // 3rd/4th place: handled separately for best-3rd logic (keep null for now)
    }
  }

  return statuses;
}

// Cache the full tournament schedule so multiple team lookups share one fetch
let _tournamentCache = null;
export async function fetchAllTournamentMatches() {
  if (_tournamentCache) return _tournamentCache;
  const res = await fetch(`${ESPN_BASE}/scoreboard?dates=20260601-20260720&limit=200`);
  if (!res.ok) throw new Error(`Failed to fetch tournament schedule (${res.status})`);
  const data = await res.json();
  _tournamentCache = parseMatches(data);
  return _tournamentCache;
}

export async function fetchTeamSchedule(teamId) {
  const all = await fetchAllTournamentMatches();
  return all.filter(m => m.home.id === teamId || m.away.id === teamId);
}

// Derive teams from standings (CORS-friendly) instead of the /teams endpoint (no CORS header)
export async function fetchTeams() {
  const res = await fetch(`${ESPN_V2_BASE}/standings`);
  if (!res.ok) throw new Error(`Failed to fetch teams (${res.status})`);
  const data = await res.json();
  const seen = new Set();
  const teams = [];
  for (const group of data.children ?? []) {
    for (const entry of group.standings?.entries ?? []) {
      const t = entry.team;
      if (t && !seen.has(t.id)) {
        seen.add(t.id);
        teams.push({
          id: t.id,
          displayName: t.displayName ?? t.name,
          abbreviation: t.abbreviation,
          logo: t.logos?.[0]?.href,
          group: group.name,
        });
      }
    }
  }
  if (!teams.length) throw new Error("No teams found in standings response");
  return teams;
}

function parseMatches(data) {
  const events = data.events ?? [];
  return events.map(event => {
    const comp = event.competitions?.[0];
    const home = comp?.competitors?.find(c => c.homeAway === "home");
    const away = comp?.competitors?.find(c => c.homeAway === "away");
    const status = comp?.status?.type;

    return {
      id: event.id,
      isoDate: event.date,  // ISO UTC string — used for local time conversion
      venue: comp?.venue?.fullName ?? "",
      city: comp?.venue?.address?.city ?? "",
      home: {
        id: home?.team?.id,
        name: home?.team?.displayName ?? home?.team?.name,
        abbreviation: home?.team?.abbreviation,
        logo: home?.team?.logo,           // scoreboard uses singular "logo"
        color: home?.team?.color,         // hex color e.g. "c60b1e"
        score: home?.score,
        winner: home?.winner,
      },
      away: {
        id: away?.team?.id,
        name: away?.team?.displayName ?? away?.team?.name,
        abbreviation: away?.team?.abbreviation,
        logo: away?.team?.logo,
        color: away?.team?.color,
        score: away?.score,
        winner: away?.winner,
      },
      statusState: comp?.status?.type?.state,  // "pre" | "in" | "post" — most reliable live check
      statusShort: status?.shortDetail,        // "42'" | "HT" | "Final" | "1:00 PM ET"
      clock: comp?.status?.displayClock,       // "42'" during live
      note: comp?.notes?.[0]?.headline ?? "",
    };
  });
}

function parseStandings(data) {
  const groups = [];
  const children = data.children ?? [];

  children.forEach(group => {
    const groupName = group.name ?? group.abbreviation ?? "Group";
    const entries = group.standings?.entries ?? [];

    const teams = entries.map(entry => {
      const stats = {};
      entry.stats?.forEach(s => { stats[s.name] = s.value; });

      return {
        teamId: entry.team?.id,
        name: entry.team?.displayName ?? entry.team?.name,
        abbreviation: entry.team?.abbreviation,
        logo: entry.team?.logos?.[0]?.href,
        played: stats.gamesPlayed ?? 0,
        wins: stats.wins ?? 0,
        draws: stats.ties ?? 0,
        losses: stats.losses ?? 0,
        goalsFor: stats.pointsFor ?? 0,
        goalsAgainst: stats.pointsAgainst ?? 0,
        goalDiff: stats.pointDifferential ?? 0,
        points: stats.points ?? 0,
      };
    // Sort: points desc → goal diff desc → goals for desc
    }).sort((a, b) =>
      b.points - a.points ||
      b.goalDiff - a.goalDiff ||
      b.goalsFor - a.goalsFor
    );

    groups.push({ name: groupName, teams });
  });

  return groups;
}
