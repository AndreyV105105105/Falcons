import PresetCard from '../components/PresetCard';

const Presets = ({setScreen, onApply, savedPresets}) => {
    return (
        <div className="bg-white p-6 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col border border-neutral-200 min-h-[600px]">
            <div className="flex justify-between items-center mb-8">
            <h1 className="font-oswald text-[28px] font-bold uppercase tracking-tighter">Мои настройки</h1>
            <button 
                onClick={() => setScreen('generator')} 
                className="font-oswald font-bold uppercase text-[10px] tracking-widest border-2 border-black rounded-xl px-3 py-2 cursor-pointer"
            >
                Назад
            </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {savedPresets.map((preset) => (
                <PresetCard key={preset.id} item={preset} onApply={onApply} />
            ))}
            </div>

            <button className="mt-6 font-oswald w-full bg-black text-white py-4 rounded-3xl text-sm font-bold uppercase tracking-widest shadow-lg hover:bg-neutral-800 transition-all cursor-pointer">
            Создать новую настройку
            </button>
        </div>
    )
}

export default Presets;