import React from "react";

// Estilo 2: Dourado Retrô Speakeasy (Jazz Bar & Art Déco)
export function GoldLuxuryLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="goldBgGrad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#1c1813" />
          <stop offset="100%" stop-color="#0a0907" />
        </radialGradient>
        <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCE5B5" />
          <stop offset="25%" stop-color="#DFAC6C" />
          <stop offset="50%" stop-color="#B87B32" />
          <stop offset="75%" stop-color="#F2D199" />
          <stop offset="100%" stop-color="#99601E" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="100" fill="url(#goldBgGrad)" />
      <rect width="504" height="504" x="4" y="4" rx="96" fill="none" stroke="url(#goldMetallic)" stroke-width="2" stroke-opacity="0.3" />

      {/* Outer GPS Pin */}
      <path
        d="M 256 65 C 172 65, 110 128, 110 212 C 110 305, 238 410, 256 424 C 274 410, 402 305, 402 212 C 402 128, 340 65, 256 65 Z"
        fill="#12100d"
        stroke="url(#goldMetallic)"
        stroke-width="14"
        stroke-linejoin="round"
      />

      {/* Inner Circle Accent */}
      <circle cx="256" cy="208" r="95" fill="none" stroke="url(#goldMetallic)" stroke-width="3" stroke-opacity="0.35" />

      {/* Equalizer Sound Bars */}
      <rect x="190" y="190" width="9" height="40" rx="4.5" fill="url(#goldMetallic)" fill-opacity="0.5" />
      <rect x="208" y="165" width="9" height="85" rx="4.5" fill="url(#goldMetallic)" fill-opacity="0.75" />
      <rect x="226" y="140" width="9" height="135" rx="4.5" fill="url(#goldMetallic)" fill-opacity="0.95" />
      <rect x="277" y="150" width="9" height="115" rx="4.5" fill="url(#goldMetallic)" fill-opacity="0.85" />
      <rect x="295" y="172" width="9" height="70" rx="4.5" fill="url(#goldMetallic)" fill-opacity="0.65" />
      <rect x="313" y="196" width="9" height="28" rx="4.5" fill="url(#goldMetallic)" fill-opacity="0.4" />

      {/* Question Mark '?' */}
      <path
        d="M 228 160 C 228 132, 244 120, 258 120 C 276 120, 292 134, 292 154 C 292 178, 258 188, 258 218 L 258 228"
        fill="none"
        stroke="url(#goldMetallic)"
        stroke-width="16"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="258" cy="256" r="9" fill="url(#goldMetallic)" />

      {/* Typography */}
      <text
        x="256"
        y="472"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="25"
        fontWeight="800"
        letterSpacing="5"
        fill="url(#goldMetallic)"
      >
        RADAR DO ROLÊ
      </text>
    </svg>
  );
}

// Estilo 3: Clean Duotone Tech (Estilo iOS / Apple)
export function CleanDuotoneLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="duoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0e1322" />
          <stop offset="100%" stop-color="#060911" />
        </linearGradient>
        <linearGradient id="duoVioletPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8B5CF6" />
          <stop offset="50%" stop-color="#A855F7" />
          <stop offset="100%" stop-color="#EC4899" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="100" fill="url(#duoBgGrad)" />
      <rect width="504" height="504" x="4" y="4" rx="96" fill="none" stroke="white" stroke-opacity="0.08" stroke-width="2" />

      {/* GPS Pin Outer */}
      <path
        d="M 256 65 C 170 65, 105 130, 105 215 C 105 310, 240 415, 256 428 C 272 415, 407 310, 407 215 C 407 130, 342 65, 256 65 Z"
        fill="#0c101c"
        stroke="url(#duoVioletPink)"
        stroke-width="14"
        stroke-linejoin="round"
      />

      {/* Inner Fill Shape */}
      <circle cx="256" cy="215" r="95" fill="url(#duoVioletPink)" fill-opacity="0.1" />

      {/* Equalizer Sound Bars */}
      <rect x="178" y="185" width="10" height="55" rx="5" fill="url(#duoVioletPink)" fill-opacity="0.45" />
      <rect x="198" y="155" width="10" height="95" rx="5" fill="url(#duoVioletPink)" fill-opacity="0.7" />
      <rect x="218" y="130" width="10" height="140" rx="5" fill="url(#duoVioletPink)" fill-opacity="0.9" />
      <rect x="284" y="145" width="10" height="115" rx="5" fill="url(#duoVioletPink)" fill-opacity="0.9" />
      <rect x="304" y="170" width="10" height="80" rx="5" fill="url(#duoVioletPink)" fill-opacity="0.7" />
      <rect x="324" y="195" width="10" height="40" rx="5" fill="url(#duoVioletPink)" fill-opacity="0.45" />

      {/* Crisp White Question Mark '?' */}
      <path
        d="M 226 160 C 226 130, 242 116, 258 116 C 278 116, 294 130, 294 150 C 294 174, 258 186, 258 216 L 258 226"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="18"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="258" cy="256" r="10" fill="#FFFFFF" />

      {/* Modern Typography */}
      <text
        x="256"
        y="476"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="28"
        fontWeight="900"
        letterSpacing="3"
        fill="#FFFFFF"
      >
        Radar do <tspan fill="url(#duoVioletPink)">Rolê</tspan>
      </text>
    </svg>
  );
}

// Estilo 4: Monocromático Urbano (Streetwear / Boiler Room)
export function MinimalStreetLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="streetMatte" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#16161a" />
          <stop offset="100%" stop-color="#0a0a0c" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="100" fill="url(#streetMatte)" />
      <rect width="504" height="504" x="4" y="4" rx="96" fill="none" stroke="#27272A" stroke-width="2" />

      {/* Bold Silver Pin */}
      <path
        d="M 256 60 C 165 60, 95 130, 95 218 C 95 315, 238 424, 256 438 C 274 424, 417 315, 417 218 C 417 130, 347 60, 256 60 Z"
        fill="#121214"
        stroke="#FFFFFF"
        stroke-width="14"
        stroke-linejoin="round"
      />

      {/* Monochromatic Sound Bars */}
      <rect x="175" y="195" width="12" height="40" rx="6" fill="#52525B" />
      <rect x="197" y="165" width="12" height="85" rx="6" fill="#71717A" />
      <rect x="219" y="135" width="12" height="135" rx="6" fill="#A1A1AA" />
      <rect x="281" y="150" width="12" height="110" rx="6" fill="#D4D4D8" />
      <rect x="303" y="175" width="12" height="70" rx="6" fill="#71717A" />
      <rect x="325" y="200" width="12" height="30" rx="6" fill="#52525B" />

      {/* Clean White '?' */}
      <path
        d="M 224 165 C 224 130, 242 115, 258 115 C 280 115, 298 130, 298 152 C 298 178, 258 190, 258 222 L 258 234"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="18"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="258" cy="265" r="10" fill="#FFFFFF" />

      {/* High-Contrast Streetwear Typography */}
      <text
        x="256"
        y="482"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="27"
        fontWeight="900"
        letterSpacing="6"
        fill="#FFFFFF"
      >
        RADAR DO ROLÊ
      </text>
    </svg>
  );
}

// Estilo 1: Flat Vector SVG (Garante renderização instantânea caso a imagem demore)
export function FlatVectorLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="flatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7C3AED" />
          <stop offset="50%" stop-color="#C026D3" />
          <stop offset="100%" stop-color="#F43F5E" />
        </linearGradient>
      </defs>

      <rect width="512" height="512" rx="100" fill="#0d0d11" />
      <rect width="504" height="504" x="4" y="4" rx="96" fill="none" stroke="#27272A" stroke-width="2" />

      {/* Pin with Flat Gradient */}
      <path
        d="M 256 65 C 168 65, 102 132, 102 216 C 102 312, 238 422, 256 436 C 274 422, 410 312, 410 216 C 410 132, 344 65, 256 65 Z"
        fill="url(#flatGrad)"
      />

      {/* Negative Space Soundwave + Question Mark */}
      <rect x="214" y="185" width="14" height="65" rx="7" fill="#0d0d11" />
      <rect x="249" y="145" width="14" height="120" rx="7" fill="#0d0d11" />
      <rect x="284" y="170" width="14" height="90" rx="7" fill="#0d0d11" />

      {/* Cutout Question Mark Curve */}
      <path
        d="M 240 155 C 240 120, 260 110, 276 110 C 298 110, 318 126, 318 152 C 318 180, 278 190, 278 226 L 278 238"
        fill="none"
        stroke="#0d0d11"
        stroke-width="22"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="278" cy="272" r="12" fill="#0d0d11" />

      {/* Typography */}
      <text
        x="256"
        y="482"
        textAnchor="middle"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="28"
        fontWeight="900"
        letterSpacing="4"
        fill="#FFFFFF"
      >
        RADAR DO ROLÊ
      </text>
    </svg>
  );
}
