#!/usr/bin/env node
// fix-svgs.js — Fix broken section SVGs + generate remaining external SVG files
const fs = require('fs');

// ─── Fix: Section headers with & must use &amp; in XML ────────────────────
const fixedSections = [
  { file: 'sec-achievements.svg', color: '#ff007f', label: '🏆  ACHIEVEMENTS &amp; MILESTONES', tag: 'metrics' },
  { file: 'sec-tech.svg',         color: '#a855f7', label: '💻  SKILL MATRIX &amp; TECH STACK', tag: 'stack' },
  { file: 'sec-specialties.svg',  color: '#fbbf24', label: '🛠  SPECIALTIES &amp; FOCUS AREAS',  tag: 'focus' },
];

function makeSectionSvg(color, label, tag) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 50" width="860">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#03050d"/>
      <stop offset="50%"  stop-color="#06091a"/>
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
  <rect width="860" height="50" rx="9" fill="url(#bg)" stroke="#0d1e3a" stroke-width="1.2"/>
  <rect width="860" height="50" rx="9" fill="none" stroke="${color}" stroke-width="0.8">
    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="4s" repeatCount="indefinite"/>
  </rect>
  <rect x="0" y="0" width="5" height="50" rx="3" fill="${color}" opacity="0.9"/>
  <text x="15" y="15" font-family="'Courier New',Courier,monospace" font-size="7" fill="${color}" opacity="0.4" letter-spacing="2">// SECTION</text>
  <text x="15" y="36" font-family="'Courier New',Courier,monospace" font-size="15" font-weight="bold" fill="${color}" letter-spacing="1" filter="url(#glow)">${label}</text>
  <text x="848" y="34" font-family="'Courier New',Courier,monospace" font-size="13" fill="#152040" text-anchor="end">{ ${tag} }</text>
  <rect x="0" y="48" width="860" height="2" rx="1" fill="url(#line)"/>
</svg>`;
}

fixedSections.forEach(({ file, color, label, tag }) => {
  fs.writeFileSync(file, makeSectionSvg(color, label, tag), 'utf8');
  console.log('Fixed:', file);
});

// ─── build-log.svg (Currently Building section) ────────────────────────────
const buildLogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 155" width="860">
  <defs>
    <linearGradient id="cbbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060c1a"/>
      <stop offset="100%" stop-color="#0c0e22"/>
    </linearGradient>
    <filter id="cbGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="cbGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a1830" stroke-width="0.4"/>
    </pattern>
  </defs>
  <rect width="860" height="155" rx="12" fill="url(#cbbg)" stroke="#1e2d52" stroke-width="1.2"/>
  <rect width="860" height="155" rx="12" fill="url(#cbGrid)" opacity="0.5"/>
  <rect width="860" height="155" rx="12" fill="none" stroke="#fbbf24" stroke-width="1">
    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite"/>
  </rect>
  <!-- Terminal top bar -->
  <rect x="0" y="0" width="860" height="30" rx="12" fill="#0b1526"/>
  <rect x="0" y="15" width="860" height="15" fill="#0b1526"/>
  <circle cx="20" cy="15" r="4.5" fill="#ff5f57"/>
  <circle cx="36" cy="15" r="4.5" fill="#febc2e"/>
  <circle cx="52" cy="15" r="4.5" fill="#28c840"/>
  <text x="430" y="20" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="9" fill="#3a4a6a">build.log — dmzrider — active projects</text>
  <circle cx="826" cy="15" r="5" fill="#fbbf24" filter="url(#cbGlow)">
    <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/>
  </circle>
  <text x="836" y="19" font-family="'Courier New',Courier,monospace" font-size="8" fill="#fbbf24">LIVE</text>
  <!-- Prompt -->
  <text x="24" y="54" font-family="'Courier New',Courier,monospace" font-size="11">
    <tspan fill="#6366f1">$</tspan><tspan fill="#64748b"> git log --oneline --all --current</tspan>
  </text>
  <!-- Project 1 -->
  <text x="24" y="79" font-family="'Courier New',Courier,monospace" font-size="12">
    <tspan fill="#fbbf24" font-weight="bold">&#9658;</tspan>
    <tspan fill="#f1f5f9" dx="6">Discord Security Bot v2.0</tspan>
    <tspan fill="#475569" font-size="10" dx="8">&#8212; Advanced moderation + DDoS alert hooks</tspan>
  </text>
  <rect x="786" y="66" width="62" height="18" rx="5" fill="#1e1b4b" stroke="#6366f1" stroke-width="0.8"/>
  <text x="817" y="79" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#a5b4fc">BUILDING</text>
  <!-- Project 2 -->
  <text x="24" y="105" font-family="'Courier New',Courier,monospace" font-size="12">
    <tspan fill="#22c55e" font-weight="bold">&#9658;</tspan>
    <tspan fill="#f1f5f9" dx="6">AKRP-V5-MAIN &#8212; All Kerala Roleplay Open.MP</tspan>
    <tspan fill="#475569" font-size="10" dx="8">&#8212; Modular Pawn gamemode, 3.6 MB codebase</tspan>
  </text>
  <rect x="786" y="92" width="62" height="18" rx="5" fill="#0f2000" stroke="#22c55e" stroke-width="0.8"/>
  <text x="817" y="105" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#4ade80">ACTIVE</text>
  <!-- Project 3 -->
  <text x="24" y="131" font-family="'Courier New',Courier,monospace" font-size="12">
    <tspan fill="#a855f7" font-weight="bold">&#9658;</tspan>
    <tspan fill="#f1f5f9" dx="6">NovaShield &#8212; Packet Defense Engine</tspan>
    <tspan fill="#475569" font-size="10" dx="8">&#8212; Real-time DDoS mitigation &amp; firewall filtering</tspan>
  </text>
  <rect x="786" y="118" width="62" height="18" rx="5" fill="#1a002e" stroke="#a855f7" stroke-width="0.8"/>
  <text x="817" y="131" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#c084fc">PUBLIC</text>
</svg>`;

fs.writeFileSync('build-log.svg', buildLogSvg, 'utf8');
console.log('Created: build-log.svg');

// ─── global-reach.svg ──────────────────────────────────────────────────────
const globalReachSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 235" width="860">
  <defs>
    <linearGradient id="globebg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#04060f"/>
      <stop offset="100%" stop-color="#080d1c"/>
    </linearGradient>
    <radialGradient id="glowCenter" cx="50%" cy="55%" r="40%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="dotGlow">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="globeGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a1830" stroke-width="0.4"/>
    </pattern>
  </defs>
  <rect width="860" height="235" rx="13" fill="url(#globebg)" stroke="#1e2d52" stroke-width="1"/>
  <rect width="860" height="235" rx="13" fill="url(#globeGrid)" opacity="0.5"/>
  <rect width="860" height="235" rx="13" fill="none" stroke="#4f46e5" stroke-width="1">
    <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Title -->
  <text x="430" y="30" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="11" font-weight="bold" fill="#00f0ff" letter-spacing="3" opacity="0.85">// GLOBAL_REACH</text>

  <!-- Globe outer ring -->
  <circle cx="430" cy="130" r="85" fill="url(#glowCenter)" stroke="#1e3a5f" stroke-width="1" opacity="0.7"/>
  <!-- Latitude lines -->
  <ellipse cx="430" cy="130" rx="85" ry="22" fill="none" stroke="#1e3a5f" stroke-width="0.7" opacity="0.5"/>
  <ellipse cx="430" cy="98"  rx="72" ry="18" fill="none" stroke="#1e3a5f" stroke-width="0.5" opacity="0.4"/>
  <ellipse cx="430" cy="162" rx="72" ry="18" fill="none" stroke="#1e3a5f" stroke-width="0.5" opacity="0.4"/>
  <!-- Meridian lines -->
  <line x1="430" y1="45" x2="430" y2="215" stroke="#1e3a5f" stroke-width="0.7" opacity="0.5"/>
  <line x1="345" y1="130" x2="515" y2="130" stroke="#1e3a5f" stroke-width="0.7" opacity="0.5"/>

  <!-- Connection lines (dashed) -->
  <line x1="430" y1="130" x2="170" y2="130" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.35"/>
  <line x1="430" y1="130" x2="305" y2="80"  stroke="#a855f7" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.35"/>
  <line x1="430" y1="130" x2="585" y2="88"  stroke="#ff007f" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.35"/>
  <line x1="430" y1="130" x2="725" y2="110" stroke="#fbbf24" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.35"/>
  <line x1="430" y1="130" x2="525" y2="168" stroke="#22c55e" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.35"/>

  <!-- ── Location dots ── -->
  <!-- Kerala, India (HOME) -->
  <circle cx="430" cy="130" r="9" fill="#00f0ff" filter="url(#dotGlow)">
    <animate attributeName="r" values="7;12;7" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="430" cy="130" r="3.5" fill="#ffffff"/>
  <text x="430" y="153" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#00f0ff">&#127968; Kerala, India</text>

  <!-- USA -->
  <circle cx="170" cy="130" r="6" fill="#a855f7" filter="url(#dotGlow)">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite"/>
  </circle>
  <text x="170" y="148" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#a855f7">USA</text>

  <!-- Europe -->
  <circle cx="305" cy="80" r="6" fill="#ff007f" filter="url(#dotGlow)">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="2.5s" repeatCount="indefinite"/>
  </circle>
  <text x="305" y="72" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#ff007f">Europe</text>

  <!-- SE Asia -->
  <circle cx="585" cy="88" r="6" fill="#fbbf24" filter="url(#dotGlow)">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="3.5s" repeatCount="indefinite"/>
  </circle>
  <text x="585" y="80" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#fbbf24">SE Asia</text>

  <!-- Middle East -->
  <circle cx="525" cy="168" r="6" fill="#22c55e" filter="url(#dotGlow)">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite"/>
  </circle>
  <text x="525" y="185" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#22c55e">Middle East</text>

  <!-- Australia -->
  <circle cx="725" cy="110" r="6" fill="#38bdf8" filter="url(#dotGlow)">
    <animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite"/>
  </circle>
  <text x="725" y="102" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#38bdf8">Australia</text>

  <!-- ── Stats footer row ── -->
  <line x1="20" y1="208" x2="840" y2="208" stroke="#1a2a4a" stroke-width="1"/>
  <text x="107" y="223" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="9" fill="#475569">Profile Visitors</text>
  <text x="107" y="232" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="12" fill="#00f0ff" font-weight="bold">&#127760; Global</text>
  <text x="322" y="223" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="9" fill="#475569">Regions Reached</text>
  <text x="322" y="232" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="12" fill="#a855f7" font-weight="bold">6+ Regions</text>
  <text x="538" y="223" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="9" fill="#475569">Based In</text>
  <text x="538" y="232" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="12" fill="#fbbf24" font-weight="bold">Kerala, India</text>
  <text x="753" y="223" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="9" fill="#475569">Availability</text>
  <text x="753" y="232" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="12" fill="#22c55e" font-weight="bold">&#128994; Open</text>
</svg>`;

fs.writeFileSync('global-reach.svg', globalReachSvg, 'utf8');
console.log('Created: global-reach.svg');

// ─── contact-cards.svg ─────────────────────────────────────────────────────
const contactCardsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 168" width="860">
  <defs>
    <linearGradient id="connbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060c1a"/>
      <stop offset="100%" stop-color="#0e0a24"/>
    </linearGradient>
    <linearGradient id="connBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#6366f1"/>
      <stop offset="50%"  stop-color="#00f0ff"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
    <linearGradient id="connTopLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#6366f1" stop-opacity="0"/>
      <stop offset="30%"  stop-color="#6366f1" stop-opacity="0.8"/>
      <stop offset="50%"  stop-color="#00f0ff" stop-opacity="1"/>
      <stop offset="70%"  stop-color="#a855f7" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
    </linearGradient>
    <filter id="connGlow">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="connGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a1830" stroke-width="0.4"/>
    </pattern>
  </defs>
  <rect width="860" height="168" rx="14" fill="url(#connbg)" stroke="#1e2d52" stroke-width="1.2"/>
  <rect width="860" height="168" rx="14" fill="url(#connGrid)" opacity="0.4"/>
  <rect x="0" y="0" width="860" height="2.5" fill="url(#connTopLine)" rx="2"/>
  <rect width="860" height="168" rx="14" fill="none" stroke="url(#connBorderGrad)" stroke-width="1.5">
    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="4s" repeatCount="indefinite"/>
  </rect>

  <!-- Heading -->
  <text x="430" y="34" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="11" font-weight="bold" fill="#00f0ff" letter-spacing="3" opacity="0.85">// FIND ME ON</text>

  <!-- GitHub card -->
  <rect x="18" y="52" width="188" height="100" rx="11" fill="#060a14" stroke="#30363d" stroke-width="1.3"/>
  <rect x="18" y="52" width="188" height="4" rx="3" fill="#30363d" opacity="0.5"/>
  <text x="112" y="96" text-anchor="middle" font-family="Arial" font-size="28">&#128025;</text>
  <text x="112" y="120" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="12" fill="#e2e8f0" font-weight="bold">GitHub</text>
  <text x="112" y="138" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="10" fill="#475569">@dmzrider</text>

  <!-- Discord card -->
  <rect x="222" y="52" width="188" height="100" rx="11" fill="#060a14" stroke="#5865f2" stroke-width="1.3"/>
  <rect x="222" y="52" width="188" height="4" rx="3" fill="#5865f2" opacity="0.5"/>
  <text x="316" y="96" text-anchor="middle" font-family="Arial" font-size="28">&#128172;</text>
  <text x="316" y="120" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="12" fill="#7289da" font-weight="bold">Discord</text>
  <text x="316" y="138" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="10" fill="#475569">echo__dev</text>

  <!-- Email card -->
  <rect x="426" y="52" width="188" height="100" rx="11" fill="#060a14" stroke="#ff007f" stroke-width="1.3"/>
  <rect x="426" y="52" width="188" height="4" rx="3" fill="#ff007f" opacity="0.5"/>
  <text x="520" y="96" text-anchor="middle" font-family="Arial" font-size="28">&#128231;</text>
  <text x="520" y="120" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="12" fill="#ff007f" font-weight="bold">Email</text>
  <text x="520" y="138" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="10" fill="#475569">DM for contact</text>

  <!-- Availability card (wider) -->
  <rect x="630" y="52" width="212" height="100" rx="11" fill="#060a14" stroke="#22c55e" stroke-width="1.3"/>
  <rect x="630" y="52" width="212" height="4" rx="3" fill="#22c55e" opacity="0.5"/>
  <rect x="630" y="52" width="212" height="100" rx="11" fill="none" stroke="#22c55e" stroke-width="1">
    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite"/>
  </rect>
  <circle cx="660" cy="102" r="7" fill="#22c55e" filter="url(#connGlow)">
    <animate attributeName="r" values="5;9;5" dur="1.5s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <text x="736" y="92" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#f1f5f9" font-weight="bold">Available for Work</text>
  <text x="736" y="112" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="10" fill="#4ade80">Freelance &amp; Collaboration</text>
  <text x="736" y="130" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="9" fill="#475569">Kerala, India</text>
</svg>`;

fs.writeFileSync('contact-cards.svg', contactCardsSvg, 'utf8');
console.log('Created: contact-cards.svg');

// ─── footer-bar.svg ────────────────────────────────────────────────────────
const footerBarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 76" width="860">
  <defs>
    <linearGradient id="footbg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#03050d"/>
      <stop offset="50%"  stop-color="#06091a"/>
      <stop offset="100%" stop-color="#03050d"/>
    </linearGradient>
    <linearGradient id="footTop" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#00f0ff" stop-opacity="0"/>
      <stop offset="25%"  stop-color="#00f0ff" stop-opacity="0.7"/>
      <stop offset="50%"  stop-color="#a855f7" stop-opacity="1"/>
      <stop offset="75%"  stop-color="#ff007f" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#ff007f" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="footBot" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#ff007f" stop-opacity="0"/>
      <stop offset="30%"  stop-color="#ff007f" stop-opacity="0.5"/>
      <stop offset="50%"  stop-color="#a855f7" stop-opacity="0.7"/>
      <stop offset="70%"  stop-color="#00f0ff" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="footGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a1830" stroke-width="0.3"/>
    </pattern>
  </defs>
  <rect width="860" height="76" rx="10" fill="url(#footbg)" stroke="#1a2a4a" stroke-width="1"/>
  <rect width="860" height="76" rx="10" fill="url(#footGrid)" opacity="0.4"/>
  <rect x="0" y="0"    width="860" height="2.5" rx="2" fill="url(#footTop)"/>
  <rect x="0" y="73.5" width="860" height="2.5" rx="2" fill="url(#footBot)"/>
  <text x="430" y="32" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="11" fill="#475569">Thanks for visiting! If you find my work useful,</text>
  <text x="287" y="54" font-family="'Courier New',Courier,monospace" font-size="11" fill="#334155">drop a </text>
  <text x="333" y="54" font-family="'Courier New',Courier,monospace" font-size="11" fill="#fbbf24">&#11088;</text>
  <text x="350" y="54" font-family="'Courier New',Courier,monospace" font-size="11" fill="#334155"> on any repo &#8212; it means a lot!  Built with </text>
  <text x="620" y="54" font-family="'Courier New',Courier,monospace" font-size="11" fill="#ff007f">&#9829;</text>
  <text x="635" y="54" font-family="'Courier New',Courier,monospace" font-size="11" fill="#334155"> by </text>
  <text x="660" y="54" font-family="'Courier New',Courier,monospace" font-size="12" fill="#00f0ff" font-weight="bold">dmzrider</text>
  <rect x="800" y="10" width="48" height="18" rx="5" fill="#070d1a" stroke="#1a2a4a" stroke-width="0.8"/>
  <text x="824" y="23" text-anchor="middle" font-family="'Courier New',Courier,monospace" font-size="8" fill="#252f42">v5.1.0</text>
</svg>`;

fs.writeFileSync('footer-bar.svg', footerBarSvg, 'utf8');
console.log('Created: footer-bar.svg');

console.log('\n✅ All fixes and new SVGs generated!');
