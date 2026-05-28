import { useState, useEffect, useRef } from 'react';
import { handleCopy } from '../utils/passwordUtils';
import { decryptPassword } from '../api/api';

const PasswordCard = ({ item, onDelete, masterKey }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [decryptedPassword, setDecryptedPassword] = useState("");
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(false);
    const errorTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        };
    }, []);

    const showError = (msg) => {
        setErrorMessage(msg);
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        errorTimerRef.current = setTimeout(() => setErrorMessage(''), 3500);
    };

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
            showError('Кодовое слово отсутствует');
            return;
        }

        setIsDecrypting(true);
        try {
            const data = await decryptPassword(item.id, masterKey);
            if (data && data.decrypted_password) {
                setDecryptedPassword(data.decrypted_password);
                setIsVisible(true);
                setErrorMessage(''); // Очищаем ошибку при успехе
            } else {
                showError('Не удалось расшифровать');
            }
        } catch (error) {
            // Вместо старого alert() выводим ошибку в наш встроенный UI элемент
            showError(error.message || 'Ошибка доступа');
        } finally {
            setIsDecrypting(false);
        }
    };

    const onCopyClick = () => {
        if (!decryptedPassword) {
            showError('Сначала расшифруйте');
            return;
        }
        handleCopy(decryptedPassword, setCopied);
    };

    return (
        <div className="relative p-4 border-2 border-neutral-100 rounded-3xl group bg-white hover:border-black transition-colors">
            {/* Кнопка удаления */}
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                className="absolute top-3 right-3 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Удалить пароль"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>

            {/* Контент карточки */}
            <div className="flex flex-col gap-1 mb-3 pr-6">
                <span className="font-oswald text-[10px] font-bold uppercase tracking-widest text-neutral-400">Название</span>
                <span className="font-oswald font-bold uppercase text-lg text-neutral-900 leading-tight truncate">{item.title}</span>
            </div>

            {/* Динамическая плашка ошибки (Встроенный блок вывода errorMessage) */}
            {errorMessage && (
                <div className="mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-center">
                    <span className="font-oswald text-[11px] font-bold uppercase tracking-wider text-red-600 animate-pulse">
                        ⚠️ {errorMessage}
                    </span>
                </div>
            )}

            {/* Поле отображения пароля */}
            <div className="flex items-center justify-between gap-2 bg-neutral-50 p-2.5 rounded-2xl border border-neutral-100 h-[46px]">
                <div className="flex-1 font-mono text-sm font-bold text-center tracking-wide truncate px-2 select-all">
                    {isDecrypting ? (
                        <span className="text-neutral-400 animate-pulse font-oswald uppercase text-xs tracking-widest">Дешифрация...</span>
                    ) : isVisible ? (
                        <span className="text-black">{decryptedPassword}</span>
                    ) : (
                        <span className="text-neutral-400 tracking-[0.3em]">••••••••</span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {/* Кнопка Глаз */}
                    <button
                        onClick={toggleVisibility}
                        disabled={isDecrypting}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                        title={isVisible ? "Скрыть" : "Показать"}
                    >
                        {isVisible ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )}
                    </button>

                    {/* Кнопка Скопировать */}
                    <button
                        onClick={onCopyClick}
                        disabled={!isVisible}
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400"
                        title={copied ? "Скопировано!" : "Копировать"}
                    >
                        {copied ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordCard;