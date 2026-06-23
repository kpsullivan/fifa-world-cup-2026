import { useState, useEffect } from "react";
import { fetchMatchesByDate } from "../data/api";
import { teamFacts } from "../data/teamFacts";
import { useTeamNav } from "../context/TeamNav";

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function localTime(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function TeamBlock({ team }) {
  const rank = teamFacts[team.abbreviation]?.fifaRank;
  const bgColor = team.color ? `#${team.color}` : "#1e3a5f";
  const { navigateToTeam } = useTeamNav();

  return (
    <button
      onClick={() => navigateToTeam({ id: team.id, displayName: team.name, abbreviation: team.abbreviation, logo: team.logo })}
      className="flex flex-col items-center w-5/12 active:scale-95 transition-transform"
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-1 overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {team.logo
          ? <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
          : <span className="text-white text-xs font-bold">{team.abbreviation}</span>
        }
      </div>
      <span className="text-sm font-semibold text-center leading-tight">{team.name}</span>
      {rank && <span className="text-xs text-yellow-400/80 mt-0.5">#{rank} FIFA</span>}
    </button>
  );
}

function MatchCard({ match }) {
  const isLive = match.statusState === "in";
  const isFinal = match.statusState === "post";
  const isScheduled = match.statusState === "pre";

  const statusColor = isLive ? "bg-red-500 animate-pulse"
    : isFinal ? "bg-gray-600"
    : "bg-emerald-700";

  // statusShort returns "42'", "HT", "Final", or "Scheduled" — use clock for live, else statusShort
  const statusLabel = isLive ? `LIVE ${match.clock || match.statusShort || ""}`
    : isFinal ? (match.statusShort || "Final")
    : localTime(match.isoDate);

  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-3 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50 truncate mr-2">
          {[match.venue, match.city].filter(Boolean).join(" · ")}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full text-white font-semibold flex-shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      {match.note && (
        <div className="text-xs text-yellow-400/70 mb-2">{match.note}</div>
      )}

      <div className="flex items-center justify-between">
        <TeamBlock team={match.home} />

        <div className="flex flex-col items-center w-2/12">
          {!isScheduled ? (
            <span className="text-2xl font-bold text-yellow-400">
              {match.home.score ?? 0} – {match.away.score ?? 0}
            </span>
          ) : (
            <span className="text-lg font-bold text-white/60">vs</span>
          )}
        </div>

        <TeamBlock team={match.away} />
      </div>
    </div>
  );
}

function DatePicker({ selectedDate, onSelect }) {
  const today = new Date();
  const todayStr = localDateStr(today);
  const dates = [];
  for (let i = -5; i <= 10; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(localDateStr(d));
  }

  const formatLabel = (str) => {
    if (str === todayStr) return "Today";
    const d = new Date(str + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {dates.map(d => (
        <button
          key={d}
          onClick={() => onSelect(d)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedDate === d
              ? "bg-yellow-400 text-gray-900"
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          {formatLabel(d)}
        </button>
      ))}
    </div>
  );
}

export default function TodayMatches() {
  const today = localDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMatchesByDate(selectedDate)
      .then(setMatches)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <div>
      <DatePicker selectedDate={selectedDate} onSelect={setSelectedDate} />

      {loading && (
        <div className="text-center text-white/50 py-12">
          <div className="text-3xl mb-3 animate-spin">⚽</div>
          <p>Loading matches...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-center text-red-300">
          <p className="font-semibold mb-1">Couldn't load matches</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="text-center text-white/50 py-12">
          <div className="text-4xl mb-3">📅</div>
          <p>No matches on this date</p>
        </div>
      )}

      {!loading && !error && matches.map(m => <MatchCard key={m.id} match={m} />)}
    </div>
  );
}
