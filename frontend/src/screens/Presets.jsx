import { useEffect, useState } from 'react';
import { getPresets, deletePreset } from '../api/api';

const Presets = ({ setScreen, onApply }) => {
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const data = await getPresets();
                setPresets(data.presets || data); 
            } catch (error) {
                console.error("Error loading presets:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPresets();
    }, []);

    const handleDelete = async (e, presetId) => {
        e.stopPropagation();
        
        try {
            await deletePreset(presetId); 
            setPresets(prev => prev.filter(p => p.id !== presetId)); 
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };
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
                            className="relative p-4 border-2 border-black rounded-2xl cursor-pointer hover:bg-neutral-50 transition-all group"
                        >
                            <button
                                onClick={(e) => handleDelete(e, preset.id)}
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white border border-neutral-200 rounded-full text-neutral-400 hover:text-red-500 hover:border-red-500 transition-colors z-10"
                                title="Удалить"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>

                            <h3 className="font-oswald font-bold uppercase pr-6">{preset.profile_name}</h3>
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