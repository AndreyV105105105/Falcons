import { useEffect, useState } from 'react';
import PasswordCard from '../components/PasswordCard';
import { getPasswords, deletePassword } from '../api/api'; //[cite: 4, 8]

const Passwords = ({ setScreen }) => {
    const [passwords, setPasswords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [masterKey, setMasterKey] = useState(""); 
    const [isMasterKeyModalOpen, setIsMasterKeyModalOpen] = useState(false);
    const [tempMasterKey, setTempMasterKey] = useState("");

        useEffect(() => {
        let key = localStorage.getItem('masterKey');
        
        if (!key) {
            setIsMasterKeyModalOpen(true);
        } else {
            setMasterKey(key);
            fetchPasswords();
        }
    }, []);

    const fetchPasswords = async () => {
        setLoading(true);
        try {
            const data = await getPasswords();
            setPasswords(data.passwords || []); 
        } catch (error) {
            console.error("Ошибка при загрузке паролей:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMasterKeySubmit = () => {
        if (!tempMasterKey) {
            alert("Пожалуйста, введите кодовое слово");
            return;
        }
        localStorage.setItem('masterKey', tempMasterKey);
        setMasterKey(tempMasterKey);
        setIsMasterKeyModalOpen(false);
        fetchPasswords();
    };

    const handleDelete = async (passwordId) => {
        if (!window.confirm("Удалить этот пароль?")) return;

        try {
            await deletePassword(passwordId); 
            setPasswords(prev => prev.filter(p => p.id !== passwordId));
        } catch (error) {
            console.error("Ошибка при удалении пароля:", error);
            alert("Не удалось удалить пароль");
        }
    };

    return (
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
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                        <span className="font-oswald uppercase tracking-widest text-sm text-center px-4">Загрузка...</span>
                    </div>
                ) : passwords.length > 0 ? (
                    passwords.map((item) => (
                        <PasswordCard 
                            key={item.id} 
                            item={item} 
                            onDelete={handleDelete}
                            // Передаем мастер-ключ, чтобы карточка могла выполнить decrypt[cite: 6, 8]
                            masterKey={masterKey} 
                        />
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-3xl text-neutral-400">
                        <span className="font-oswald uppercase tracking-widest text-sm text-center px-4">Список пуст</span>
                    </div>
                )}
            </div>

            {/* Модальное окно для ввода кодового слова */}
            {isMasterKeyModalOpen && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white p-6 rounded-3xl w-[90%] max-w-[340px] border-2 border-black">
                        <h2 className="font-oswald font-bold uppercase mb-4 text-center">Доступ к паролям</h2>
                        <p className="font-oswald text-[10px] uppercase tracking-widest text-center mb-4 text-neutral-500">
                            Введите ваше кодовое слово для расшифровки
                        </p>
                        <input 
                            autoFocus type="password" value={tempMasterKey}
                            onChange={(e) => setTempMasterKey(e.target.value)}
                            placeholder="Кодовое слово"
                            className="w-full p-3 border-2 border-black rounded-xl mb-4 font-oswald text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleMasterKeySubmit()}
                        />
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setScreen('generator')} 
                                className="flex-1 border-2 border-black py-2 rounded-xl font-oswald font-bold uppercase text-[10px] tracking-widest"
                            >
                                Назад
                            </button>
                            <button 
                                onClick={handleMasterKeySubmit} 
                                className="flex-1 bg-black text-white py-2 rounded-xl font-oswald font-bold uppercase text-[10px] tracking-widest"
                            >
                                Войти
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Passwords;