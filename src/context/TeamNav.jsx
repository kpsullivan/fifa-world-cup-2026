import { createContext, useContext } from "react";

export const TeamNavContext = createContext({ navigateToTeam: () => {} });
export const useTeamNav = () => useContext(TeamNavContext);
