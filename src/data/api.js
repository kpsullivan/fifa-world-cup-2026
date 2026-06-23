// ESPN public sports API — no API key required
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const ESPN_V2_BASE = "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world";

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

  const teamStats = {};
  for (const t of data.boxscore?.teams ?? []) {
    const abbr = t.team?.abbreviation;
    const s = {};
    for (const stat of t.statistics ?? []) s[stat.name] = stat.displayValue;
    teamStats[abbr] = s;
  }

  const goals = [];
  for (const event of data.keyEvents ?? []) {
    const type = event.type?.type;
    if (!["goal", "penalty-goal", "own-goal"].includes(type)) continue;
    const player = event.participants?.[0]?.athlete;
    // Team name appears in parentheses: "Julián Quiñones (Mexico) right footed..."
    const teamMatch = event.text?.match(/\(([^)]+)\)/);
    goals.push({
      player: player?.displayName ?? "?",
      team: teamMatch?.[1] ?? "",
      clock: event.clock?.displayValue ?? "",
      isOwnGoal: type === "own-goal",
      isPenalty: type === "penalty-goal",
    });
  }

  return { teamStats, goals };
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

  const tally = {};
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const goal of r.value.goals ?? []) {
      if (goal.isOwnGoal) continue;
      const key = goal.player;
      if (!tally[key]) {
        const info = teamMap[goal.team] ?? {};
        tally[key] = { name: goal.player, team: goal.team, abbreviation: info.abbreviation ?? "", logo: info.logo ?? null, goals: 0 };
      }
      tally[key].goals++;
    }
  }

  return Object.values(tally)
    .filter(s => s.goals > 0)
    .sort((a, b) => b.goals - a.goals);
}

// Cache the full tournament schedule so multiple team lookups share one fetch
let _tournamentCache = null;
async function fetchAllTournamentMatches() {
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
