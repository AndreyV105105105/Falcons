import PasswordCard from '../components/PasswordCard';

const Passwords = ({setScreen, savedPasswords}) => {
    return(
        <div className="bg-white p-6 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col border border-neutral-200 min-h-[600px]">
        
            <div className="flex justify-between items-center mb-6">
            <h1 className="font-oswald text-[28px] font-bold uppercase tracking-tighter">Мои пароли</h1>
            <button 
                onClick={() => setScreen('generator')} 
                className="font-oswald font-bold uppercase text-[10px] tracking-widest border-2 border-black rounded-xl px-3 py-2 hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
                Назад
            </button>
            </div>
        

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {savedPasswords.length > 0 ? (
                savedPasswords.map((item) => (
                <PasswordCard key={item.id} item={item} />
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-3xl text-neutral-400">
                <span className="font-oswald uppercase tracking-widest text-sm text-center px-4">Список пуст</span>
                </div>
            )}
            </div>
        </div>
    )
}

export default Passwords;