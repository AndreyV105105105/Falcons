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
            setDecryptedPassword(data.decrypted_password);
            setIsVisible(true);
        } catch (error) {
            showError(error.message || 'Неверное кодовое слово');
        } finally {
            setIsDecrypting(false);
        }
    };

    const onCopyClick = () => {
        const passToCopy = decryptedPassword || 'Сначала расшифруйте';
        handleCopy(passToCopy, setCopied);
    };

    return (
        <div className="relative p-4 border-2 border-neutral-100 rounded-3xl group bg-white">

            {/* Кастомный попап ошибки */}
            {errorMessage && (
                <div
                    className="absolute -top-14 left-1/2 z-50 animate-error-popup"
                    style={{
                        transform: 'translateX(-50%)',
                        animation: 'errorPopup 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1515 100%)',
                            border: '1.5px solid rgba(239,68,68,0.5)',
                            borderRadius: '14px',
                            padding: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 32px rgba(239,68,68,0.25), 0 2px 8px rgba(0,0,0,0.4)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {/* Иконка замка с крестиком */}
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'rgba(239,68,68,0.15)',
                            border: '1.5px solid rgba(239,68,68,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </div>
                        <span style={{
                            fontFamily: 'Oswald, sans-serif',
                            fontWeight: 700,
                            fontSize: '10px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#fca5a5',
                        }}>
                            {errorMessage}
                        </span>
                        {/* Прогресс-бар */}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            height: '2px',
                            borderRadius: '0 0 14px 14px',
                            background: 'rgba(239,68,68,0.7)',
                            animation: 'errorProgress 3.5s linear forwards',
                            width: '100%',
                        }}/>
                    </div>
                    {/* Стрелочка */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid rgba(239,68,68,0.5)',
                    }}/>
                </div>
            )}

            {/* Кнопка удаления */}
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="absolute top-2 right-2 text-neutral-400 hover:text-red-500"
            />

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-oswald font-bold uppercase text-sm tracking-wide">{item.title}</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={toggleVisibility}
                        disabled={isDecrypting}
                        className="p-2 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        title="Показать пароль"
                    >
                        {isDecrypting ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            </svg>
                        ) : isVisible ? (
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
                    isVisible ? decryptedPassword : '••••••••••••'
                )}
            </div>

            <style>{`
                @keyframes errorPopup {
                    from { opacity: 0; transform: translateX(-50%) translateY(6px) scale(0.92); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0)  scale(1); }
                }
                @keyframes errorProgress {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
        </div>
    );
};

export default PasswordCard;