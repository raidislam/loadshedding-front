// Animated scene of electricity travelling from a power plant, over transmission
// towers, through a substation and into homes. Pure SVG + CSS, no image assets.

const WIRE_RIGHT =
  "M124,246 Q168,252 204,218 Q259,246 314,218 Q369,246 424,218 Q456,248 480,272";
const WIRE_LEFT =
  "M124,252 Q140,256 156,218 Q211,246 266,218 Q321,246 376,218 Q430,256 468,272";
const WIRE_DIST = "M536,272 Q571,288 606,270 Q652,288 704,276";

const TOWERS = [180, 290, 400];
const HOUSES = [566, 620, 668];

const STARS = [
  [40, 40], [95, 80], [150, 30], [210, 70], [260, 25], [330, 60], [380, 35],
  [440, 85], [500, 30], [560, 55], [700, 40], [690, 120], [20, 120], [300, 110],
];

const SKYLINE =
  "M140,330 V300 H158 V286 H176 V306 H196 V276 H214 V296 H236 V266 H252 V290 H274 V302 H296 V280 H318 V294 H340 V270 H356 V288 H378 V300 H400 V284 H420 V296 H444 V330 Z";

export function PowerGridIllustration() {
  return (
    <svg
      viewBox="0 0 720 380"
      className="grid-anim h-auto w-full"
      role="img"
      aria-label="Electricity flowing from a power plant through transmission towers and a substation into homes"
    >
      <defs>
        <linearGradient id="pg-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#020617" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pg-horizon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pg-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff7d6" stopOpacity="0" />
        </radialGradient>
        <filter id="pg-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <path id="pg-wire-r" d={WIRE_RIGHT} />
        <path id="pg-wire-l" d={WIRE_LEFT} />
        <path id="pg-wire-d" d={WIRE_DIST} />

        {/* Lattice transmission tower, origin at the base centre */}
        <g id="pg-tower" fill="none" stroke="#9fb4dc" strokeWidth="1.6" strokeLinecap="round">
          <path d="M-14,0 L-4,-110 M14,0 L4,-110" strokeWidth="2.2" />
          <path d="M-14,0 L11,-28 L-11,-56 L8,-84 L-5,-110" />
          <path d="M14,0 L-11,-28 L11,-56 L-8,-84 L5,-110" />
          <path d="M-24,-118 L24,-118 M-4,-110 L-24,-118 M4,-110 L24,-118" strokeWidth="2" />
          <path d="M-4,-110 L0,-128 L4,-110" />
          <path d="M-24,-118 L-24,-112 M24,-118 L24,-112" stroke="#e8eefc" strokeWidth="2.4" />
        </g>
      </defs>

      {/* Moon and stars (no sky fill, so the hero background shows through) */}
      <circle cx="640" cy="72" r="60" fill="url(#pg-moon)" />
      <circle cx="640" cy="72" r="20" fill="#fff4cc" />
      <circle cx="632" cy="66" r="4" fill="#efe2b0" />
      {STARS.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.6 : 1.1}
          fill="#ffffff"
          className="pg-star"
          style={{ animationDelay: `${(i * 0.37) % 3}s` }}
        />
      ))}

      {/* Distant city skyline */}
      <path d={SKYLINE} fill="#1d3f7e" opacity="0.35" />

      {/* Ground */}
      <rect x="0" y="330" width="720" height="50" fill="url(#pg-ground)" />
      <rect x="0" y="329" width="720" height="2" fill="url(#pg-horizon)" />

      {/* Power plant: cooling tower, building, chimney, steam */}
      <g>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={65}
            cy={200}
            r={10}
            fill="#c9d6ee"
            className="pg-steam"
            style={{ animationDelay: `${i * 1.2}s` }}
          />
        ))}
        <path d="M40,330 C49,290 49,250 43,210 L87,210 C81,250 81,290 90,330 Z" fill="#5e76a8" />
        <path d="M43,210 L87,210 L86,216 L44,216 Z" fill="#7e95c4" />
        <rect x="108" y="196" width="10" height="70" fill="#4a6295" />
        <rect x="108" y="204" width="10" height="4" fill="#e05252" />
        <rect x="88" y="262" width="40" height="68" fill="#3d5588" />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={95 + c * 16}
              y={272 + r * 18}
              width="9"
              height="9"
              rx="1"
              fill="#ffd166"
              opacity="0.9"
            />
          )),
        )}
        <path d="M122,262 V246" stroke="#e8eefc" strokeWidth="2.4" />
      </g>

      {/* Transmission towers */}
      {TOWERS.map((x) => (
        <use key={x} href="#pg-tower" x={x} y={330} />
      ))}

      {/* High-voltage wires with flowing current */}
      <g fill="none" strokeLinecap="round">
        <use href="#pg-wire-r" stroke="#6b84b8" strokeWidth="1.4" />
        <use href="#pg-wire-l" stroke="#6b84b8" strokeWidth="1.4" />
        <use href="#pg-wire-d" stroke="#6b84b8" strokeWidth="1.4" />
        <use href="#pg-wire-r" stroke="#5ec8ff" strokeWidth="2" className="pg-flow" filter="url(#pg-glow)" />
        <use href="#pg-wire-l" stroke="#5ec8ff" strokeWidth="2" className="pg-flow pg-flow-slow" filter="url(#pg-glow)" />
        <use href="#pg-wire-d" stroke="#ffd166" strokeWidth="2" className="pg-flow" filter="url(#pg-glow)" />
      </g>

      {/* Energy pulses riding along the wires */}
      <g className="pg-pulse" filter="url(#pg-glow)">
        {[0, 0.8, 1.6].map((d) => (
          <circle key={`r${d}`} r="3.5" fill="#bdeaff">
            <animateMotion dur="2.4s" begin={`${d}s`} repeatCount="indefinite">
              <mpath href="#pg-wire-r" />
            </animateMotion>
          </circle>
        ))}
        {[0.4, 1.4].map((d) => (
          <circle key={`l${d}`} r="3" fill="#bdeaff">
            <animateMotion dur="2.8s" begin={`${d}s`} repeatCount="indefinite">
              <mpath href="#pg-wire-l" />
            </animateMotion>
          </circle>
        ))}
        {[0, 0.7].map((d) => (
          <circle key={`d${d}`} r="3" fill="#ffe7a3">
            <animateMotion dur="1.4s" begin={`${d}s`} repeatCount="indefinite">
              <mpath href="#pg-wire-d" />
            </animateMotion>
          </circle>
        ))}
      </g>

      {/* Substation */}
      <g>
        <rect x="460" y="276" width="80" height="54" rx="3" fill="#0d2150" stroke="#4d6eb0" strokeDasharray="4 3" />
        <path d="M466,272 H536 M470,272 V292 M484,272 V292 M516,272 V292 M530,272 V292" stroke="#9fb4dc" strokeWidth="2" />
        {[468, 500].map((x) => (
          <g key={x}>
            <rect x={x} y="292" width="24" height="30" rx="2" fill="#3d5588" />
            <path d={`M${x + 5},297 V317 M${x + 12},297 V317 M${x + 19},297 V317`} stroke="#5e76a8" strokeWidth="2" />
          </g>
        ))}
        <g className="pg-bolt" filter="url(#pg-glow)">
          <circle cx="500" cy="248" r="13" fill="#ffd166" opacity="0.18" />
          <path d="M503,237 L493,250 H500 L496,260 L507,246 H500 Z" fill="#ffd166" />
        </g>
      </g>

      {/* Distribution pole */}
      <path d="M606,330 V264 M594,270 H618" stroke="#9fb4dc" strokeWidth="2.2" strokeLinecap="round" />

      {/* Homes lighting up */}
      {HOUSES.map((x, i) => (
        <g key={x}>
          <path d={`M${x + 18},282 V270`} stroke="#6b84b8" strokeWidth="1" />
          <rect x={x} y="300" width="36" height="30" fill="#2c4479" />
          <path d={`M${x - 4},301 L${x + 18},283 L${x + 40},301 Z`} fill="#4a6295" />
          <rect
            x={x + 5}
            y="307"
            width="10"
            height="9"
            rx="1"
            className="pg-window"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
          <rect
            x={x + 21}
            y="307"
            width="10"
            height="9"
            rx="1"
            className="pg-window"
            style={{ animationDelay: `${i * 0.5 + 0.25}s` }}
          />
          <rect x={x + 14} y="320" width="8" height="10" fill="#18295a" />
        </g>
      ))}

      {/* Stage labels */}
      <g fill="#9fb4dc" fontSize="11" fontWeight="600" textAnchor="middle" letterSpacing="0.06em">
        <text x="84" y="352">GENERATION</text>
        <text x="290" y="352">TRANSMISSION</text>
        <text x="500" y="352">SUBSTATION</text>
        <text x="636" y="352">YOUR HOME</text>
      </g>
    </svg>
  );
}
