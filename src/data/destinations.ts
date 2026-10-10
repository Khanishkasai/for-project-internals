export type Destination = {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  longDescription: string;
  image: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  bestTime: string;
  budget: string;
  currency: string;
  language: string;
  timezone: string;
  lat: number;
  lng: number;
  highlights: string[];
  weather: { month: string; temp: string; condition: string }[];
};

export type Place = {
  id: string;
  name: string;
  type: "attraction" | "restaurant" | "hotel" | "cafe" | "market" | "museum" | "park";
  category: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  image: string;
  lat: number;
  lng: number;
  openHours: string;
  phone?: string;
  website?: string;
  tags: string[];
  cuisine?: string;
  amenities?: string[];
};

export const DESTINATIONS: Destination[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    description: "The City of Light — art, romance, and world-class cuisine",
    longDescription: "Paris is the capital and most populous city of France. Situated on the Seine River, it has been a major European city and a global center for art, fashion, gastronomy, and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.",
    image: "https://images.pexels.com/photos/2082103/pexels-photo-2082103.jpeg",
    tags: ["culture", "food", "romance", "art", "history"],
    rating: 4.8,
    reviewCount: 124500,
    bestTime: "Apr–Jun, Sep–Oct",
    budget: "$150–300/day",
    currency: "EUR",
    language: "French",
    timezone: "CET (UTC+1)",
    lat: 48.8566,
    lng: 2.3522,
    highlights: ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Montmartre", "Musée d'Orsay"],
    weather: [
      { month: "Apr", temp: "16°C", condition: "Mild" },
      { month: "Jun", temp: "23°C", condition: "Warm & sunny" },
      { month: "Sep", temp: "20°C", condition: "Pleasant" },
    ],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "Where ancient tradition meets neon-lit modernity",
    longDescription: "Tokyo is Japan's busy capital, mixing the ultramodern and the traditional. Shibuya and Shinjuku are districts known for their shopping and entertainment. The city is home to an extraordinary concentration of Michelin-starred restaurants.",
    image: "https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg",
    tags: ["food", "technology", "culture", "shopping", "anime"],
    rating: 4.9,
    reviewCount: 98700,
    bestTime: "Mar–May, Oct–Nov",
    budget: "$100–200/day",
    currency: "JPY",
    language: "Japanese",
    timezone: "JST (UTC+9)",
    lat: 35.6762,
    lng: 139.6503,
    highlights: ["Shibuya Crossing", "Senso-ji Temple", "Tsukiji Market", "teamLab", "Mount Fuji day trip"],
    weather: [
      { month: "Mar", temp: "12°C", condition: "Cherry blossom" },
      { month: "May", temp: "22°C", condition: "Warm" },
      { month: "Oct", temp: "18°C", condition: "Crisp & clear" },
    ],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    description: "Island of the Gods — temples, rice terraces, and world-class surf",
    longDescription: "Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple.",
    image: "https://images.pexels.com/photos/1537640/pexels-photo-1537640.jpeg",
    tags: ["beach", "culture", "wellness", "surf", "nature"],
    rating: 4.7,
    reviewCount: 87300,
    bestTime: "Apr–Oct",
    budget: "$50–150/day",
    currency: "IDR",
    language: "Balinese/Indonesian",
    timezone: "WITA (UTC+8)",
    lat: -8.3405,
    lng: 115.0920,
    highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Uluwatu", "Mount Batur", "Seminyak Beach"],
    weather: [
      { month: "Jun", temp: "27°C", condition: "Dry & sunny" },
      { month: "Aug", temp: "27°C", condition: "Best weather" },
      { month: "Oct", temp: "28°C", condition: "Shoulder season" },
    ],
  },
  {
    id: "new-york",
    name: "New York City",
    country: "USA",
    region: "North America",
    description: "The city that never sleeps — culture, skyline, and endless energy",
    longDescription: "New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that's among the world's major commercial, financial, and cultural centers.",
    image: "https://images.pexels.com/photos/2190283/pexels-photo-2190283.jpeg",
    tags: ["urban", "food", "culture", "shopping", "nightlife"],
    rating: 4.7,
    reviewCount: 210000,
    bestTime: "Apr–Jun, Sep–Nov",
    budget: "$200–400/day",
    currency: "USD",
    language: "English",
    timezone: "EST (UTC-5)",
    lat: 40.7128,
    lng: -74.0060,
    highlights: ["Central Park", "Times Square", "Brooklyn Bridge", "Metropolitan Museum", "High Line"],
    weather: [
      { month: "May", temp: "20°C", condition: "Mild & pleasant" },
      { month: "Sep", temp: "24°C", condition: "Warm & sunny" },
      { month: "Oct", temp: "15°C", condition: "Fall foliage" },
    ],
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    region: "Europe",
    description: "The Eternal City — 2,500 years of history at every corner",
    longDescription: "Rome is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture, and culture on display. Ancient ruins such as the Forum and the Colosseum evoke the power of the former Roman Empire.",
    image: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg",
    tags: ["history", "food", "art", "architecture", "culture"],
    rating: 4.8,
    reviewCount: 156000,
    bestTime: "Apr–Jun, Sep–Oct",
    budget: "$120–250/day",
    currency: "EUR",
    language: "Italian",
    timezone: "CET (UTC+1)",
    lat: 41.9028,
    lng: 12.4964,
    highlights: ["Colosseum", "Vatican Museums", "Trevi Fountain", "Roman Forum", "Pantheon"],
    weather: [
      { month: "May", temp: "22°C", condition: "Perfect" },
      { month: "Sep", temp: "25°C", condition: "Warm & dry" },
    ],
  },
  {
    id: "barcelona",
    name: "Barcelona",
    country: "Spain",
    region: "Europe",
    description: "Gaudí's masterpieces, tapas culture, and Mediterranean beaches",
    longDescription: "Barcelona, the cosmopolitan capital of Spain's Catalonia region, is known for its art and architecture. The fantastical Sagrada Família church and other modernist landmarks designed by Antoni Gaudí dot the city.",
    image: "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg",
    tags: ["architecture", "beach", "food", "nightlife", "art"],
    rating: 4.7,
    reviewCount: 143000,
    bestTime: "May–Jun, Sep–Oct",
    budget: "$100–200/day",
    currency: "EUR",
    language: "Catalan/Spanish",
    timezone: "CET (UTC+1)",
    lat: 41.3851,
    lng: 2.1734,
    highlights: ["Sagrada Família", "Park Güell", "Las Ramblas", "Gothic Quarter", "Camp Nou"],
    weather: [
      { month: "Jun", temp: "26°C", condition: "Hot & sunny" },
      { month: "Sep", temp: "26°C", condition: "Warm, less crowded" },
    ],
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    description: "Desert opulence, record-breaking towers, and vibrant souks",
    longDescription: "Dubai is a city and emirate in the United Arab Emirates known for luxury shopping, ultramodern architecture, and a lively nightlife scene. The city is home to the Burj Khalifa, the world's tallest building.",
    image: "https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg",
    tags: ["luxury", "architecture", "shopping", "desert", "food"],
    rating: 4.6,
    reviewCount: 98000,
    bestTime: "Nov–Mar",
    budget: "$150–400/day",
    currency: "AED",
    language: "Arabic/English",
    timezone: "GST (UTC+4)",
    lat: 25.2048,
    lng: 55.2708,
    highlights: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah", "Gold Souk", "Desert Safari"],
    weather: [
      { month: "Dec", temp: "24°C", condition: "Perfect" },
      { month: "Feb", temp: "22°C", condition: "Ideal" },
    ],
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "Iconic harbour, golden beaches, and laid-back Aussie culture",
    longDescription: "Sydney is the largest city in Australia and the capital city of the state of New South Wales. It is an international city known for landmarks including the Sydney Harbour Bridge and the Sydney Opera House.",
    image: "https://images.pexels.com/photos/1878293/pexels-photo-1878293.jpeg",
    tags: ["beach", "outdoors", "culture", "food", "urban"],
    rating: 4.7,
    reviewCount: 112000,
    bestTime: "Sep–Nov, Mar–May",
    budget: "$150–280/day",
    currency: "AUD",
    language: "English",
    timezone: "AEST (UTC+10)",
    lat: -33.8688,
    lng: 151.2093,
    highlights: ["Sydney Opera House", "Harbour Bridge", "Bondi Beach", "Blue Mountains", "Darling Harbour"],
    weather: [
      { month: "Oct", temp: "22°C", condition: "Spring" },
      { month: "Mar", temp: "24°C", condition: "Late summer" },
    ],
  },
];

export const PLACES: Place[] = [
  // Paris places
  {
    id: "eiffel-tower",
    name: "Eiffel Tower",
    type: "attraction",
    category: "Landmark",
    description: "The world's most visited monument — an iron lattice tower on the Champ de Mars.",
    address: "Champ de Mars, 5 Av. Anatole France",
    city: "Paris",
    rating: 4.7,
    reviewCount: 98500,
    priceLevel: 2,
    image: "https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg",
    lat: 48.8584,
    lng: 2.2945,
    openHours: "9:00 AM – 11:45 PM",
    tags: ["landmark", "views", "romantic"],
  },
  {
    id: "louvre-museum",
    name: "Louvre Museum",
    type: "museum",
    category: "Museum",
    description: "World's largest art museum and a historic monument — home to the Mona Lisa.",
    address: "Rue de Rivoli, 75001 Paris",
    city: "Paris",
    rating: 4.7,
    reviewCount: 76000,
    priceLevel: 2,
    image: "https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg",
    lat: 48.8606,
    lng: 2.3376,
    openHours: "9:00 AM – 6:00 PM (closed Tue)",
    tags: ["art", "history", "iconic"],
  },
  {
    id: "cafe-de-flore",
    name: "Café de Flore",
    type: "cafe",
    category: "Café",
    description: "One of the oldest and most prestigious coffeehouses in Paris — a hub for literary legends.",
    address: "172 Bd Saint-Germain, 75006 Paris",
    city: "Paris",
    rating: 4.3,
    reviewCount: 12800,
    priceLevel: 3,
    image: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg",
    lat: 48.8541,
    lng: 2.3332,
    openHours: "7:30 AM – 1:30 AM",
    cuisine: "French",
    tags: ["historic", "coffee", "literary"],
  },
  {
    id: "le-jules-verne",
    name: "Le Jules Verne",
    type: "restaurant",
    category: "Fine Dining",
    description: "Michelin-starred restaurant inside the Eiffel Tower with breathtaking views of Paris.",
    address: "Av. Gustave Eiffel, 75007 Paris",
    city: "Paris",
    rating: 4.5,
    reviewCount: 4200,
    priceLevel: 4,
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    lat: 48.8584,
    lng: 2.2945,
    openHours: "12:00 PM – 10:00 PM",
    cuisine: "French",
    tags: ["michelin", "views", "romantic"],
  },
  // Tokyo places
  {
    id: "senso-ji",
    name: "Senso-ji Temple",
    type: "attraction",
    category: "Temple",
    description: "Tokyo's oldest temple in the Asakusa district — famous for the Kaminarimon gate.",
    address: "2-3-1 Asakusa, Taito City, Tokyo",
    city: "Tokyo",
    rating: 4.7,
    reviewCount: 54000,
    priceLevel: 1,
    image: "https://images.pexels.com/photos/1325837/pexels-photo-1325837.jpeg",
    lat: 35.7148,
    lng: 139.7967,
    openHours: "Always open (grounds); 6:00 AM – 5:00 PM (main hall)",
    tags: ["temple", "historic", "culture"],
  },
  {
    id: "ichiran-ramen",
    name: "Ichiran Ramen",
    type: "restaurant",
    category: "Ramen",
    description: "Famous for solo dining cubicles and rich tonkotsu broth. A uniquely Japanese experience.",
    address: "1-22-7 Jinnan, Shibuya, Tokyo",
    city: "Tokyo",
    rating: 4.4,
    reviewCount: 18900,
    priceLevel: 2,
    image: "https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg",
    lat: 35.6616,
    lng: 139.7013,
    openHours: "24 hours",
    cuisine: "Japanese",
    tags: ["ramen", "solo dining", "authentic"],
  },
  // Bali places
  {
    id: "tanah-lot",
    name: "Tanah Lot Temple",
    type: "attraction",
    category: "Temple",
    description: "Spectacular sea temple perched on a rock formation — best visited at sunset.",
    address: "Beraban, Kediri, Tabanan Regency, Bali",
    city: "Bali",
    rating: 4.6,
    reviewCount: 28700,
    priceLevel: 1,
    image: "https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg",
    lat: -8.6215,
    lng: 115.0867,
    openHours: "7:00 AM – 7:00 PM",
    tags: ["temple", "sunset", "photography"],
  },
  {
    id: "locavore",
    name: "Locavore",
    type: "restaurant",
    category: "Fine Dining",
    description: "Asia's 50 Best Restaurants — Indonesian ingredients reimagined with modernist techniques.",
    address: "Jl. Dewi Sita No.10, Ubud, Bali",
    city: "Bali",
    rating: 4.8,
    reviewCount: 3200,
    priceLevel: 4,
    image: "https://images.pexels.com/photos/2814828/pexels-photo-2814828.jpeg",
    lat: -8.5069,
    lng: 115.2625,
    openHours: "12:00 PM – 11:00 PM (closed Sun)",
    cuisine: "Indonesian",
    tags: ["fine dining", "local ingredients", "innovative"],
  },
  // Hotels (all cities)
  {
    id: "hotel-ritz-paris",
    name: "Hôtel Ritz Paris",
    type: "hotel",
    category: "Luxury Hotel",
    description: "The legendary palace hotel where Coco Chanel lived and Hemingway drank. Place Vendôme.",
    address: "15 Place Vendôme, 75001 Paris",
    city: "Paris",
    rating: 4.9,
    reviewCount: 2800,
    priceLevel: 4,
    image: "https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg",
    lat: 48.8686,
    lng: 2.3299,
    openHours: "24/7",
    amenities: ["spa", "pool", "concierge", "restaurant", "bar", "gym"],
    tags: ["luxury", "historic", "iconic"],
  },
  {
    id: "park-hyatt-tokyo",
    name: "Park Hyatt Tokyo",
    type: "hotel",
    category: "Luxury Hotel",
    description: "Famously featured in 'Lost in Translation' — stunning Shinjuku views from the 52nd floor.",
    address: "3-7-1-2 Nishi Shinjuku, Tokyo",
    city: "Tokyo",
    rating: 4.8,
    reviewCount: 4100,
    priceLevel: 4,
    image: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg",
    lat: 35.6851,
    lng: 139.6984,
    openHours: "24/7",
    amenities: ["pool", "spa", "gym", "restaurant", "bar", "concierge"],
    tags: ["luxury", "views", "iconic"],
  },
  {
    id: "komaneka-ubud",
    name: "Komaneka at Bisma",
    type: "hotel",
    category: "Boutique Resort",
    description: "Clifftop jungle resort in Ubud with private pool villas overlooking the Campuhan valley.",
    address: "Jl. Bisma, Ubud, Gianyar, Bali",
    city: "Bali",
    rating: 4.8,
    reviewCount: 1900,
    priceLevel: 4,
    image: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg",
    lat: -8.5044,
    lng: 115.2590,
    openHours: "24/7",
    amenities: ["pool", "spa", "restaurant", "concierge", "yoga"],
    tags: ["jungle", "pool villas", "romantic"],
  },
];

export const RESTAURANTS: Place[] = PLACES.filter(p => ["restaurant", "cafe"].includes(p.type));
export const HOTELS: Place[] = PLACES.filter(p => p.type === "hotel");
export const ATTRACTIONS: Place[] = PLACES.filter(p => ["attraction", "museum", "park", "market"].includes(p.type));

export function getPlacesByCity(city: string): Place[] {
  return PLACES.filter(p => p.city.toLowerCase() === city.toLowerCase());
}

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find(d => d.id === id);
}
