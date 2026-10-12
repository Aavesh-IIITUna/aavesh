import React, { useState, useEffect, useRef, useCallback } from 'react';
import './TriangleGallery.css';

/**
 * Procedural Web Audio Engine (Self-contained, zero asset files required)
 */
class ProceduralAudio {
  constructor() {
    this.ctx = null;
  }

  _getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playHover() {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(1700, now + 0.07);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }

  playSelect() {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.14);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  destroy() {
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }
}

/**
 * Individual Triangle Card Component (▲ Upward or ▼ Downward)
 */
function TriangleCard({
  item,
  index,
  orientation,
  isSpotlight,
  isActive,
  onHover,
  onClick
}) {
  const isUp = orientation === 'up';
  const points = isUp ? '50,0 100,100 0,100' : '0,0 100,0 50,100';

  const rankText = item.rank || String(index + 1).padStart(2, '0');
  const badgeLabel = item.badgeLabel || 'HERO NAME';
  const titleText = item.title || item.name || `AGENT ${rankText}`;
  const codeText = item.code || `UNIT // ${rankText}`;
  const subtagText = item.subtag || item.role || '';

  const cardClasses = [
    'tg-card',
    isUp ? 'tg-up' : 'tg-down',
    isSpotlight ? 'tg-spotlight' : '',
    isActive ? 'tg-active' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      data-id={item.id || index}
      onMouseEnter={() => onHover(item, index)}
      onClick={() => onClick(item, index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item, index);
        }
      }}
    >
      <div className="tg-card-inner">
        {/* Character Portrait Background */}
        <div className="tg-img-wrap">
          <img
            src={item.image}
            alt={titleText}
            className="tg-img"
            loading="lazy"
          />
          <div className="tg-pop-texture" />
          <div className="tg-vignette" />
        </div>

        {/* Upward Triangle Layout (▲): Narrow apex at top, wide base at bottom */}
        {isUp ? (
          <>
            <div className="tg-meta-top">
              <span className="tg-apex-tag">{codeText}</span>
            </div>
            <div className="tg-meta-bottom">
              <div className="tg-badge">
                <span className="tg-badge-label">{badgeLabel}</span>
                <span className="tg-badge-title">{titleText}</span>
              </div>
              <span className="tg-rank-sub">RANKING No.</span>
              <div className="tg-rank-num">{rankText}</div>
              {subtagText && <span className="tg-subtag">{subtagText.toUpperCase()}</span>}
            </div>
          </>
        ) : (
          /* Downward Triangle Layout (▼): Wide base at top, narrow apex at bottom */
          <>
            <div className="tg-meta-top">
              <div className="tg-badge">
                <span className="tg-badge-label">{badgeLabel}</span>
                <span className="tg-badge-title">{titleText}</span>
              </div>
              <span className="tg-rank-sub">RANKING No.</span>
              <div className="tg-rank-num">{rankText}</div>
            </div>
            <div className="tg-meta-bottom">
              {subtagText && <span className="tg-subtag">{subtagText.toUpperCase()}</span>}
              <span className="tg-apex-tag">{codeText}</span>
            </div>
          </>
        )}
      </div>

      {/* Razor-sharp SVG Vector Border */}
      <svg className="tg-border-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points={points} className="tg-border-path" />
      </svg>
    </div>
  );
}

/**
 * Built-in Detail Modal Component
 */
function DefaultDetailModal({ item, onClose, customRender }) {
  if (!item) return null;

  if (typeof customRender === 'function') {
    return customRender({ item, onClose });
  }

  const rankText = item.rank || '01';
  const titleText = item.title || item.name || 'OPERATIVE';
  const subTitle = item.descriptionHeader || item.code || 'CLASSIFIED SPECIALIST';
  const bioText = item.description || item.bio || 'High-priority operative registered in apex database.';

  return (
    <div className="tg-modal tg-open" role="dialog" aria-modal="true">
      <div className="tg-modal-backdrop" onClick={onClose} />
      <div className="tg-modal-panel">
        <button className="tg-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="tg-modal-content-grid">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '320px', background: '#000', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <img
                src={item.image}
                alt={titleText}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ fontFamily: 'var(--tg-font-num)', fontSize: '2.2rem', color: 'var(--tg-accent)', marginTop: '0.5rem' }}>
              RANK {rankText}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
              {item.tier && (
                <span style={{ background: 'var(--tg-accent)', color: '#000', fontFamily: 'var(--tg-font-mono)', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: '2px' }}>
                  {item.tier}
                </span>
              )}
              {item.role && (
                <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'var(--tg-font-mono)', fontSize: '0.65rem', padding: '2px 7px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                  {item.role.toUpperCase()}
                </span>
              )}
            </div>

            <h2 style={{ fontFamily: 'var(--tg-font-num)', fontSize: '3.2rem', lineHeight: 0.95, color: '#fff', margin: '0 0 0.3rem' }}>
              {titleText}
            </h2>
            <div style={{ fontFamily: 'var(--tg-font-mono)', fontSize: '0.8rem', color: 'var(--tg-accent)', letterSpacing: '0.15em', marginBottom: '1rem' }}>
              {subTitle}
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--tg-text-muted)' }}>
              {bioText}
            </p>

            {/* Optional Stats Meters */}
            {item.stats && typeof item.stats === 'object' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '1.2rem 0', background: 'rgba(0,0,0,0.3)', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                {Object.entries(item.stats).map(([k, v]) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 35px', alignItems: 'center', gap: '0.8rem', fontFamily: 'var(--tg-font-mono)', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--tg-text-muted)' }}>{k.toUpperCase()}</span>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${v}%`, background: 'var(--tg-accent)', borderRadius: '3px', boxShadow: '0 0 8px var(--tg-accent)' }} />
                    </div>
                    <span style={{ color: '#fff', textAlign: 'right', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Triangle Gallery React Component
 *
 * @param {Object} props
 * @param {Array} props.items - Array of card item objects
 * @param {'dual'|'ribbon'} [props.layout='dual'] - Gallery layout mode
 * @param {'crimson'|'cyan'|'amber'|'emerald'|'violet'} [props.theme='crimson'] - Color theme preset
 * @param {number} [props.itemsPerRow=5] - Number of items in first row when in dual layout
 * @param {boolean} [props.enableAudio=true] - Enable procedural Web Audio effects
 * @param {boolean} [props.spotlightFirst=true] - Hero 01 starts in active full-color spotlight
 * @param {boolean} [props.showModal=true] - Open detail modal on click
 * @param {Function} [props.onSelect] - (item, index) => void callback on card click
 * @param {Function} [props.onHover] - (item, index) => void callback on card hover
 * @param {Function} [props.renderModal] - Custom modal render prop ({ item, onClose }) => JSX
 * @param {string} [props.className] - Extra class name for container
 * @param {Object} [props.style] - Inline style for container
 */
export default function TriangleGallery({
  items = [],
  layout = 'dual',
  theme = 'crimson',
  itemsPerRow = 5,
  enableAudio = true,
  spotlightFirst = true,
  showModal = true,
  onSelect,
  onHover,
  renderModal,
  className = '',
  style = {}
}) {
  const [spotlightIndex, setSpotlightIndex] = useState(spotlightFirst ? 0 : null);
  const [selectedItem, setSelectedItem] = useState(null);
  const audioRef = useRef(null);

  // Initialize Audio
  useEffect(() => {
    if (enableAudio && typeof window !== 'undefined') {
      audioRef.current = new ProceduralAudio();
    }
    return () => {
      audioRef.current?.destroy();
    };
  }, [enableAudio]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Card Hover Handler
  const handleCardHover = useCallback((item, index) => {
    if (audioRef.current) {
      audioRef.current.playHover();
    }
    setSpotlightIndex(index);
    if (typeof onHover === 'function') {
      onHover(item, index);
    }
  }, [onHover]);

  // Card Click Handler
  const handleCardClick = useCallback((item, index) => {
    if (audioRef.current) {
      audioRef.current.playSelect();
    }
    if (showModal) {
      setSelectedItem(item);
    }
    if (typeof onSelect === 'function') {
      onSelect(item, index);
    }
  }, [showModal, onSelect]);

  // Mouse leave container: reset spotlight to item 0
  const handleMouseLeaveRows = useCallback(() => {
    if (spotlightFirst && items.length > 0) {
      setSpotlightIndex(0);
    } else {
      setSpotlightIndex(null);
    }
  }, [spotlightFirst, items.length]);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Layout calculations
  const isDual = layout === 'dual';
  const topItems = isDual ? items.slice(0, itemsPerRow) : items;
  const bottomItems = isDual ? items.slice(itemsPerRow) : [];

  return (
    <div
      className={`triangle-gallery layout-${layout} ${className}`}
      data-theme={theme}
      style={style}
    >
      <div className="tg-rows" onMouseLeave={handleMouseLeaveRows}>
        {/* Dual Mode: Top Row */}
        {isDual ? (
          <>
            <div className="tg-row tg-row-top">
              {topItems.map((item, idx) => {
                const orientation = idx % 2 === 0 ? 'up' : 'down';
                return (
                  <TriangleCard
                    key={item.id || idx}
                    item={item}
                    index={idx}
                    orientation={orientation}
                    isSpotlight={spotlightIndex === idx}
                    isActive={selectedItem?.id === item.id}
                    onHover={handleCardHover}
                    onClick={handleCardClick}
                  />
                );
              })}
            </div>

            {/* Dual Mode: Bottom Row (Interlocks with top row) */}
            {bottomItems.length > 0 && (
              <div className="tg-row tg-row-bottom">
                {bottomItems.map((item, idx) => {
                  const globalIdx = itemsPerRow + idx;
                  const orientation = idx % 2 === 0 ? 'down' : 'up';
                  return (
                    <TriangleCard
                      key={item.id || globalIdx}
                      item={item}
                      index={globalIdx}
                      orientation={orientation}
                      isSpotlight={spotlightIndex === globalIdx}
                      isActive={selectedItem?.id === item.id}
                      onHover={handleCardHover}
                      onClick={handleCardClick}
                    />
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Ribbon Mode: Single continuous row */
          <div className="tg-row tg-row-ribbon">
            {items.map((item, idx) => {
              const orientation = idx % 2 === 0 ? 'up' : 'down';
              return (
                <TriangleCard
                  key={item.id || idx}
                  item={item}
                  index={idx}
                  orientation={orientation}
                  isSpotlight={spotlightIndex === idx}
                  isActive={selectedItem?.id === item.id}
                  onHover={handleCardHover}
                  onClick={handleCardClick}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedItem && (
        <DefaultDetailModal
          item={selectedItem}
          onClose={handleCloseModal}
          customRender={renderModal}
        />
      )}
    </div>
  );
}
