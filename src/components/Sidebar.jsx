import { useState, useRef } from 'react';
import { Dropdown, Tooltip } from 'antd';
import {
  PushpinOutlined,
  PushpinFilled,
  CaretDownOutlined,
  CheckOutlined,
  ShopOutlined,
  PlayCircleOutlined,
  BarChartOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';

const NAV_ICONS = {
  play:  PlayCircleOutlined,
  chart: BarChartOutlined,
  mic:   AudioOutlined,
  cctv:  VideoCameraOutlined,
  users: TeamOutlined,
  audio: ToolOutlined,
};
import { useApp } from '../contexts/AppContext';
import { NAV_ITEMS, ROLES, STORE_LIST, MULTI_STORE } from '../data/constants.js';

/* ─── colour tokens ─────────────────────────────────────────── */
const C = {
  bg:          '#0d1b2e',
  bgHover:     '#132337',
  active:      '#1a3a5c',
  activeBorder:'#2563eb',
  text:        '#e2e8f0',
  textMuted:   '#64748b',
  textDisabled:'#374151',
  border:      'rgba(255,255,255,0.07)',
  pill:        'rgba(255,255,255,0.08)',
  pillHover:   'rgba(255,255,255,0.14)',
  badge:       'rgba(37,99,235,0.25)',
  badgeText:   '#93c5fd',
};

const SIDEBAR_COLLAPSED = 56;
const SIDEBAR_EXPANDED  = 216;

/* ─── tiny helpers ──────────────────────────────────────────── */
function dot(color) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function Avatar({ color, initials, size = 28 }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: '#fff',
        fontSize: initials.length > 1 ? 9 : 11,
        fontWeight: 700,
        letterSpacing: 0,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </span>
  );
}

/* ─── Sidebar ───────────────────────────────────────────────── */
export default function Sidebar() {
  const {
    lang, setLang,
    curRole, setCurRole,
    curPage, setCurPage,
    curStore, setCurStore,
    pinned, setPinned,
    t,
  } = useApp();

  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  const expanded = pinned || hovered;
  const width    = expanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  const role      = ROLES[curRole];
  const roleColor = role?.color ?? '#2563eb';
  const roleName  = t(`role_${curRole}`);
  const userName  = t(`name_${curRole}`);
  const isMulti      = MULTI_STORE.includes(curRole);
  const selectedIds  = Array.isArray(curStore) ? curStore : [curStore];
  const selectedObjs = STORE_LIST.filter((s) => selectedIds.includes(s.id));
  const storeObj     = selectedObjs[0] ?? STORE_LIST[0];

  function toggleStore(id) {
    setCurStore((prev) => {
      const arr = Array.isArray(prev) ? prev : [prev];
      return arr.includes(id) ? (arr.length > 1 ? arr.filter((x) => x !== id) : arr) : [...arr, id];
    });
  }

  /* ── hover with small delay so it doesn't flicker on fast passes ── */
  function handleMouseEnter() {
    clearTimeout(timerRef.current);
    setHovered(true);
  }
  function handleMouseLeave() {
    timerRef.current = setTimeout(() => setHovered(false), 120);
  }

  /* ── role dropdown items ── */
  const roleMenuItems = Object.entries(ROLES).map(([key, val]) => ({
    key,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', minWidth: 180 }}>
        {dot(val.color)}
        <span style={{ flex: 1, fontSize: 13 }}>{t(`role_${key}`)}</span>
        {curRole === key && <CheckOutlined style={{ fontSize: 11, color: '#2563eb' }} />}
      </div>
    ),
    onClick: () => setCurRole(key),
  }));

  /* ── store dropdown items ── */
  const storeMenuItems = STORE_LIST.map((s) => ({
    key: s.id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 190 }}>
        <span
          style={{
            display: 'inline-block',
            width: 28,
            fontSize: 10,
            fontWeight: 700,
            color: s.color,
            flexShrink: 0,
          }}
        >
          {s.code}
        </span>
        <span style={{ flex: 1, fontSize: 12 }}>{s.name}</span>
        {selectedIds.includes(s.id) && <CheckOutlined style={{ fontSize: 11, color: '#2563eb' }} />}
      </div>
    ),
    onClick: () => toggleStore(s.id),
  }));

  /* ── shared section label ── */
  function SectionLabel({ label }) {
    if (!expanded) return null;
    return (
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.textMuted,
          padding: '14px 14px 4px',
        }}
      >
        {label}
      </div>
    );
  }

  /* ── divider ── */
  function Divider() {
    return (
      <div
        style={{
          height: 1,
          background: C.border,
          margin: '6px 10px',
        }}
      />
    );
  }

  /* ── nav item ── */
  function NavItem({ item }) {
    const hasAccess = role?.pages?.includes(item.pg);
    const isActive  = curPage === item.pg;
    const isReadonly = role?.readonly?.includes(item.pg);
    const locked    = !hasAccess;

    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: expanded ? '0 12px 0 14px' : '0',
      height: 36,
      borderRadius: 8,
      margin: '1px 6px',
      cursor: locked ? 'not-allowed' : 'pointer',
      transition: 'background 0.15s, color 0.15s',
      position: 'relative',
      justifyContent: expanded ? 'flex-start' : 'center',
      color: locked ? C.textDisabled : isActive ? '#fff' : C.text,
      background: isActive ? C.active : 'transparent',
      borderLeft: isActive ? `3px solid ${C.activeBorder}` : '3px solid transparent',
      opacity: locked ? 0.45 : 1,
      userSelect: 'none',
      overflow: 'hidden',
      textDecoration: 'none',
    };

    const content = (
      <div
        style={baseStyle}
        onClick={() => !locked && setCurPage(item.pg)}
        onMouseEnter={(e) => {
          if (!locked && !isActive) e.currentTarget.style.background = C.bgHover;
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* icon */}
        {(() => { const Icon = NAV_ICONS[item.ico]; return Icon ? <Icon style={{ fontSize: 16, flexShrink: 0 }} /> : <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{item.ico}</span>; })()}

        {/* label + badge — only when expanded */}
        {expanded && (
          <>
            <span
              style={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {t(item.lbl)}
            </span>

            {isReadonly && !locked && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  background: C.badge,
                  color: C.badgeText,
                  borderRadius: 4,
                  padding: '1px 5px',
                  flexShrink: 0,
                }}
              >
                {t('ro_badge')}
              </span>
            )}

            {locked && (
              <span style={{ fontSize: 11, color: C.textDisabled, flexShrink: 0 }}>🔒</span>
            )}
          </>
        )}
      </div>
    );

    /* show tooltip on collapsed sidebar */
    if (!expanded) {
      return (
        <Tooltip
          title={
            <span>
              {t(item.lbl)}
              {locked && ' (locked)'}
              {isReadonly && !locked && ` · ${t('ro_badge')}`}
            </span>
          }
          placement="right"
          mouseEnterDelay={0.3}
        >
          {content}
        </Tooltip>
      );
    }

    return content;
  }

  /* ──────────────────────────────────────────────────────────── */
  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width,
        minWidth: width,
        height: '100vh',
        background: C.bg,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        boxShadow: '2px 0 12px rgba(0,0,0,0.35)',
        zIndex: 100,
      }}
    >
      {/* ── 1. Logo area ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: expanded ? '16px 14px 12px' : '16px 0 12px',
          justifyContent: expanded ? 'flex-start' : 'center',
          borderBottom: `1px solid ${C.border}`,
          flexShrink: 0,
        }}
      >
        {/* Blue square "NS" logo */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 12,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.5px',
            boxShadow: '0 2px 8px rgba(37,99,235,0.5)',
          }}
        >
          NS
        </div>

        {expanded && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.text,
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}
            >
              NamiSense Anywhere
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.textMuted,
                whiteSpace: 'nowrap',
                marginTop: 2,
              }}
            >
              {t('sub')}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Role pill ────────────────────────────────────── */}
      <div style={{ padding: expanded ? '10px 10px 4px' : '10px 6px 4px', flexShrink: 0 }}>
        <Dropdown
          menu={{ items: roleMenuItems }}
          trigger={['click']}
          placement="bottomLeft"
          overlayStyle={{ zIndex: 200 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: expanded ? '5px 8px' : '5px',
              borderRadius: 8,
              background: C.pill,
              cursor: 'pointer',
              transition: 'background 0.15s',
              justifyContent: expanded ? 'flex-start' : 'center',
              minHeight: 32,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.pillHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.pill)}
          >
            {dot(roleColor)}
            {expanded && (
              <>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.text,
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {roleName}
                </span>
                <CaretDownOutlined style={{ fontSize: 10, color: C.textMuted }} />
              </>
            )}
          </div>
        </Dropdown>
      </div>

      {/* ── 3. Store selector ───────────────────────────────── */}
      <div style={{ padding: expanded ? '2px 10px 8px' : '2px 6px 8px', flexShrink: 0 }}>
        {isMulti ? (
          <Dropdown
            menu={{ items: storeMenuItems }}
            trigger={['click']}
            placement="bottomLeft"
            overlayStyle={{ zIndex: 200 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: expanded ? '5px 8px' : '5px',
                borderRadius: 8,
                background: C.pill,
                cursor: 'pointer',
                transition: 'background 0.15s',
                justifyContent: expanded ? 'flex-start' : 'center',
                minHeight: 32,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.pillHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.pill)}
            >
              {expanded ? (
                <>
                  <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 3, overflow: 'hidden' }}>
                    {selectedObjs.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: s.color,
                          background: 'rgba(255,255,255,0.07)',
                          borderRadius: 4,
                          padding: '1px 5px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.code}
                      </span>
                    ))}
                    {selectedObjs.length > 2 && (
                      <span style={{ fontSize: 10, color: C.textMuted }}>+{selectedObjs.length - 2}</span>
                    )}
                  </div>
                  <CaretDownOutlined style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }} />
                </>
              ) : (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: storeObj.color,
                    minWidth: 24,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {storeObj.code}
                </span>
              )}
            </div>
          </Dropdown>
        ) : (
          /* Non-multi-store: read-only store info */
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: expanded ? '5px 8px' : '5px',
              borderRadius: 8,
              background: C.pill,
              justifyContent: expanded ? 'flex-start' : 'center',
              minHeight: 32,
            }}
          >
            <ShopOutlined style={{ fontSize: 13, color: C.textMuted, flexShrink: 0 }} />
            {expanded && (
              <span
                style={{
                  fontSize: 11,
                  color: C.textMuted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {storeObj.name}
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: C.border, margin: '0 10px 6px' }} />

      {/* ── 4. Navigation ───────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 8 }}>
        {NAV_ITEMS.map((item, idx) => {
          if (item.div) return <Divider key={`div-${idx}`} />;
          return <NavItem key={item.pg} item={item} />;
        })}
      </div>

      {/* ── bottom section ──────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>

        {/* ── 5. Pin button ───────────────────────────────────── */}
        <div style={{ padding: expanded ? '8px 10px 4px' : '8px 6px 4px' }}>
          <Tooltip title={!expanded ? t('pin_lbl') : ''} placement="right">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: expanded ? '5px 8px' : '5px',
                borderRadius: 8,
                cursor: 'pointer',
                background: pinned ? 'rgba(37,99,235,0.18)' : 'transparent',
                transition: 'background 0.15s',
                justifyContent: expanded ? 'flex-start' : 'center',
                minHeight: 32,
              }}
              onClick={() => setPinned(!pinned)}
              onMouseEnter={(e) => {
                if (!pinned) e.currentTarget.style.background = C.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = pinned ? 'rgba(37,99,235,0.18)' : 'transparent';
              }}
            >
              {pinned ? (
                <PushpinFilled style={{ fontSize: 14, color: '#2563eb', flexShrink: 0 }} />
              ) : (
                <PushpinOutlined style={{ fontSize: 14, color: C.textMuted, flexShrink: 0 }} />
              )}
              {expanded && (
                <span
                  style={{
                    fontSize: 12,
                    color: pinned ? '#93c5fd' : C.textMuted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('pin_lbl')}
                </span>
              )}
            </div>
          </Tooltip>
        </div>

        {/* ── 6. Language switcher ─────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: expanded ? '4px 10px' : '4px 6px',
            justifyContent: expanded ? 'flex-start' : 'center',
          }}
        >
          {['vi', 'ja', 'en'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: '3px 7px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: lang === l ? '#2563eb' : C.pill,
                color: lang === l ? '#fff' : C.textMuted,
                transition: 'background 0.15s, color 0.15s',
                lineHeight: 1.6,
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── 7. User info ─────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: expanded ? '8px 12px 14px' : '8px 0 14px',
            justifyContent: expanded ? 'flex-start' : 'center',
          }}
        >
          <Avatar color={roleColor} initials={role?.av ?? '?'} size={30} />
          {expanded && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                }}
              >
                {userName}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: C.textMuted,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                }}
              >
                {roleName}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
