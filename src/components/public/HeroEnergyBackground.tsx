// Full-bleed animated background for the home hero: glowing circuit traces with
// travelling current, flickering lightning, energy rings and rising sparks.

const TRACES = [
  "M0,140 H220 L270,190 H420 L450,160 H560",
  "M0,420 H120 L170,370 H300 L340,410 H380",
  "M0,700 H180 L240,760 H400 L440,720 H520",
  "M260,900 V800 L300,760 V640 L330,610 H360",
  "M1440,120 H1240 L1190,170 H1060 L1030,140 H940",
  "M1440,380 H1320 L1280,420 H1160",
  "M1440,640 H1260 L1210,690 H1080 L1040,650 H980",
  "M1180,900 V820 L1140,780 V700 L1110,670 H1060",
  "M620,0 V60 L660,100 H800 L840,60 H900",
  "M720,900 V850 L760,810 H900",
];

// Last point of each trace, where a glowing node sits
const NODES = [
  [560, 160], [380, 410], [520, 720], [360, 610], [940, 140],
  [1160, 420], [980, 650], [1060, 670], [900, 60], [900, 810],
];

const BOLTS = [
  { d: "M180,0 L212,90 L176,110 L232,230 L196,252 L250,380", dur: 6, delay: 0.5 },
  { d: "M1300,0 L1268,110 L1310,132 L1250,262 L1292,284 L1230,430", dur: 8, delay: 3 },
  { d: "M820,0 L842,70 L814,86 L862,176 L836,190 L870,260", dur: 10, delay: 6 },
];

// Deterministic pseudo-random spark positions (same on server and client)
const SPARKS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 263) % 1440,
  y: 620 + ((i * 97) % 280),
  r: 1 + (i % 3) * 0.6,
  dur: 5 + (i % 5),
  delay: (i * 0.7) % 6,
}));

export function HeroEnergyBackground() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="grid-anim pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="eb-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="eb-flash" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="eb-vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="55%" stopColor="#020617" stopOpacity="0" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.85" />
        </radialGradient>
        {TRACES.map((d, i) => (
          <path key={i} id={`eb-trace-${i}`} d={d} />
        ))}
      </defs>

      {/* Energy rings pulsing out behind the illustration */}
      <g fill="none" stroke="#38bdf8" strokeWidth="1.5">
        {[0, 1.3, 2.6].map((d) => (
          <circle key={d} cx="1040" cy="450" r="260" className="eb-ring" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>

      {/* Circuit traces: faint base line + flowing current on top */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {TRACES.map((_, i) => (
          <use key={`b${i}`} href={`#eb-trace-${i}`} stroke="#1e3a8a" strokeWidth="2" opacity="0.7" />
        ))}
        {TRACES.map((_, i) => (
          <use
            key={`f${i}`}
            href={`#eb-trace-${i}`}
            stroke={i % 3 === 0 ? "#fcd34d" : "#38bdf8"}
            strokeWidth="2"
            className="eb-trace"
            style={{ animationDelay: `${(i * 0.45) % 3}s` }}
            filter="url(#eb-glow)"
          />
        ))}
      </g>

      {/* Bright pulses travelling along the traces */}
      <g className="pg-pulse" filter="url(#eb-glow)">
        {TRACES.map((_, i) => (
          <circle key={i} r="3" fill={i % 3 === 0 ? "#fde68a" : "#e0f2fe"}>
            <animateMotion dur={`${2.5 + (i % 4) * 0.6}s`} begin={`${(i * 0.4) % 2}s`} repeatCount="indefinite">
              <mpath href={`#eb-trace-${i}`} />
            </animateMotion>
          </circle>
        ))}
      </g>

      {/* Nodes at the trace ends */}
      {NODES.map(([x, y], i) => (
        <g key={i} filter="url(#eb-glow)">
          <circle cx={x} cy={y} r="6" fill="#0b1d45" stroke="#38bdf8" strokeWidth="2" />
          <circle cx={x} cy={y} r="2.5" fill="#e0f2fe" className="eb-node" style={{ animationDelay: `${(i * 0.3) % 2}s` }} />
        </g>
      ))}

      {/* Lightning strikes with a sky flash */}
      {BOLTS.map((b, i) => (
        <g key={i} className="eb-bolt" style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}>
          <rect width="1440" height="900" fill="url(#eb-flash)" />
          <path d={b.d} fill="none" stroke="#bae6fd" strokeWidth="6" opacity="0.5" filter="url(#eb-glow)" />
          <path d={b.d} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
        </g>
      ))}

      {/* Rising sparks */}
      {SPARKS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={i % 4 === 0 ? "#fcd34d" : "#7dd3fc"}
          className="eb-spark"
          style={{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        />
      ))}

      <rect width="1440" height="900" fill="url(#eb-vignette)" />
    </svg>
  );
}
