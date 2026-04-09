import { useState } from "react";
import { registerUser } from "../api/api";

const Registration = ({authInputStyle, setScreen}) => {
    const [login, setLogin] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        setLoading(true);
        try {
            await registerUser(login, password);
            setScreen('generator'); 
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col items-center border border-neutral-200">
            <h1 className="font-oswald text-[32px] mb-10 uppercase tracking-tighter leading-none text-center">Регистрация</h1>
            <div className="w-full space-y-3">
                <input type="text" placeholder="ЛОГИН" className={authInputStyle} onChange={(e) => setLogin(e.target.value)} />
                <input type="password" placeholder="ПАРОЛЬ" className={authInputStyle} onChange={(e) => setPassword(e.target.value)}/>
                
            </div>
            <button 
            disabled={loading}
            onClick={handleRegister}
            className={loading ? "opacity-50 font-oswald w-full bg-black text-white py-5 rounded-2xl mt-10 text-base font-bold uppercase hover:bg-neutral-800 active:scale-95 transition-all tracking-widest": "font-oswald w-full bg-black text-white py-5 rounded-2xl mt-10 text-base font-bold uppercase hover:bg-neutral-800 active:scale-95 transition-all tracking-widest cursor-pointer"}
            >
            Зарегистрироваться
            </button>
        </div>
    )
}

export default Registration;