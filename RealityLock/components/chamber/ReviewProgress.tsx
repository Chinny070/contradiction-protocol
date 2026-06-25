'use client';

import { useState, useEffect } from 'react';

interface Props {
  active: boolean;
  onComplete?: () => void;
}

const STAGES = [
  { key: 'submitted', label: 'Transaction Submitted', desc: 'Review request sent to GenLayer' },
  { key: 'reviewing', label: 'Analyzing Evidence', desc: 'Validators examining contradictions' },
  { key: 'consensus', label: 'Validator Consensus', desc: 'Reaching agreement on verdict' },
  { key: 'finalizing', label: 'Finalizing Verdict', desc: 'Writing canonical state on-chain' },
] as const;

function ReviewStages() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStage(1), 3000),
      setTimeout(() => setCurrentStage(2), 8000),
      setTimeout(() => setCurrentStage(3), 14000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="rounded-lg border p-6 relative overflow-hidden"
      style={{
        background: 'var(--rl-glass)',
        borderColor: 'var(--rl-violet)',
      }}
    >
      <div
        className="absolute top-0 left-0 h-[2px] transition-all duration-1000"
        style={{
          width: `${((currentStage + 1) / STAGES.length) * 100}%`,
          background: 'linear-gradient(90deg, var(--rl-violet), var(--rl-cyan))',
        }}
      />

      <div className="flex items-center gap-2 mb-6">
        <div
          className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--rl-violet)', borderTopColor: 'transparent' }}
        />
        <h3
          className="text-sm font-medium"
          style={{ color: 'var(--rl-violet)', fontFamily: 'var(--font-ui)' }}
        >
          GenLayer Review in Progress
        </h3>
      </div>

      <div className="space-y-0">
        {STAGES.map((stage, i) => {
          const isComplete = i < currentStage;
          const isCurrent = i === currentStage;
          const isPending = i > currentStage;

          return (
            <div key={stage.key} className="flex gap-3">
              {/* Indicator column */}
              <div className="flex flex-col items-center w-6">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 transition-all duration-500 flex items-center justify-center"
                  style={{
                    background: isComplete
                      ? 'var(--rl-green)'
                      : isCurrent
                      ? 'var(--rl-violet)'
                      : 'transparent',
                    border: `2px solid ${
                      isComplete
                        ? 'var(--rl-green)'
                        : isCurrent
                        ? 'var(--rl-violet)'
                        : 'var(--rl-border)'
                    }`,
                    boxShadow: isCurrent ? '0 0 10px rgba(155,92,255,0.4)' : 'none',
                  }}
                >
                  {isComplete && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#080A0D" strokeWidth="4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {i < STAGES.length - 1 && (
                  <div
                    className="w-[1px] h-8 transition-all duration-500"
                    style={{
                      background: isComplete ? 'var(--rl-green)' : 'var(--rl-border)',
                    }}
                  />
                )}
              </div>

              {/* Text */}
              <div className="pb-5">
                <p
                  className="text-sm transition-all duration-300"
                  style={{
                    color: isPending ? 'var(--rl-muted)' : '#fff',
                    fontFamily: 'var(--font-ui)',
                    opacity: isPending ? 0.4 : 1,
                  }}
                >
                  {stage.label}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{
                    color: 'var(--rl-muted)',
                    fontFamily: 'var(--font-ui)',
                    opacity: isPending ? 0.3 : 0.6,
                  }}
                >
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p
        className="text-xs mt-2"
        style={{ color: 'var(--rl-muted)', fontFamily: 'var(--font-ui)', opacity: 0.5 }}
      >
        This process uses real GenLayer validators. Time depends on network consensus.
      </p>
    </div>
  );
}

export default function ReviewProgress({ active }: Props) {
  if (!active) return null;
  return <ReviewStages key={String(active)} />;
}
