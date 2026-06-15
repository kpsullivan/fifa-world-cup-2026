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

export async function fetchTodayMatches() {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
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

export async function fetchTeamSchedule(teamId) {
  const res = await fetch(`${ESPN_BASE}/teams/${teamId}/schedule`);
  if (!res.ok) throw new Error(`Failed to fetch schedule (${res.status})`);
  const data = await res.json();
  const events = data.events ?? [];
  return events.map(event => {
    const comp = event.competitions?.[0];
    const home = comp?.competitors?.find(c => c.homeAway === "home");
    const away = comp?.competitors?.find(c => c.homeAway === "away");
    const status = comp?.status?.type;
    return {
      id: event.id,
      isoDate: event.date,
      venue: comp?.venue?.fullName ?? "",
      city: comp?.venue?.address?.city ?? "",
      home: {
        id: home?.team?.id,
        name: home?.team?.displayName ?? home?.team?.name,
        abbreviation: home?.team?.abbreviation,
        logo: home?.team?.logo,
        color: home?.team?.color,
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
      statusState: comp?.status?.type?.state,
      statusShort: status?.shortDetail,
      clock: comp?.status?.displayClock,
      note: comp?.notes?.[0]?.headline ?? "",
    };
  });
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
      },
      away: {
        id: away?.team?.id,
        name: away?.team?.displayName ?? away?.team?.name,
        abbreviation: away?.team?.abbreviation,
        logo: away?.team?.logo,
        color: away?.team?.color,
        score: away?.score,
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
