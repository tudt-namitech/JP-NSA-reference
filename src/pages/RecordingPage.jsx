import { useState, useMemo, useCallback } from 'react';
import {
  Table, Tag, Badge, Button, Input, Select, DatePicker,
  Modal, Space, Tabs, Tooltip,
} from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CloseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';
import { RECS, PRIORITY_CFG, INITIAL_PRIORITY_RULES } from '../data/constants.js';

const { RangePicker } = DatePicker;

/* ─── colour tokens ─────────────────────────────────────────── */
const C = {
  bg:         '#f0f4f8',
  surface:    '#ffffff',
  border:     '#e2e8f0',
  text:       '#1e293b',
  textMuted:  '#64748b',
  textLight:  '#94a3b8',
  primary:    '#2563eb',
  alertYellowBg: '#fffbeb',
  alertYellowBorder: '#fcd34d',
  alertYellowText: '#92400e',
};

/* ─── keyword colour palette ─────────────────────────────────── */
const KW_COLORS = [
  { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  { bg: '#cffafe', color: '#164e63', border: '#67e8f9' },
];

function kwColor(kw) {
  let hash = 0;
  for (let i = 0; i < kw.length; i++) hash = kw.charCodeAt(i) + ((hash << 5) - hash);
  return KW_COLORS[Math.abs(hash) % KW_COLORS.length];
}

/* ─── priority calculation ───────────────────────────────────── */
function calcPriority(rec, rules = INITIAL_PRIORITY_RULES) {
  const criticalRule = rules.find((r) => r.priority === 'critical');
  const warningRule  = rules.find((r) => r.priority === 'warning');
  if (criticalRule && rec.kws.some((kw) => criticalRule.keywords.includes(kw))) return 'critical';
  if (warningRule  && rec.kws.some((kw) => warningRule.keywords.includes(kw)))  return 'warning';
  return 'normal';
}

/* ─── priority icon helper ───────────────────────────────────── */
function PriorityIcon({ level }) {
  if (level === 'critical') return <ExclamationCircleOutlined style={{ color: PRIORITY_CFG.critical.color, fontSize: 13 }} />;
  if (level === 'warning')  return <WarningOutlined           style={{ color: PRIORITY_CFG.warning.color,  fontSize: 13 }} />;
  return <CheckCircleOutlined style={{ color: PRIORITY_CFG.normal.dot, fontSize: 13 }} />;
}

/* ─── tiny fake waveform bar row ─────────────────────────────── */
const WAVE_HEIGHTS = [0.3, 0.7, 0.5, 1.0, 0.6, 0.4, 0.9, 0.5, 0.8, 0.3, 0.7, 0.6,
                      0.4, 1.0, 0.5, 0.3, 0.8, 0.6, 0.7, 0.4, 0.9, 0.5, 0.3, 0.6,
                      0.7, 0.4, 0.8, 0.5, 1.0, 0.3, 0.7, 0.6, 0.4, 0.9, 0.5, 0.3];

function MiniWaveform({ progress = 0, color = '#2563eb', height = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height }}>
      {WAVE_HEIGHTS.map((h, i) => {
        const barProgress = (i + 1) / WAVE_HEIGHTS.length;
        const played = barProgress <= progress;
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: Math.max(3, h * height),
              borderRadius: 2,
              background: played ? color : '#e2e8f0',
              flexShrink: 0,
              transition: 'background 0.1s',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── keyword chip ───────────────────────────────────────────── */
function KwChip({ kw, size = 'normal' }) {
  const { bg, color, border } = kwColor(kw);
  return (
    <span
      style={{
        display: 'inline-block',
        padding: size === 'small' ? '1px 6px' : '2px 8px',
        borderRadius: 20,
        background: bg,
        color,
        border: `1px solid ${border}`,
        fontSize: size === 'small' ? 10 : 11,
        fontWeight: 600,
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
    >
      {kw}
    </span>
  );
}

/* ─── priority badge cell ────────────────────────────────────── */
function PriorityCell({ level }) {
  const cfg = PRIORITY_CFG[level];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: cfg.color,
          letterSpacing: '0.02em',
        }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

/* ─── expandable row content ─────────────────────────────────── */
function ExpandedRow({ rec, lang, t, transcriptSearch, keywordFilter }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function togglePlay() {
    if (!playing) {
      setPlaying(true);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 1) { clearInterval(interval); setPlaying(false); return 0; }
          return p + 0.02;
        });
      }, 150);
    } else {
      setPlaying(false);
    }
  }

  const criticalKws = (INITIAL_PRIORITY_RULES.find((r) => r.priority === 'critical')?.keywords) ?? [];
  const warningKws  = (INITIAL_PRIORITY_RULES.find((r) => r.priority === 'warning')?.keywords)  ?? [];

  function highlightText(text) {
    const allKws = [...criticalKws, ...warningKws];
    let result = text;
    allKws.forEach((kw) => {
      if (result.includes(kw)) {
        const { bg, color, border } = kwColor(kw);
        result = result.split(kw).join(
          `<mark style="background:${bg};color:${color};border:1px solid ${border};border-radius:3px;padding:0 3px;font-weight:600;">${kw}</mark>`
        );
      }
    });
    // highlight transcript search term
    if (transcriptSearch) {
      const q = transcriptSearch;
      const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, '<mark style="background:#fef08a;color:#713f12;border-radius:3px;padding:0 2px;">$1</mark>');
    }
    // highlight selected keywords
    if (keywordFilter && keywordFilter.length > 0 && !keywordFilter.includes('__all__')) {
      keywordFilter.forEach((kw) => {
        if (!allKws.includes(kw) && result.includes(kw)) {
          result = result.split(kw).join(
            `<mark style="background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;border-radius:3px;padding:0 3px;font-weight:600;">${kw}</mark>`
          );
        }
      });
    }
    return result;
  }

  const spLabel = { s: t('sp_s'), c: t('sp_c') };

  return (
    <div
      style={{
        background: '#f8fafc',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '16px 20px',
        margin: '4px 0',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      {/* ── mini audio player ── */}
      <div style={{ flex: '0 0 300px', minWidth: 280 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Audio Preview
        </div>
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '12px 14px',
          }}
        >
          {/* waveform */}
          <div style={{ marginBottom: 10 }}>
            <MiniWaveform progress={progress} color={C.primary} height={36} />
          </div>
          {/* progress bar */}
          <div
            style={{
              height: 3,
              background: '#e2e8f0',
              borderRadius: 2,
              marginBottom: 10,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: C.primary,
                borderRadius: 2,
                transition: 'width 0.15s',
              }}
            />
          </div>
          {/* controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={togglePlay}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 'none',
                background: C.primary,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {playing ? (
                <PauseCircleOutlined style={{ fontSize: 16 }} />
              ) : (
                <PlayCircleOutlined style={{ fontSize: 16 }} />
              )}
            </button>
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: 'monospace' }}>
              {Math.floor(progress * rec.totalSec / 60).toString().padStart(2, '0')}:
              {Math.floor(progress * rec.totalSec % 60).toString().padStart(2, '0')}
              {' / '}
              {rec.dur}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: C.textLight }}>
              <ClockCircleOutlined style={{ marginRight: 3 }} />
              {rec.mic}
            </span>
          </div>
        </div>
      </div>

      {/* ── transcript ── */}
      <div style={{ flex: 1, minWidth: 280 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.textMuted,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Transcript
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rec.ts.map((line, idx) => {
            const isStaff = line.sp === 's';
            const text = line.text[lang] || line.text.en;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: isStaff ? '#dbeafe' : '#f0fdf4',
                    color: isStaff ? '#1e40af' : '#166534',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {spLabel[line.sp] ?? line.sp.toUpperCase()}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 9, color: C.textLight, fontFamily: 'monospace', marginRight: 6 }}>
                    {line.t2}
                  </span>
                  <span
                    style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}
                    dangerouslySetInnerHTML={{ __html: highlightText(text) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Player Overlay (Modal) ─────────────────────────────────── */
function PlayerModal({ rec, lang, t, open, onClose }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('keywords');
  const [activeChannel, setActiveChannel] = useState('ch1');
  const [offsetInput, setOffsetInput] = useState('0');
  const [adjustedOffset, setAdjustedOffset] = useState(0);

  const channels = rec ? ['ch1', 'ch2', 'ch3'] : [];

  const priority = rec ? calcPriority(rec) : 'normal';

  function togglePlay() {
    if (!playing) {
      setPlaying(true);
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 1) { clearInterval(interval); setPlaying(false); return 0; }
          return p + 0.01;
        });
      }, 100);
    } else {
      setPlaying(false);
    }
  }

  if (!rec) return null;

  const noteText = rec.note[lang] || rec.note.en;
  const spLabel  = { s: t('sp_s'), c: t('sp_c') };

  /* mock multiple notes for the All Notes view */
  const allNotes = [
    ...(noteText ? [{ creator: 'admin@namitech.io', createdAt: rec.datetime.replace(/\//g, '-'), body: noteText }] : []),
    { creator: 'admin@namitech.io', createdAt: '2026-03-06 17:50:07', body: 'Confirmed with supervisor — no further action needed.' },
    { creator: 'admin@namitech.io', createdAt: '2026-03-06 17:48:34', body: 'Initial review completed. Session flagged for QA follow-up on ASR accuracy.' },
  ];

  const tabItems = [
    {
      key: 'keywords',
      label: (
        <span style={{ fontSize: 12 }}>
          <TagsOutlined style={{ marginRight: 4 }} />
          {t('th_kw_m')}
        </span>
      ),
      children: (
        <div style={{ padding: '12px 0' }}>
          {rec.kws.length === 0 ? (
            <span style={{ color: C.textMuted, fontSize: 12 }}>—</span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {rec.kws.map((kw) => <KwChip key={kw} kw={kw} />)}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</div>
            <PriorityCell level={priority} />
          </div>
          {/* notes preview removed — see All Notes tab */}
        </div>
      ),
    },
    {
      key: 'transcript',
      label: (
        <span style={{ fontSize: 12 }}>
          <FileTextOutlined style={{ marginRight: 4 }} />
          Transcript
        </span>
      ),
      children: (
        <div style={{ padding: '12px 0', maxHeight: 320, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rec.ts.map((line, idx) => {
              const isStaff = line.sp === 's';
              const text = line.text[lang] || line.text.en;
              return (
                <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: isStaff ? '#dbeafe' : '#f0fdf4',
                      color: isStaff ? '#1e40af' : '#166534',
                      fontSize: 9,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 1,
                    }}
                  >
                    {spLabel[line.sp] ?? line.sp.toUpperCase()}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 9, color: C.textLight, fontFamily: 'monospace', marginRight: 6 }}>{line.t2}</span>
                    <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      key: 'notes',
      label: (
        <span style={{ fontSize: 12 }}>
          <FileTextOutlined style={{ marginRight: 4 }} />
          All Notes ({allNotes.length})
        </span>
      ),
      children: (
        <div style={{ padding: '12px 0', maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {allNotes.length === 0 ? (
            <span style={{ color: C.textMuted, fontSize: 12 }}>No notes.</span>
          ) : (
            allNotes.map((note, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                }}
              >
                {/* header */}
                <div
                  style={{
                    display: 'flex',
                    gap: 20,
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderBottom: `1px solid ${C.border}`,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: 12, color: C.textMuted }}>
                    Creator: <strong style={{ color: C.text }}>{note.creator}</strong>
                  </span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>
                    Created At: <strong style={{ color: C.text }}>{note.createdAt}</strong>
                  </span>
                </div>
                {/* body */}
                <div
                  style={{
                    padding: '12px 14px',
                    fontSize: 13,
                    color: C.text,
                    lineHeight: 1.7,
                    borderLeft: `3px solid ${C.border}`,
                    margin: '0 0 0 0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {note.body}
                </div>
              </div>
            ))
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      styles={{ body: { padding: 0, maxHeight: '90vh', overflow: 'hidden' }, content: { padding: 0, borderRadius: 12, overflow: 'hidden' } }}
      closeIcon={null}
      destroyOnClose
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
        }}
      >
        <button
          onClick={onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: `1px solid ${C.border}`,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.textMuted,
          }}
        >
          <ArrowLeftOutlined style={{ fontSize: 13 }} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{rec.staff}</span>
            <span style={{ fontSize: 11, color: C.textMuted }}>{rec.datetime}</span>
            <PriorityCell level={priority} />
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
            {rec.store} · {rec.mic}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: '#f1f5f9',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.textMuted,
          }}
        >
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', height: 'calc(90vh - 64px)', overflow: 'hidden' }}>
        {/* ── Left: video + audio (65%) ── */}
        <div
          style={{
            flex: '0 0 65%',
            borderRight: `1px solid ${C.border}`,
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflowY: 'auto',
          }}
        >
          {/* Channel + offset control bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: '#fff',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
            }}
          >
            {/* Channel tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {channels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 6,
                    border: `1px solid ${C.primary}`,
                    background: activeChannel === ch ? C.primary : '#fff',
                    color: activeChannel === ch ? '#fff' : C.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            {/* Offset control */}
            <Tooltip title="Adjust time offset between audio and video (seconds)">
              <span style={{ color: C.textMuted, cursor: 'default', fontSize: 14, lineHeight: 1 }}>ⓘ</span>
            </Tooltip>
            <input
              type="number"
              value={offsetInput}
              onChange={(e) => setOffsetInput(e.target.value)}
              style={{
                width: 60,
                padding: '4px 8px',
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Adjusted offset: {adjustedOffset}
            </span>
            <button
              onClick={() => setAdjustedOffset(parseInt(offsetInput, 10) || 0)}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                border: 'none',
                background: C.primary,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                whiteSpace: 'nowrap',
              }}
            >
              Confirm →
            </button>
          </div>

          {/* Video placeholder */}
          <div
            style={{
              background: '#0d1b2e',
              borderRadius: 10,
              aspectRatio: '16/9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* fake scan lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${(i + 1) * 12}%`,
                  height: 1,
                  background: 'rgba(255,255,255,0.03)',
                }}
              />
            ))}
            <CameraOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.15)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
              CCTV Stream
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>
              {rec.store} · {rec.datetime}
            </span>
            {/* recording indicator */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(220,38,38,0.85)',
                borderRadius: 4,
                padding: '2px 7px',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'inline-block',
                  animation: 'pulse 1.5s infinite',
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>REC</span>
            </div>
            {/* store badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 10,
                left: 12,
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 4,
                padding: '2px 7px',
              }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{rec.mic}</span>
            </div>
          </div>

          {/* Audio player */}
          <div
            style={{
              background: '#f8fafc',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>
              Audio Recording
            </div>

            {/* waveform */}
            <div style={{ marginBottom: 10 }}>
              <MiniWaveform progress={progress} color={C.primary} height={44} />
            </div>

            {/* progress track */}
            <div
              style={{
                height: 4,
                background: '#e2e8f0',
                borderRadius: 2,
                marginBottom: 10,
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress((e.clientX - rect.left) / rect.width);
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${C.primary}, #60a5fa)`,
                  borderRadius: 2,
                  transition: 'width 0.1s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${progress * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: C.primary,
                  boxShadow: `0 0 0 2px #fff`,
                }}
              />
            </div>

            {/* controls row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={togglePlay}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.primary}, #3b82f6)`,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
                  flexShrink: 0,
                }}
              >
                {playing ? <PauseCircleOutlined style={{ fontSize: 18 }} /> : <PlayCircleOutlined style={{ fontSize: 18 }} />}
              </button>
              <span style={{ fontSize: 12, color: C.textMuted, fontFamily: 'monospace' }}>
                {Math.floor(progress * rec.totalSec / 60).toString().padStart(2, '0')}:
                {Math.floor(progress * rec.totalSec % 60).toString().padStart(2, '0')}
                {' / '}
                {rec.dur}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: C.textLight, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ClockCircleOutlined />
                {rec.dur}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: info + transcript panel (35%) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>

          {/* Compact recording details — always visible */}
          <div
            style={{
              background: '#f8fafc',
              borderBottom: `1px solid ${C.border}`,
              padding: '10px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px 16px',
              flexShrink: 0,
            }}
          >
            {[
              { label: t('th_counter'),   value: rec.staff },
              { label: t('th_store_mic'), value: `${rec.store} / ${rec.mic}` },
              { label: t('th_start'),     value: rec.datetime },
              { label: t('th_dur'),       value: rec.dur },
            ].map(({ label, value }) => (
              <span key={label} style={{ fontSize: 11, color: C.textMuted, whiteSpace: 'nowrap' }}>
                {label}: <strong style={{ color: C.text, fontWeight: 600 }}>{value}</strong>
              </span>
            ))}
          </div>

          {/* Transcript — always visible, scrollable, takes most space */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              Transcript
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rec.ts.map((line, idx) => {
                const isStaff = line.sp === 's';
                const text = line.text[lang] || line.text.en;
                return (
                  <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span
                      style={{
                        flexShrink: 0,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: isStaff ? '#dbeafe' : '#f0fdf4',
                        color: isStaff ? '#1e40af' : '#166534',
                        fontSize: 8,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 1,
                      }}
                    >
                      {spLabel[line.sp] ?? line.sp.toUpperCase()}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 9, color: C.textLight, fontFamily: 'monospace', marginRight: 6 }}>{line.t2}</span>
                      <span style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom tabs: Keywords / Notes — compact */}
          <div style={{ borderTop: `1px solid ${C.border}`, flexShrink: 0, padding: '0 16px' }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems.filter((t) => t.key !== 'transcript')}
              size="small"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Priority Settings Modal ────────────────────────────────── */
function PrioritySettingsModal({ open, onClose }) {
  const [rules, setRules] = useState(() =>
    INITIAL_PRIORITY_RULES.map((r) => ({ ...r, keywords: [...r.keywords] }))
  );
  const [newKw, setNewKw] = useState({});

  function removeKeyword(priority, kw) {
    setRules((prev) =>
      prev.map((r) =>
        r.priority === priority ? { ...r, keywords: r.keywords.filter((k) => k !== kw) } : r
      )
    );
  }

  function addKeyword(priority) {
    const kw = (newKw[priority] ?? '').trim();
    if (!kw) return;
    setRules((prev) =>
      prev.map((r) =>
        r.priority === priority && !r.keywords.includes(kw)
          ? { ...r, keywords: [...r.keywords, kw] }
          : r
      )
    );
    setNewKw((prev) => ({ ...prev, [priority]: '' }));
  }

  const priorityRulesContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* info box */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          color: '#1e40af',
          lineHeight: 1.6,
        }}
      >
        <b>Priority</b> is calculated from session keywords — first matching rule applies. If no rule matches, the session is marked as <b>Normal</b>.
      </div>

      {rules.map((rule) => {
        const cfg = PRIORITY_CFG[rule.priority];
        return (
          <div
            key={rule.priority}
            style={{
              border: `1px solid ${cfg.dot}40`,
              borderLeft: `3px solid ${cfg.dot}`,
              borderRadius: 8,
              padding: '12px 14px',
            }}
          >
            {/* header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: cfg.bg,
                  border: `1px solid ${cfg.dot}50`,
                  borderRadius: 20,
                  padding: '3px 10px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: cfg.color,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                {cfg.label}
              </span>
              <span style={{ fontSize: 12, color: C.textMuted }}>if session has</span>
              <span
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  padding: '2px 10px',
                  fontSize: 11,
                  color: C.textMuted,
                }}
              >
                any topic/keyword
              </span>
            </div>

            {/* keywords label */}
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Keywords
            </div>

            {/* keyword chips + add input */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {rule.keywords.map((kw) => (
                <span
                  key={kw}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    background: '#fff',
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 12,
                    color: C.text,
                  }}
                >
                  {kw}
                  <CloseOutlined
                    style={{ fontSize: 9, color: C.textMuted, cursor: 'pointer' }}
                    onClick={() => removeKeyword(rule.priority, kw)}
                  />
                </span>
              ))}
              <Input
                size="small"
                placeholder="Add keyword..."
                value={newKw[rule.priority] ?? ''}
                onChange={(e) => setNewKw((prev) => ({ ...prev, [rule.priority]: e.target.value }))}
                onPressEnter={() => addKeyword(rule.priority)}
                style={{
                  width: 130,
                  border: '1px dashed #d1d5db',
                  borderRadius: 6,
                  fontSize: 12,
                  background: '#fafafa',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: 14, fontWeight: 700 }}>
          <SettingOutlined style={{ marginRight: 8, color: C.primary }} />
          Settings
        </span>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Close</Button>
          <Button type="primary" onClick={onClose}>Save Changes</Button>
        </div>
      }
      width={560}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="rules"
        items={[
          { key: 'rules', label: 'Priority Rules', children: priorityRulesContent },
          { key: 'topics', label: 'Topics', children: <div style={{ color: C.textMuted, fontSize: 13, padding: '16px 0' }}>Topics configuration coming soon.</div> },
        ]}
      />
    </Modal>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function RecordingPage() {
  const { t, lang } = useApp();

  /* state */
  const [alertVisible, setAlertVisible]     = useState(true);
  const [priorityFilter, setPriorityFilter] = useState([]); // [] = All, else array of active keys
  const [storeFilter, setStoreFilter]       = useState([]);
  const [keywordFilter, setKeywordFilter]   = useState([]);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [expandedId, setExpandedId]         = useState(null);
  const [selectedId, setSelectedId]         = useState(null);
  const [playerOpen, setPlayerOpen]         = useState(false);
  const [settingsOpen, setSettingsOpen]     = useState(false);

  /* enrich records with computed priority */
  const enrichedRecs = useMemo(() =>
    RECS.map((r) => ({ ...r, priority: calcPriority(r) })),
    []
  );

  /* keyword options from all records */
  const keywordOptions = useMemo(() => {
    const kws = [...new Set(enrichedRecs.flatMap((r) => r.kws ?? []))].sort();
    return [
      { value: '__all__', label: 'All' },
      ...kws.map((k) => ({ value: k, label: k })),
    ];
  }, [enrichedRecs]);

  /* unique store list */
  const storeOptions = useMemo(() => {
    const stores = [...new Set(enrichedRecs.map((r) => r.store))];
    return [
      { value: '__all__', label: 'All' },
      ...stores.map((s) => ({ value: s, label: s })),
    ];
  }, [enrichedRecs]);

  /* step 1: right-side filters (store / keyword / transcript) */
  const rightFiltered = useMemo(() => {
    return enrichedRecs.filter((r) => {
      if (storeFilter.length > 0 && !storeFilter.includes('__all__') && !storeFilter.includes(r.store)) return false;
      if (keywordFilter.length > 0 && !keywordFilter.includes('__all__')) {
        if (!(r.kws ?? []).some((k) => keywordFilter.includes(k))) return false;
      } else if (transcriptSearch) {
        const q = transcriptSearch.toLowerCase();
        const inTranscript = (r.ts ?? []).some((seg) =>
          Object.values(seg.text ?? {}).some((t) => t.toLowerCase().includes(q))
        );
        if (!inTranscript) return false;
      }
      return true;
    });
  }, [enrichedRecs, storeFilter, keywordFilter, transcriptSearch]);

  /* priority counts reflect right-side filtered base */
  const priorityCounts = useMemo(() => {
    const counts = { critical: 0, warning: 0, normal: 0 };
    rightFiltered.forEach((r) => counts[r.priority]++);
    return counts;
  }, [rightFiltered]);

  /* step 2: priority filter on top of right-side results */
  const filtered = useMemo(() => {
    if (priorityFilter.length === 0) return rightFiltered;
    return rightFiltered.filter((r) => priorityFilter.includes(r.priority));
  }, [rightFiltered, priorityFilter]);

  /* player open handler */
  const openPlayer = useCallback((rec) => {
    setSelectedId(rec.id);
    setPlayerOpen(true);
  }, []);

  const selectedRec = useMemo(
    () => enrichedRecs.find((r) => r.id === selectedId) ?? null,
    [enrichedRecs, selectedId]
  );

  /* ── table columns ── */
  const columns = useMemo(() => [
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority</span>,
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (level) => <PriorityCell level={level} />,
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('th_counter')}</span>,
      key: 'counter',
      width: 140,
      render: (_, rec) => (
        <div style={{ fontSize: 13, color: C.text }}>{rec.staff}</div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('th_topic')}</span>,
      key: 'topic',
      width: 60,
      render: () => <span style={{ color: C.textLight, fontSize: 12 }}>—</span>,
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('th_start')}</span>,
      key: 'start',
      width: 160,
      render: (_, rec) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip title="Open video player">
            <button
              onClick={(e) => { e.stopPropagation(); openPlayer(rec); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: '#f0f9ff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#0ea5e9',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f9ff'; }}
            >
              <VideoCameraOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.text, lineHeight: 1.3 }}>
              {rec.datetime.split(' ')[1]}
            </div>
            <div style={{ fontSize: 10, color: C.textMuted }}>
              {rec.datetime.split(' ')[0]}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('th_store_mic')}</span>,
      key: 'store',
      width: 170,
      render: (_, rec) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: C.text, lineHeight: 1.4 }}>{rec.store}</div>
          <div style={{ fontSize: 10, color: C.textLight, fontFamily: 'monospace' }}>{rec.mic}</div>
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('th_dur')}</span>,
      dataIndex: 'dur',
      key: 'dur',
      width: 80,
      render: (dur) => (
        <span style={{ fontSize: 12, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
          <ClockCircleOutlined style={{ fontSize: 11 }} />
          {dur}
        </span>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('th_kw_m')}</span>,
      key: 'kws',
      width: 160,
      render: (_, rec) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {rec.kws.length === 0 ? (
            <span style={{ color: C.textLight, fontSize: 12 }}>—</span>
          ) : (
            rec.kws.map((kw) => <KwChip key={kw} kw={kw} size="small" />)
          )}
        </div>
      ),
    },
    {
      title: <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('th_notes')}</span>,
      key: 'note',
      render: (_, rec) => {
        const text = rec.note[lang] || rec.note.en;
        if (!text) return <span style={{ color: C.textLight, fontSize: 12 }}>—</span>;
        const SHORT_LEN = 60;
        const isLong = text.length > SHORT_LEN;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 11, color: C.textLight }}>
              {rec.datetime} — admin@namitech.io
            </span>
            <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>
              {isLong ? text.slice(0, SHORT_LEN) + '…' : text}
            </span>
            {isLong && (
              <span
                style={{ fontSize: 12, color: C.primary, cursor: 'pointer', fontWeight: 500 }}
                onClick={(e) => { e.stopPropagation(); openPlayer(rec); }}
              >
                Show More
              </span>
            )}
          </div>
        );
      },
    },
  ], [t, lang, openPlayer]);

  /* ── row expansion ── */
  const expandable = {
    expandedRowKeys: expandedId ? [expandedId] : [],
    onExpand: (_, record) => setExpandedId((prev) => (prev === record.id ? null : record.id)),
    expandedRowRender: (rec) => <ExpandedRow rec={rec} lang={lang} t={t} transcriptSearch={transcriptSearch} keywordFilter={keywordFilter} />,
    expandRowByClick: false,
    showExpandColumn: false,
  };

  /* ── filter pill config ── */
  const filterPills = [
    { key: 'critical', label: PRIORITY_CFG.critical.label, color: PRIORITY_CFG.critical.color, bg: PRIORITY_CFG.critical.bg },
    { key: 'warning',  label: PRIORITY_CFG.warning.label,  color: PRIORITY_CFG.warning.color,  bg: PRIORITY_CFG.warning.bg  },
    { key: 'normal',   label: PRIORITY_CFG.normal.label,   color: PRIORITY_CFG.normal.color,   bg: PRIORITY_CFG.normal.bg   },
  ];

  /* ── render ── */
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ══ 1. ALERT STRIP ══════════════════════════════════════ */}
      {alertVisible && (
        <div
          style={{
            background: C.alertYellowBg,
            borderBottom: `1px solid ${C.alertYellowBorder}`,
            padding: '9px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <WarningOutlined style={{ color: '#d97706', fontSize: 14, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 12, color: C.alertYellowText, lineHeight: 1.5 }}>
            {t('as_msg')}
          </span>
          <button
            onClick={() => setAlertVisible(false)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '2px 8px',
              borderRadius: 5,
              fontSize: 11,
              color: '#92400e',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {t('as_act')}
          </button>
          <button
            onClick={() => setAlertVisible(false)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 4,
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <CloseOutlined style={{ fontSize: 11 }} />
          </button>
        </div>
      )}

      {/* ══ 2. STATS BAR ════════════════════════════════════════ */}
      <div
        style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        {[
          { label: t('sc1'), value: '64', sub: t('sc1s'), color: '#2563eb' },
          { label: t('sc3'), value: '78%', sub: t('sc3s'), color: '#059669' },
          { label: t('sc4'), value: '5',   sub: t('sc4s'), color: '#d97706' },
        ].map((stat, idx, arr) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRight: idx < arr.length - 1 ? `1px solid ${C.border}` : 'none',
            }}
          >
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, marginBottom: 4 }}>
              {stat.label}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ══ 3. FILTER AREA ══════════════════════════════════════ */}
      <div
        style={{
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {/* Priority filter pills */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {/* "All" pill */}
          <button
            onClick={() => setPriorityFilter([])}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              border: `1px solid ${priorityFilter.length === 0 ? C.primary : C.border}`,
              background: priorityFilter.length === 0 ? '#eff6ff' : 'transparent',
              color: priorityFilter.length === 0 ? C.primary : C.textMuted,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              lineHeight: 1.6,
            }}
          >
            {t('filter_all')} ({enrichedRecs.length})
          </button>

          {filterPills.map((pill) => {
            const active = priorityFilter.includes(pill.key);
            return (
              <button
                key={pill.key}
                onClick={() => setPriorityFilter((prev) =>
                  prev.includes(pill.key) ? prev.filter((k) => k !== pill.key) : [...prev, pill.key]
                )}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  border: `1px solid ${active ? pill.color : C.border}`,
                  background: active ? pill.bg : 'transparent',
                  color: active ? pill.color : C.textMuted,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  lineHeight: 1.6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: pill.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {pill.label}
                <span
                  style={{
                    background: active ? pill.color : '#f1f5f9',
                    color: active ? '#fff' : C.textMuted,
                    borderRadius: 10,
                    padding: '0 5px',
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: 1.6,
                    minWidth: 18,
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {priorityCounts[pill.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minWidth: 0 }} />

        {/* Store selector */}
        <Select
          mode="multiple"
          allowClear
          placeholder={t('sel_store')}
          style={{ minWidth: 160, maxWidth: 320 }}
          size="small"
          options={storeOptions}
          value={storeFilter}
          onChange={setStoreFilter}
          maxTagCount="responsive"
        />

        {/* Date range picker */}
        <RangePicker size="small" style={{ width: 210 }} />

        {/* Keyword / transcript search */}
        <Select
          mode="multiple"
          showSearch
          allowClear
          placeholder={
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <SearchOutlined style={{ fontSize: 11 }} />
              Select keyword…
            </span>
          }
          style={{ minWidth: 220, maxWidth: 360 }}
          size="small"
          options={keywordOptions}
          value={keywordFilter}
          onChange={(vals) => {
            setKeywordFilter(vals);
            if (vals.length > 0) setTranscriptSearch('');
          }}
          onSearch={(val) => {
            if (keywordFilter.length === 0) setTranscriptSearch(val);
          }}
          onClear={() => { setKeywordFilter([]); setTranscriptSearch(''); }}
          filterOption={(input, opt) =>
            opt.value === '__all__' || opt.label.toLowerCase().includes(input.toLowerCase())
          }
          maxTagCount="responsive"
        />

        {/* Settings gear */}
        <Tooltip title="Priority Settings">
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setSettingsOpen(true)}
            style={{ flexShrink: 0 }}
          />
        </Tooltip>
      </div>

      {/* ══ TABLE HEADER ════════════════════════════════════════ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px 6px',
          flexShrink: 0,
        }}
      >
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
            {t('rh_lbl')}
          </span>
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: C.textMuted,
              background: '#f1f5f9',
              padding: '1px 8px',
              borderRadius: 10,
            }}
          >
            {filtered.length} / {enrichedRecs.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button size="small" type="text" style={{ fontSize: 12, color: C.textMuted }}>
            {t('btn_export')}
          </Button>
        </div>
      </div>

      {/* ══ 4. RECORDING TABLE ══════════════════════════════════ */}
      <div style={{ flex: 1, padding: '0 20px 20px', minHeight: 0 }}>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="middle"
          expandable={expandable}
          pagination={{
            size: 'small',
            pageSize: 20,
            showSizeChanger: false,
            style: { marginTop: 12 },
          }}
          scroll={{ x: 900 }}
          onRow={(record) => ({
            onClick: () => setExpandedId((prev) => (prev === record.id ? null : record.id)),
            style: {
              cursor: 'pointer',
              background: expandedId === record.id ? '#f0f7ff' : undefined,
              transition: 'background 0.15s',
            },
          })}
          rowClassName={(record) =>
            expandedId === record.id ? 'rec-row-expanded' : ''
          }
          style={{
            background: C.surface,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            overflow: 'hidden',
          }}
          components={{}}
        />
      </div>

      {/* ══ 5. PLAYER OVERLAY ════════════════════════════════════ */}
      <PlayerModal
        rec={selectedRec}
        lang={lang}
        t={t}
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
      />

      {/* ══ 6. PRIORITY SETTINGS MODAL ══════════════════════════ */}
      <PrioritySettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* ── inline keyframes for pulse animation ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .ant-table-row.rec-row-expanded > td {
          background: #f0f7ff !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
}
