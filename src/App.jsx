import { useState, useCallback } from "react";
import TodayMatches from "./components/TodayMatches";
import Standings from "./components/Standings";
import Teams from "./components/Teams";
import Bracket from "./components/Bracket";
import { TeamNavContext } from "./context/TeamNav";
import "./index.css";

const tabs = [
  { id: "matches",   label: "Matches",  icon: "⚽" },
  { id: "standings", label: "Standings", icon: "📊" },
  { id: "bracket",   label: "Bracket",  icon: "🏆" },
  { id: "teams",     label: "Teams",    icon: "🌍" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("matches");
  const [pendingTeam, setPendingTeam] = useState(null);

  const navigateToTeam = useCallback((team) => {
    setPendingTeam(team);
    setActiveTab("teams");
  }, []);

  const clearPendingTeam = useCallback(() => {
    setPendingTeam(null);
  }, []);

  return (
    <TeamNavContext.Provider value={{ navigateToTeam }}>
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1f3c] to-[#0a1628]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0a1628]/90 backdrop-blur border-b border-white/10 px-4">
          <div className="max-w-lg mx-auto">
            <div className="py-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">🏆 FIFA World Cup</h1>
                <p className="text-yellow-400 text-xs font-medium">USA · Canada · Mexico 2026</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/40">Group Stage</div>
                <div className="text-xs text-emerald-400 font-medium">● In Progress</div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <div className="sticky top-[73px] z-10 bg-[#0a1628]/90 backdrop-blur border-b border-white/10">
          <div className="max-w-lg mx-auto">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? "text-yellow-400 border-b-2 border-yellow-400"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-lg mx-auto px-4 py-4 pb-8">
          {activeTab === "matches"   && <TodayMatches />}
          {activeTab === "standings" && <Standings />}
          {activeTab === "bracket"   && <Bracket />}
          {activeTab === "teams"     && (
            <Teams externalSelected={pendingTeam} clearExternal={clearPendingTeam} />
          )}
        </main>
      </div>
    </TeamNavContext.Provider>
  );
}
