import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';

const BUNTING_CODES = [
  'BR','AR','FR','DE','PT','ES','GB_ENG','IT','JP','US','MX','NL',
  'HR','MA','SN','GH','NG','EG','AU','KR','IR','SA','QA','PL',
  'RS','DK','CH','BE','GB_SCT','UY','CO','EC','PE','CA','CR','PA',
  'TR','RO','SK','SI','AT','CN','CL','UZ','NZ','VN','GB_WLS','ZM',
];

export function FlagBunting() {
  const FlagMap = Flags as Record<string, React.ComponentType<{ className?: string }>>;
  const all = [...BUNTING_CODES, ...BUNTING_CODES];

  return (
    <div
      className="relative overflow-hidden w-full select-none"
      style={{
        height: '52px',
        maskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, black 4%, black 96%, transparent)',
      }}
      aria-hidden="true"
    >
      {/* Rope */}
      <div
        className="absolute left-0 right-0"
        style={{ top: '7px', height: '1.5px', background: 'rgba(255,255,255,0.35)', boxShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
      />
      {/* Scrolling flags */}
      <div className="auth-flags-track absolute top-0 left-0 flex items-start">
        {all.map((code, i) => {
          const FlagComp = FlagMap[code];
          const tilt = (i % 3 === 0) ? -5 : (i % 3 === 1) ? 3 : -2;
          return (
            <div
              key={i}
              className="flex flex-col items-center flex-shrink-0 mx-[5px]"
              style={{ transformOrigin: 'top center', transform: `rotate(${tilt}deg)` }}
            >
              <div style={{ width: '1px', height: '8px', background: 'rgba(255,255,255,0.45)' }} />
              {FlagComp
                ? <div className="rounded-[2px] overflow-hidden" style={{ width: 36, height: 24, boxShadow: '0 2px 6px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.15)', flexShrink: 0 }}>
                    <FlagComp className="w-full h-full" />
                  </div>
                : null
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
