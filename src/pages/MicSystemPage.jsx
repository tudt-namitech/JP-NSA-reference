import { useState, useMemo } from 'react';
import {
  Table, Tabs, Tag, Button, Input, Select, Card, DatePicker, Tooltip, Popover,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, ExportOutlined,
  DesktopOutlined, AudioOutlined, EllipsisOutlined, InfoCircleOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';
import { MICS_DATA, STORE_LIST } from '../data/constants.js';

const { RangePicker } = DatePicker;

/* ─── colour tokens ─────────────────────────────────────────── */
const C = {
  bg:        '#f0f4f8',
  surface:   '#ffffff',
  border:    '#e2e8f0',
  text:      '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  primary:   '#2563eb',
  green:     '#059669',
  orange:    '#d97706',
  purple:    '#7c3aed',
  red:       '#dc2626',
};

/* ─── tag colour for mic tags ────────────────────────────────── */
const TAG_STYLES = {
  enable:   { bg: '#eff6ff', color: C.primary, border: '#bfdbfe' },
  utraview: { bg: '#f5f3ff', color: C.purple,  border: '#ddd6fe' },
};

function MicTag({ tag }) {
  const s = TAG_STYLES[tag] ?? { bg: '#f1f5f9', color: C.textMuted, border: C.border };
  return (
    <Tag style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 4, fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
      {tag}
    </Tag>
  );
}

/* ─── online/offline dot ─────────────────────────────────────── */
function StatusDot({ online }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: online ? C.green : '#cbd5e1', display: 'inline-block', boxShadow: online ? '0 0 0 2px #d1fae5' : 'none' }} />
      <span style={{ fontSize: 14, color: online ? C.green : C.textLight, fontWeight: online ? 600 : 400 }}>
        {online ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}

/* ─── SearchButton helper ────────────────────────────────────── */
function SearchButton({ onClick }) {
  return (
    <Button type="primary" icon={<SearchOutlined />} onClick={onClick} style={{ fontWeight: 600 }}>
      Search
    </Button>
  );
}

/* ─── SectionHeader helper ───────────────────────────────────── */
function SectionHeader({ title, count, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
      <div>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{title}</span>
        {count != null && <span style={{ fontSize: 14, color: C.textMuted, marginLeft: 4 }}>({count})</span>}
        {desc && <div style={{ fontSize: 14, color: C.textMuted, marginTop: 2 }}>{desc}</div>}
      </div>
      {children && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{children}</div>}
    </div>
  );
}

/* ═══ 1. Statistics Tab ══════════════════════════════════════════ */
/* realistic 30-day data — stable pattern like the reference screenshot */
const CHART_DATA = (() => {
  const days = [];
  const base = new Date('2026-02-27');
  const pattern = [8,8,8,8,8,8,9,9,9,9,9,9,1,9,9,1,8,9,9,9,9,9,9,9,9,9,9,9,9,9];
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const total = pattern[i] ?? 9;
    /* mostly lt40, a few teal bars in the later days */
    const hasTeal = i >= 18 && total > 3;
    const lt40 = hasTeal ? total - 4 : total;
    const r60  = hasTeal ? 4 : 0;
    days.push({ date: dateStr, lt40, r40: 0, r60, gt80: 0, total });
  }
  return days;
})();

function StatisticsTab() {
  const chartData = CHART_DATA;
  const maxVal = 10;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Statistics</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginTop: 2 }}>
            Analyzing comprehensive system monitoring statistics to ensure optimal performance and operational stability.
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600, marginBottom: 4 }}>Date Range</div>
          <RangePicker style={{ width: 280 }} />
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, textAlign: 'center', marginBottom: 16 }}>
        Statistics Of Microphones With Audio Data
      </div>

      {/* chart area */}
      <div style={{ position: 'relative', paddingLeft: 30 }}>
        {/* Y axis labels */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {[10, 8, 6, 4, 2, 0].map((v) => (
            <span key={v} style={{ fontSize: 12, color: C.textMuted, lineHeight: 1 }}>{v}</span>
          ))}
        </div>

        {/* bars + value labels */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 280, paddingBottom: 28, position: 'relative' }}>
          {chartData.map((d) => {
            const pct = (n) => `${(n / maxVal) * 100}%`;
            return (
              <Tooltip
                key={d.date}
                title={
                  <div style={{ fontSize: 11 }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{d.date}</div>
                    <div>Have Data &lt; 40%: {d.lt40}</div>
                    <div>Have Data 40 - 60%: {d.r40}</div>
                    <div>Have Data 60 - 80%: {d.r60}</div>
                    <div>Have Data &gt; 80%: {d.gt80}</div>
                  </div>
                }
              >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', cursor: 'pointer' }}>
                  {/* value label on top */}
                  <span style={{ fontSize: 9, color: C.textMuted, marginBottom: 2 }}>{d.total}</span>
                  {/* stacked bars */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse' }}>
                    <div style={{ height: pct(d.lt40), background: '#f87171', borderRadius: d.r60 ? 0 : '2px 2px 0 0', transition: 'height 0.3s' }} />
                    {d.r40 > 0 && <div style={{ height: pct(d.r40), background: '#fbbf24' }} />}
                    {d.r60 > 0 && <div style={{ height: pct(d.r60), background: '#2dd4bf', borderRadius: '2px 2px 0 0' }} />}
                    {d.gt80 > 0 && <div style={{ height: pct(d.gt80), background: '#34d399', borderRadius: '2px 2px 0 0' }} />}
                  </div>
                </div>
              </Tooltip>
            );
          })}

          {/* x axis labels */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex' }}>
            {chartData.filter((_, i) => i % 3 === 0).map((d) => (
              <span key={d.date} style={{ flex: 3, fontSize: 9, color: C.textMuted, textAlign: 'center' }}>
                {d.date}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 12 }}>
        {[
          { label: 'Have Data < 40%',    color: '#f87171' },
          { label: 'Have Data 40 - 60%', color: '#fbbf24' },
          { label: 'Have Data 60 - 80%', color: '#2dd4bf' },
          { label: 'Have Data > 80%',    color: '#34d399' },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: C.textMuted }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ 2. Microphone Status Tab ═══════════════════════════════════ */
function MicStatusTab({ t }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MICS_DATA.filter((m) => {
    if (search && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'on' && !m.on) return false;
    if (statusFilter === 'off' && m.on) return false;
    return true;
  });

  const columns = [
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Device</span>,
      dataIndex: 'id',
      key: 'id',
      render: (id) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DesktopOutlined style={{ color: C.textMuted, fontSize: 14 }} />
          <code style={{ fontFamily: 'monospace', fontSize: 14, color: C.text }}>{id}</code>
        </div>
      ),
    },
    { title: <span style={{ color: C.primary, fontWeight: 700 }}>Store</span>, dataIndex: 'store', key: 'store', render: (s) => <span style={{ fontSize: 13 }}>{s}</span> },
    { title: <span style={{ color: C.primary, fontWeight: 700 }}>Ver</span>, dataIndex: 'ver', key: 'ver', render: (v) => <span style={{ fontSize: 14, color: C.textMuted }}>{v}</span> },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Tags</span>,
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => tags.length ? tags.map((tag) => <MicTag key={tag} tag={tag} />) : <span style={{ color: C.textLight }}>—</span>,
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Online/Offline</span>,
      dataIndex: 'on',
      key: 'on',
      render: (on) => <StatusDot online={on} />,
    },
  ];

  return (
    <div>
      {/* filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input
          placeholder="Search by device ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
          suffix={<Button type="primary" icon={<SearchOutlined />} size="small" style={{ borderRadius: 4 }} />}
        />
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} options={[
          { value: 'all', label: 'All Status' },
          { value: 'on',  label: 'Online' },
          { value: 'off', label: 'Offline' },
        ]} />
        <Button icon={<ReloadOutlined />} style={{ flexShrink: 0 }} />
      </div>

      <Table
        dataSource={filtered.map((m) => ({ ...m, key: m.id }))}
        columns={columns}
        pagination={{ pageSize: 8, size: 'small', showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}` }}
        size="small"
      />
    </div>
  );
}

/* ═══ 3. Synchronization History Tab ═════════════════════════════ */
const SYNC_DATA = MICS_DATA.map((m, idx) => ({
  key: m.id,
  name: m.id.split('.').pop(),
  store: m.store,
  camera: m.on ? `CH${(idx % 3) + 1}` : '—',
  tags: m.tags,
  noteDate: idx % 2 === 0 ? `2026-03-${String(6 + idx).padStart(2, '0')} 17:${50 - idx}:07` : null,
  noteAuthor: 'admin@namitech.io',
  noteBody: idx === 0 ? 'Re-sync completed successfully' : idx === 4 ? 'テストノート' : null,
  days: Array.from({ length: 7 }, (_, di) => (idx + di) % 3 !== 0),
}));

function SyncHistoryTab({ t }) {
  const [deviceName, setDeviceName] = useState('');
  const [tagFilter, setTagFilter] = useState(null);

  const filtered = SYNC_DATA.filter((m) => {
    if (deviceName && !m.name.toLowerCase().includes(deviceName.toLowerCase())) return false;
    if (tagFilter && !m.tags.includes(tagFilter)) return false;
    return true;
  });

  const columns = [
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Name</span>,
      dataIndex: 'name',
      key: 'name',
      render: (n) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 6, background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AudioOutlined style={{ fontSize: 15, color: C.primary }} />
          </span>
          <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{n}</span>
        </div>
      ),
    },
    { title: <span style={{ color: C.primary, fontWeight: 700 }}>Store</span>, dataIndex: 'store', key: 'store' },
    { title: <span style={{ color: C.primary, fontWeight: 700 }}>Camera</span>, dataIndex: 'camera', key: 'camera', render: (c) => <span style={{ color: C.textMuted }}>{c}</span> },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Tags</span>,
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => tags.length ? tags.map((tag) => <MicTag key={tag} tag={tag} />) : <span style={{ color: C.textLight }}>—</span>,
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Note</span>,
      key: 'note',
      render: (_, row) => {
        if (!row.noteDate) return <span style={{ color: C.textLight }}>—</span>;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13, color: C.textLight }}>{row.noteDate} · {row.noteAuthor}</span>
            {row.noteBody && <span style={{ fontSize: 14, color: C.text }}>{row.noteBody}</span>}
            {row.noteBody && <span style={{ fontSize: 14, color: C.primary, cursor: 'pointer', fontWeight: 500 }}>Show More</span>}
          </div>
        );
      },
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Status</span>,
      key: 'status',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>Audio</span>
          <div style={{ display: 'flex', gap: 3 }}>
            {row.days.map((active, i) => (
              <span key={i} style={{ width: 14, height: 14, borderRadius: 3, background: active ? C.green : '#e2e8f0', display: 'inline-block' }} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: () => <EllipsisOutlined style={{ fontSize: 16, color: C.textMuted, cursor: 'pointer' }} />,
    },
  ];

  return (
    <div>
      {/* filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap', background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, marginBottom: 4 }}>Device Name</div>
          <Input placeholder="Device Name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} style={{ width: 160 }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, marginBottom: 4 }}>Tags</div>
          <Select allowClear placeholder="Select tag" value={tagFilter} onChange={setTagFilter} style={{ width: 140 }} options={[
            { value: 'enable', label: 'enable' },
            { value: 'utraview', label: 'utraview' },
          ]} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, marginBottom: 4 }}>Date</div>
          <RangePicker size="middle" style={{ width: 240 }} />
        </div>
        <SearchButton />
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        pagination={{ pageSize: 8, size: 'small' }}
        size="small"
      />
    </div>
  );
}

/* ═══ 4. Active Microphone By Store Tab ══════════════════════════ */
const STORE_MIC_DATA = STORE_LIST.map((s) => {
  const total = MICS_DATA.filter((m) => m.store === s.name).length;
  const online = MICS_DATA.filter((m) => m.store === s.name && m.on).length;
  return { key: s.id, storeId: s.id, address: s.name, activeMicCount: online, total, color: s.color };
});

function ActiveByStoreTab({ t }) {
  const filtered = STORE_MIC_DATA;

  const columns = [
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Store Id</span>,
      dataIndex: 'storeId',
      key: 'storeId',
      render: (id) => <span style={{ fontWeight: 500 }}>{id}</span>,
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Store Address</span>,
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Active Mic Count</span>,
      dataIndex: 'activeMicCount',
      key: 'activeMicCount',
      align: 'right',
      render: (n) => <span style={{ fontWeight: 700 }}>{n}</span>,
    },
  ];

  return (
    <div>
      <SectionHeader title="Report Microphone By Store" count={filtered.length}>
        <Button icon={<ReloadOutlined />}>Reload</Button>
        <Button icon={<ExportOutlined />}>Export CSV</Button>
      </SectionHeader>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap', background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, marginBottom: 4 }}>Date Range</div>
          <RangePicker size="middle" style={{ width: 240 }} />
        </div>
        <SearchButton />
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        pagination={{ pageSize: 20, size: 'small', showSizeChanger: true }}
        size="small"
      />
    </div>
  );
}

/* ═══ 5. Microphone History Tab ══════════════════════════════════ */
const ACTIVE_DAYS_RANGE = [19, 20, 21, 22, 23, 24, 25];

const MIC_HISTORY = MICS_DATA.map((m, idx) => {
  const storeObj = STORE_LIST.find((s) => s.name === m.store);
  /* generate full month active days (March 2026 = 31 days) */
  const monthDays = Array.from({ length: 31 }, (_, i) => (idx + i) % 4 !== 0);
  return {
    key: m.id,
    deviceName: m.id.split('.').pop(),
    storeId: storeObj?.id ?? '—',
    storeAddress: m.store,
    createdDate: `2025-0${3 + (idx % 6)}-${String(13 + idx).padStart(2, '0')}`,
    activeDays: ACTIVE_DAYS_RANGE.map((d) => (idx + d) % 4 !== 0),
    monthActiveDays: monthDays,
  };
});

/* ─── Active Days calendar popover ───────────────────────────── */
function ActiveDaysCalendar({ monthDays }) {
  const year = 2026;
  const month = 2; // March (0-indexed)
  const daysInMonth = 31;
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // Sunday=0

  const activeDayCount = monthDays.filter(Boolean).length;

  const weeks = [];
  let week = new Array(firstDayOfWeek).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div style={{ width: 280, padding: 4 }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>March</div>
          <div style={{ fontSize: 15, color: C.primary }}>2026</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ cursor: 'pointer', color: C.textMuted, fontSize: 14 }}>‹</span>
          <span style={{ cursor: 'pointer', color: C.textMuted, fontSize: 14 }}>›</span>
        </div>
      </div>

      {/* day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 4 }}>
        {dayLabels.map((d, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, padding: '4px 0' }}>{d}</span>
        ))}
      </div>

      {/* calendar grid */}
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
          {week.map((day, di) => {
            if (day === null) return <span key={di} />;
            const active = monthDays[day - 1];
            const isToday = day === 26;
            return (
              <span
                key={di}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: active ? C.primary : 'transparent',
                  color: active ? '#fff' : isToday ? C.text : C.textLight,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  margin: '0 auto',
                }}
              >
                {day}
              </span>
            );
          })}
        </div>
      ))}

      {/* divider */}
      <div style={{ height: 1, background: C.border, margin: '10px 0' }} />

      {/* footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.primary, display: 'inline-block' }} />
          <span style={{ fontSize: 14, color: C.textMuted }}>Active Day</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{activeDayCount} active days</span>
      </div>
    </div>
  );
}

function MicHistoryTab({ t }) {
  const [deviceFilter, setDeviceFilter] = useState(null);

  const filtered = MIC_HISTORY.filter((m) => {
    if (deviceFilter && m.deviceName !== deviceFilter) return false;
    return true;
  });

  const deviceOptions = [...new Set(MIC_HISTORY.map((m) => m.deviceName))].map((n) => ({ value: n, label: n }));

  const columns = [
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Device Name</span>,
      dataIndex: 'deviceName',
      key: 'deviceName',
      render: (n) => <span style={{ fontWeight: 600 }}>{n}</span>,
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Store Id</span>,
      dataIndex: 'storeId',
      key: 'storeId',
      render: (id) => <code style={{ fontSize: 14, color: C.textMuted }}>{id}</code>,
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Store Address</span>,
      dataIndex: 'storeAddress',
      key: 'storeAddress',
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Device Creation Date</span>,
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (d) => <span style={{ fontSize: 14, color: C.textMuted }}>{d}</span>,
    },
    {
      title: <span style={{ color: C.primary, fontWeight: 700 }}>Active Days</span>,
      key: 'activeDays',
      render: (_, row) => (
        <Popover
          content={<ActiveDaysCalendar monthDays={row.monthActiveDays} />}
          trigger="click"
          placement="left"
        >
          <div style={{ display: 'flex', gap: 6, cursor: 'pointer' }}>
            {ACTIVE_DAYS_RANGE.map((day, i) => {
              const active = row.activeDays[i];
              return (
                <span
                  key={day}
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: active ? C.primary : '#e2e8f0',
                    color: active ? '#fff' : C.textLight,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </Popover>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader title="Device History" count={filtered.length} desc="List microphones by 'enable' baseline tag, sorted by date.">
        <Button icon={<ReloadOutlined />}>Reload</Button>
        <Button icon={<ExportOutlined />}>Export CSV</Button>
      </SectionHeader>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-end', flexWrap: 'wrap', background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <div>
          <div style={{ fontSize: 13, color: C.primary, fontWeight: 600, marginBottom: 4 }}>Device</div>
          <Select allowClear showSearch placeholder="Filter by device name" value={deviceFilter} onChange={setDeviceFilter} style={{ width: 200 }} options={deviceOptions} />
        </div>
        <SearchButton />
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        pagination={{ pageSize: 10, size: 'small' }}
        size="small"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

/* ═══ Main Component ═════════════════════════════════════════════ */
export default function MicSystemPage() {
  const { t } = useApp();

  const items = [
    { key: '1', label: 'Statistics',              children: <StatisticsTab /> },
    { key: '2', label: 'Microphone Status',        children: <MicStatusTab t={t} /> },
    { key: '3', label: 'Synchronization History',   children: <SyncHistoryTab t={t} /> },
    { key: '4', label: 'Active Microphone By Store', children: <ActiveByStoreTab t={t} /> },
    { key: '5', label: 'Microphone History',        children: <MicHistoryTab t={t} /> },
  ];

  return (
    <div style={{ padding: '20px 24px', background: C.bg, minHeight: '100vh' }}>
      <Card
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}
        styles={{ body: { padding: '0 20px 20px' } }}
      >
        <Tabs
          defaultActiveKey="1"
          items={items}
          style={{ fontWeight: 500 }}
          tabBarStyle={{ marginBottom: 20 }}
        />
      </Card>
    </div>
  );
}
