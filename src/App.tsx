import './App.css';
import './styles/global.css';
import { UIProvider } from './context/UIProvider';
import Toast from './components/Toast';
import MusicPlayer from './components/MusicPlayer';
import Hero from './sections/Hero';
import Story from './sections/Story';
import Calendar from './sections/Calendar';
import GallerySection from './sections/GallerySection';
import Location from './sections/Location';
import Gifts from './sections/Gifts';
import RSVP from './sections/RSVP';
import Ending from './sections/Ending';

function App() {
  return (
    <UIProvider>
      <Toast />
      <MusicPlayer />
      <main>
        <Hero />
        <Story />
        <Calendar />
        <Location />
        <Gifts />
        <RSVP />
        <GallerySection />
        <Ending />
      </main>
    </UIProvider>
  );
}

export default App;
