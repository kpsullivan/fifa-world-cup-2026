import { useState, useEffect } from "react";
import { fetchGroupsForBracket, computeBest3rd } from "../data/api";
import { useTeamNav } from "../context/TeamNav";

function GroupTable({ group, best3rdIds }) {
  const { navigateToTeam } = useTeamNav();
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl mb-4 overflow-hidden border border-white/10">
      <div className="bg-yellow-400/20 px-4 py-2 border-b border-white/10">
        <span className="font-bold text-yellow-400 text-sm">{group.name.toUpperCase()}</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/40 text-xs">
            <th className="text-left px-4 py-2">Team</th>
            <th className="px-1 py-2">P</th>
            <th className="px-1 py-2">W</th>
            <th className="px-1 py-2">D</th>
            <th className="px-1 py-2">L</th>
            <th className="px-1 py-2">GD</th>
            <th className="px-2 py-2 font-bold text-white/60">Pts</th>
          </tr>
        </thead>
        <tbody>
          {group.teams.map((team, i) => {
            const isTop2 = i < 2;
            const is3rd = i === 2;
            const isQualified3rd = is3rd && best3rdIds.has(team.id);
            const rowBg = isTop2
              ? "bg-emerald-400/5"
              : isQualified3rd
              ? "bg-amber-400/8"
              : "";
            return (
              <tr key={team.id ?? i} className={`border-t border-white/5 ${rowBg}`}>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => navigateToTeam({ id: team.id, displayName: team.name, abbreviation: team.abbreviation, logo: team.logo })}
                    className="flex items-center gap-2 hover:opacity-70 transition-opacity text-left"
                  >
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <div className="w-6 h-6 bg-white/10 rounded-full" />
                    )}
                    <span className="font-medium text-sm truncate">{team.name}</span>
                    {isQualified3rd && (
                      <span className="text-[10px] text-amber-400 font-semibold ml-1">★3rd</span>
                    )}
                  </button>
                </td>
                <td className="text-center px-1 py-2.5 text-white/70">{team.played}</td>
                <td className="text-center px-1 py-2.5 text-white/70">{team.wins}</td>
                <td className="text-center px-1 py-2.5 text-white/70">{team.draws}</td>
                <td className="text-center px-1 py-2.5 text-white/70">{team.losses}</td>
                <td className="text-center px-1 py-2.5 text-white/70">
                  {team.goalDiff > 0 ? "+" : ""}{team.goalDiff}
                </td>
                <td className="text-center px-2 py-2.5 font-bold text-yellow-400">{team.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-1.5 border-t border-white/5 text-xs text-white/40">
        <span className="text-emerald-400/70">● Top 2 advance</span>
        <span className="mx-2">·</span>
        <span className="text-amber-400/70">★ Best 3rd (top 8 across all groups also advance)</span>
      </div>
    </div>
  );
}

export default function Standings() {
  const [groups, setGroups] = useState([]);
  const [best3rdIds, setBest3rdIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroupsForBracket()
      .then(groups => {
        setGroups(groups);
        const best3rd = computeBest3rd(groups);
        setBest3rdIds(new Set(best3rd.map(t => t.id)));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center text-white/50 py-12">
      <div className="text-3xl mb-3 animate-spin">⚽</div>
      <p>Loading standings...</p>
    </div>
  );

  if (error) return (
    <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-center text-red-300">
      <p className="font-semibold mb-1">Couldn't load standings</p>
      <p className="text-sm">{error}</p>
    </div>
  );

  if (groups.length === 0) return (
    <div className="text-center text-white/50 py-12">
      <p>Standings not yet available</p>
    </div>
  );

  return (
    <div>
      <p className="text-white/50 text-xs mb-4 text-center">
        Top 2 from each group advance · Best 8 third-place teams also advance
      </p>
      {groups.map(g => <GroupTable key={g.name} group={g} best3rdIds={best3rdIds} />)}
    </div>
  );
}
