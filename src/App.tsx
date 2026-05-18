
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import DailyTracking from './pages/DailyTracking';
import MonthClosing from './pages/MonthClosing';
import History from './pages/History';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="daily" element={<DailyTracking />} />
        <Route path="closing" element={<MonthClosing />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  );
}

export default App;
