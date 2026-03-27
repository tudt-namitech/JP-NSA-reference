import { useState } from 'react';
import {
  Drawer,
  Tabs,
  Button,
  Switch,
  Input,
  Space,
  Typography,
  List,
  Empty,
} from 'antd';
import {
  CloseOutlined,
  AudioOutlined,
  MailOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';

const { Text } = Typography;

/* ─── severity config ───────────────────────────────────────── */
const SEV_CFG = {
  p1: { bg: '#dc2626', color: '#fff', border: '#dc2626' },
  p2: { bg: '#ea580c', color: '#fff', border: '#ea580c' },
  p3: { bg: '#2563eb', color: '#fff', border: '#2563eb' },
};

/* ─── AlertPanel ────────────────────────────────────────────── */
export default function AlertPanel({ open, onClose }) {
  const { t } = useApp();

  const alerts = t('alerts') ?? [];

  /* filter state */
  const [filter, setFilter]       = useState('all'); // 'all' | 'unread' | 'mic'
  const [readSet, setReadSet]     = useState(new Set());

  /* settings state */
  const [evtMicOff, setEvtMicOff]       = useState(true);
  const [evtSync, setEvtSync]           = useState(true);
  const [chanInApp, setChanInApp]       = useState(true);
  const [chanEmail, setChanEmail]       = useState(false);
  const [emailAddr, setEmailAddr]       = useState('');
  const [quietHours, setQuietHours]     = useState(true);
  const [quietFrom, setQuietFrom]       = useState('22:00');
  const [quietTo, setQuietTo]           = useState('08:00');

  /* helpers */
  function isRead(idx) {
    return readSet.has(idx) || !alerts[idx]?.unread;
  }

  function markRead(idx) {
    setReadSet((prev) => new Set([...prev, idx]));
  }

  function markAllRead() {
    setReadSet(new Set(alerts.map((_, i) => i)));
  }

  function dismiss(idx) {
    markRead(idx);
  }

  /* filtered list keeps original index for read tracking */
  const filteredAlerts = alerts
    .map((a, i) => ({ ...a, _idx: i }))
    .filter((a) => {
      if (filter === 'unread') return !isRead(a._idx);
      if (filter === 'mic')    return a.type === 'mic';
      return true;
    });

  /* ── Severity icon badge ── */
  function SevBadge({ sev, type }) {
    const cfg = SEV_CFG[sev] ?? SEV_CFG.p3;
    const Icon = type === 'sync' ? SyncOutlined : AudioOutlined;
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: cfg.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon style={{ fontSize: 16, color: cfg.color }} />
      </div>
    );
  }

  /* ── Alerts tab ── */
  function AlertsTab() {
    const unreadCount = alerts.filter((a, i) => !isRead(i)).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* filter row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 0 12px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { key: 'all',    label: t('ap_all') },
            { key: 'unread', label: t('ap_unread') },
            { key: 'mic',    label: <AudioOutlined /> },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: filter === key ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: filter === key ? '#eff6ff' : '#fff',
                color: filter === key ? '#2563eb' : '#475569',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: filter === key ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              {label}
              {key === 'unread' && unreadCount > 0 && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: '#2563eb',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '0 4px',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <Button
            size="small"
            type="link"
            onClick={markAllRead}
            style={{ fontSize: 14, color: '#2563eb', padding: 0 }}
          >
            {t('ap_mark_all')}
          </Button>
        </div>

        {/* list */}
        {filteredAlerts.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text style={{ color: '#94a3b8', fontSize: 13 }}>
                  {filter === 'unread' ? t('ap_unread') : t('ap_all')}
                </Text>
              }
            />
          </div>
        ) : (
          <List
            dataSource={filteredAlerts}
            style={{ flex: 1, overflowY: 'auto' }}
            renderItem={(alert) => {
              const read     = isRead(alert._idx);
              const sevCfg   = SEV_CFG[alert.sev] ?? SEV_CFG.p3;

              return (
                <List.Item
                  key={alert._idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    marginBottom: 6,
                    background: read ? '#fff' : '#f8faff',
                    border: '1px solid',
                    borderColor: read ? '#f1f5f9' : '#dbeafe',
                    borderLeft: `3px solid ${read ? '#e2e8f0' : sevCfg.border}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    cursor: 'default',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* severity icon */}
                  <SevBadge sev={alert.sev} type={alert.type} />

                  {/* content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        strong={!read}
                        style={{
                          fontSize: 15,
                          color: '#0f172a',
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {alert.title}
                      </Text>

                      {/* severity dot */}
                      <span
                        style={{
                          display: 'inline-block',
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: sevCfg.bg,
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    <Text style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 6 }}>
                      {alert.store}
                    </Text>

                    {/* actions */}
                    <Space size={4}>
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => markRead(alert._idx)}
                        style={{ fontSize: 13, height: 22, padding: '0 8px', borderRadius: 4 }}
                      >
                        {t('ap_view')}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => dismiss(alert._idx)}
                        style={{ fontSize: 13, height: 22, padding: '0 8px', borderRadius: 4 }}
                      >
                        {t('ap_dismiss')}
                      </Button>
                    </Space>
                  </div>

                  {/* time + unread dot */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {alert.time}
                    </Text>
                    {!read && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: '#2563eb',
                        }}
                      />
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    );
  }

  /* ── Settings tab ── */
  function SettingsTab() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 16 }}>

        {/* Event Types */}
        <section>
          <SectionHeading label="Event Types" />
          <SettingRow
            label="Microphone Offline"
            checked={evtMicOff}
            onChange={setEvtMicOff}
          />
          <SettingRow
            label="Sync Failure"
            checked={evtSync}
            onChange={setEvtSync}
          />
        </section>

        {/* Channels */}
        <section>
          <SectionHeading label="Channels" />
          <div style={{ display: 'flex', gap: 10 }}>
            <ChannelCard
              icon={<AppstoreOutlined />}
              label="In-App"
              checked={chanInApp}
              onChange={setChanInApp}
            />
            <ChannelCard
              icon={<MailOutlined />}
              label="Email"
              checked={chanEmail}
              onChange={setChanEmail}
            />
          </div>

          {/* email input */}
          {chanEmail && (
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <Input
                size="small"
                placeholder="email@example.com"
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                style={{ flex: 1, fontSize: 12 }}
              />
              <Button size="small" style={{ fontSize: 12 }}>
                Test
              </Button>
            </div>
          )}
        </section>

        {/* Quiet Hours */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <SectionHeading label="Quiet Hours" noMargin />
            <Switch
              size="small"
              checked={quietHours}
              onChange={setQuietHours}
            />
          </div>

          {quietHours && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <ClockCircleOutlined style={{ color: '#64748b', fontSize: 14 }} />
              <input
                type="time"
                value={quietFrom}
                onChange={(e) => setQuietFrom(e.target.value)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontSize: 14,
                  color: '#0f172a',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              />
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>to</Text>
              <input
                type="time"
                value={quietTo}
                onChange={(e) => setQuietTo(e.target.value)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '3px 7px',
                  fontSize: 14,
                  color: '#0f172a',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              />
            </div>
          )}
        </section>

        {/* Save */}
        <Button type="primary" block style={{ borderRadius: 8 }}>
          Save
        </Button>
      </div>
    );
  }

  /* ── small helpers for settings ── */
  function SectionHeading({ label, noMargin }) {
    return (
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          marginBottom: noMargin ? 0 : 10,
        }}
      >
        {label}
      </div>
    );
  }

  function SettingRow({ label, checked, onChange }) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          borderRadius: 8,
          background: '#f8fafc',
          border: '1px solid #f1f5f9',
          marginBottom: 6,
        }}
      >
        <Text style={{ fontSize: 15, color: '#334155' }}>{label}</Text>
        <Switch size="small" checked={checked} onChange={onChange} />
      </div>
    );
  }

  function ChannelCard({ icon, label, checked, onChange }) {
    return (
      <div
        onClick={() => onChange(!checked)}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: '12px 8px',
          borderRadius: 10,
          border: `1.5px solid ${checked ? '#2563eb' : '#e2e8f0'}`,
          background: checked ? '#eff6ff' : '#fff',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 20, color: checked ? '#2563eb' : '#94a3b8' }}>{icon}</span>
        <Text style={{ fontSize: 14, color: checked ? '#2563eb' : '#64748b', fontWeight: checked ? 600 : 400 }}>
          {label}
        </Text>
        <Switch size="small" checked={checked} onChange={onChange} onClick={(e) => e.stopPropagation()} />
      </div>
    );
  }

  /* ── tabs config ── */
  const tabItems = [
    {
      key: 'alerts',
      label: t('ap_tab_a'),
      children: <AlertsTab />,
    },
    {
      key: 'settings',
      label: t('ap_tab_s'),
      children: <SettingsTab />,
    },
  ];

  /* ── render ── */
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={380}
      styles={{
        header: { padding: '14px 16px', borderBottom: '1px solid #f1f5f9' },
        body: { padding: '16px', display: 'flex', flexDirection: 'column' },
      }}
      title={
        <Text strong style={{ fontSize: 15, color: '#0f172a' }}>
          {t('ap_title')}
        </Text>
      }
      closeIcon={
        <CloseOutlined style={{ fontSize: 15, color: '#64748b' }} />
      }
      destroyOnClose={false}
    >
      <Tabs
        defaultActiveKey="alerts"
        items={tabItems}
        size="small"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        tabBarStyle={{ marginBottom: 14 }}
      />
    </Drawer>
  );
}
