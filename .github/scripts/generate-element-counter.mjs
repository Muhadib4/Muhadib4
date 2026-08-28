import { mkdir, readFile, writeFile } from 'node:fs/promises';

const username = process.env.GITHUB_REPOSITORY_OWNER || 'Muhadib4';

async function getViews() {
  try {
    const response = await fetch(`https://profile-counter.glitch.me/${username}/count.svg`, {
      headers: {
        accept: 'image/svg+xml',
        'user-agent': 'azure-nature-counter/1.0',
      },
    });
    if (!response.ok) throw new Error(`Counter returned ${response.status}`);
    const svg = await response.text();
    const digits = [...svg.matchAll(/<tspan\b[^>]*>(\d)<\/tspan>/g)].map((match) => match[1]);
    if (digits.length === 0) throw new Error('Counter SVG contained no digits');
    const value = Number(digits.join(''));
    return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
  } catch (error) {
    console.warn('Could not fetch profile views:', error.message);
    return 0;
  }
}

const elements = [
  {
    name: 'WATER',
    color: '#38BDF8',
    glow: '#7DD3FC',
    icon: `<path d="M52 9C43 22 35 31 35 42a17 17 0 0 0 34 0C69 31 61 22 52 9Z" fill="#38BDF8" opacity=".95"/>
      <path d="M41 43c5 5 16 5 22 0" fill="none" stroke="#E0F2FE" stroke-width="3" stroke-linecap="round">
        <animate attributeName="d" values="M41 43c5 5 16 5 22 0;M41 41c6 7 16 7 22 0;M41 43c5 5 16 5 22 0" dur="2.4s" repeatCount="indefinite"/>
      </path>`,
  },
  {
    name: 'FOREST',
    color: '#2DD4BF',
    glow: '#99F6E4',
    icon: `<path d="M52 8 34 31h10L30 48h18v10h8V48h18L60 31h10Z" fill="#2DD4BF"/>
      <path d="M52 14v35" stroke="#CCFBF1" stroke-width="2" opacity=".75">
        <animateTransform attributeName="transform" type="rotate" values="-2 52 56;2 52 56;-2 52 56" dur="3s" repeatCount="indefinite"/>
      </path>`,
  },
  {
    name: 'EARTH',
    color: '#60A5FA',
    glow: '#BFDBFE',
    icon: `<path d="m19 51 18-30 12 17 9-13 27 26Z" fill="#2563EB"/>
      <path d="m37 21 7 10-6-2-5 4Z" fill="#DBEAFE"/>
      <path d="M18 51h68" stroke="#93C5FD" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    name: 'FIRE',
    color: '#FB923C',
    glow: '#FDBA74',
    icon: `<path d="M53 7c5 13-6 16 2 26 3-8 10-10 9-20 11 11 15 22 9 32-8 15-32 15-40 0-6-12 1-23 12-33-1 10 2 14 8 18 4-8-3-13 0-23Z" fill="#F97316">
        <animate attributeName="opacity" values=".78;1;.82;1;.78" dur="1.3s" repeatCount="indefinite"/>
      </path>
      <path d="M52 33c8 8 7 18 0 23-8-4-9-14 0-23Z" fill="#FDE68A"/>`,
  },
  {
    name: 'WIND',
    color: '#7DD3FC',
    glow: '#E0F2FE',
    icon: `<path d="M19 25h48c13 0 13-14 3-15-6-1-10 2-12 6M17 36h63c12 0 12 14 2 16-7 1-11-3-12-7M24 48h27" fill="none" stroke="#BAE6FD" stroke-width="4" stroke-linecap="round" stroke-dasharray="90">
        <animate attributeName="stroke-dashoffset" values="90;0;-90" dur="3s" repeatCount="indefinite"/>
      </path>`,
  },
  {
    name: 'STORM',
    color: '#A78BFA',
    glow: '#DDD6FE',
    icon: `<path d="M31 36c0-9 7-16 16-16 5-10 21-9 25 2 9 0 15 6 15 14 0 8-7 14-16 14H35c-10 0-17-6-17-14 0-7 5-12 13-13" fill="#93C5FD"/>
      <path d="m55 35-10 18h10l-5 15 20-24H59l7-9Z" fill="#FDE047">
        <animate attributeName="opacity" values="1;.45;1;1;.6;1" dur="1.8s" repeatCount="indefinite"/>
      </path>`,
  },
  {
    name: 'ICE',
    color: '#67E8F9',
    glow: '#CFFAFE',
    icon: `<g stroke="#CFFAFE" stroke-width="3" stroke-linecap="round" transform="translate(52 34)">
        <path d="M0-25V25M-22-13 22 13M-22 13 22-13M0-25l-5 6M0-25l5 6M0 25l-5-6M0 25l5-6"/>
        <circle r="5" fill="#67E8F9" stroke="none"/>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite" additive="sum"/>
      </g>`,
  },
];

function renderCard(element, digit, index) {
  const x = 35 + index * 112;
  return `<g transform="translate(${x} 78)">
    <rect width="100" height="150" rx="22" fill="url(#card-${index})" stroke="${element.color}" stroke-opacity=".82"/>
    <rect x="5" y="5" width="90" height="140" rx="18" fill="none" stroke="${element.glow}" stroke-opacity=".15"/>
    <g transform="translate(-2 8)">${element.icon}</g>
    <text x="50" y="113" text-anchor="middle" fill="#F0F9FF" font-family="Verdana,DejaVu Sans,sans-serif" font-size="47" font-weight="800" letter-spacing="-2">${digit}</text>
    <text x="50" y="137" text-anchor="middle" fill="${element.glow}" font-family="Verdana,DejaVu Sans,sans-serif" font-size="9" font-weight="700" letter-spacing="1.4">${element.name}</text>
  </g>`;
}

function renderCounter(count) {
  const digits = String(count).padStart(7, '0').slice(-7).split('');
  const cardGradients = elements.map((element, index) => `
    <linearGradient id="card-${index}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#071A2F"/>
      <stop offset=".58" stop-color="#0A2F55"/>
      <stop offset="1" stop-color="${element.color}" stop-opacity=".36"/>
    </linearGradient>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="850" height="255" viewBox="0 0 850 255" role="img" aria-label="Profile views: ${count}">
  <title>Profile views: ${count}</title>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#061426"/>
      <stop offset=".5" stop-color="#0B4F8A"/>
      <stop offset="1" stop-color="#38BDF8"/>
    </linearGradient>
    <filter id="soft-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${cardGradients}
  </defs>
  <rect width="850" height="255" rx="28" fill="url(#sky)" opacity=".16"/>
  <path d="M0 49C120 19 221 72 341 44S578 20 850 52" fill="none" stroke="#7DD3FC" stroke-opacity=".34" stroke-width="2"/>
  <path d="M0 57C145 31 238 78 376 52S650 31 850 62" fill="none" stroke="#38BDF8" stroke-opacity=".25"/>
  <text x="425" y="31" text-anchor="middle" fill="#E0F2FE" font-family="Verdana,DejaVu Sans,sans-serif" font-size="18" font-weight="700" letter-spacing="4">ELEMENTAL VISITORS</text>
  <text x="425" y="53" text-anchor="middle" fill="#7DD3FC" font-family="Verdana,DejaVu Sans,sans-serif" font-size="10" letter-spacing="2">SEVEN FORCES · ONE LIVING REALM</text>
  <g filter="url(#soft-glow)">
    ${elements.map((element, index) => renderCard(element, digits[index], index)).join('')}
  </g>
  <circle cx="18" cy="20" r="2" fill="#BAE6FD"><animate attributeName="opacity" values=".2;1;.2" dur="2.8s" repeatCount="indefinite"/></circle>
  <circle cx="820" cy="35" r="3" fill="#7DD3FC"><animate attributeName="opacity" values="1;.2;1" dur="3.5s" repeatCount="indefinite"/></circle>
</svg>`;
}

async function applyAzureGalagaGradient() {
  for (const fileName of ['galaga-contribution-graph.svg', 'galaga-contribution-graph-dark.svg']) {
    const path = `dist/${fileName}`;
    try {
      let svg = await readFile(path, 'utf8');
      const gradient = `<defs><linearGradient id="azure-space" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#061426"/><stop offset=".45" stop-color="#0B4F8A"/><stop offset="1" stop-color="#38BDF8"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#azure-space)"/>`;
      svg = svg.replace('<rect width="100%" height="100%" fill="#000000"/>', gradient);
      svg = svg
        .replaceAll('fill="white"', 'fill="#E0F2FE"')
        .replaceAll('fill="#aaaaaa"', 'fill="#7DD3FC"')
        .replaceAll('fill="#9be9a8"', 'fill="#38BDF8"')
        .replaceAll('stroke="#9be9a8"', 'stroke="#38BDF8"');
      await writeFile(path, svg);
      console.log(`Applied Azure gradient to ${fileName}`);
    } catch (error) {
      console.warn(`Skipped ${fileName}: ${error.message}`);
    }
  }
}

await mkdir('dist', { recursive: true });
const views = await getViews();
await writeFile('dist/element-profile-counter.svg', renderCounter(views));
await applyAzureGalagaGradient();
console.log(`Generated elemental profile counter with ${views} views`);
