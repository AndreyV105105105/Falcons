const Auth = ({authInputStyle, setScreen}) => {
    return (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm flex flex-col items-center border border-neutral-200">
            <h1 className="font-oswald text-[32px] mb-10 uppercase tracking-tighter leading-none">Личный кабинет</h1>
            <div className="w-full space-y-3">
            <input type="text" placeholder="ЛОГИН" className={authInputStyle} />
            <input type="password" placeholder="ПАРОЛЬ" className={authInputStyle} />
            </div>
            <button 
            onClick={() => setScreen('generator')}
            className="font-oswald w-full bg-black text-white py-5 rounded-2xl mt-10 text-base font-bold uppercase hover:bg-neutral-800 active:scale-95 transition-all tracking-widest cursor-pointer"
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