import { useState } from "react";
import { registerUser } from "../api/api";

const Registration = ({authInputStyle, setScreen, setGlobalMasterKey}) => {
    const [login, setLogin] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [masterKey, setMasterKey] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!masterKey.trim()) {
            alert("Пожалуйста, придумайте секретное слово. Оно нужно для защиты ваших паролей!");
            return;
        }

        setLoading(true);
        try {
            const response = await registerUser(login, password, masterKey);
            if (response.token) {
                localStorage.setItem('jwt_token', response.token);
                if (setGlobalMasterKey) {
                    setGlobalMasterKey(masterKey);
                }
                setScreen('generator');
            } 
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col items-center border border-neutral-200">
            <button 
                onClick={() => setScreen('auth')} 
                className="absolute top-6 right-6 font-oswald font-bold uppercase text-[10px] tracking-widest border-2 border-black rounded-xl px-3 py-2 hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
                Назад
            </button>
            <h1 className="font-oswald text-[32px] mb-10 uppercase tracking-tighter leading-none text-center">Регистрация</h1>
            
            <div className="w-full space-y-3">
                {/* Поле Логин */}
                <input 
                    type="text" 
                    placeholder="ЛОГИН" 
                    className={authInputStyle} 
                    onChange={(e) => setLogin(e.target.value)} 
                />

                {/* Поле Пароль */}
                <div className="relative w-full">
                    <input
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ПАРОЛЬ"
                        className={authInputStyle}
                    />
                
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black transition-colors"
                    >
                        {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                    </button>
                </div>

                {/* НОВОЕ: Поле Секретное слово */}
                <div className="pt-2">
                    <p className="text-[10px] font-oswald font-bold text-neutral-400 mb-1 uppercase tracking-wider px-2">
                        Секретное слово (для шифрования)
                    </p>
                    <input 
                        type="password" 
                        placeholder="ПРИДУМАЙТЕ СЕКРЕТНОЕ СЛОВО" 
                        className={`${authInputStyle} border-orange-200 focus:border-orange-500`} 
                        value={masterKey}
                        onChange={(e) => setMasterKey(e.target.value)} 
                    />
                    <p className="text-[9px] text-neutral-400 px-2 mt-1 leading-tight">
                        * Запомните его. Без него нельзя будет посмотреть сохраненные пароли.
                    </p>
                </div>
            </div>

            <button 
                disabled={loading}
                onClick={handleRegister}
                className={loading 
                    ? "opacity-50 font-oswald w-full bg-black text-white py-5 rounded-2xl mt-8 text-base font-bold uppercase transition-all tracking-widest"
                    : "font-oswald w-full bg-black text-white py-5 rounded-2xl mt-8 text-base font-bold uppercase hover:bg-neutral-800 active:scale-95 transition-all tracking-widest cursor-pointer"
                }
            >
                {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
        </div>
    );
};

export default Registration;