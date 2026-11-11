/* ============================================================
   DATI: catalogo componenti, build dei PDF, usi, giochi.
   Prezzi: p  = scenario A (PDF "Consulenza" 27 ott 2026, prezzi reali IT)
           p2 = scenario B (PDF "Build PC Niky" 15 ott 2026, stime centrali)
   v: 'V' = verificato su listini italiani, 'S' = stima / non verificato
   ============================================================ */

const CATS = [
  { key: 'cpu',    label: 'Processore',    icon: '🧠', color: '#ff4fd8' },
  { key: 'gpu',    label: 'Scheda video',  icon: '🎮', color: '#22d3ee' },
  { key: 'mobo',   label: 'Scheda madre',  icon: '🧩', color: '#a78bfa' },
  { key: 'ram',    label: 'RAM',           icon: '⚡', color: '#fbbf24' },
  { key: 'ssd',    label: 'SSD',           icon: '💾', color: '#34d399' },
  { key: 'psu',    label: 'Alimentatore',  icon: '🔌', color: '#fb923c' },
  { key: 'cooler', label: 'Dissipatore',   icon: '❄️', color: '#60a5fa' },
  { key: 'case',   label: 'Case',          icon: '🖥️', color: '#f472b6' },
];

const ITEMS = {
  cpu: [
    { id: 'r5-9600x', name: 'Ryzen 5 9600X', brand: 'AMD', socket: 'AM5', cores: 6, thr: 12, g: 80, mt: 52, power: 130, vrm: 2,
      p: 188.6, v: 'V', spec: '6 core · AM5 · 105 W',
      note: 'Il best buy d\'ingresso: 6 core Zen 5 velocissimi nei giochi, soprattutto in Full HD. Per montaggio video e progetti audio pesanti hai meno margine dei fratelli maggiori.' },
    { id: 'r7-9700x', name: 'Ryzen 7 9700X', brand: 'AMD', socket: 'AM5', cores: 8, thr: 16, g: 84, mt: 66, power: 110, vrm: 2,
      p: 294.8, v: 'V', spec: '8 core · AM5 · 65 W',
      note: 'Il compromesso più sensato se giochi E monti: 8 core efficienti. Per il PDF di consulenza, per i video un 9700X con SSD da 2 TB è più utile di un 9800X3D.' },
    { id: 'r7-9800x3d', name: 'Ryzen 7 9800X3D', brand: 'AMD', socket: 'AM5', cores: 8, thr: 16, g: 100, mt: 68, power: 130, vrm: 3,
      p: 408.1, p2: 420, v: 'V', spec: '8 core · 3D V-Cache · AM5',
      note: 'La CPU gaming più veloce di questa fascia. Per audio, Godot e video leggeri è abbondante. Costa ~110 € più del 9700X: li spendi per i frame, non per il montaggio.' },
    { id: 'r7-7800x3d', name: 'Ryzen 7 7800X3D', brand: 'AMD', socket: 'AM5', cores: 8, thr: 16, g: 93, mt: 64, power: 120, vrm: 3,
      p: 430, v: 'S', spec: '8 core · 3D V-Cache · AM5 (gen. precedente)',
      note: 'Il predecessore del 9800X3D: ancora fortissimo nei giochi (3D V-Cache), una spanna sotto il 9800X3D. Su audio e video è alla pari di un 9700X. Compare spesso nei PC preassemblati.' },
    { id: 'r9-9950x', name: 'Ryzen 9 9950X', brand: 'AMD', socket: 'AM5', cores: 16, thr: 32, g: 87, mt: 100, power: 220, vrm: 4,
      p: 560, v: 'S', spec: '16 core · AM5 · 170 W',
      note: 'Una belva per render e montaggio pesante, ma nei giochi non batte il 9800X3D e costa un rene. Per i tuoi usi è un lusso, non una necessità.' },
    { id: 'u7-265k', name: 'Core Ultra 7 265K', brand: 'Intel', socket: 'LGA1851', cores: 20, thr: 20, g: 80, mt: 92, power: 250, vrm: 4,
      p: 370, v: 'S', spec: '20 core · LGA1851 · 125 W',
      note: 'Ottimo in produttività, ma consumi alti e prestazioni gaming sotto agli X3D. Fuori dalla linea AM5 della consulenza.' },
    { id: 'i5-14600k', name: 'Core i5-14600K', brand: 'Intel', socket: 'LGA1700', cores: 14, thr: 20, g: 80, mt: 72, power: 180, vrm: 3,
      p: 270, v: 'S', spec: '14 core · LGA1700 · 125 W',
      note: 'Buona CPU, ma su un socket a fine vita: niente upgrade futuri e consumi alti. AM5 è un investimento migliore.' },
  ],

  gpu: [
    { id: 'gtx1660s', name: 'GTX 1660 Super (la tua attuale)', brand: 'NVIDIA', idx: 22, vram: 6, tdp: 125,
      p: 0, v: 'V', spec: '6 GB · già in tuo possesso',
      note: 'La tua scheda attuale: 6 GB di VRAM sono il motivo dei lag con Hogwarts Legacy, Arc Raiders e AION 2. Tenerla fa risparmiare ~700 €, ma non è una build da gaming 2026.' },
    { id: 'rx9060xt', name: 'Radeon RX 9060 XT 16 GB', brand: 'AMD', idx: 55, vram: 16, tdp: 160,
      p: 400, v: 'S', spec: '16 GB · 160 W',
      note: 'Entry level moderno con 16 GB di VRAM: ottima per il Full HD, regge anche il 1440p con dettagli sensati. Meno margine per GTA 6 e giochi futuri.' },
    { id: 'rtx5070', name: 'GeForce RTX 5070', brand: 'NVIDIA', idx: 66, vram: 12, tdp: 250,
      p: 600, v: 'S', spec: '12 GB · DLSS · CUDA',
      note: 'DLSS, CUDA e NVENC, ma solo 12 GB di VRAM: nei giochi 2026 se ne consigliano 16. Va bene in FHD/QHD, tra qualche anno la VRAM potrebbe farsi sentire.' },
    { id: 'rx9070', name: 'Radeon RX 9070 16 GB', brand: 'AMD', idx: 74, vram: 16, tdp: 220,
      p: 680, p2: 680, v: 'S', spec: '16 GB · 220 W',
      note: 'Il punto dolce secondo il PDF: in Full HD la differenza con la XT è piccola e lascia ~190 € di margine, utili con la RAM così cara. 16 GB di VRAM: scelta sicura.' },
    { id: 'rx9070xt', name: 'Radeon RX 9070 XT 16 GB', brand: 'AMD', idx: 82, vram: 16, tdp: 304,
      p: 833.15, p2: 850, v: 'V', spec: '16 GB · 304 W',
      note: 'La scelta consigliata dal PDF: potenza da 1440p alto, 16 GB e prezzo ben sotto la RTX 5070 Ti. Va bene con DaVinci Resolve e Premiere per montaggi semplici.' },
    { id: 'rtx5070ti', name: 'GeForce RTX 5070 Ti', brand: 'NVIDIA', idx: 88, vram: 16, tdp: 300,
      p: 1300, v: 'S', spec: '16 GB · DLSS · CUDA',
      note: 'Fuori budget a 2000-2500 € (1.150-1.500 € in Italia, spesso introvabile). Ottima per encoding, CUDA e IA, ma per giocare in Full HD è una Ferrari per andare a fare la spesa.' },
    { id: 'rtx5080', name: 'GeForce RTX 5080', brand: 'NVIDIA', idx: 98, vram: 16, tdp: 360,
      p: 1550, v: 'S', spec: '16 GB · 360 W',
      note: 'Top di gamma: 4K senza paura. Ma con queste cifre il budget evapora e la build diventa un altro tipo di progetto.' },
  ],

  mobo: [
    { id: 'b650m-s2h', name: 'Gigabyte B650M S2H', socket: 'AM5', form: 'mATX', wifi: false, vrm: 2,
      p: 102.5, v: 'V', spec: 'AM5 · mATX · DDR5',
      note: 'La B650 più economica trovata: fa il suo lavoro con CPU da 65-105 W. Niente Wi-Fi e VRM semplici: non abbinarla a CPU pesanti.' },
    { id: 'b650m-tuf', name: 'ASUS TUF B650M-E', socket: 'AM5', form: 'mATX', wifi: false, vrm: 3,
      p: 128.99, v: 'V', spec: 'AM5 · mATX · DDR5',
      note: 'La B650 usata nel PDF di consulenza: solida, prezzo onesto. Ideale per tenere basso il totale senza rinunciare all\'AM5.' },
    { id: 'asus-b850-plus', name: 'ASUS PRIME B850-PLUS-CSM', socket: 'AM5', form: 'ATX', wifi: false, vrm: 4,
      p: 170, v: 'S', spec: 'AM5 · ATX · DDR5 · senza Wi-Fi',
      note: 'B850 ATX solida di ASUS, ma senza Wi-Fi: se hai il PC in Ethernet (come nella postazione dual PC) non ti serve altro.' },
    { id: 'b850-atx', name: 'B850 ATX con Wi-Fi (MSI/Gigabyte)', socket: 'AM5', form: 'ATX', wifi: true, vrm: 4,
      p: 165, v: 'S', spec: 'AM5 · ATX · Wi-Fi · PCIe 5',
      note: 'La scelta della build Niky: VRM robusti, Wi-Fi e più slot. Per 40 € in più della B650 ti compri più tranquillità e margine di upgrade.' },
    { id: 'x870e', name: 'X870E ATX Wi-Fi', socket: 'AM5', form: 'ATX', wifi: true, vrm: 5,
      p: 330, v: 'S', spec: 'AM5 · ATX · USB4 · top',
      note: 'Il meglio di AM5, ma per i tuoi usi è spesso un sovrapprezzo: ~165 € in più della B850 che non diventano frame.' },
    { id: 'z790', name: 'Z790 DDR5 ATX', socket: 'LGA1700', form: 'ATX', wifi: true, vrm: 4,
      p: 230, v: 'S', spec: 'LGA1700 · ATX · DDR5',
      note: 'Piattaforma Intel a fine vita: la compri oggi e non potrai cambiare CPU domani.' },
    { id: 'z890', name: 'Z890 ATX Wi-Fi', socket: 'LGA1851', form: 'ATX', wifi: true, vrm: 4,
      p: 280, v: 'S', spec: 'LGA1851 · ATX · DDR5',
      note: 'Piattaforma Intel recente. Costa più di una B850 e fa girare CPU meno efficienti nei giochi.' },
  ],

  ram: [
    { id: 'ram16', name: '16 GB (2×8) DDR5-6000', gb: 16, p: 340, v: 'S', spec: 'DDR5-6000 · 16 GB',
      note: 'Il PDF è chiaro: non scendere a 16 GB. Per montaggio e giochi moderni è stretta e ti ritrovi a upgradare subito, con la RAM che costa tantissimo.' },
    { id: 'ram32', name: '32 GB (2×16) DDR5-6000 CL30', gb: 32, p: 681.69, p2: 500, v: 'S', spec: 'DDR5-6000 CL30 · EXPO',
      note: 'La quantità giusta. Ma attenzione: la crisi DRAM (domanda server/AI) ha fatto esplodere i prezzi, ~un terzo del totale. Previsione: nessun calo prima del 2027, e il Black Friday non aiuta sulla RAM.' },
    { id: 'ram64', name: '64 GB (2×32) DDR5-6000', gb: 64, p: 1350, p2: 1000, v: 'S', spec: 'DDR5-6000 · 64 GB',
      note: 'Di lusso: per video leggeri e Godot è esagerata, soprattutto con questi prezzi. Meglio i 32 GB e il resto in GPU o SSD.' },
  ],

  ssd: [
    { id: 'ssd1', name: 'SSD NVMe Gen4 1 TB', tb: 1, spd: 7000, p: 155, v: 'S', spec: '1 TB · PCIe 4.0',
      note: 'Basta per partire: Windows, giochi principali e progetti in corso. Se vuoi risparmiare ~100 €, prendi questo e aggiungi un secondo disco più avanti.' },
    { id: 'ssd2', name: 'SSD NVMe Gen4 2 TB', tb: 2, spd: 7000, p: 260, v: 'S', spec: '2 TB · PCIe 4.0 (990 EVO Plus, SN850X…)',
      note: 'Il punto giusto per chi fa podcast e video: i progetti occupano molto spazio. Per i video è un investimento più utile di una CPU più potente.' },
    { id: 'ssd2g5', name: 'SSD NVMe Gen5 2 TB', tb: 2, spd: 12000, p: 340, v: 'S', spec: '2 TB · PCIe 5.0',
      note: 'Velocissimo sulla carta, ma nell\'uso reale (gioco, montaggio leggero) il vantaggio rispetto a un Gen4 è minimo. Scalda di più.' },
    { id: 'ssd4', name: 'SSD NVMe Gen4 4 TB', tb: 4, spd: 7000, p: 560, v: 'S', spec: '4 TB · PCIe 4.0',
      note: 'Spazio per anni di progetti e libreria giochi. Costoso adesso: valuta 2 TB + secondo disco in futuro.' },
  ],

  psu: [
    { id: 'psu650', name: '650 W 80+ Bronze', w: 650, qual: 'Bronze', p: 70, v: 'S', spec: '650 W · Bronze',
      note: 'Risparmi pochi euro ma resti al limite con una GPU moderna: non è dove conviene tagliare.' },
    { id: 'psu750', name: '750 W 80+ Gold modulare ATX 3.x', w: 750, qual: 'Gold', p: 100, v: 'S', spec: '750 W · Gold · ATX 3.x',
      note: 'La scelta della build Niky: Gold, modulare, abbastanza per una 9070/9070 XT con un margine onesto.' },
    { id: 'psu750b', name: '750 W 80+ Bronze (marca non indicata)', w: 750, qual: 'Bronze', p: 80, v: 'S', spec: '750 W · Bronze · marca ignota',
      note: 'Il pezzo su cui i preassemblati risparmiano più volentieri. Con una scheda da 300 W è al minimo consigliato: chiedi marca e modello, e valuta il passaggio a un 850 W Gold (~+40 €).' },
    { id: 'rmx850', name: 'Corsair RMx 850 W Gold ATX 3.1 (modulare)', w: 850, qual: 'Gold', p: 150, v: 'S', spec: '850 W · Gold · modulare · ATX 3.1',
      note: 'Un alimentatore di marca nota e di buona qualità: è uno dei pezzi in cui conviene non risparmiare.' },
    { id: 'psu850', name: '850 W 80+ Gold ATX 3.1', w: 850, qual: 'Gold', p: 120, v: 'S', spec: '850 W · Gold · ATX 3.1',
      note: 'La scelta della consulenza: per ~20 € in più hai margine per cambiare GPU in futuro senza cambiare alimentatore.' },
    { id: 'psu1000', name: '1000 W 80+ Gold ATX 3.1', w: 1000, qual: 'Gold', p: 170, v: 'S', spec: '1000 W · Gold · ATX 3.1',
      note: 'Per GPU top o per dormire sonni tranquilli. Con una 9070 XT è sovradimensionato.' },
  ],

  cooler: [
    { id: 'pa120', name: 'Thermalright Peerless Assassin 120 (SE ARGB)', type: 'aria', h: 157, rad: 0, cap: 260, silent: 70,
      p: 49.95, p2: 65, v: 'S', spec: 'Aria doppia torre · 157 mm · ARGB',
      note: 'Il re del rapporto qualità/prezzo: raffredda come dissipatori da 100 €. Con ventole lente è anche discreto per la registrazione.' },
    { id: 'nhd15', name: 'Noctua NH-D15 G2', type: 'aria', h: 168, rad: 0, cap: 300, silent: 92, p: 110, v: 'S', spec: 'Aria · 168 mm · silenziosissimo',
      note: 'Il più silenzioso: perfetto se registri nella stessa stanza del PC. Alto e pesante: controlla il case. Niente RGB.' },
    { id: 'aio240', name: 'AIO 240 mm', type: 'liquido', h: 0, rad: 240, cap: 300, silent: 68, p: 90, v: 'S', spec: 'Liquido · radiatore 240 mm',
      note: 'Estetico e pulito intorno al socket. Prestazioni simili a un buon dissipatore ad aria, ma con la pompa che aggiunge rumore.' },
    { id: 'aio360', name: 'AIO 360 mm', type: 'liquido', h: 0, rad: 360, cap: 400, silent: 72, p: 115, v: 'S', spec: 'Liquido · radiatore 360 mm',
      note: 'Per CPU molto calde (9950X, Ultra 7). Tre ventole lente = silenzio e freddo, ma richiede un case grande.' },
  ],

  case: [
    { id: 'case-rgb', name: 'Case ATX con RGB (generico)', forms: ['ATX', 'mATX'], maxCooler: 160, rad: 240, air: 70, silent: 55, rgb: true,
      p: 75, v: 'S', spec: 'ATX · RGB · airflow medio',
      note: 'Il case economico della consulenza: fa il suo lavoro, estetica RGB inclusa. Spazio limitato per dissipatori giganti.' },
    { id: 'h7flow', name: 'NZXT H7 Flow RGB', forms: ['ATX', 'mATX'], maxCooler: 185, rad: 360, air: 90, silent: 40, rgb: true,
      p: 120, v: 'S', spec: 'ATX · RGB · frontale forato',
      note: 'Il frontale forato fa passare tanta aria, ma anche rumore. Per registrare: ventole da 140 mm lente, curva gentile e PC lontano dal microfono.' },
    { id: 'fv150', name: 'Cougar FV150 RGB', forms: ['ATX', 'mATX'], maxCooler: 160, rad: 360, air: 65, silent: 60, rgb: true,
      p: 90, v: 'S', spec: 'ATX · RGB · vetro · dual chamber',
      note: 'Case panoramico con vetro temperato e 4 ventole ARGB incluse, camera separata per alimentatore e cavi. Bello da vedere; il frontale in vetro limita un po\' l\'aria.' },
    { id: 'antec', name: 'Antec C3 Black', forms: ['ATX', 'mATX'], maxCooler: 160, rad: 360, air: 70, silent: 55, rgb: true,
      p: 85, v: 'S', spec: 'ATX · RGB · vetro · 4 ventole ARGB',
      note: 'Mid-tower ATX con vetro e 4 ventole ARGB incluse, spazio per radiatori da 360 mm. Estetico e semplice da montare; per le registrazioni non è il più silenzioso.' },
    { id: 'pcs-spectrum', name: 'PCS Spectrum II Compact ARGB Bianco', forms: ['ATX', 'mATX'], maxCooler: 155, rad: 360, air: 85, silent: 45, rgb: true,
      p: 90, v: 'S', spec: 'ATX compatto · RGB · frontale a rete',
      note: 'Compatto (405 × 210 × 360 mm), frontale a rete e ventole ARGB: l\'aria passa bene, ma il rumore anche. Per le registrazioni non è la scelta migliore.' },
    { id: 'north', name: 'Fractal Design North', forms: ['ATX', 'mATX'], maxCooler: 170, rad: 360, air: 72, silent: 75, rgb: false,
      p: 140, v: 'S', spec: 'ATX · legno/acciaio · silenzioso',
      note: 'Il più silenzioso e bello da vedere, ma senza RGB: se il tuo PC deve brillare, questo no.' },
    { id: 'case-matx', name: 'Case mATX compatto con RGB', forms: ['mATX'], maxCooler: 160, rad: 240, air: 60, silent: 50, rgb: true,
      p: 70, v: 'S', spec: 'mATX · RGB · compatto',
      note: 'Piccolo, sulla scrivania sta bene. Solo schede mATX e spazio per dissipatori contato.' },
  ],
};

const USES = [
  { key: 'fhd',    label: 'Gaming Full HD',        short: 'Full HD', icon: '🎮' },
  { key: 'qhd',    label: 'Gaming 1440p',          short: '1440p',   icon: '🕹️' },
  { key: 'uhd',    label: 'Gaming 4K',             short: '4K',      icon: '📺' },
  { key: 'audio',  label: 'Podcast & sound design',short: 'Audio',   icon: '🎙️' },
  { key: 'video',  label: 'Montaggio video',       short: 'Video',   icon: '🎬' },
  { key: 'dev',    label: 'Godot & vibe coding',   short: 'Dev',     icon: '👾' },
  { key: 'ai',     label: 'IA in locale',          short: 'IA',      icon: '🤖' },
  { key: 'future', label: 'Longevità (GTA 6…)',    short: 'Futuro',  icon: '🔮' },
];

const PROFILES = {
  niky:    { label: 'Tuttofare (Niky)', uses: ['fhd', 'audio', 'video', 'dev', 'future'] },
  gaming:  { label: 'Solo gaming',      uses: ['fhd', 'qhd', 'future'] },
  creator: { label: 'Creator audio/video', uses: ['audio', 'video', 'dev'] },
  uhd:     { label: 'Gaming 4K',        uses: ['qhd', 'uhd', 'future'] },
  ai:      { label: 'IA & produzione',  uses: ['ai', 'video', 'dev'] },
};

/* Testi pre-programmati per ogni uso: [>=85, >=70, >=55, resto] */
const USE_TEXT = {
  fhd: [
    'Full HD ultra senza pensieri: i giochi 2026 volano ben oltre il livello PS5, anche con dettagli al massimo.',
    'Full HD alto e fluido: giochi moderni in ultra o quasi, con ampio margine rispetto a una PS5.',
    'Full HD giocabile: dettagli medio-alti nei titoli 2026, ma qualche gioco pesante ti chiederà compromessi.',
    'Full HD con compromessi: sei al limite o sotto una PS5. Qui serve una scheda video più forte.',
  ],
  qhd: [
    '1440p ultra: risoluzione che oggi è il sogno di ogni giocatore, e tu ci arrivi comodo.',
    '1440p alto: ottima esperienza, con qualche impostazione da calibrare nei titoli più pesanti.',
    '1440p a compromessi: serve DLSS/FSR e dettagli medi per restare fluido.',
    '1440p sconsigliato: con questa scheda resta in Full HD.',
  ],
  uhd: [
    '4K senza paura: build da monitor 4K vero.',
    '4K con upscaling: giocabile con FSR/DLSS e qualche rinuncia. Il PDF ricorda che il 4K non ti serve.',
    '4K solo con upscaling spinto: l\'esperienza non è ideale.',
    '4K fuori portata: resta su Full HD o 1440p.',
  ],
  audio: [
    'Studio di registrazione pronto: CPU e RAM abbondanti, PC silenzioso. Pro Tools, plugin e podcast filano.',
    'Ottimo per podcast e sound design. Controlla rumore di ventole e GPU, tieni il PC lontano dal microfono.',
    'Funziona, ma il PC può essere rumoroso o poco spazioso per progetti audio grandi.',
    'Per registrare va stretto: troppo rumore o RAM/CPU al limite con tanti plugin.',
  ],
  video: [
    'Montaggio video con i fiocchi: DaVinci Resolve e Premiere scorrono anche su progetti pesanti.',
    'Ottimo per montaggio YouTube/podcast video: timeline fluide ed export veloci.',
    'Montaggi semplici sì, 4K multicamera no: prepara proxy e pazienza.',
    'Per il video è sotto pari: CPU, RAM o GPU limitano molto.',
  ],
  dev: [
    'Godot, GDScript e vibe coding sono una passeggiata: compilazioni e editor reattivi, anche con più app aperte.',
    'Più che sufficiente per Godot 2D e coding: lavori senza attese.',
    'Ci lavori, ma con più app aperte (Godot, browser, DAW) potresti sentire il peso.',
    'Limitato anche per il coding: servono più RAM o una CPU migliore.',
  ],
  ai: [
    'IA in locale molto capace: tanta VRAM e CUDA. Non richiesto dal PDF, ma ci si diverte.',
    'IA in locale discreta: modelli medi e generazione immagini fattibili.',
    'IA in locale limitata: solo modelli piccoli. Per il PDF l\'IA va online, quindi nessun problema.',
    'IA in locale non adatta: usa i servizi online (come previsto nei requisiti del PDF).',
  ],
  future: [
    'Build a prova di futuro: GTA 6 su PC (previsto fine 2027-2028) e giochi dei prossimi 4-5 anni senza ansia.',
    'Longevità buona: arriverà a GTA 6 e oltre, magari cambiando solo la scheda video.',
    'Longevità media: tra 2-3 anni potresti dover aggiornare qualcosa.',
    'Longevità corta: fra poco dovrai rimetterci mano (socket, RAM o scheda video).',
  ],
};

/* Giochi in lista: demand = punteggio Full HD richiesto per un'esperienza "fluida e alta" */
const GAMES = [
  { name: 'AION 2',                demand: 40, note: 'Requisiti: RTX 2070 8 GB consigliata' },
  { name: 'Arc Raiders',           demand: 55, note: 'Uno dei giochi che lagga con 6 GB di VRAM' },
  { name: 'Hogwarts Legacy',       demand: 60, note: 'Molto esigente con VRAM e CPU' },
  { name: 'Cyberpunk 2077 (RT)',   demand: 80, note: 'Ray tracing: la prova del fuoco' },
  { name: 'GTA 6 (previsione)',    demand: 72, note: 'Su PC stimato tra fine 2027 e 2028: solo previsione' },
];

/* ============================================================
   Build dei PDF.  src: 'A' = Consulenza 27/10, 'B' = Build Niky 15/10
   ============================================================ */
const BASE_A = { gpu: 'rx9070xt', ram: 'ram32', mobo: 'b650m-tuf', psu: 'psu850', cooler: 'pa120', case: 'case-rgb' };
const BASE_B = { cpu: 'r7-9800x3d', ram: 'ram32', ssd: 'ssd2', mobo: 'b850-atx', psu: 'psu750', cooler: 'pa120', case: 'h7flow' };

const PRESETS = [
  { id: 'a2000', src: 'A', title: 'Base equilibrata',  budget: 2000, pdfTotal: 2232, note: 'Base equilibrata. Il più economico: sfora di ~232 €.',
    build: { ...BASE_A, cpu: 'r5-9600x', ssd: 'ssd1' } },
  { id: 'a2100', src: 'A', title: '8 core per il montaggio', budget: 2100, pdfTotal: 2339, note: '8 core: meglio per montaggio.',
    build: { ...BASE_A, cpu: 'r7-9700x', ssd: 'ssd1' } },
  { id: 'a2200', src: 'A', title: 'Più spazio per i progetti', budget: 2200, pdfTotal: 2444, note: 'Più spazio per i progetti (SSD 2 TB).',
    build: { ...BASE_A, cpu: 'r7-9700x', ssd: 'ssd2' } },
  { id: 'a2300', src: 'A', title: 'Top per il gaming', budget: 2300, pdfTotal: 2452, note: 'Top per gaming con SSD 1 TB.',
    build: { ...BASE_A, cpu: 'r7-9800x3d', ssd: 'ssd1' } },
  { id: 'a2400', src: 'A', title: 'La più equilibrata', budget: 2400, pdfTotal: 2557, note: 'Build più equilibrata: X3D + SSD 2 TB.',
    build: { ...BASE_A, cpu: 'r7-9800x3d', ssd: 'ssd2' } },
  { id: 'a2500alt', src: 'A', title: 'Alternativa RTX 5070 Ti', budget: 2500, pdfTotal: null, note: 'Alternativa del PDF: RTX 5070 Ti + 9600X (costosa e difficile da trovare).',
    build: { ...BASE_A, cpu: 'r5-9600x', gpu: 'rtx5070ti', ssd: 'ssd2' } },
  { id: 'b9070', src: 'B', title: 'Niky con RX 9070', budget: 2500, pdfTotal: 2310, note: 'La build che rientra nel budget: 9800X3D + RX 9070 liscia.',
    build: { ...BASE_B, gpu: 'rx9070' } },
  { id: 'b9070xt', src: 'B', title: 'Niky con RX 9070 XT', budget: 2500, pdfTotal: 2480, note: 'Il sogno: 9800X3D + RX 9070 XT, rientra nel budget solo se i prezzi non salgono.',
    build: { ...BASE_B, gpu: 'rx9070xt' } },
];

const SOURCES = {
  A: { label: 'Consulenza del 27 ottobre 2026', short: '27 ott', price: 'Prezzi reali sul mercato italiano (Trovaprezzi/negozi), verificati dove [V]' },
  B: { label: 'Build PC Niky del 15 ottobre 2026', short: '15 ott', price: 'Prezzi indicativi centrali, con intervallo di variazione' },
};

/* Tabella prezzi del PDF "Build PC Niky" */
const PDF_B_TABLE = [
  ['CPU', 'AMD Ryzen 7 9800X3D (8 core, AM5)', '420 €', '400-440 €'],
  ['GPU', 'AMD Radeon RX 9070 16 GB (consigliata)', '680 €', '640-720 €'],
  ['GPU alternativa', 'AMD Radeon RX 9070 XT 16 GB', '850 €', '820-880 €'],
  ['Scheda madre', 'B850 ATX con WiFi (MSI / Gigabyte)', '165 €', '140-190 €'],
  ['RAM', '32 GB (2×16) DDR5-6000, EXPO', '500 €', '450-600 €'],
  ['SSD', 'NVMe Gen4 da 2 TB (990 EVO Plus, SN850X...)', '260 €', '200-320 €'],
  ['Alimentatore', '750 W 80+ Gold, modulare, ATX 3.x', '100 €', '100-145 €'],
  ['Case', 'NZXT H7 Flow RGB', '120 €', '120-140 €'],
  ['Dissipatore', 'Thermalright Peerless Assassin 120', '65 €', '45-65 €'],
  ['TOTALE con RX 9070', '', '2.310 €', '2.095-2.620 €'],
  ['TOTALE con RX 9070 XT', '', '2.480 €', '2.275-2.780 €'],
];

/* Tabella prezzi del PDF "Consulenza" (27 ott): [componente, prezzo, stato, fonte] */
const PDF_A_TABLE = [
  ['Ryzen 5 9600X (box)', '188,60 €', 'V', 'Redgaming (Trovaprezzi), spedizione inclusa'],
  ['Ryzen 7 9700X (box)', '294,80 €', 'V', 'Redgaming; Kaufland 295,99 con spedizione gratis'],
  ['Ryzen 7 9800X3D (box)', '408,10 €', 'V', 'Redgaming; Amazon.it 437; AliExpress da 356 (sconsigliato)'],
  ['RX 9070 XT', '833,15 €', 'V', 'XFX Swift, GigaTrade. Letta solo la marca XFX'],
  ['Scheda madre B650 (ASUS TUF B650M-E)', '128,99 €', 'V', 'Amazon.it; la più economica è la Gigabyte B650M S2H a 102,50'],
  ['RAM 32 GB DDR5-6000 CL30', '681,69 €', 'S', 'ITPartners, aggiornato al 7 agosto; in Francia +4,8% in 30 giorni'],
  ['SSD 1 TB / 2 TB PCIe 4.0', '~155 / ~260 €', 'S', 'Nessun prezzo italiano affidabile: stima da listini europei, ±40 €'],
  ['Alimentatore 850 W Gold ATX 3.1', '~120 €', 'S', 'Recensione italiana (ASUS AP-850G ~115-120), non datata'],
  ['Dissipatore Thermalright PA120 SE ARGB', '49,95 €', 'S', 'PcComponentes, luglio 2026'],
  ['Case ATX con RGB', '~75 €', 'S', 'Nessun prezzo verificato'],
];

const FONTI = [
  'Trovaprezzi.it: schede prodotto Ryzen 5 9600X, Ryzen 7 9700X, Ryzen 7 9800X3D, XFX RX 9070 XT, schede madri B650 AM5, GPU, scheda madre, case',
  'ITPartners.it: Corsair Vengeance RGB 32 GB DDR5-6000 (aggiornato 7/8/2026)',
  'comparateur-gamer.fr: evoluzione prezzi RAM ottobre 2026',
  'shattered.io e pangoly.com: confronto prezzi RTX 5070 Ti / RX 9070 XT, ottobre 2026',
  'PcComponentes.it: Thermalright Peerless Assassin 120 SE ARGB; pc-gaming.it: ASUS Prime AP-850G Gold',
  'Pangoly.it (RAM e CPU), gpupricehistory.com / rampricehistory.com (storico prezzi GPU e SSD)',
  'TuttoTech.net: offerte CPU Amazon (12/10/2026); NotebookCheck.it: rincari GPU Nvidia; Darkflash: previsioni GTA 6 PC; System Requirements Lab: requisiti AION 2',
];
