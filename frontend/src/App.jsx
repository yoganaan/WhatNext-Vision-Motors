import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Dealers from './pages/Dealers';
import Vehicles from './pages/Vehicles';
import Orders from './pages/Orders';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/orders" element={<Orders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
