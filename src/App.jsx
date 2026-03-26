import { useState } from 'react';
import { ConfigProvider } from 'antd';
import { AppProvider, useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AlertPanel from './components/AlertPanel';
import RecordingPage from './pages/RecordingPage';
import KeywordAnalyticsPage from './pages/KeywordAnalyticsPage';
import MicSystemPage from './pages/MicSystemPage';
import CctvPage from './pages/CctvPage';
import UsersPage from './pages/UsersPage';
import AudioTasksPage from './pages/AudioTasksPage';

function AppContent() {
  const { curPage, t } = useApp();
  const [alertOpen, setAlertOpen] = useState(false);
  const alertCount = (t('alerts') || []).filter(a => a.unread).length;

  const renderPage = () => {
    switch (curPage) {
      case 'rec': return <RecordingPage />;
      case 'kw': return <KeywordAnalyticsPage />;
      case 'mic': return <MicSystemPage />;
      case 'cctv': return <CctvPage />;
      case 'users': return <UsersPage />;
      case 'audio': return <AudioTasksPage />;
      default: return <RecordingPage />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f0f4fa' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <TopBar
          onBellClick={() => setAlertOpen(true)}
          alertCount={alertCount}
        />
        <div style={{ flex: 1, overflow: 'auto' }}>
          {renderPage()}
        </div>
      </div>
      <AlertPanel open={alertOpen} onClose={() => setAlertOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563eb',
          borderRadius: 8,
          fontFamily: "'Noto Sans JP', 'Noto Sans', sans-serif",
          fontSize: 13,
        },
      }}
    >
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
