import type { Messages } from './en'

const sigay = (count: number) => `${count} sigay`

export const tl: Messages = {
  appName: 'Sungka',
  tagline: 'Ang tradisyonal na larong sigay ng mga Pilipino',
  languageName: 'Tagalog',

  language: {
    heading: 'Laruin sa English o Tagalog',
    note: 'Pwedeng magpalit anumang oras, kahit nasa gitna ng laro.',
    english: 'English',
    tagalog: 'Tagalog',
    label: 'Wika',
  },

  nav: {
    play: 'Maglaro',
    howToPlay: 'Paano Laruin',
    home: 'Home',
    back: 'Bumalik',
    soundOn: 'Bukas ang tunog',
    soundOff: 'Patay ang tunog',
    muteLabel: 'Patayin ang tunog',
    unmuteLabel: 'Buksan ang tunog',
  },

  rules: {
    title: 'Paano Laruin',
    intro: 'Dalawang hanay ng pitong bahay, may ulo sa magkabilang dulo, at pitong sigay sa bawat bahay.',
    steps: [
      {
        title: 'Maghulog ng sigay',
        body: 'Pumili ng isa sa mga bahay mo at kunin ang lahat ng sigay doon. Maghulog ng tig-isang sigay sa bawat susunod na butas, pakaliwa. Lalampasan mo ang ulo ng kalaban.',
      },
      {
        title: 'Sa ulo mo, ulit!',
        body: 'Kapag ang huling sigay mo ay napunta sa sarili mong ulo, makakapaglaro ka ulit.',
      },
      {
        title: 'Tuloy-tuloy (sunod)',
        body: 'Kapag ang huling sigay ay napunta sa butas na may laman na, kunin ang lahat ng laman nito at ituloy ang paghulog mula roon.',
      },
      {
        title: 'Huli!',
        body: 'Kapag ang huling sigay ay napunta sa walang lamang bahay sa panig mo, huli mo ito pati ang lahat ng sigay sa katapat na bahay, at mapupunta ang lahat sa ulo mo. Kung walang laman ang katapat, wala kang huhulihin. Kapag sa walang lamang bahay ng kalaban napunta, tapos na ang turno mo.',
      },
      {
        title: 'Walang sigay? Laktaw',
        body: 'Kung wala kang maihuhulog, lalaktawan ang turno mo. Kapag wala nang makakagalaw, tapos na ang round.',
      },
      {
        title: 'Laban: dalawang round',
        body: 'Ang laban ay dalawang round at nagpapalitan ang mauuna para patas. Pinagsasama ang sigay mo sa dalawang round at ang mas marami ang panalo. Piliin ang Mabilis kung isang round lang.',
      },
    ],
  },

  setup: {
    title: 'Ihanda ang laro',
    opponent: 'Kalaban',
    vsBot: 'Ikaw vs Bot',
    vsFriend: '2 tao',
    botLevel: 'Antas ng Bot',
    levels: { madali: 'Madali', katamtaman: 'Katamtaman', magaling: 'Magaling' },
    length: 'Haba ng laban',
    lengthMatch: 'Laban (2 round)',
    lengthQuick: 'Mabilis (1 round)',
    speed: 'Bilis ng animasyon',
    speeds: { slow: 'Mabagal', normal: 'Katamtaman', fast: 'Mabilis' },
    names: 'Mga pangalan',
    namePlaceholder: (seat: 1 | 2) => `Manlalaro ${seat}`,
    start: 'Simulan ang laro',
    wins: (count: number) => `${count} panalo na`,
  },

  players: {
    you: 'Ikaw',
    bot: 'Bot',
    numbered: (seat: number) => `Manlalaro ${seat}`,
  },

  game: {
    round: (current: number, total: number) => `Round ${current}/${total}`,
    totals: 'Kabuuan',
    ulo: 'Ulo',
    yourTurn: 'Ikaw na. Pumili ng bahay.',
    playerTurn: (name: string) => `${name}, pumili ng bahay mo.`,
    botThinking: (name: string) => `Nag-iisip si ${name}…`,
    sowing: 'Naghuhulog…',
    skip: 'Laktawan ang animasyon',
    extra: 'Ulit ka!',
    capture: (count: number) => `Huli! +${count}`,
    passed: (name: string) => `Walang sigay si ${name}, laktaw`,
    roundOver: (round: number) => `Tapos na ang round ${round}`,
    roundScore: (a: number, b: number) => `${a} laban sa ${b}`,
    nextRound: 'Susunod na round',
    seeResult: 'Tingnan ang resulta',
    leaveConfirm: 'Aalis ka sa laro? Mawawala ang progreso mo.',
    firstToMove: (name: string) => `Si ${name} ang mauuna sa round na ito`,
    board: 'Sungkaan',
  },

  pit: {
    shells: sigay,
    house: (owner: string, isYou: boolean, house: number, count: number) =>
      `Bahay ${house} ${isYou ? 'mo' : `ni ${owner}`}, ${sigay(count)}`,
    ulo: (owner: string, isYou: boolean, count: number) =>
      `Ulo ${isYou ? 'mo' : `ni ${owner}`}, ${sigay(count)}`,
  },

  result: {
    youWin: 'Panalo ka!',
    youLose: 'Panalo ang Bot ngayon',
    draw: 'Tabla ang laban!',
    winner: (name: string) => `Panalo si ${name}!`,
    rounds: 'Mga round',
    round: (n: number) => `Round ${n}`,
    total: 'Kabuuan',
    playAgain: 'Ulit',
    home: 'Home',
    record: 'Rekord mo laban sa mga Bot',
    recordRow: (wins: number, losses: number, draws: number) =>
      `${wins} panalo · ${losses} talo · ${draws} tabla`,
  },
}
