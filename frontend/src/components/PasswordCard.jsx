import { useState } from 'react';
import { handleCopy } from '../utils/passwordUtils';
import { decryptPassword } from '../api/api';

const PasswordCard = ({ item, onDelete, masterKey }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [decryptedPassword, setDecryptedPassword] = useState(""); // Состояние для расшифрованного пароля
    const [copied, setCopied] = useState(false);

    const toggleVisibility = async () => {
            if (isVisible) {
                setIsVisible(false);
                return;
            }
    
            if (decryptedPassword) {
                setIsVisible(true);
                return;
            }
    
            if (!masterKey) {
                alert("Кодовое слово отсутствует!");
                return;
            }
    
            try {
                const data = await decryptPassword(item.id, masterKey);
                setDecryptedPassword(data.decrypted_password); 
                setIsVisible(true);
            } catch (error) {
                alert("Ошибка: " + error.message);
            }
        };

    const onCopyClick = () => {
        const passToCopy = decryptedPassword || "Сначала расшифруйте";
        handleCopy(passToCopy, setCopied);
    };

    return (
        <div className="relative p-4 border-2 border-neutral-100 rounded-3xl group bg-white">
            {/* Кнопка удаления */}
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500">
                {/* SVG крестика */}
            </button>

            <div className="flex justify-between items-start mb-2">
                <div>
                    {/* Исправлено на title */}
                    <h3 className="font-oswald font-bold uppercase text-sm tracking-wide">{item.title}</h3>
                </div>
                <div className="flex gap-2">
                <button
                    onClick={toggleVisibility}
                    className="p-2 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors cursor-pointer"
                    title="Показать пароль"
                >
                    {isVisible ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                </button>

                <button 
                    onClick={onCopyClick} 
                    className="p-2 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors cursor-pointer"
                    title="Копировать"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </div>
            </div>

            <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100 font-mono text-xs font-bold text-center tracking-widest text-neutral-600 flex items-center justify-center min-h-[34px]">
                {copied ? (
                    <span className="text-green-500 font-sans uppercase text-[10px] tracking-widest">Скопировано!</span>
                ) : (
                    isVisible ? decryptedPassword : "••••••••••••"
                )}
            </div>
        </div>
    );
};

export default PasswordCard;