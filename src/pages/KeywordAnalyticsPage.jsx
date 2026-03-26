import { useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Select, DatePicker,
  Button, Tag, Space, Typography,
} from 'antd';
import {
  RiseOutlined,
  ShopOutlined,
  TagsOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';
import { KW_ANALYTICS_DATA, STORE_LIST } from '../data/constants.js';

const { RangePicker } = DatePicker;
const { Text } = Typography;

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
  purple:    '#7c3aed',
  navy:      '#0f1f3d',
};

/* ─── by-store mock data ─────────────────────────────────────── */
const KEYWORDS = KW_ANALYTICS_DATA.map((d) => d.kw);

const BY_STORE_DATA = [
  { store: '東京_渋谷店',  '血圧': 2140, '糖尿病': 1520, '風邪薬': 1830, 'インフルエンザ': 1040, '花粉症': 920,  'ビタミン': 780 },
  { store: '大阪_梅田店',  '血圧': 1590, '糖尿病': 1210, '風邪薬': 980,  'インフルエンザ': 780,  '花粉症': 710,  'ビタミン': 560 },
  { store: '名古屋_栄店',  '血圧': 1320, '糖尿病': 1080, '風邪薬': 890,  'インフルエンザ': 640,  '花粉症': 510,  'ビタミン': 420 },
  { store: '福岡_天神店',  '血圧': 1050, '糖尿病': 890,  '風邪薬': 760,  'インフルエンザ': 580,  '花粉症': 830,  'ビタミン': 490 },
  { store: '横浜MM店',     '血圧': 1240, '糖尿病': 980,  '風邪薬': 1060, 'インフルエンザ': 870,  '花粉症': 420,  'ビタミン': 380 },
  { store: '札幌_大通店',  '血圧': 780,  '糖尿病': 750,  '風邪薬': 360,  'インフルエンザ': 300,  '花粉症': 250,  'ビタミン': 280 },
  { store: '京都_四条店',  '血圧': 0,    '糖尿病': 0,    '風邪薬': 0,    'インフルエンザ': 0,    '花粉症': 0,    'ビタミン': 0 },
];

/* ─── trend sparkbar component ──────────────────────────────── */
const TREND_DATA = {
  '血圧':        [60, 72, 68, 80, 75, 88, 100],
  '糖尿病':      [55, 60, 70, 65, 72, 80, 100],
  '風邪薬':      [40, 50, 80, 95, 70, 60, 100],
  'インフルエンザ': [20, 30, 70, 100, 85, 50, 30],
  '花粉症':      [10, 20, 60, 100, 90, 70, 40],
  'ビタミン':    [50, 55, 60, 65, 70, 80, 100],
};

function SparkBar({ kw }) {
  const vals = TREND_DATA[kw] ?? [50, 60, 70, 80, 90, 95, 100];
  const max = Math.max(...vals);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24 }}>
      {vals.map((v, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: `${(v / max) * 100}%`,
            background: i === vals.length - 1 ? C.blue : '#bfdbfe',
            borderRadius: 1,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}

/* ─── KPI card ───────────────────────────────────────────────── */
function KpiCard({ label, value, sub, accentColor, icon }) {
  return (
    <Card
      size="small"
      style={{
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,.07)',
        height: '100%',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 6, fontWeight: 500 }}>
            {label}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>
            {value}
          </div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 6 }}>{sub}</div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: `${accentColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: accentColor,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export default function KeywordAnalyticsPage() {
  const { t } = useApp();
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedKw, setSelectedKw] = useState(null);

  /* ── KW analytics table columns ── */
  const summaryColumns = [
    {
      title: t('fl_kw'),
      dataIndex: 'kw',
      key: 'kw',
      render: (kw) => (
        <Tag
          style={{
            background: '#eff6ff',
            color: C.blue,
            border: '1px solid #bfdbfe',
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {kw}
        </Tag>
      ),
    },
    {
      title: t('th_det'),
      dataIndex: 'n',
      key: 'n',
      align: 'right',
      render: (n) => (
        <Text strong style={{ color: C.text }}>
          {n.toLocaleString()}
        </Text>
      ),
    },
    {
      title: t('th_share'),
      dataIndex: 'pct',
      key: 'pct',
      align: 'right',
      render: (pct) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
          <div
            style={{
              width: 60,
              height: 6,
              background: '#e2e8f0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: C.blue,
                borderRadius: 3,
              }}
            />
          </div>
          <Text style={{ color: C.textMuted, fontSize: 12, minWidth: 30 }}>{pct}%</Text>
        </div>
      ),
    },
    {
      title: 'Trend',
      key: 'trend',
      align: 'center',
      render: (_, row) => <SparkBar kw={row.kw} />,
    },
  ];

  /* ── by-store table columns ── */
  const byStoreColumns = [
    {
      title: t('th_store'),
      dataIndex: 'store',
      key: 'store',
      fixed: 'left',
      width: 140,
      render: (store) => (
        <Text strong style={{ color: C.text, fontSize: 13 }}>
          {store}
        </Text>
      ),
    },
    ...KEYWORDS.map((kw) => ({
      title: (
        <span style={{ color: C.blue, fontSize: 12, fontWeight: 600 }}>{kw}</span>
      ),
      dataIndex: kw,
      key: kw,
      align: 'right',
      width: 110,
      render: (val) =>
        val > 0 ? (
          <Tag
            style={{
              background: val > 1500 ? '#eff6ff' : val > 800 ? '#f0fdf4' : '#fafafa',
              color: val > 1500 ? C.blue : val > 800 ? C.green : C.textMuted,
              border: `1px solid ${val > 1500 ? '#bfdbfe' : val > 800 ? '#a7f3d0' : '#e2e8f0'}`,
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {val.toLocaleString()}
          </Tag>
        ) : (
          <Text style={{ color: C.textLight, fontSize: 12 }}>—</Text>
        ),
    })),
  ];

  const storeOptions = STORE_LIST.map((s) => ({ value: s.id, label: s.name }));
  const kwOptions = KEYWORDS.map((kw) => ({ value: kw, label: kw }));

  return (
    <div style={{ padding: '20px 24px', background: C.bg, minHeight: '100vh' }}>

      {/* ── KPI Row ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label={t('kl1')}
            value="38,472"
            sub={t('ks1')}
            accentColor={C.blue}
            icon={<RiseOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label={t('kl2')}
            value="血圧"
            sub={t('ks2')}
            accentColor={C.green}
            icon={<FireOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label={t('kl3')}
            value="7"
            sub={t('ks3')}
            accentColor={C.orange}
            icon={<ShopOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label={t('kl4')}
            value="81"
            sub={t('ks4')}
            accentColor={C.purple}
            icon={<TagsOutlined />}
          />
        </Col>
      </Row>

      {/* ── Filter Card ── */}
      <Card
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,.07)',
          marginBottom: 20,
          border: `1px solid ${C.border}`,
        }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Space wrap size={12} align="center">
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('fl_store')}
            </div>
            <Select
              placeholder={t('sel_store')}
              options={storeOptions}
              value={selectedStore}
              onChange={setSelectedStore}
              allowClear
              style={{ width: 180 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('fl_kw')}
            </div>
            <Select
              placeholder={t('fl_kw')}
              options={kwOptions}
              value={selectedKw}
              onChange={setSelectedKw}
              allowClear
              style={{ width: 160 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('fl_from')} – {t('fl_to')}
            </div>
            <RangePicker style={{ width: 240 }} />
          </div>
          <div style={{ paddingTop: 18 }}>
            <Button
              type="primary"
              style={{ background: C.blue, borderColor: C.blue, borderRadius: 6, fontWeight: 600 }}
            >
              {t('btn_gen_rpt')}
            </Button>
          </div>
        </Space>
      </Card>

      {/* ── Summary Card ── */}
      <Card
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,.07)',
          marginBottom: 20,
          border: `1px solid ${C.border}`,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Row style={{ minHeight: 340 }}>
          {/* Left: dark navy summary box */}
          <Col
            xs={24}
            md={7}
            style={{
              background: C.navy,
              borderRadius: '8px 0 0 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 24px',
              gap: 12,
            }}
          >
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t('kw_sum_lbl')}
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1,
                letterSpacing: '-1px',
              }}
            >
              38,472
            </div>
            <div
              style={{
                display: 'inline-block',
                background: `${C.blue}40`,
                border: `1px solid ${C.blue}80`,
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                color: '#93c5fd',
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              2026/03/01 – 2026/03/26
            </div>
            <div
              style={{
                marginTop: 16,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '10px 16px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginBottom: 4 }}>
                {t('kl1')}
              </div>
              <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>{t('ks1')}</div>
            </div>
          </Col>

          {/* Right: keyword analytics table */}
          <Col xs={24} md={17} style={{ padding: '20px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, marginBottom: 12 }}>
              {t('fl_kw')} · Top {KW_ANALYTICS_DATA.length}
            </div>
            <Table
              dataSource={KW_ANALYTICS_DATA.map((d, i) => ({ ...d, key: i }))}
              columns={summaryColumns}
              pagination={false}
              size="small"
              style={{ borderRadius: 6 }}
            />
          </Col>
        </Row>
      </Card>

      {/* ── By-Store Table ── */}
      <Card
        title={
          <span style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>
            {t('rpt_store_title')}
          </span>
        }
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,.07)',
          border: `1px solid ${C.border}`,
        }}
        styles={{ body: { padding: '0 0 8px 0' } }}
      >
        <Table
          dataSource={BY_STORE_DATA.map((d, i) => ({ ...d, key: i }))}
          columns={byStoreColumns}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
          style={{ borderRadius: '0 0 8px 8px' }}
          summary={(pageData) => {
            const totals = {};
            KEYWORDS.forEach((kw) => {
              totals[kw] = pageData.reduce((sum, row) => sum + (row[kw] || 0), 0);
            });
            return (
              <Table.Summary.Row style={{ background: '#f8fafc' }}>
                <Table.Summary.Cell index={0}>
                  <Text strong style={{ color: C.text, fontSize: 13 }}>
                    Total
                  </Text>
                </Table.Summary.Cell>
                {KEYWORDS.map((kw, i) => (
                  <Table.Summary.Cell key={kw} index={i + 1} align="right">
                    <Text strong style={{ color: C.blue, fontSize: 13 }}>
                      {totals[kw].toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
}
