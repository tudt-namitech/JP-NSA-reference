import { Button, Badge, Tooltip, Space, Typography } from 'antd';
import {
  ExportOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

function FlatBellIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
import { useApp } from '../contexts/AppContext';
import { ROLES, PAGE_KEY } from '../data/constants.js';

const { Text, Title } = Typography;

/* ─── colour tokens (light surface) ────────────────────────── */
const C = {
  bg:       '#ffffff',
  border:   '#e2e8f0',
  textMain: '#0f172a',
  textSub:  '#64748b',
};

/* ─── TopBar ────────────────────────────────────────────────── */
export default function TopBar({ onBellClick, alertCount = 0 }) {
  const { curPage, curRole, t } = useApp();

  const pageTitle = t(PAGE_KEY[curPage] ?? curPage);
  const descKey   = `desc_${curPage}`;
  const pageDesc  = t(descKey);

  const role      = ROLES[curRole];
  const roleColor = role?.color ?? '#2563eb';
  const roleName  = t(`role_${curRole}`);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 56,
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
        zIndex: 90,
        gap: 16,
      }}
    >
      {/* ── Left: page title + subtitle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Title
              level={5}
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 700,
                color: C.textMain,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pageTitle}
            </Title>

            {/* description tooltip */}
            <Tooltip
              title={pageDesc}
              placement="bottomLeft"
              overlayStyle={{ maxWidth: 320 }}
              overlayInnerStyle={{ fontSize: 12 }}
            >
              <InfoCircleOutlined
                style={{
                  fontSize: 15,
                  color: '#94a3b8',
                  cursor: 'help',
                  flexShrink: 0,
                }}
              />
            </Tooltip>
          </div>

          {pageDesc && (
            <Text
              style={{
                fontSize: 13,
                color: C.textSub,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 480,
                lineHeight: 1.4,
                marginTop: 1,
              }}
            >
              {pageDesc}
            </Text>
          )}
        </div>
      </div>

      {/* ── Right: role badge + bell + export ── */}
      <Space size={10} style={{ flexShrink: 0 }}>
        {/* Role badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px 3px 8px',
            borderRadius: 20,
            background: `${roleColor}18`,
            border: `1px solid ${roleColor}40`,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: roleColor,
              flexShrink: 0,
            }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: roleColor,
              whiteSpace: 'nowrap',
            }}
          >
            {roleName}
          </Text>
        </span>

        {/* Notification bell */}
        <Badge
          count={alertCount}
          size="small"
          offset={[-2, 2]}
          styles={{ indicator: { fontSize: 12, minWidth: 16, height: 16, lineHeight: '16px' } }}
        >
          <Button
            shape="circle"
            icon={<FlatBellIcon size={16} color={alertCount > 0 ? '#2563eb' : '#64748b'} />}
            onClick={onBellClick}
            style={{
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: alertCount > 0 ? '#2563eb' : '#64748b',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Badge>

        {/* Export */}
        <Button
          icon={<ExportOutlined />}
          style={{
            fontSize: 15,
            fontWeight: 500,
            borderRadius: 8,
            height: 34,
            padding: '0 14px',
            border: '1px solid #e2e8f0',
            color: '#334155',
          }}
        >
          {t('btn_export')}
        </Button>
      </Space>
    </div>
  );
}
