#!/usr/bin/env node
// generate-sections.js - Generates all section header SVGs and the HUD status bar
const fs = require('fs');

// ─── Section header definitions ────────────────────────────────────────────
const sections = [
  { file: 'sec-about.svg',        color: '#00f0ff', label: '👾  ABOUT ME',                      tag: 'whoami' },
  { file: 'sec-building.svg',     color: '#fbbf24', label: '🏗️  CURRENTLY BUILDING',            tag: 'git.log()' },
  { file: 'sec-achievements.svg', color: '#ff007f', label: '🏆  ACHIEVEMENTS & MILESTONES',     tag: 'metrics' },
  { file: 'sec-tech.svg',         color: '#a855f7', label: '💻  SKILL MATRIX & TECH STACK',     tag: 'stack' },
  { file: 'sec-projects.svg',     color: '#22c55e', label: '📌  PINNED PROJECT SHOWCASE',       tag: 'arcade' },
  { file: 'sec-analytics.svg',    color: '#00f0ff', label: '📊  GITHUB ANALYTICS & DIAGNOSTICS',tag: 'telemetry' },
  { file: 'sec-activity.svg',     color: '#38bdf8', label: '📡  CONTRIBUTION ACTIVITY',         tag: 'radar' },
  { file: 'sec-snake.svg',        color: '#28c840', label: '🎮  ARCADE SNAKE GAME',              tag: 'game' },
  { file: 'sec-global.svg',       color: '#4f46e5', label: '🌍  GLOBAL REACH',                  tag: 'network' },
  { file: 'sec-specialties.svg',  color: '#fbbf24', label: '🛠️  SPECIALTIES & FOCUS AREAS',     tag: 'focus' },
  { file: 'sec-connect.svg',      color: '#5865f2', label: '📬  CONNECT WITH ME',               tag: 'connect()' },
];

// ─── Section header SVG template ───────────────────────────────────────────
function makeSectionSvg(color, label, tag) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 50" width="860">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#03050d"/>
      <stop offset="50%" stop-color="#06091a"/>
      <stop offset="100%" stop-color="#03050d"/>
    </linearGradient>
    <linearGradient id="line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="${color}" stop-opacity="0"/>
      <stop offset="20%"  stop-color="${color}" stop-opacity="0.7"/>
      <stop offset="50%"  stop-color="${color}" stop-opacity="1"/>
      <stop offset="80%"  stop-color="${color}" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="860" height="50" rx="9" fill="url(#bg)" stroke="#0d1e3a" stroke-width="1.2"/>
  <!-- Animated border glow -->
  <rect width="860" height="50" rx="9" fill="none" stroke="${color}" stroke-width="0.8">
    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite"/>
  </rect>
  <!-- Left accent bar -->
  <rect x="0" y="0" width="5" height="50" rx="3" fill="${color}" opacity="0.9"/>
  <!-- Corner decoration top-left -->
  <text x="15" y="15" font-family="'Courier New',Courier,monospace" font-size="7" fill="${color}" opacity="0.4" letter-spacing="2">// SECTION</text>
  <!-- Main label -->
  <text x="15" y="36" font-family="'Courier New',Courier,monospace" font-size="15" font-weight="bold" fill="${color}" letter-spacing="1" filter="url(#glow)">${label}</text>
  <!-- Right tag decoration -->
  <text x="848" y="34" font-family="'Courier New',Courier,monospace" font-size="13" fill="#152040" text-anchor="end">{ ${tag} }</text>
  <!-- Bottom gradient underline -->
  <rect x="0" y="48" width="860" height="2" rx="1" fill="url(#line)"/>
</svg>`;
}

// ─── HUD Status Bar ─────────────────────────────────────────────────────────
const hudSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 76" width="860">
  <defs>
    <linearGradient id="hudbg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#030710"/>
      <stop offset="50%"  stop-color="#070f1e"/>
      <stop offset="100%" stop-color="#030710"/>
    </linearGradient>
    <linearGradient id="hudAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#00f0ff" stop-opacity="0"/>
      <stop offset="25%"  stop-color="#00f0ff" stop-opacity="0.7"/>
      <stop offset="50%"  stop-color="#a855f7" stop-opacity="1"/>
      <stop offset="75%"  stop-color="#ff007f" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#ff007f" stop-opacity="0"/>
    </linearGradient>
    <filter id="dotGlow">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="textGlow">
      <feGaussianBlur stdDeviation="1.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="hudGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a1830" stroke-width="0.3"/>
    </pattern>
  </defs>
  <!-- Background -->
  <rect width="860" height="76" rx="12" fill="url(#hudbg)" stroke="#1a2a4a" stroke-width="1.5"/>
  <rect width="860" height="76" rx="12" fill="url(#hudGrid)" opacity="0.5"/>
  <!-- Top accent line -->
  <rect x="0" y="0" width="860" height="2.5" rx="2" fill="url(#hudAccent)"/>
  <!-- Animated border -->
  <rect width="860" height="76" rx="12" fill="none" stroke="#22c55e" stroke-width="1">
    <animate attributeName="opacity" values="0.15;0.6;0.15" dur="3s" repeatCount="indefinite"/>
  </rect>

  <!-- ── Pulsing availability dot ── -->
  <circle cx="30" cy="38" r="8" fill="#22c55e" filter="url(#dotGlow)">
    <animate attributeName="r" values="7;11;7" dur="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="30" cy="38" r="3.8" fill="#ffffff"/>

  <!-- ── Status column ── -->
  <text x="53" y="28" font-family="'Courier New',Courier,monospace" font-size="9" fill="#22c55e" font-weight="bold" letter-spacing="3">AVAILABILITY STATUS</text>
  <text x="53" y="54" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="#f1f5f9" font-weight="700">🟢 Open for Freelance &amp; Bot Dev Projects</text>

  <!-- ── Dividers ── -->
  <line x1="340" y1="16" x2="340" y2="62" stroke="#1a2a4a" stroke-width="1.5"/>
  <line x1="530" y1="16" x2="530" y2="62" stroke="#1a2a4a" stroke-width="1.5"/>

  <!-- ── SYSTEM column ── -->
  <text x="360" y="28" font-family="'Courier New',Courier,monospace" font-size="9" fill="#475569" letter-spacing="3">SYSTEM</text>
  <text x="360" y="52" font-family="'Courier New',Courier,monospace" font-size="14" fill="#00f0ff" font-weight="bold" filter="url(#textGlow)">cybernode-01</text>
  <circle cx="508" cy="50" r="5" fill="#22c55e" filter="url(#dotGlow)">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/>
  </circle>

  <!-- ── UPTIME column ── -->
  <text x="548" y="28" font-family="'Courier New',Courier,monospace" font-size="9" fill="#475569" letter-spacing="3">UPTIME</text>
  <text x="548" y="52" font-family="'Courier New',Courier,monospace" font-size="14" fill="#a855f7" font-weight="bold" filter="url(#textGlow)">99.9% secured</text>

  <!-- ── CTA Button ── -->
  <rect x="680" y="20" width="162" height="38" rx="9" fill="#061a10" stroke="#22c55e" stroke-width="1.5"/>
  <rect x="680" y="20" width="162" height="38" rx="9" fill="none" stroke="#4ade80" stroke-width="1">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite"/>
  </rect>
  <text x="761" y="43" font-family="'Courier New',Courier,monospace" font-size="10" fill="#4ade80" text-anchor="middle" font-weight="bold" letter-spacing="2">DM TO COLLABORATE</text>
</svg>`;

// ─── Write all files ─────────────────────────────────────────────────────────
sections.forEach(({ file, color, label, tag }) => {
  fs.writeFileSync(file, makeSectionSvg(color, label, tag), 'utf8');
  console.log('✓', file);
});

fs.writeFileSync('hud-status.svg', hudSvg, 'utf8');
console.log('✓ hud-status.svg');

console.log('\n✅ All section SVGs generated!');
