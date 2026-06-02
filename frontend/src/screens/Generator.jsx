import { handleCopy } from "../utils/passwordUtils";
import { getPassword, savePreset, savePassword } from "../api/api"; 
import { useState } from "react";

const Generator = ({ 
  length, setLength, settings, toggleSetting, 
  isMenuOpen, setIsMenuOpen, setScreen,
  masterKey, setMasterKey
}) => {
  const [password, setPassword] = useState();
  const [difficulty, setDifficulty] = useState();
  const [copied, setCopied] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTitle, setPasswordTitle] = useState('');
  const [presetName, setPresetName] = useState('');
  const [isSaving, setIsSaving] = useState(false); 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleGenerate = async () => {
    try {
      const data = await getPassword({
        length: length,
        use_upper: settings.use_upper, 
        use_digits: settings.use_digits, 
        use_special: settings.use_special,
        exclude_similar: settings.exclude_similar
      });
      
      setPassword(data.password); 
      setDifficulty(data.entropy.level);
    } catch (err) {
      console.error("Cloud generation failed:", err);
    }
  };
  
  const onCopyClick = () => {
    handleCopy(password, setCopied);
  };

  const handleSavePassword = () => {
    if (!password) return;
    if (!masterKey) {
      alert("Для сохранения пароля необходимо сначала ввести кодовое слово во вкладке 'Мои пароли'");
      return;
    }
    setIsPasswordModalOpen(true);
  };

  const confirmSavePassword = async () => {
    if (!passwordTitle) {
      alert("Введите название для пароля");
      return;
    }

    if (!masterKey) {
      alert("Кодовое слово отсутствует!");
      return;
    }

    setIsSaving(true);
    try {
      await savePassword({
        title: passwordTitle,
        password: password,
        keyword: masterKey 
      });
      
      setIsPasswordModalOpen(false);
      setPasswordTitle('');
      setSuccessMessage("Пароль успешно зашифрован и сохранен!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      alert("Ошибка: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };


  const handleSavePreset = async () => {
    try {
      await savePreset({
        preset_name: presetName, 
        length: length,
        use_uppercase: settings.use_upper,
        use_numbers: settings.use_digits,
        use_special: settings.use_special,
        use_lowercase: true,
      });
      setIsSaveModalOpen(false);
      setPresetName('');
      setSuccessMessage("Настройка успешно сохранена!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('masterKey');
    setMasterKey('');
    setScreen('auth');
  }
  
  return (
    <div className="bg-white p-6 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col items-center border border-neutral-200 relative">

          <div className="w-full flex justify-between items-center mb-8 px-2 relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col gap-1.5 cursor-pointer z-20"
            >
              <div className={`w-8 h-0.5 bg-black transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-8 h-0.5 bg-black transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-8 h-0.5 bg-black transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </button>

            {isMenuOpen && (
              <div className="absolute top-10 right-0 w-48 bg-white border-2 border-black rounded-2xl shadow-xl z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col">
                  <button onClick={() => { setScreen('my_presets'); setIsMenuOpen(false); }} className="font-oswald font-bold uppercase tracking-widest p-4 text-left hover:bg-neutral-100 border-b border-neutral-100 text-sm cursor-pointer">
                    Мои настройки
                  </button>
                  <button onClick={() => { setScreen('my_passwords'); setIsMenuOpen(false); }} className="font-oswald font-bold uppercase tracking-widest p-4 text-left hover:bg-neutral-100 text-sm cursor-pointer">
                    Мои пароли
                  </button>
                  <button onClick={() => {handleLogout(); setIsMenuOpen(false); }} className="font-oswald font-bold uppercase tracking-widest p-4 text-left hover:bg-neutral-100 text-sm cursor-pointer">
                    Выйти
                  </button>
                </div>
              </div>
            )}
        </div>

        <h1 className="font-oswald text-[32px] mb-6 uppercase tracking-tight text-center">Генератор пароля</h1>

        <div className="w-full flex items-center gap-2 mb-1">
          <button 
            onClick={handleSavePassword} 
            disabled={!password || isSaving}
            className="p-3 border-2 border-black rounded-2xl hover:bg-neutral-100 transition-colors flex items-center justify-center min-w-[64px] h-[60px] cursor-pointer disabled:opacity-30"
          >
            {isSaving ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            )}
          </button>

          <div className="relative flex-1 group">
            <input 
              readOnly 
              value={password}  
              className="w-full p-4 border-2 border-neutral-700 rounded-2xl bg-white font-mono text-lg font-bold text-center" 
            />
          </div>

          <button onClick={onCopyClick} className="p-3 border-2 border-black rounded-2xl hover:bg-neutral-100 transition-colors flex flex-col items-center justify-center min-w-[64px] h-[60px] cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        
        {copied && (
            <span className="absolute top-20 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-2 px-4 rounded-lg animate-in fade-in slide-in-from-bottom-2 z-30">
              Скопировано!
            </span>
        )}

        <span className={`font-oswald text-xs font-bold uppercase tracking-widest self-start ml-2 mb-4 transition-colors ${
          difficulty === 'Непробиваемый' ? 'text-green-500' : 
          difficulty === 'Надежный' ? 'text-green-400' : 
          difficulty === 'Средний' ? 'text-yellow-500' : 
          difficulty === 'Слабый' ? 'text-red-500' : 'text-neutral-400'
        }`}>
          {difficulty}
        </span>

        {/* Слайдер длины */}
        <div className="w-full mb-6">
          <div className="flex justify-center items-center mb-2 gap-4">
            <span className="font-oswald font-bold uppercase tracking-widest text-sm">Длина</span>
            <span className="font-oswald font-bold text-black border-2 border-black rounded-lg px-3 py-1 text-sm">{length}</span>
          </div>
          <input 
            type="range" min="5" max="25" value={length} 
            onChange={(e) => setLength(parseInt(e.target.value))} 
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>

        {/* Чекбоксы настроек */}
        <div className="w-full space-y-4 mb-8">
          {[
            { id: 'use_digits', label: 'Цифры ' },
            { id: 'use_upper', label: 'Прописные' },
            { id: 'use_special', label: 'Спецсимволы' },
            { id: 'exclude_similar', label: 'Исключить похожие символы' }
          ].map((item) => (
            <label 
              key={item.id} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleSetting(item.id)}
            >
              <div className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-colors ${
                item.id === 'exclude_similar' ? 'rounded-full' : 'rounded-sm'
              } ${settings[item.id] ? 'bg-black' : 'bg-transparent'}`}>
                {settings[item.id] && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span className="font-oswald font-bold uppercase tracking-widest text-sm">{item.label}</span>
            </label>
          ))}
        </div>

        <button onClick={() => setIsSaveModalOpen(true)} className="font-oswald text-xs font-bold uppercase tracking-widest mb-6 text-[16px] cursor-pointer">Сохранить настройку</button>
        <button onClick={handleGenerate} className="font-oswald w-full bg-black text-white py-4 rounded-[2rem] text-[16px] font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all cursor-pointer">Сгенерировать</button>

        {/* Модальное окно для пресета */}
        {isSaveModalOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-[40px]">
            <div className="bg-white p-6 rounded-3xl w-[90%] max-w-[340px] border-2 border-black">
              <h2 className="font-oswald font-bold uppercase mb-4 text-center">Назовите настройку</h2>
              <input 
                autoFocus type="text" value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-full p-3 border-2 border-black rounded-xl mb-4 font-oswald text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => setIsSaveModalOpen(false)} className="flex-1 border-2 border-black py-2 rounded-xl font-oswald font-bold uppercase text-xs">Отмена</button>
                <button onClick={handleSavePreset} className="flex-1 bg-black text-white py-2 rounded-xl font-oswald font-bold uppercase text-xs">Сохранить</button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно для сохранения пароля */}
        {isPasswordModalOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-[40px]">
            <div className="bg-white p-6 rounded-3xl w-[90%] max-w-[340px] border-2 border-black">
              <h2 className="font-oswald font-bold uppercase mb-4 text-center">Сохранить пароль</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="font-oswald text-[10px] uppercase tracking-widest ml-2 mb-1 block">Название</label>
                  <input 
                    autoFocus type="text" value={passwordTitle}
                    onChange={(e) => setPasswordTitle(e.target.value)}
                    placeholder="Напр: Google Account"
                    className="w-full p-3 border-2 border-black rounded-xl font-oswald text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="flex-1 border-2 border-black py-2 rounded-xl font-oswald font-bold uppercase text-xs"
                >
                  Отмена
                </button>
                <button 
                  onClick={confirmSavePassword} 
                  disabled={isSaving}
                  className="flex-1 bg-black text-white py-2 rounded-xl font-oswald font-bold uppercase text-xs disabled:opacity-50"
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Модальное окно успеха */}
        {isSuccessModalOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-[40px] backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl w-[90%] max-w-[340px] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 border-2 border-green-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              
              <h2 className="font-oswald font-bold uppercase mb-2 text-center text-xl tracking-tight">Успешно!</h2>
              <p className="font-oswald text-xs uppercase tracking-widest text-center mb-6 text-neutral-500 leading-relaxed">
                {successMessage}
              </p>

              <button 
                onClick={() => setIsSuccessModalOpen(false)} 
                className="w-full bg-black text-white py-3 rounded-xl font-oswald font-bold uppercase text-sm tracking-[0.2em] shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                Отлично
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default Generator;