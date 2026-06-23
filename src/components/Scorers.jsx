import { useState, useEffect } from "react";
import { fetchTopScorers } from "../data/api";
import { teamFacts } from "../data/teamFacts";
import { useTeamNav } from "../context/TeamNav";

export default function Scorers() {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { navigateToTeam } = useTeamNav();

  useEffect(() => {
    fetchTopScorers()
      .then(setScorers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center text-white/50 py-12">
      <div className="text-3xl mb-3 animate-spin">⚽</div>
      <p>Tallying goals...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-center text-red-300">
      <p className="font-semibold mb-1">Couldn't load scorers</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  if (scorers.length === 0) return (
    <div className="text-center text-white/50 py-12">
      <div className="text-4xl mb-3">🥅</div>
      <p>No goals scored yet</p>
    </div>
  );

  const topGoals = scorers[0]?.goals ?? 1;

  return (
    <div>
      <p className="text-white/50 text-xs mb-4 text-center">
        Tournament Golden Boot race · Updated from completed matches
      </p>

      <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden border border-white/10">
        {scorers.map((scorer, i) => {
          const rank = i + 1;
          const rankColor = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : "text-white/40";
          const barWidth = Math.round((scorer.goals / topGoals) * 100);
          const facts = teamFacts[scorer.abbreviation];

          return (
            <div key={scorer.name} className={`px-4 py-3 border-b border-white/5 last:border-0 ${rank <= 3 ? "bg-yellow-400/3" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold w-6 text-center flex-shrink-0 ${rankColor}`}>
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </span>

                <button
                  onClick={() => scorer.abbreviation && navigateToTeam({
                    id: null,
                    displayName: scorer.team,
                    abbreviation: scorer.abbreviation,
                    logo: scorer.logo,
                  })}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left hover:opacity-70 transition-opacity"
                >
                  {scorer.logo
                    ? <img src={scorer.logo} alt={scorer.team} className="w-6 h-6 object-contain flex-shrink-0" />
                    : <div className="w-6 h-6 bg-white/10 rounded-full flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{scorer.name}</div>
                    <div className="text-xs text-white/40 truncate">{scorer.team}</div>
                  </div>
                </button>

                <div className="text-right flex-shrink-0">
                  <span className={`text-xl font-bold ${rank === 1 ? "text-yellow-400" : "text-white"}`}>
                    {scorer.goals}
                  </span>
                  <span className="text-xs text-white/40 ml-1">{scorer.goals === 1 ? "goal" : "goals"}</span>
                </div>
              </div>

              {/* Goal bar */}
              <div className="mt-2 ml-9 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${rank === 1 ? "bg-yellow-400" : rank <= 3 ? "bg-yellow-400/60" : "bg-white/30"}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-white/30 text-xs text-center mt-3">
        Own goals not counted · Penalty goals marked (pen)
      </p>
    </div>
  );
}
