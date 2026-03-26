import { useState } from 'react';
import {
  Table, Tag, Button, Input, Select, Space, Card, Dropdown, Avatar,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';
import { USERS_DATA, ROLES } from '../data/constants.js';

/* ─── colour tokens ─────────────────────────────────────────── */
const C = {
  bg:        '#f0f4f8',
  surface:   '#ffffff',
  border:    '#e2e8f0',
  text:      '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  blue:      '#2563eb',
  green:     '#059669',
  red:       '#dc2626',
};

/* ─── role label lookup (i18n-free for simplicity) ───────────── */
const ROLE_LABELS = {
  admin:    'Admin',
  operator: 'Operator',
  store:    'Store Mgr',
  account:  'Account',
  area:     'Area Mgr',
};

function RoleBadge({ role }) {
  const color = ROLES[role]?.color ?? C.textMuted;
  return (
    <Tag
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}50`,
        borderRadius: 4,
        fontWeight: 600,
        fontSize: 11,
      }}
    >
      {ROLE_LABELS[role] ?? role}
    </Tag>
  );
}

function StatusBadge({ active, t }) {
  return (
    <Tag
      style={{
        background: active ? '#d1fae5' : '#f1f5f9',
        color: active ? C.green : C.textLight,
        border: `1px solid ${active ? '#6ee7b7' : C.border}`,
        borderRadius: 4,
        fontWeight: 600,
        fontSize: 11,
      }}
    >
      {active ? t('usr_active_lbl') : t('usr_inactive_lbl')}
    </Tag>
  );
}

const actionItems = [
  { key: 'edit',   label: 'Edit',          icon: <EditOutlined /> },
  { key: 'lock',   label: 'Reset Password', icon: <LockOutlined /> },
  { key: 'delete', label: 'Remove',         icon: <DeleteOutlined />, danger: true },
];

export default function UsersPage() {
  const { t } = useApp();
  const [search, setSearch]       = useState('');
  const [roleFilter, setRole]     = useState('all');
  const [statusFilter, setStatus] = useState('all');

  const filtered = USERS_DATA.filter((u) => {
    const matchSearch =
      !search ||
      u.nm.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter   === 'all' || u.role   === roleFilter;
    const matchStatus =
      statusFilter === 'all' ? true : statusFilter === 'active' ? u.active : !u.active;
    return matchSearch && matchRole && matchStatus;
  });

  const roleOptions = [
    { value: 'all', label: t('uf_all_roles') },
    ...Object.keys(ROLES).map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r })),
  ];

  const statusOptions = [
    { value: 'all',      label: 'All' },
    { value: 'active',   label: t('uf_active') },
    { value: 'inactive', label: t('uf_inactive') },
  ];

  const columns = [
    {
      title: t('th_u_name'),
      key: 'name',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            size={32}
            style={{ background: ROLES[row.role]?.color ?? C.blue, fontSize: 12, fontWeight: 700, flexShrink: 0 }}
          >
            {ROLES[row.role]?.av ?? row.nm[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 13, lineHeight: 1.3 }}>{row.nm}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
      render: (email) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.textMuted }}>{email}</span>
      ),
    },
    {
      title: t('th_u_role'),
      dataIndex: 'role',
      key: 'role',
      render: (role) => <RoleBadge role={role} />,
    },
    {
      title: t('th_u_store'),
      dataIndex: 'store',
      key: 'store',
      render: (s) => <span style={{ fontSize: 12, color: C.textMuted }}>{s}</span>,
    },
    {
      title: 'Last Login',
      dataIndex: 'login',
      key: 'login',
      render: (d) => <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.textMuted }}>{d}</span>,
    },
    {
      title: t('th_u_status'),
      dataIndex: 'active',
      key: 'active',
      render: (active) => <StatusBadge active={active} t={t} />,
    },
    {
      title: t('th_action'),
      key: 'action',
      align: 'center',
      width: 60,
      render: () => (
        <Dropdown menu={{ items: actionItems }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} style={{ color: C.textMuted }} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 24px', background: C.bg, minHeight: '100vh' }}>
      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: C.textMuted }}>{t('desc_users')}</span>
      </div>

      {/* Toolbar */}
      <Card
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 16 }}
        styles={{ body: { padding: '14px 20px' } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Space wrap size={10}>
            <Input
              prefix={<SearchOutlined style={{ color: C.textLight }} />}
              placeholder={t('usr_srch_ph')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
            <Select
              value={roleFilter}
              onChange={setRole}
              options={roleOptions}
              style={{ width: 140 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatus}
              options={statusOptions}
              style={{ width: 130 }}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: C.blue, borderColor: C.blue, borderRadius: 6, fontWeight: 600 }}
          >
            {t('btn_add_user')}
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filtered.map((u, i) => ({ ...u, key: u.email }))}
          columns={columns}
          size="small"
          scroll={{ x: 'max-content' }}
          style={{ borderRadius: 8 }}
          pagination={{ pageSize: 10, size: 'small', style: { padding: '12px 16px', margin: 0 } }}
        />
      </Card>
    </div>
  );
}
