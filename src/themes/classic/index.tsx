import './styles/index.css';
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import Index from './pages/index';
import { useTheme } from './hooks/useTheme';

const ActivityList = lazy(() => import('./components/ActivityList'));

export default function ClassicTheme() {
  const { theme } = useTheme();

  return (
    <HelmetProvider>
      <Helmet>
        <html lang="en" data-theme={theme} />
      </Helmet>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/summary" element={<ActivityList />} />
            <Route path="*" element={<Index />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}
