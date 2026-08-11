import { PresetSample } from '@/types';

// High quality SVG data URIs for instantaneous offline preview
const TOMATO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%231a382b"/><path d="M 300 380 Q 280 200 300 20 Q 320 200 300 380" fill="%232e7d32"/><ellipse cx="250" cy="180" rx="110" ry="70" transform="rotate(-25 250 180)" fill="%23388e3c"/><ellipse cx="360" cy="220" rx="120" ry="75" transform="rotate(30 360 220)" fill="%232e7d32"/><ellipse cx="230" cy="170" rx="45" ry="30" fill="%23423b20" opacity="0.95"/><ellipse cx="230" cy="170" rx="35" ry="22" fill="%232d1d0f"/><ellipse cx="370" cy="240" rx="55" ry="35" fill="%23423b20" opacity="0.95"/><ellipse cx="370" cy="240" rx="42" ry="25" fill="%232d1d0f"/><circle cx="230" cy="170" r="48" fill="none" stroke="%23fbc02d" stroke-width="4" stroke-dasharray="6,4"/><circle cx="370" cy="240" r="58" fill="none" stroke="%23fbc02d" stroke-width="4" stroke-dasharray="6,4"/><text x="30" y="40" fill="%23e8f5e9" font-family="sans-serif" font-size="18" font-weight="bold">SAMPLE PRESET: Tomato Leaf (Late Blight)</text></svg>`;

const RICE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23132e1b"/><path d="M 220 390 C 240 220 280 100 380 20 C 320 120 260 240 240 390" fill="%2343a047"/><polygon points="280,180 320,165 310,195 270,210" fill="%235d4037"/><polygon points="285,183 315,169 307,192 275,206" fill="%23d7ccc8"/><polygon points="300,120 340,105 330,135 290,150" fill="%235d4037"/><polygon points="305,123 335,109 327,132 295,146" fill="%23d7ccc8"/><text x="30" y="40" fill="%23e8f5e9" font-family="sans-serif" font-size="18" font-weight="bold">SAMPLE PRESET: Rice Blade (Rice Blast)</text></svg>`;

const WHEAT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%231c331e"/><rect x="260" y="30" width="80" height="340" rx="40" fill="%234caf50"/><path d="M 280 60 L 280 320 M 300 60 L 300 320 M 320 60 L 320 320" stroke="%23fbc02d" stroke-width="10" stroke-dasharray="14,10"/><text x="30" y="40" fill="%23e8f5e9" font-family="sans-serif" font-size="18" font-weight="bold">SAMPLE PRESET: Wheat Leaf (Yellow Rust)</text></svg>`;

const CORN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%2318301d"/><ellipse cx="300" cy="200" rx="220" ry="120" transform="rotate(-15 300 200)" fill="%23388e3c"/><circle cx="200" cy="180" r="14" fill="%238d6e63"/><circle cx="240" cy="160" r="18" fill="%238d6e63"/><circle cx="280" cy="190" r="15" fill="%238d6e63"/><circle cx="340" cy="210" r="20" fill="%238d6e63"/><circle cx="390" cy="230" r="16" fill="%238d6e63"/><text x="30" y="40" fill="%23e8f5e9" font-family="sans-serif" font-size="18" font-weight="bold">SAMPLE PRESET: Corn Leaf (Common Rust)</text></svg>`;

const POTATO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23192f1b"/><ellipse cx="300" cy="200" rx="160" ry="100" fill="%232e7d32"/><circle cx="260" cy="180" r="45" fill="%233e2723"/><circle cx="260" cy="180" r="32" fill="%234e342e"/><circle cx="260" cy="180" r="20" fill="%236d4c41"/><circle cx="340" cy="220" r="35" fill="%233e2723"/><circle cx="340" cy="220" r="22" fill="%234e342e"/><text x="30" y="40" fill="%23e8f5e9" font-family="sans-serif" font-size="18" font-weight="bold">SAMPLE PRESET: Potato Leaf (Early Blight Target Rings)</text></svg>`;

export const PRESET_SAMPLES: PresetSample[] = [
  {
    id: 'sample-tomato-blight',
    title: 'Tomato — Late Blight',
    crop: 'Tomato',
    disease: 'Late Blight (Phytophthora infestans)',
    thumbnail: TOMATO_SVG,
    severity: 78,
    description: 'Dark water-soaked lesions with yellow margins on tomato compound leaf',
    defaultLocation: {
      latitude: 16.3067,
      longitude: 80.4365,
      city: 'Guntur',
      region: 'Andhra Pradesh',
      country: 'India',
    },
  },
  {
    id: 'sample-rice-blast',
    title: 'Rice — Rice Blast',
    crop: 'Rice',
    disease: 'Rice Blast (Magnaporthe oryzae)',
    thumbnail: RICE_SVG,
    severity: 65,
    description: 'Spindle-shaped brownish lesions with ash-gray center on paddy leaf blade',
    defaultLocation: {
      latitude: 10.787,
      longitude: 79.1378,
      city: 'Thanjavur',
      region: 'Tamil Nadu',
      country: 'India',
    },
  },
  {
    id: 'sample-wheat-rust',
    title: 'Wheat — Yellow Stripe Rust',
    crop: 'Wheat',
    disease: 'Yellow Stripe Rust (Puccinia striiformis)',
    thumbnail: WHEAT_SVG,
    severity: 82,
    description: 'Parallel yellow spore pustules running along leaf veins',
    defaultLocation: {
      latitude: 30.901,
      longitude: 75.8573,
      city: 'Ludhiana',
      region: 'Punjab',
      country: 'India',
    },
  },
  {
    id: 'sample-corn-rust',
    title: 'Corn — Common Rust',
    crop: 'Corn',
    disease: 'Common Rust (Puccinia sorghi)',
    thumbnail: CORN_SVG,
    severity: 45,
    description: 'Scattered cinnamon-brown elongated pustules on corn foliage',
    defaultLocation: {
      latitude: 41.5868,
      longitude: -93.625,
      city: 'Des Moines',
      region: 'Iowa',
      country: 'USA',
    },
  },
  {
    id: 'sample-potato-blight',
    title: 'Potato — Early Blight',
    crop: 'Potato',
    disease: 'Early Blight (Alternaria solani)',
    thumbnail: POTATO_SVG,
    severity: 58,
    description: 'Concentric ring target-board lesions on lower mature foliage',
    defaultLocation: {
      latitude: 43.4917,
      longitude: -112.034,
      city: 'Idaho Falls',
      region: 'Idaho',
      country: 'USA',
    },
  },
];
