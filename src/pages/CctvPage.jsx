import { useState } from 'react';
import {
  Table, Tag, Button, Input, Select, Space, Card, Dropdown,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';
import { CCTV_DATA } from '../data/constants.js';

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
  orange:    '#d97706',
  red:       '#dc2626',
};

const BRANDS = ['Hikvision', 'Dahua', 'Axis', 'Bosch'];

function actionItems(record) {
  return [
    { key: 'edit',   label: 'Edit',       icon: <EditOutlined /> },
    { key: 'resync', label: 'Resync',     icon: <ReloadOutlined /> },
    { key: 'delete', label: 'Delete',     icon: <DeleteOutlined />, danger: true },
  ];
}

export default function CctvPage() {
  const { t } = useApp();
  const [search, setSearch]       = useState('');
  const [brandFilter, setBrand]   = useState('all');
  const [page, setPage]           = useState(1);
  const PAGE_SIZE = 10;

  const filtered = CCTV_DATA.filter((r) => {
    const matchSearch =
      !search ||
      r.code.includes(search) ||
      r.addr.toLowerCase().includes(search.toLowerCase());
    const matchBrand = brandFilter === 'all' || r.brand === brandFilter;
    return matchSearch && matchBrand;
  });

  const brandOptions = [
    { value: 'all', label: 'All Brands' },
    ...BRANDS.map((b) => ({ value: b, label: b })),
  ];

  const columns = [
    {
      title: t('th_cc_store'),
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <code style={{ fontFamily: 'monospace', fontSize: 12, color: C.text, background: '#f8fafc', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
          {code}
        </code>
      ),
    },
    {
      title: t('th_cc_addr'),
      dataIndex: 'addr',
      key: 'addr',
      render: (addr) => <span style={{ fontSize: 13, color: C.text }}>{addr}</span>,
    },
    {
      title: 'RTSP',
      key: 'rtsp',
      align: 'center',
      width: 80,
      render: (_, row) => (
        <Tag
          style={{
            background: row.ok ? '#d1fae5' : '#fee2e2',
            color: row.ok ? C.green : C.red,
            border: `1px solid ${row.ok ? '#6ee7b7' : '#fca5a5'}`,
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 11,
          }}
        >
          {row.ok ? 'RTSP ✓' : 'RTSP ✗'}
        </Tag>
      ),
    },
    {
      title: t('th_cc_brand'),
      dataIndex: 'brand',
      key: 'brand',
      render: (brand) => (
        <Tag
          style={{
            background: '#f1f5f9', color: C.textMuted,
            border: `1px solid ${C.border}`,
            borderRadius: 4, fontWeight: 500, fontSize: 12,
          }}
        >
          {brand}
        </Tag>
      ),
    },
    {
      title: t('th_cc_cams'),
      dataIndex: 'cams',
      key: 'cams',
      align: 'center',
      render: (n) => (
        <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{n}</span>
      ),
    },
    {
      title: t('th_cc_ret'),
      dataIndex: 'ret',
      key: 'ret',
      align: 'center',
      render: (n) => <span style={{ color: C.textMuted, fontSize: 13 }}>{n}d</span>,
    },
    {
      title: t('th_action'),
      key: 'action',
      align: 'center',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={{ items: actionItems(record) }} trigger={['click']} placement="bottomRight">
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{ color: C.textMuted }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 24px', background: C.bg, minHeight: '100vh' }}>
      {/* Description */}
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: C.textMuted }}>{t('desc_cctv')}</span>
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
              placeholder={t('cctv_srch_ph')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 260 }}
              allowClear
            />
            <Select
              value={brandFilter}
              onChange={setBrand}
              options={brandOptions}
              style={{ width: 150 }}
            />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: C.blue, borderColor: C.blue, borderRadius: 6, fontWeight: 600 }}
          >
            {t('btn_add_store')}
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={filtered.map((r) => ({ ...r, key: r.code }))}
          columns={columns}
          size="small"
          scroll={{ x: 'max-content' }}
          style={{ borderRadius: 8 }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: filtered.length,
            onChange: setPage,
            showSizeChanger: false,
            size: 'small',
            style: { padding: '12px 16px', margin: 0 },
          }}
        />
      </Card>
    </div>
  );
}
