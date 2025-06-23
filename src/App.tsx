import { Route, Routes } from 'react-router-dom';
import { Game } from './components/game/Game';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
    </Routes>
  );
}

export default App;
