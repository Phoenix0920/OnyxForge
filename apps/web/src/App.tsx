import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Nav } from './components/Nav';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';

export default function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Nav />
        <div className="col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/t/:plugin/:tool" element={<ToolPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
