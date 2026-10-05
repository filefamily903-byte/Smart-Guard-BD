import React from 'react';

interface Avatar3DProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isAnimated?: boolean;
  showOnlineStatus?: boolean;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  size = 'md',
  className = '',
  isAnimated = false,
  showOnlineStatus = false,
}) => {
  // Dimension mapping
  const dimensions = {
    xs: { px: 28, svgSize: 28 },
    sm: { px: 36, svgSize: 36 },
    md: { px: 44, svgSize: 44 },
    lg: { px: 56, svgSize: 56 },
    xl: { px: 76, svgSize: 76 },
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        isAnimated ? 'hover:scale-105 transition-transform duration-300' : ''
      } ${className}`}
      style={{ width: dimensions.px, height: dimensions.px }}
      aria-label="Shurakkha AI 3D Avatar"
    >
      <svg
        viewBox="0 0 100 100"
        width={dimensions.svgSize}
        height={dimensions.svgSize}
        className="drop-shadow-[0_4px_12px_rgba(15,118,110,0.35)] overflow-visible"
      >
        <defs>
          {/* 3D Outer Shell Gradient */}
          <radialGradient id="head3D" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F1F5F9" />
            <stop offset="85%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>

          {/* 3D Visor / Screen Face Gradient */}
          <radialGradient id="visor3D" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#134E4A" />
            <stop offset="60%" stopColor="#0B2530" />
            <stop offset="100%" stopColor="#04131A" />
          </radialGradient>

          {/* Glowing Eyes Gradient */}
          <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Ear Pods 3D Gradient */}
          <radialGradient id="earPodGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="60%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#115E59" />
          </radialGradient>

          {/* Top Antenna / Light Sensor */}
          <radialGradient id="antennaGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="70%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </radialGradient>

          {/* Soft Specular Highlight */}
          <linearGradient id="specularGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Filter for 3D Drop Shadow */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* --- 3D ANTENNA / CONNECTIVITY NODE --- */}
        <path
          d="M 50 14 L 50 8"
          stroke="#94A3B8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Antenna Orb */}
        <circle cx="50" cy="7" r="4.5" fill="url(#antennaGrad)" filter="url(#softGlow)" />
        <circle cx="48.5" cy="5.5" r="1.5" fill="#FFFFFF" opacity="0.9" />

        {/* --- 3D SIDE EAR PODS / AUDIO TRANSDUCERS --- */}
        {/* Left Ear */}
        <rect
          x="10"
          y="42"
          width="8"
          height="18"
          rx="4"
          fill="url(#earPodGrad)"
        />
        <circle cx="14" cy="51" r="2" fill="#5EEAD4" opacity="0.85" />

        {/* Right Ear */}
        <rect
          x="82"
          y="42"
          width="8"
          height="18"
          rx="4"
          fill="url(#earPodGrad)"
        />
        <circle cx="86" cy="51" r="2" fill="#5EEAD4" opacity="0.85" />

        {/* Headband / Bridge Arc */}
        <path
          d="M 17 44 C 17 22, 83 22, 83 44"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* --- MAIN 3D HEAD SPHERE --- */}
        <circle
          cx="50"
          cy="52"
          r="36"
          fill="url(#head3D)"
        />

        {/* Subtle Gloss Rim Shadow */}
        <circle
          cx="50"
          cy="52"
          r="36"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />

        {/* --- 3D GLOSSY VISOR / SCREEN --- */}
        <rect
          x="24"
          y="35"
          width="52"
          height="34"
          rx="17"
          fill="url(#visor3D)"
          stroke="#0F766E"
          strokeWidth="1.5"
        />

        {/* Visor Specular Curve */}
        <path
          d="M 28 44 C 36 38, 64 38, 72 44 C 64 41, 36 41, 28 44 Z"
          fill="url(#specularGlow)"
          opacity="0.6"
        />

        {/* --- 3D FRIENDLY CYAN LED EYES --- */}
        {/* Left Eye */}
        <g filter="url(#softGlow)">
          <path
            d="M 33 50 C 33 46, 42 46, 42 50 C 42 54, 33 54, 33 50 Z"
            fill="url(#eyeGlow)"
          />
          {/* Eye Sparkle */}
          <circle cx="35.5" cy="48.5" r="1.2" fill="#FFFFFF" />
        </g>

        {/* Right Eye */}
        <g filter="url(#softGlow)">
          <path
            d="M 58 50 C 58 46, 67 46, 67 50 C 67 54, 58 54, 58 50 Z"
            fill="url(#eyeGlow)"
          />
          {/* Eye Sparkle */}
          <circle cx="60.5" cy="48.5" r="1.2" fill="#FFFFFF" />
        </g>

        {/* --- FRIENDLY LED SMILE --- */}
        <path
          d="M 46 58 Q 50 62 54 58"
          fill="none"
          stroke="#2DD4BF"
          strokeWidth="2.2"
          strokeLinecap="round"
          filter="url(#softGlow)"
        />

        {/* --- MINI HEALTH SHIELD EMBLEM AT CHEST/BASE --- */}
        <g transform="translate(43, 76)">
          <path
            d="M 7 0 L 14 3 L 14 9 C 14 14, 7 17, 7 17 C 7 17, 0 14, 0 9 L 0 3 Z"
            fill="#0F766E"
            stroke="#2DD4BF"
            strokeWidth="1"
          />
          {/* White Plus / Medical Cross */}
          <path
            d="M 7 4 L 7 12 M 3 8 L 11 8"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Online / Active Indicator Dot */}
      {showOnlineStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3"
          title="Online & Ready"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981] ring-2 ring-white"></span>
        </span>
      )}
    </div>
  );
};
