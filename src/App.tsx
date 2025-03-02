import { Toaster } from 'sonner';
import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import Home from './pages/Home';
import Tools from './pages/Tools';
import Contact from './pages/Contact';
import SavedTools from './pages/SavedTools';
import SubmitTool from './pages/SubmitTool';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/saved" element={<SavedTools />} />
        <Route path="/submit" element={<SubmitTool />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
