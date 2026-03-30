const fs = require('fs');
const raw = JSON.parse(fs.readFileSync('src/data/guests-raw.json','utf-8'));

const companyLocations = {
  'meta': [37.48, -122.15], 'facebook': [37.48, -122.15],
  'google': [37.42, -122.08], 'alphabet': [37.42, -122.08],
  'apple': [37.33, -122.01], 'netflix': [37.27, -121.96],
  'amazon': [47.62, -122.34], 'microsoft': [47.64, -122.13],
  'uber': [37.77, -122.39], 'airbnb': [37.77, -122.42],
  'stripe': [37.79, -122.39], 'slack': [37.79, -122.39],
  'salesforce': [37.79, -122.40], 'twitter': [37.78, -122.39],
  'shopify': [45.42, -75.69], 'spotify': [59.33, 18.07],
  'figma': [37.78, -122.39], 'notion': [37.78, -122.39],
  'instagram': [37.48, -122.15], 'whatsapp': [37.48, -122.15],
  'linkedin': [37.37, -122.07], 'pinterest': [37.78, -122.39],
  'doordash': [37.78, -122.39], 'lyft': [37.78, -122.39],
  'coinbase': [37.78, -122.39], 'robinhood': [37.48, -122.15],
  'dropbox': [37.79, -122.39], 'airtable': [37.78, -122.39],
  'reddit': [37.78, -122.39], 'snap': [34.02, -118.50],
  'tiktok': [34.05, -118.24], 'bytedance': [39.91, 116.40],
  'openai': [37.77, -122.42], 'anthropic': [37.77, -122.42],
  'y combinator': [37.78, -122.39], 'stanford': [37.43, -122.17],
  'harvard': [42.37, -71.12], 'wharton': [39.95, -75.19],
  'waze': [32.07, 34.77], 'israel': [32.07, 34.77],
};

const techHubs = [
  [37.78, -122.39], [37.42, -122.08], [37.48, -122.15],
  [40.71, -74.01], [47.61, -122.33], [34.05, -118.24],
  [30.27, -97.74], [42.36, -71.06], [51.51, -0.13],
  [59.33, 18.07], [32.07, 34.77], [43.65, -79.38],
  [48.86, 2.35], [52.52, 13.41], [1.35, 103.82],
  [12.97, 77.59], [35.68, 139.69], [-33.87, 151.21],
  [25.76, -80.19], [41.88, -87.63], [33.75, -84.39],
  [39.74, -104.99], [45.52, -122.68],
];

function jitter(base, range) {
  return base + (Math.random() - 0.5) * range;
}

function findLocation(guest) {
  const combined = ((guest.description || '') + ' ' + guest.title).toLowerCase();
  for (const [key, loc] of Object.entries(companyLocations)) {
    if (combined.includes(key)) {
      return [jitter(loc[0], 1.5), jitter(loc[1], 1.5)];
    }
  }
  let hash = 0;
  for (let i = 0; i < guest.slug.length; i++) {
    hash = ((hash << 5) - hash) + guest.slug.charCodeAt(i);
    hash |= 0;
  }
  const hub = techHubs[Math.abs(hash) % techHubs.length];
  return [jitter(hub[0], 2.5), jitter(hub[1], 2.5)];
}

// Convert episode title to a user-facing question
function titleToQuestion(title) {
  let part = title.split('|')[0].trim();

  // Already a question
  if (part.endsWith('?')) return part;

  // "How to X" -> "How do I X?"
  if (/^how to /i.test(part)) return part.replace(/^how to /i, 'How do I ') + '?';

  // "Why X" -> keep as question
  if (/^why /i.test(part)) return part + '?';

  // "What X" -> keep as question
  if (/^what /i.test(part)) return part + '?';

  // "When X" -> keep as question
  if (/^when /i.test(part)) return part + '?';

  // "The X of Y" or other declarative -> "How can I learn about X?"
  // Fallback: wrap in "How can I..." framing
  if (part.length > 80) part = part.slice(0, 77) + '...';
  return 'How can I apply the lessons from "' + part + '"?';
}

const processed = raw.map(g => {
  const [lat, lng] = findLocation(g);
  const videoId = g.video_id || null;
  return {
    slug: g.slug,
    guest: g.guest,
    title: g.title,
    video_id: videoId,
    lat: Math.round(lat * 100) / 100,
    lng: Math.round(lng * 100) / 100,
    question: titleToQuestion(g.title),
    // YouTube provides consistent thumbnail URLs from video_id
    avatar: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
    thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
  };
});

let ts = '// Auto-generated guest data for globe visualization\n';
ts += 'export interface GuestData {\n';
ts += '  slug: string;\n  guest: string;\n  title: string;\n  video_id: string | null;\n';
ts += '  lat: number;\n  lng: number;\n  question: string;\n';
ts += '  avatar: string | null;\n  thumbnail: string | null;\n}\n\n';
ts += 'export const GUESTS: GuestData[] = ' + JSON.stringify(processed, null, 2) + ';\n';

fs.writeFileSync('src/data/guests.ts', ts);
console.log('Generated', processed.length, 'guests with questions + thumbnails');
// Show a few examples
processed.slice(0, 5).forEach(g => console.log(`  ${g.guest}: "${g.question}"`));
