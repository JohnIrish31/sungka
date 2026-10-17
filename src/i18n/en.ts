const shells = (count: number) => `${count} ${count === 1 ? 'shell' : 'shells'}`

export const en = {
  appName: 'Sungka',
  tagline: 'The traditional Filipino shell game',
  languageName: 'English',

  language: {
    heading: 'Play in English or Tagalog',
    note: 'Switch any time, even in the middle of a game.',
    english: 'English',
    tagalog: 'Tagalog',
    label: 'Language',
  },

  nav: {
    play: 'Play',
    howToPlay: 'How to play',
    home: 'Home',
    back: 'Back',
    soundOn: 'Sound is on',
    soundOff: 'Sound is off',
    muteLabel: 'Turn sound off',
    unmuteLabel: 'Turn sound on',
  },

  rules: {
    title: 'How to play',
    intro: 'Two rows of seven houses, one ulo (store) on each end, seven shells in every house.',
    steps: [
      {
        title: 'Sow the shells',
        body: 'Pick one of your houses and take every shell in it. Drop one shell in each pit that follows, going counter-clockwise. You skip your opponent’s ulo.',
      },
      {
        title: 'Land in your ulo to go again',
        body: 'If your last shell falls in your own ulo, you get another turn.',
      },
      {
        title: 'Keep going (relay)',
        body: 'If your last shell lands in a pit that already has shells, pick them all up and keep sowing from there.',
      },
      {
        title: 'Capture',
        body: 'If your last shell lands in an empty house on your side, you take it together with all the shells in the house facing it, and they go to your ulo. If the house facing it is empty, nothing is captured. An empty house on your opponent’s side simply ends your turn.',
      },
      {
        title: 'No shells? You pass',
        body: 'If you have nothing to play, your turn is skipped. When nobody can move, the round is over.',
      },
      {
        title: 'Match: two rounds',
        body: 'A match is two rounds and the player who starts is swapped, so it is fair. Your shells from both rounds are added up and the bigger pile wins. Pick Quick for a single round.',
      },
    ],
  },

  setup: {
    title: 'Set up your game',
    opponent: 'Opponent',
    vsBot: 'You vs Bot',
    vsFriend: '2 players',
    botLevel: 'Bot level',
    levels: { madali: 'Easy', katamtaman: 'Medium', magaling: 'Hard' },
    length: 'Match length',
    lengthMatch: 'Match (2 rounds)',
    lengthQuick: 'Quick (1 round)',
    speed: 'Animation speed',
    speeds: { slow: 'Slow', normal: 'Normal', fast: 'Fast' },
    names: 'Names',
    namePlaceholder: (seat: 1 | 2) => `Player ${seat}`,
    start: 'Start game',
    wins: (count: number) => `${count} ${count === 1 ? 'win' : 'wins'} so far`,
  },

  players: {
    you: 'You',
    bot: 'Bot',
    numbered: (seat: number) => `Player ${seat}`,
  },

  game: {
    round: (current: number, total: number) => `Round ${current}/${total}`,
    totals: 'Total',
    ulo: 'Ulo',
    yourTurn: 'Your turn. Pick one of your houses.',
    playerTurn: (name: string) => `${name}, pick one of your houses.`,
    botThinking: (name: string) => `${name} is thinking…`,
    sowing: 'Sowing…',
    skip: 'Skip animation',
    extra: 'Go again!',
    capture: (count: number) => `Capture! +${count}`,
    passed: (name: string) => `${name} has no shells and passes`,
    roundOver: (round: number) => `Round ${round} is over`,
    roundScore: (a: number, b: number) => `${a} to ${b}`,
    nextRound: 'Next round',
    seeResult: 'See result',
    leaveConfirm: 'Leave this game? Your progress will be lost.',
    firstToMove: (name: string) => `${name} starts this round`,
    board: 'Sungka board',
  },

  pit: {
    shells,
    house: (owner: string, isYou: boolean, house: number, count: number) =>
      `${isYou ? 'Your' : `${owner}’s`} house ${house}, ${shells(count)}`,
    ulo: (owner: string, isYou: boolean, count: number) =>
      `${isYou ? 'Your' : `${owner}’s`} ulo, ${shells(count)}`,
  },

  result: {
    youWin: 'You win!',
    youLose: 'The bot wins this time',
    draw: 'It’s a draw!',
    winner: (name: string) => `${name} wins!`,
    rounds: 'Rounds',
    round: (n: number) => `Round ${n}`,
    total: 'Total',
    playAgain: 'Play again',
    home: 'Home',
    record: 'Your record vs bots',
    recordRow: (wins: number, losses: number, draws: number) =>
      `${wins}W · ${losses}L · ${draws}D`,
  },
}

export type Messages = typeof en
