import React, { useState } from 'react';
import { Send, MapPin, Fuel, Coffee, ThumbsUp, Radio } from 'lucide-react';

const QUICK_CHIPS = [
  { icon: MapPin, text: '📍 Arrived at start point' },
  { icon: Fuel, text: '⛽ Fueling up, 5 mins away' },
  { icon: Coffee, text: '☕ Reached breakfast stop' },
  { icon: ThumbsUp, text: '👍 Regrouped & clear' },
];

export default function RideChat({ chatMessages, onSendMessage, currentRiderId }) {
  const [text, setText] = useState('');

  const handleSend = (msgText) => {
    const finalMsg = msgText || text;
    if (!finalMsg.trim()) return;
    onSendMessage(finalMsg.trim());
    setText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '360px', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pb: '10px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
        <Radio size={18} color="var(--amber)" className="animate-pulse-glow" />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Ride Day Channel
        </span>
      </div>

      {/* Messages List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px', marginBottom: '12px' }}>
        {chatMessages?.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem', marginTop: 'auto', marginBottom: 'auto' }}>
            No updates yet. Use quick chips below for hands-free messaging on ride morning.
          </div>
        ) : (
          chatMessages.map((msg, idx) => {
            const isMe = msg.riderId === currentRiderId;
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  backgroundColor: isMe ? 'var(--surface-raised)' : 'var(--bg-color)',
                  border: `1px solid ${isMe ? 'var(--amber)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '2px', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 600, color: isMe ? 'var(--amber)' : 'var(--text-muted)' }}>
                    {isMe ? 'You' : msg.riderName || 'Rider'}
                  </span>
                  <span style={{ color: 'var(--text-faint)' }}>{msg.time || 'Just now'}</span>
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{msg.text}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Action Chips */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', pb: '8px', marginBottom: '10px' }}>
        {QUICK_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip.text)}
            style={{
              whiteSpace: 'nowrap',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--amber)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message group..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-color)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
          }}
        />
        <button
          onClick={() => handleSend()}
          style={{
            backgroundColor: 'var(--amber)',
            color: '#121417',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 14px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
