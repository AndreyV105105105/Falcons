import PresetCard from '../components/PresetCard';

import { useEffect, useState } from 'react';
import { getPresets } from '../api/api';

const Presets = ({ setScreen, onApply }) => {
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchPresets = async () => {
        try {
            const data = await getPresets();
            console.log("Данные с бэкенда:", data); // Посмотрите это в консоли браузера (F12)
            
            // Если в консоли вы видите { presets: [...] }, то нужно писать:
            // setPresets(data.presets || data); 
            setPresets(data); 
        } catch (error) {
            console.error("Error loading presets:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchPresets();
}, []);

    return (
        <div className="bg-white p-6 rounded-[40px] shadow-2xl w-full max-w-sm border border-neutral-200">
            <h1 className="font-oswald text-2xl mb-6 uppercase">Мои настройки</h1>
            
            {loading ? (
                <p className="text-center font-oswald uppercase text-sm">Загрузка...</p>
            ) : presets.length === 0 ? (
                <p className="text-center text-neutral-400 py-4">У вас пока нет пресетов</p>
            ) : (
                <div className="space-y-4">
                    {presets.map((preset) => (
                        <div 
                            key={preset.id} 
                            onClick={() => onApply(preset)}
                            className="p-4 border-2 border-black rounded-2xl cursor-pointer hover:bg-neutral-50 transition-all"
                        >
                            <h3 className="font-oswald font-bold uppercase">{preset.profile_name}</h3>
                            <p className="font-oswald text-xs text-neutral-500 uppercase tracking-widest">
                                Длина: <span className="font-bold text-black">{preset.password_length}</span>
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {preset.use_numbers && (
                                    <span className="font-oswald text-[10px] bg-neutral-100 px-2 py-1 rounded-md font-bold uppercase">
                                        Цифры
                                    </span>
                                )}
                                {preset.use_uppercase && (
                                    <span className="font-oswald text-[10px] bg-neutral-100 px-2 py-1 rounded-md font-bold uppercase">
                                        Прописные
                                    </span>
                                )}
                                {preset.use_symbols && (
                                    <span className="font-oswald text-[10px] bg-neutral-100 px-2 py-1 rounded-md font-bold uppercase">
                                        Спецсимволы
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <button 
                onClick={() => setScreen('generator')}
                className="mt-6 w-full border-2 border-black py-3 rounded-2xl font-oswald font-bold uppercase text-sm"
            >
                Назад
            </button>
        </div>
    );
};

export default Presets;