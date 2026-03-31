import { useState } from "react";
import { registerUser } from "../api/api";

const Registration = ({authInputStyle, setScreen}) => {
    const [login, setLogin] = useState();
    const [password, setPassword] = useState();

    const handleRegister = async () => {
        try {
            await registerUser(login, password);
            setScreen('generator'); 
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col items-center border border-neutral-200">
            <h1 className="font-oswald text-[32px] mb-10 uppercase tracking-tighter leading-none text-center">Регистрация</h1>
            <div className="w-full space-y-3">
                <input type="text" placeholder="ЛОГИН" className={authInputStyle} onChange={(evt) => setLogin(evt.target.value)} />
                <input type="password" placeholder="ПАРОЛЬ" className={authInputStyle} onChange={(evt) => setPassword(evt.target.value)}/>
                
            </div>
            <button 
            onClick={handleRegister}
            className="font-oswald w-full bg-black text-white py-5 rounded-2xl mt-10 text-base font-bold uppercase hover:bg-neutral-800 active:scale-95 transition-all tracking-widest cursor-pointer"
            >
            Регистрация
            </button>
        </div>
    )
}

export default Registration;