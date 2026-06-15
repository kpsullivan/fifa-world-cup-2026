// FIFA World Rankings as of June 2026 + team facts
// Ranking source: FIFA.com official rankings
export const countries = {
  // Group A
  "USA": {
    flag: "🇺🇸", name: "United States", group: "A", fifaRank: 11,
    confederation: "CONCACAF",
    facts: ["Co-hosting the 2026 World Cup with Canada & Mexico", "Made it to Round of 16 in 2022", "Star player: Christian Pulisic (AC Milan)", "Never won a World Cup"],
    coach: "Mauricio Pochettino", avgAge: 26.2,
  },
  "MEX": {
    flag: "🇲🇽", name: "Mexico", group: "A", fifaRank: 15,
    confederation: "CONCACAF",
    facts: ["Co-hosting the 2026 World Cup", "Famous for the 'Quinto Partido' curse — eliminated in Round of 16 seven times straight", "Star player: Hirving 'Chucky' Lozano", "Best World Cup finish: Quarterfinals (1970, 1986)"],
    coach: "Javier Aguirre", avgAge: 27.8,
  },
  "CAN": {
    flag: "🇨🇦", name: "Canada", group: "A", fifaRank: 38,
    confederation: "CONCACAF",
    facts: ["Co-hosting the 2026 World Cup", "Qualified for first World Cup since 1986 in 2022", "Star player: Alphonso Davies (Real Madrid)", "Top scorer Cyle Larin"],
    coach: "Jesse Marsch", avgAge: 25.1,
  },
  "URU": {
    flag: "🇺🇾", name: "Uruguay", group: "A", fifaRank: 14,
    confederation: "CONMEBOL",
    facts: ["Won the very first World Cup in 1930", "4th place in 2010", "Star player: Darwin Núñez (Liverpool)", "Legendary striker tradition: Suárez, Forlán, Cavani"],
    coach: "Marcelo Bielsa", avgAge: 26.5,
  },

  // Group B
  "ARG": {
    flag: "🇦🇷", name: "Argentina", group: "B", fifaRank: 1,
    confederation: "CONMEBOL",
    facts: ["Reigning World Cup champions (2022)", "Won 3 World Cups: 1978, 1986, 2022", "Led by Lionel Messi — arguably the greatest player ever", "Also won Copa América 2021 & 2024"],
    coach: "Lionel Scaloni", avgAge: 27.3,
  },
  "ESP": {
    flag: "🇪🇸", name: "Spain", group: "B", fifaRank: 3,
    confederation: "UEFA",
    facts: ["Won 2010 World Cup in South Africa", "Won back-to-back Euro titles (2008, 2012, 2024)", "Current Euro 2024 champions", "Star player: Pedri, Lamine Yamal"],
    coach: "Luis de la Fuente", avgAge: 25.9,
  },
  "MAR": {
    flag: "🇲🇦", name: "Morocco", group: "B", fifaRank: 13,
    confederation: "CAF",
    facts: ["Incredible 4th place finish at 2022 World Cup — best African team ever", "First African/Arab team to reach a World Cup semi-final", "Star player: Achraf Hakimi (PSG)", "Hosting 2030 World Cup"],
    coach: "Walid Regragui", avgAge: 27.1,
  },
  "CRO": {
    flag: "🇭🇷", name: "Croatia", group: "B", fifaRank: 9,
    confederation: "UEFA",
    facts: ["World Cup runners-up in 2018", "3rd place in 2022", "Star player: Luka Modrić — 2018 Ballon d'Or winner", "Small nation of only 4 million people"],
    coach: "Zlatko Dalić", avgAge: 28.4,
  },

  // Group C
  "BRA": {
    flag: "🇧🇷", name: "Brazil", group: "C", fifaRank: 5,
    confederation: "CONMEBOL",
    facts: ["Most World Cup wins ever: 5 times (1958, 1962, 1970, 1994, 2002)", "Only team to play in every World Cup", "Star player: Vinicius Jr (Real Madrid)", "Home of football legends: Pelé, Ronaldo, Ronaldinho"],
    coach: "Dorival Júnior", avgAge: 26.8,
  },
  "FRA": {
    flag: "🇫🇷", name: "France", group: "C", fifaRank: 2,
    confederation: "UEFA",
    facts: ["Won 1998 & 2018 World Cups", "Runner-up in 2022 (lost to Argentina on penalties)", "Star player: Kylian Mbappé (Real Madrid)", "One of the most talented squads in history"],
    coach: "Didier Deschamps", avgAge: 26.1,
  },
  "BEL": {
    flag: "🇧🇪", name: "Belgium", group: "C", fifaRank: 7,
    confederation: "UEFA",
    facts: ["3rd place in 2018 — 'Golden Generation' era", "Star players: Kevin De Bruyne, Romelu Lukaku", "Historically underachieved despite world-class talent", "Population of only 11 million"],
    coach: "Domenico Tedesco", avgAge: 29.2,
  },
  "JPN": {
    flag: "🇯🇵", name: "Japan", group: "C", fifaRank: 22,
    confederation: "AFC",
    facts: ["Shocked Germany & Spain in 2022 group stage", "Reached Round of 16 in 2022", "Star player: Takumi Minamino", "Known for discipline, teamwork, and tactical intelligence"],
    coach: "Hajime Moriyasu", avgAge: 25.7,
  },

  // Group D
  "ENG": {
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "England", group: "D", fifaRank: 4,
    confederation: "UEFA",
    facts: ["Only World Cup win: 1966 (at home)", "Lost Euro 2024 final to Spain", "Star player: Jude Bellingham (Real Madrid)", "'Football is coming home' — still waiting since 1966!"],
    coach: "Thomas Tuchel", avgAge: 26.4,
  },
  "GER": {
    flag: "🇩🇪", name: "Germany", group: "D", fifaRank: 12,
    confederation: "UEFA",
    facts: ["Won 4 World Cups: 1954, 1974, 1990, 2014", "Crashed out in group stage in 2018 & 2022", "Hosted Euro 2024 (eliminated by Spain in quarters)", "Star player: Florian Wirtz (Bayer Leverkusen)"],
    coach: "Julian Nagelsmann", avgAge: 25.3,
  },
  "POR": {
    flag: "🇵🇹", name: "Portugal", group: "D", fifaRank: 6,
    confederation: "UEFA",
    facts: ["Never won a World Cup (best: 3rd in 1966)", "Star player: Cristiano Ronaldo — all-time World Cup goals leader", "Won Euro 2016", "Strong generation of young talent behind Ronaldo"],
    coach: "Roberto Martínez", avgAge: 27.6,
  },
  "SEN": {
    flag: "🇸🇳", name: "Senegal", group: "D", fifaRank: 18,
    confederation: "CAF",
    facts: ["Reigning Africa Cup of Nations champions", "Reached 2022 Round of 16", "Star player: Sadio Mané (Al-Nassr)", "Best World Cup: Quarterfinals in 2002"],
    coach: "Aliou Cissé", avgAge: 26.9,
  },

  // Group E
  "NED": {
    flag: "🇳🇱", name: "Netherlands", group: "E", fifaRank: 8,
    confederation: "UEFA",
    facts: ["3-time World Cup runners-up (1974, 1978, 2010)", "Never won the World Cup despite legendary teams", "Star player: Virgil van Dijk (Liverpool)", "'Total Football' inventors"],
    coach: "Ronald Koeman", avgAge: 27.0,
  },
  "POR2": {
    flag: "🇦🇹", name: "Austria", group: "E", fifaRank: 24,
    confederation: "UEFA",
    facts: ["Best finish: 3rd place in 1954", "Star player: David Alaba (Real Madrid)", "Reached Euro 2024 Round of 16", "Strong Bundesliga presence"],
    coach: "Ralf Rangnick", avgAge: 26.1,
  },
  "ECU": {
    flag: "🇪🇨", name: "Ecuador", group: "E", fifaRank: 31,
    confederation: "CONMEBOL",
    facts: ["Opened 2022 World Cup with a win vs host Qatar", "Star player: Enner Valencia", "First qualified for World Cup in 2002", "Eliminated in group stage in 2022"],
    coach: "Sebastián Beccacece", avgAge: 25.8,
  },

  // Group F
  "ITA": {
    flag: "🇮🇹", name: "Italy", group: "F", fifaRank: 10,
    confederation: "UEFA",
    facts: ["4-time World Cup winners (1934, 1938, 1982, 2006)", "Shockingly failed to qualify for 2018 & 2022 World Cups", "Won Euro 2020 (played in 2021)", "Star player: Federico Chiesa"],
    coach: "Luciano Spalletti", avgAge: 27.5,
  },
  "COL": {
    flag: "🇨🇴", name: "Colombia", group: "F", fifaRank: 19,
    confederation: "CONMEBOL",
    facts: ["Copa América 2024 runners-up", "Star player: James Rodríguez — won Golden Boot at 2014 World Cup", "Quarter-finalist in 2014", "Didn't qualify for 2018 or 2022"],
    coach: "Néstor Lorenzo", avgAge: 27.2,
  },
  "NGR": {
    flag: "🇳🇬", name: "Nigeria", group: "F", fifaRank: 35,
    confederation: "CAF",
    facts: ["Most successful African team overall", "Best World Cup: Round of 16 (1994, 1998, 2014)", "Star player: Victor Osimhen (Napoli)", "Known as the 'Super Eagles'"],
    coach: "Eric Chelle", avgAge: 25.4,
  },

  // Group G
  "KOR": {
    flag: "🇰🇷", name: "South Korea", group: "G", fifaRank: 23,
    confederation: "AFC",
    facts: ["Miraculous 4th place in 2002 (co-hosted with Japan)", "Made Round of 16 in 2022 after beating Portugal in final group game", "Star player: Son Heung-min (Tottenham)", "Passionate fan base — 'Red Devils'"],
    coach: "Hong Myung-bo", avgAge: 27.3,
  },
  "AUS": {
    flag: "🇦🇺", name: "Australia", group: "G", fifaRank: 25,
    confederation: "AFC",
    facts: ["Surprising Quarter-finalist in 2022", "Star player: Mathew Ryan & Martin Boyle", "Known as the 'Socceroos'", "Switched from Oceania to Asian confederation in 2006"],
    coach: "Tony Popovic", avgAge: 27.1,
  },
  "NGA": {
    flag: "🇬🇭", name: "Ghana", group: "G", fifaRank: 40,
    confederation: "CAF",
    facts: ["Came so close to semis in 2010 — Suárez handball is infamous", "Best finish: Quarterfinals 2010", "Star player: Thomas Partey (Arsenal)", "Strong history despite small country"],
    coach: "Otto Addo", avgAge: 26.5,
  },

  // Group H
  "POR3": {
    flag: "🇨🇭", name: "Switzerland", group: "H", fifaRank: 20,
    confederation: "UEFA",
    facts: ["Consistently solid at World Cups", "Quarter-finalist in 2022 (lost to Argentina)", "Star player: Granit Xhaka (Bayer Leverkusen)", "Despite never winning, always competitive"],
    coach: "Murat Yakin", avgAge: 27.8,
  },
  "SRB": {
    flag: "🇷🇸", name: "Serbia", group: "H", fifaRank: 28,
    confederation: "UEFA",
    facts: ["Has arguably the best striker in the world: Dušan Vlahović", "Also has Alexander Mitrović as backup striker", "Star player: Dušan Tadić", "Qualified but struggled in 2022 group stage"],
    coach: "Dragan Stojković", avgAge: 27.0,
  },
  "CMR": {
    flag: "🇨🇲", name: "Cameroon", group: "H", fifaRank: 44,
    confederation: "CAF",
    facts: ["Known as the 'Indomitable Lions'", "Legendary player: Roger Milla — danced his way to 4 goals at 38 years old in 1994", "Best finish: Quarterfinals 1990", "Star player: André Onana (Man United)"],
    coach: "Marc Brys", avgAge: 26.8,
  },
};

// Get all unique groups
export const getGroups = () => {
  const groups = {};
  Object.entries(countries).forEach(([code, team]) => {
    if (!groups[team.group]) groups[team.group] = [];
    groups[team.group].push({ code, ...team });
  });
  return groups;
};
