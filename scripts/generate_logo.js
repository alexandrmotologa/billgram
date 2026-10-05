import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function buildLogoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <clipPath id="squircle-clip">
      <rect x="24" y="24" width="976" height="976" rx="220" />
    </clipPath>

    <!-- Electric Cyan Gradient for Optics & Telemetry Core -->
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="40%" stop-color="#00f5ff"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <!-- Metallic Titanium Light Facet -->
    <linearGradient id="titanium-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>

    <!-- Drop Shadow for Mark Dimensionality -->
    <filter id="subtle-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#0f172a" flood-opacity="0.18" />
    </filter>

    <filter id="eye-glow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#00f5ff" flood-opacity="0.9" />
    </filter>

    <filter id="core-glow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00f5ff" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- 1. Luxury White Squircle Container -->
  <rect x="24" y="24" width="976" height="976" rx="220" fill="#ffffff" stroke="#e2e8f0" stroke-width="6" />

  <g clip-path="url(#squircle-clip)">
    <!-- Architectural Radial Background Sheen -->
    <circle cx="512" cy="512" r="440" fill="#f8fafc" opacity="0.9" />
    <circle cx="512" cy="512" r="310" fill="#f1f5f9" opacity="0.75" />

    <g transform="translate(512, 512)" filter="url(#subtle-shadow)">

      <!-- 2. Hexagonal Architectural Gateway Frame -->
      <polygon points="
        0,-390
        338,-195
        338,195
        0,390
        -338,195
        -338,-195
      " fill="none" stroke="#0f172a" stroke-width="38" stroke-linejoin="round" />

      <!-- Precision Dashed Cyan Telemetry Ring -->
      <polygon points="
        0,-356
        308,-178
        308,178
        0,356
        -308,178
        -308,-178
      " fill="none" stroke="#00f5ff" stroke-width="4" opacity="0.45" stroke-dasharray="16, 12" />

      <!-- ==================================================== -->
      <!-- 3. WATERTIGHT BASE SILHOUETTE (AERODYNAMIC SWIFT)     -->
      <!-- ==================================================== -->
      <path d="
        M 0,-260
        L 32,-220
        L 75,-145
        L 155,-165
        L 230,-190
        L 305,-200
        L 280,-105
        L 240,-25
        L 195,50
        L 150,115
        L 110,155
        L 80,310
        L 30,245
        L 0,220
        L -30,245
        L -80,310
        L -110,155
        L -150,115
        L -195,50
        L -240,-25
        L -280,-105
        L -305,-200
        L -230,-190
        L -155,-165
        L -75,-145
        L -32,-220
        Z
      " fill="#090d16" />

      <!-- ==================================================== -->
      <!-- LOW-POLY FACET MESH (SOARING ORIGAMI CARRIER SWIFT)  -->
      <!-- Directional lighting: light on right, shadow on left -->
      <!-- ==================================================== -->

      <!-- Section A: Avian Head and Crown Spire -->
      <polygon points="0,-260 -32,-220 0,-195" fill="#1e293b" />
      <polygon points="0,-260 32,-220 0,-195" fill="#64748b" />

      <!-- Supraorbital Brow Ridge -->
      <polygon points="-32,-220 -65,-180 -30,-155 0,-168" fill="#182234" />
      <polygon points="32,-220 65,-180 30,-155 0,-168" fill="#475569" />

      <!-- Forehead Keystone Bridge -->
      <polygon points="0,-195 -32,-220 0,-168" fill="#334155" />
      <polygon points="0,-195 32,-220 0,-168" fill="#94a3b8" />

      <!-- Temples -->
      <polygon points="-65,-180 -75,-145 -30,-155" fill="#0f172a" />
      <polygon points="65,-180 75,-145 30,-155" fill="#334155" />

      <!-- Section B: Predator Almond Eyes (Electric Cyan, Razor Gaze) -->
      <!-- Left Eye Socket -->
      <polygon points="-60,-178 -32,-164 -26,-148 -54,-160" fill="#050811" />
      <!-- Left Glowing Cyan Iris -->
      <polygon points="-56,-175 -34,-163 -28,-152 -50,-162" fill="url(#cyan-glow)" filter="url(#eye-glow)" />
      <!-- Left Slit Pupil -->
      <polygon points="-44,-170 -38,-164 -36,-156 -42,-161" fill="#050811" />

      <!-- Right Eye Socket -->
      <polygon points="60,-178 32,-164 26,-148 54,-160" fill="#050811" />
      <!-- Right Glowing Cyan Iris -->
      <polygon points="56,-175 34,-163 28,-152 50,-162" fill="url(#cyan-glow)" filter="url(#eye-glow)" />
      <!-- Right Slit Pupil -->
      <polygon points="44,-170 38,-164 36,-156 42,-161" fill="#050811" />

      <!-- Section C: Origami Beak (Carrier Dispatch Wedge) -->
      <polygon points="0,-168 -22,-148 0,-85" fill="#182234" />
      <polygon points="0,-168 22,-148 0,-85" fill="#cbd5e1" />
      <!-- Center Cutting Ridge -->
      <line x1="0" y1="-168" x2="0" y2="-85" stroke="#ffffff" stroke-width="2.2" opacity="0.9" />

      <!-- Section D: Gorget and Cheeks -->
      <polygon points="0,-85 -22,-148 -70,-120 -40,-65 0,-50" fill="#1e293b" />
      <polygon points="0,-85 22,-148 70,-120 40,-65 0,-50" fill="#64748b" />

      <polygon points="-75,-145 -70,-120 -22,-148" fill="#0f172a" />
      <polygon points="75,-145 70,-120 22,-148" fill="#334155" />

      <!-- Section E: High-Aspect-Ratio Scythe Wings -->
      <!-- Left Wing Leading Edge (Shadow Facets) -->
      <polygon points="-75,-145 -155,-165 -110,-100 -70,-120" fill="#0f172a" />
      <polygon points="-155,-165 -230,-190 -185,-120 -110,-100" fill="#182234" />
      <polygon points="-230,-190 -305,-200 -280,-105 -185,-120" fill="#0f172a" />

      <!-- Right Wing Leading Edge (Highlight Facets) -->
      <polygon points="75,-145 155,-165 110,-100 70,-120" fill="#475569" />
      <polygon points="155,-165 230,-190 185,-120 110,-100" fill="#64748b" />
      <polygon points="230,-190 305,-200 280,-105 185,-120" fill="#94a3b8" />

      <!-- Left Wing Primary Feathers (Cascading Flight Planes) -->
      <polygon points="-280,-105 -240,-25 -160,-35 -185,-120" fill="#1e293b" />
      <polygon points="-240,-25 -195,50 -130,30 -160,-35" fill="#0f172a" />
      <polygon points="-195,50 -150,115 -105,85 -130,30" fill="#182234" />
      <polygon points="-150,115 -110,155 -70,130 -105,85" fill="#0f172a" />

      <!-- Right Wing Primary Feathers (Cascading Flight Planes) -->
      <polygon points="280,-105 240,-25 160,-35 185,-120" fill="#475569" />
      <polygon points="240,-25 195,50 130,30 160,-35" fill="#334155" />
      <polygon points="195,50 150,115 105,85 130,30" fill="#475569" />
      <polygon points="150,115 110,155 70,130 105,85" fill="#334155" />

      <!-- Aerodynamic Electric Cyan Trim Accents on Wings -->
      <polygon points="-230,-190 -305,-200 -270,-155" fill="#00f5ff" opacity="0.95" />
      <polygon points="230,-190 305,-200 270,-155" fill="#00f5ff" opacity="0.95" />

      <polygon points="-280,-105 -240,-25 -255,-65" fill="#00f5ff" opacity="0.8" />
      <polygon points="280,-105 240,-25 255,-65" fill="#00f5ff" opacity="0.8" />

      <polygon points="-240,-25 -195,50 -210,12" fill="#00f5ff" opacity="0.65" />
      <polygon points="240,-25 195,50 210,12" fill="#00f5ff" opacity="0.65" />

      <!-- Section F: Fuselage and Keel Pectoral Armor -->
      <!-- Upper Breast Plates -->
      <polygon points="0,-50 -40,-65 -70,12 0,0" fill="#182234" />
      <polygon points="0,-50 40,-65 70,12 0,0" fill="#475569" />

      <polygon points="-40,-65 -70,-120 -110,-100 -70,12" fill="#0f172a" />
      <polygon points="40,-65 70,-120 110,-100 70,12" fill="#334155" />

      <polygon points="-110,-100 -185,-120 -160,-35 -130,30 -70,12" fill="#182234" />
      <polygon points="110,-100 185,-120 160,-35 130,30 70,12" fill="#475569" />

      <!-- Mid Breast Plates -->
      <polygon points="0,0 -70,12 -55,80 0,60" fill="#1e293b" />
      <polygon points="0,0 70,12 55,80 0,60" fill="#64748b" />

      <polygon points="-70,12 -130,30 -105,85 -55,80" fill="#0f172a" />
      <polygon points="70,12 130,30 105,85 55,80" fill="#334155" />

      <!-- Section G: Central Telemetry Core Diamond (The 30-Second Engine) -->
      <!-- Precision outer bezel -->
      <polygon points="0,20 44,70 0,120 -44,70" fill="#090d16" stroke="#00f5ff" stroke-width="2.5" />
      <!-- Glowing Inset Node -->
      <polygon points="0,32 30,70 0,108 -30,70" fill="url(#cyan-glow)" filter="url(#core-glow)" />
      <!-- Core Telemetry Pivot -->
      <polygon points="0,46 16,70 0,94 -16,70" fill="#090d16" />
      <circle cx="0" cy="70" r="4" fill="#00f5ff" />

      <!-- Lower Flanks -->
      <polygon points="0,120 -44,70 -55,80 -50,150 0,165" fill="#182234" />
      <polygon points="0,120 44,70 55,80 50,150 0,165" fill="#475569" />

      <polygon points="-55,80 -105,85 -70,130 -50,150" fill="#0f172a" />
      <polygon points="55,80 105,85 70,130 50,150" fill="#334155" />

      <!-- Section H: Signature Scissor-Fork Tail (Apus Apus) -->
      <!-- Center Rump Root -->
      <polygon points="0,165 -50,150 0,220" fill="#1e293b" />
      <polygon points="0,165 50,150 0,220" fill="#64748b" />

      <!-- Left Tail Blade -->
      <polygon points="0,220 -50,150 -110,155 -80,310 -30,245" fill="#0f172a" />
      <polygon points="-50,150 -70,130 -110,155" fill="#182234" />
      <!-- Left Tail Tip Cyan Accent -->
      <polygon points="-80,310 -50,255 -30,245" fill="#00f5ff" opacity="0.85" />

      <!-- Right Tail Blade -->
      <polygon points="0,220 50,150 110,155 80,310 30,245" fill="#334155" />
      <polygon points="50,150 70,130 110,155" fill="#475569" />
      <!-- Right Tail Tip Cyan Accent -->
      <polygon points="80,310 50,255 30,245" fill="#00f5ff" opacity="0.85" />

      <!-- Center Fork Notch Cyan Accent -->
      <polygon points="0,220 -18,245 0,238 18,245" fill="#00f5ff" opacity="0.6" />

      <!-- Section I: Crisp Titanium Wireframe Seams -->
      <path d="
        M 0,-260 L 0,-168
        M 0,-50 L 0,20
        M 0,120 L 0,165
        M 0,-195 L -32,-220 L -65,-180
        M 0,-195 L 32,-220 L 65,-180
        M -22,-148 L 0,-85 L 22,-148
        M -40,-65 L 0,-50 L 40,-65
        M -40,-65 L -70,12 L -55,80 L -50,150 L 0,165 L 50,150 L 55,80 L 70,12 L 40,-65
        M -70,12 L 0,0 L 70,12
      " fill="none" stroke="#94a3b8" stroke-width="1.2" opacity="0.4" />

    </g>
  </g>
</svg>`;
}

async function renderLogo(outputDir) {
  const svg = buildLogoSvg();
  const svgPath = path.join(outputDir, 'logo.svg');
  const pngPath = path.join(outputDir, 'logo.png');

  fs.writeFileSync(svgPath, svg, 'utf-8');
  console.log(`Saved SVG to ${svgPath}`);

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1024 },
  });
  const pngData = resvg.render().asPng();
  fs.writeFileSync(pngPath, pngData);
  console.log(`✓ Successfully rendered logo.png at 1024x1024 (${pngData.length} bytes) to ${pngPath}`);
}

const targetDir = path.resolve(__dirname, '..', 'docs', 'images');
renderLogo(targetDir).catch(err => {
  console.error('Error rendering logo:', err);
  process.exit(1);
});
