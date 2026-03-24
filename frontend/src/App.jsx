import { useState } from 'react';
import Generator from './screens/Generator';
import Auth from './screens/Auth';
import Registration from './screens/Registration';
import Passwords from './screens/Passwords';
import Presets from './screens/Presets';

function App() {
  const [screen, setScreen] = useState('auth');
  const [length, setLength] = useState(12);
  const [settings, setSettings] = useState({
    lowercase: true,
    uppercase: false,
    symbols: false,
    excludeSimilar: false
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const savedPasswords = [
    { id: 1, service: 'Google Account', pass: 'kX9v-2mPq-8zLt'},
    { id: 2, service: 'VK / Вконтакте', pass: 'Super-Safe-Pass-2024'},
    { id: 3, service: 'Telegram', pass: 'Tg_Master_99!'},
  ];
  const savedPresets = [
    { id: 1, name: 'Максимальная защита', length: 20, lowercase: true, uppercase: true, symbols: true, excludeSimilar: true },
    { id: 2, name: 'Для соцсетей', length: 12, lowercase: true, uppercase: true, symbols: false, excludeSimilar: false },
    { id: 3, name: 'Простой пин-код', length: 6, lowercase: false, uppercase: false, symbols: false, excludeSimilar: false },
  ];

  const applyPreset = (preset) => {
    setLength(preset.length);
    setSettings({
      lowercase: preset.lowercase,
      uppercase: preset.uppercase,
      symbols: preset.symbols,
      excludeSimilar: preset.excludeSimilar
    });
    setScreen('generator');
  };

  const toggleSetting = (name) => {
    setSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Общие стили для инпутов авторизации
  const authInputStyle = "w-full font-bold p-4 border-2 border-black rounded-2xl focus:bg-neutral-50 outline-none font-oswald uppercase tracking-widest placeholder:text-neutral-300";

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
      
      {screen === 'auth' && (
        <Auth setScreen={setScreen} authInputStyle={authInputStyle}/>
      )}

      {screen === 'registration' && (
        <Registration setScreen={setScreen} authInputStyle={authInputStyle}/>
      )}

      {screen === 'generator' && (
        <Generator 
          setScreen={setScreen}
          length={length}
          setLength={setLength}
          settings={settings}
          toggleSetting={toggleSetting}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
      )}

      {screen === 'my_passwords' && (
        <Passwords setScreen={setScreen} savedPasswords={savedPasswords}/>
      )}

      {screen === 'my_presets' && (
        <Presets
          setScreen={setScreen} 
          savedPresets={savedPresets} 
          onApply={applyPreset} 
        />
      )}
      
    </div>
  );
}

export default App;