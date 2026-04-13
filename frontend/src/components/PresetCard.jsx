const PresetCard = ({ item, onApply }) => {
  return (
    <div className="p-4 border-2 border-neutral-100 rounded-3xl hover:border-black transition-colors group bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-oswald font-bold uppercase text-sm tracking-wide">{item.name}</h3>
          <p className="text-[10px] text-neutral-400 font-bold tracking-widest">
            <span className='uppercase'>Длина:</span> {item.length} • {item.lowercase ? 'abc' : ''} {item.uppercase ? 'ABC' : ''} {item.symbols ? '#$%' : ''}
          </p>
        </div>
      </div>
      <button
        onClick={() => onApply(item)}
        className="w-full font-oswald border-2 border-black py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all cursor-pointer"
      >
        Применить настройку
      </button>
    </div>
  );
};

export default PresetCard;