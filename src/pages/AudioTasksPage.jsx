import { useState } from 'react';
import {
  Table, Tabs, Tag, Button, Input, Space, Card, Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useApp } from '../contexts/AppContext';

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
  yellow:    '#d97706',
};

/* ─── initial dictionary rows ────────────────────────────────── */
const INITIAL_DICT = [
  { id: 1, incorrect: 'てぃーこっど',   correct: 'Tコード',   order: 1 },
  { id: 2, incorrect: 'あすぴりん',     correct: 'アスピリン', order: 2 },
  { id: 3, incorrect: 'ぱーせんと',     correct: 'パーセント', order: 3 },
  { id: 4, incorrect: 'でぃあぼりっく', correct: 'ジアボリック', order: 4 },
];

let dictNextId = INITIAL_DICT.length + 1;

/* ─── initial keywords ───────────────────────────────────────── */
const INITIAL_KWS = [
  { id: 1, label: 'カスハラ',       value: 'kasuhara',   created: '2026-03-01' },
  { id: 2, label: '責任者',         value: 'sekininsha', created: '2026-03-05' },
  { id: 3, label: '血圧',           value: 'ketsuatsu',  created: '2026-03-10' },
  { id: 4, label: 'インフルエンザ', value: 'infuru',     created: '2026-03-12' },
];

let kwNextId = INITIAL_KWS.length + 1;

/* ─── ASR Dictionary Tab ─────────────────────────────────────── */
function AsDictionaryTab({ t }) {
  const [rows, setRows] = useState(INITIAL_DICT);

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: dictNextId++, incorrect: '', correct: '', order: prev.length + 1 },
    ]);
  }

  function deleteRow(id) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  return (
    <div>
      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <p style={{ margin: 0, fontSize: 13, color: C.textMuted, maxWidth: 640 }}>
          {t('desc_audio')}
        </p>
        <Space size={8}>
          <Tooltip title="Download dictionary">
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 6 }}>
              Download
            </Button>
          </Tooltip>
          <Tooltip title="Upload dictionary file">
            <Button icon={<UploadOutlined />} style={{ borderRadius: 6 }}>
              Upload
            </Button>
          </Tooltip>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            style={{ background: C.blue, borderColor: C.blue, borderRadius: 6, fontWeight: 600 }}
          >
            Save
          </Button>
        </Space>
      </div>

      {/* Dictionary table */}
      <Card
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}
        styles={{ body: { padding: 0 } }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${C.border}` }}>
              {['#', 'Incorrect Input', 'Correct Input', 'Order', ''].map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: C.textMuted,
                    width: i === 0 ? 48 : i === 3 ? 90 : i === 4 ? 48 : 'auto',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: `1px solid #f1f5f9` }}>
                <td style={{ padding: '8px 14px', color: C.textLight, fontSize: 12, fontWeight: 600 }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '6px 10px' }}>
                  <Input
                    value={row.incorrect}
                    onChange={(e) => updateRow(row.id, 'incorrect', e.target.value)}
                    placeholder="Incorrect pronunciation..."
                    size="small"
                    style={{ borderRadius: 4 }}
                  />
                </td>
                <td style={{ padding: '6px 10px' }}>
                  <Input
                    value={row.correct}
                    onChange={(e) => updateRow(row.id, 'correct', e.target.value)}
                    placeholder="Correct form..."
                    size="small"
                    style={{ borderRadius: 4 }}
                  />
                </td>
                <td style={{ padding: '6px 10px' }}>
                  <Input
                    type="number"
                    value={row.order}
                    onChange={(e) => updateRow(row.id, 'order', Number(e.target.value))}
                    size="small"
                    style={{ width: 64, borderRadius: 4 }}
                    min={1}
                  />
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteRow(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '12px 14px' }}>
          <Button
            icon={<PlusOutlined />}
            onClick={addRow}
            style={{ borderRadius: 6, borderStyle: 'dashed', color: C.blue, borderColor: C.blue }}
          >
            Add Word
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Keyword Management Tab ─────────────────────────────────── */
function KeywordMgmtTab() {
  const [keywords, setKeywords] = useState(INITIAL_KWS);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  function addKeyword() {
    if (!newLabel.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    setKeywords((prev) => [
      ...prev,
      { id: kwNextId++, label: newLabel.trim(), value: newValue.trim(), created: today },
    ]);
    setNewLabel('');
    setNewValue('');
  }

  function deleteKeyword(id) {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  }

  const columns = [
    {
      title: 'Keyword',
      dataIndex: 'label',
      key: 'label',
      render: (label) => (
        <Tag
          style={{
            background: '#fef3c7', color: C.yellow,
            border: '1px solid #fcd34d',
            borderRadius: 4, fontWeight: 700, fontSize: 13, padding: '2px 10px',
          }}
        >
          {label}
        </Tag>
      ),
    },
    {
      title: 'Value / Key',
      dataIndex: 'value',
      key: 'value',
      render: (v) => <code style={{ fontFamily: 'monospace', fontSize: 12, color: C.textMuted }}>{v || '—'}</code>,
    },
    {
      title: 'Created Date',
      dataIndex: 'created',
      key: 'created',
      render: (d) => (
        <code style={{ fontFamily: 'monospace', fontSize: 12, color: C.textMuted }}>{d}</code>
      ),
    },
    {
      title: '',
      key: 'del',
      align: 'center',
      width: 60,
      render: (_, row) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => deleteKeyword(row.id)}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header: count + add form */}
      <Card
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)', marginBottom: 16 }}
        styles={{ body: { padding: '14px 20px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>
              Keywords:
            </span>
            <Tag
              style={{
                background: '#eff6ff', color: C.blue,
                border: '1px solid #bfdbfe',
                borderRadius: 12, fontWeight: 700, fontSize: 14, padding: '2px 12px',
              }}
            >
              {keywords.length}
            </Tag>
          </div>
          <Space size={8} wrap>
            <Input
              placeholder="Label (e.g. 血圧)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              style={{ width: 160, borderRadius: 6 }}
              onPressEnter={addKeyword}
            />
            <Input
              placeholder="Value / key"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              style={{ width: 160, borderRadius: 6 }}
              onPressEnter={addKeyword}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addKeyword}
              disabled={!newLabel.trim()}
              style={{ background: C.blue, borderColor: C.blue, borderRadius: 6, fontWeight: 600 }}
            >
              Add
            </Button>
          </Space>
        </div>
      </Card>

      {/* Keywords table */}
      <Card
        style={{ borderRadius: 8, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={keywords.map((k) => ({ ...k, key: k.id }))}
          columns={columns}
          pagination={false}
          size="small"
          style={{ borderRadius: 8 }}
        />
      </Card>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */
export default function AudioTasksPage() {
  const { t } = useApp();

  const items = [
    { key: '1', label: t('atab1'), children: <AsDictionaryTab t={t} /> },
    { key: '2', label: t('atab2'), children: <KeywordMgmtTab /> },
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
