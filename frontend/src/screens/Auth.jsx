import { useState } from "react";
import { loginUser } from "../api/api";

const Auth = ({authInputStyle, setScreen}) => {
    const [login, setLogin] = useState();
        const [password, setPassword] = useState();
        const [loading, setLoading] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
    
        const handleLogin = async () => {
            setLoading(true);
            try {
                const response = await loginUser(login, password);
                if (response.token) {
                    localStorage.setItem('jwt_token', response.token);
                        setScreen('generator');
                }
            } catch (err) {
                alert(err.message);
            } finally {
                setLoading(false);
            }
        };
    return (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col items-center border border-neutral-200">
            <h1 className="font-oswald text-[32px] mb-10 uppercase tracking-tighter leading-none">Личный кабинет</h1>
            <div className="w-full space-y-3">
                <input type="text" placeholder="ЛОГИН" className={authInputStyle} onChange={(evt) => setLogin(evt.target.value)}/>
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
            </div>
            <button
            disabled={loading} 
            onClick={handleLogin}
            className={loading ? "opacity-50 font-oswald w-full bg-black text-white py-5 rounded-2xl mt-10 text-base font-bold uppercase hover:bg-neutral-800 active:scale-95 transition-all tracking-widest" : "font-oswald w-full bg-black text-white py-5 rounded-2xl mt-10 text-base font-bold uppercase hover:bg-neutral-800 active:scale-95 transition-all tracking-widest cursor-pointer"}
            >
            Войти
            </button>
            <button 
            onClick={() => setScreen('registration')}
            className="mt-6 font-oswald text-base font-bold uppercase tracking-widest cursor-pointer" 
            >
            Регистрация
            </button>
        </div>
    )
}

export default Auth;