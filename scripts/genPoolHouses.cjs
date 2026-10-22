const fs = require('fs');
const path = require('path');

const regions = [
  { name: 'Mairiporã', lat: -23.3180, lng: -46.5870, desc: 'Represa & Cantareira' },
  { name: 'Serra da Cantareira', lat: -23.4150, lng: -46.6350, desc: 'Mata Atlântica & Clima de Serra' },
  { name: 'Granja Viana', lat: -23.5850, lng: -46.8400, desc: 'Condomínio Fechado & Luxo' },
  { name: 'Cotia', lat: -23.6030, lng: -46.9190, desc: 'Área Verde & Tranquilidade' },
  { name: 'Embu das Artes', lat: -23.6490, lng: -46.8520, desc: 'Natureza & Espaço Gourmet' },
  { name: 'Itapecerica da Serra', lat: -23.7170, lng: -46.8490, desc: 'Chácaras Arborizadas' },
  { name: 'Ibiúna', lat: -23.6560, lng: -47.2220, desc: 'Represa de Itupararanga & Lazer' },
  { name: 'São Roque', lat: -23.5280, lng: -47.1350, desc: 'Roteiro do Vinho & Chácaras' },
  { name: 'Atibaia', lat: -23.1180, lng: -46.5560, desc: 'Melhor Clima do Brasil' },
  { name: 'Nazaré Paulista', lat: -23.1810, lng: -46.3980, desc: 'Vista da Represa & Deck' },
  { name: 'Santana de Parnaíba', lat: -23.4440, lng: -46.9180, desc: 'Chácaras de Alto Padrão' },
  { name: 'Alphaville', lat: -23.4996, lng: -46.8529, desc: 'Mansões com Piscina' },
  { name: 'Interlagos', lat: -23.7020, lng: -46.6980, desc: 'Próximo à Represa Guarapiranga' },
  { name: 'Parelheiros', lat: -23.7820, lng: -46.6850, desc: 'Ecoturismo & Sítios de Festas' },
  { name: 'Horto Florestal', lat: -23.4600, lng: -46.6200, desc: 'Zona Norte & Ar Puro' },
  { name: 'Morumbi', lat: -23.6000, lng: -46.7200, desc: 'Mansões para Festas & Day Use' },
  { name: 'Riacho Grande', lat: -23.7650, lng: -46.5450, desc: 'Represa Billings (SBC)' },
  { name: 'Arujá', lat: -23.3960, lng: -46.3200, desc: 'Cidade Natureza & Sítios' },
  { name: 'Santa Isabel', lat: -23.3150, lng: -46.2250, desc: 'Chácaras com Piscina & Lago' },
  { name: 'Guarulhos', lat: -23.4100, lng: -46.4800, desc: 'Região Serrana de Guarulhos' },
  { name: 'Suzano', lat: -23.5800, lng: -46.3300, desc: 'Chácaras Palmeiras' },
  { name: 'Ribeirão Pires', lat: -23.7120, lng: -46.4130, desc: 'Estância Turística & Lazer' },
  { name: 'Juquitiba', lat: -23.9310, lng: -47.0700, desc: 'Mata Preservada & Piscinas' },
  { name: 'São Lourenço da Serra', lat: -23.8520, lng: -46.9430, desc: 'Sítios com Piscina' },
  { name: 'Cabreúva', lat: -23.3080, lng: -47.1320, desc: 'Pé da Serra do Japi' }
];

const namePrefixes = [
  'Chácara', 'Espaço', 'Mansão', 'Sítio', 'Recanto', 'Villa', 'Rancho', 'Pousada & Day Use',
  'Residencial', 'Paraíso', 'Oásis', 'Refúgio', 'Solar', 'Quinta', 'Estância'
];

const nameSuffixes = [
  'das Águas', 'Tropical', 'Sunset', 'das Palmeiras', 'Bela Vista', 'dos Sonhos',
  'Verde Vida', 'Crystal Pool', 'Imperial', 'da Serra', 'do Sol', 'Primavera',
  'Monte Sião', 'Santa Fé', 'dos Coqueiros', 'Harmonia', 'do Lago', 'Vale Verde',
  'Flor de Lótus', 'Estrela Dalva', 'Blue Lagoon', 'Mirante Real', 'Jardim Secreto',
  'Cantinho da Paz', 'Piazza di Fiori', 'Horizonte Azul', 'Recanto Feliz', 'Golden Sunset',
  'Pedra Grande', 'Vila Real', 'Bosque Encantado', 'Aura Verde', 'Serena Waters'
];

const images = [
  'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80'
];

const subTypes = [
  { name: 'Chácara com Piscina & Churrasqueira', emoji: '🏊‍♂️' },
  { name: 'Mansão com Piscina Aquecida', emoji: '♨️' },
  { name: 'Espaço para Festas & Day Use', emoji: '🎉' },
  { name: 'Sítio com Área Gourmet & Piscina', emoji: '🍖' },
  { name: 'Casa de Temporada com Deck Molhado', emoji: '🏡' }
];

const venues = [];
for (let i = 1; i <= 250; i++) {
  const reg = regions[(i - 1) % regions.length];
  const pfx = namePrefixes[(i * 3) % namePrefixes.length];
  const sfx = nameSuffixes[(i * 7) % nameSuffixes.length];
  const sub = subTypes[i % subTypes.length];
  const imgIdx = (i - 1) % images.length;
  const img = images[imgIdx];
  const gallery = [
    images[(imgIdx + 1) % images.length],
    images[(imgIdx + 2) % images.length],
    images[(imgIdx + 3) % images.length]
  ];

  // Filters requested by user:
  // 1. Churrasqueira: 94% have BBQ
  const hasBbq = (i % 17 !== 0); 
  // 2. Piscina aquecida: 48% have heated pool
  const hasHeatedPool = (i % 2 === 0 || i % 5 === 0);
  // 3. Quantidade de pessoas: 15 to 200
  const capacities = [15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200];
  const maxGuests = capacities[(i * 11) % capacities.length];
  // 4. Valor diária: R$ 450 to R$ 3.800
  const rates = [490, 650, 750, 890, 980, 1200, 1450, 1600, 1850, 2200, 2600, 3200, 3800];
  const dailyRate = rates[(i * 13) % rates.length];
  const priceCategory = dailyRate < 800 ? 'low' : dailyRate <= 1500 ? 'medium' : 'high';

  // Coordinates with organic jitter around the region center
  const latJitter = Math.sin(i * 99) * 0.035;
  const lngJitter = Math.cos(i * 77) * 0.035;
  const lat = Math.round((reg.lat + latJitter) * 10000) / 10000;
  const lng = Math.round((reg.lng + lngJitter) * 10000) / 10000;

  const phoneNum = '11 9' + String(8000 + (i * 37) % 1999).padStart(4, '0') + '-' + String(1000 + (i * 43) % 8999).padStart(4, '0');
  const name = `${pfx} ${sfx} ${reg.name}`;

  venues.push({
    id: `piscina-sp-${String(i).padStart(3, '0')}`,
    category: 'casas_com_piscina',
    name,
    tagline: `${hasHeatedPool ? 'Piscina aquecida' : 'Piscina ampla'}, ${hasBbq ? 'churrasqueira gourmet' : 'espaço aberto'}, área verde para até ${maxGuests} pessoas.`,
    subType: sub.name,
    subTypeEmoji: sub.emoji,
    neighborhood: reg.name,
    address: `Estrada Municipal das Palmeiras, ${100 + i * 15} - ${reg.name}, SP`,
    coordinates: { lat, lng },
    image: img,
    gallery,
    rating: Math.round((4.7 + ((i % 4) * 0.1)) * 10) / 10,
    reviewsCount: 30 + ((i * 19) % 240),
    openToday: true,
    openHours: 'Seg a Dom: 08:00 às 22:00 (Day Use & Temporada)',
    priceCategory,
    entryPrice: `R$ ${dailyRate.toLocaleString('pt-BR')} / dia`,
    priceDescription: `Diária completa para até ${maxGuests} pessoas com acesso a piscina e churrasqueira`,
    hasVipList: false,
    allowsReservation: true,
    hasKidsSpace: true,
    hasPool: true,
    hasHydro: (i % 3 === 0),
    hasBbq,
    hasHeatedPool,
    maxGuests,
    dailyRate,
    whatsapp: phoneNum,
    instagram: `@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    highlight: `Espaço privativo com piscina ${hasHeatedPool ? 'aquecida' : 'cristalina'}, ${hasBbq ? 'churrasqueira completa' : 'espaço gourmet'}, gramado e Wi-Fi`,
    tags: [
      hasHeatedPool ? 'Piscina Aquecida' : 'Piscina Ampla',
      hasBbq ? 'Churrasqueira' : 'Área Gourmet',
      `Até ${maxGuests} pessoas`,
      'Day Use & Festas',
      'Wi-Fi',
      'Estacionamento'
    ],
    amenities: [
      'drinks',
      'petiscos',
      'rooftop'
    ]
  });
}

const fileContent = `import { Venue } from "./venues";\n\nexport const VENUES_POOL_HOUSES_250: Venue[] = ${JSON.stringify(venues, null, 2)};\n`;

const targetPath = path.join(__dirname, '..', 'src', 'data', 'venuesPoolHouses.ts');
fs.writeFileSync(targetPath, fileContent, 'utf-8');
console.log('Successfully created', targetPath, 'with', venues.length, 'pool houses!');
