import React, { useRef, useState, useEffect } from 'react';

export default function LiquidSegmentedControl({ options, value, onChange }) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const activeIndex = options.findIndex((opt) => opt.value === value);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const buttons = container.querySelectorAll('.liquid-tab-button');
    if (buttons[activeIndex]) {
      const activeBtn = buttons[activeIndex];
      const left = activeBtn.offsetLeft;
      const width = activeBtn.offsetWidth;

      setIsAnimating(true);
      setIndicatorStyle({ left, width });

      const timer = setTimeout(() => setIsAnimating(false), 380);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, value]);

  return (
    <div
      ref={containerRef}
      className="glass-panel"
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-full)',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      {/* Sliding Liquid Background Pill */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          bottom: '4px',
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          background: 'var(--amber-gradient)',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 4px 20px var(--amber-glow), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          transition: 'left 0.38s cubic-bezier(0.34, 1.4, 0.64, 1), width 0.38s cubic-bezier(0.34, 1.4, 0.64, 1), transform 0.2s ease',
          transform: isAnimating ? 'scaleX(1.06) scaleY(0.96)' : 'scaleX(1) scaleY(1)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Tab Buttons */}
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="liquid-tab-button ios-pressable"
            style={{
              flex: 1,
              position: 'relative',
              zIndex: 2,
              backgroundColor: 'transparent',
              border: 'none',
              color: isActive ? '#07090C' : 'var(--text-muted)',
              borderRadius: 'var(--radius-full)',
              padding: '9px 12px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: isActive ? 800 : 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'color 0.25s ease',
            }}
          >
            {opt.icon && <opt.icon size={15} color={isActive ? '#07090C' : 'var(--text-muted)'} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
