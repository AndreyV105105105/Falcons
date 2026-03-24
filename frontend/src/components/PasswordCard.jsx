import { useState } from 'react';
import { handleCopy } from '../utils/passwordUtils';

const PasswordCard = ({ item }) => {
  const [isVisible, setIsVisible] = useState(false);

  const [copied, setCopied] = useState(false);
    const onCopyClick = () => {
        handleCopy(item.pass, setCopied);
    };

  return (
    <div className="p-4 border-2 border-neutral-100 rounded-3xl hover:border-black transition-colors group bg-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-oswald font-bold uppercase text-sm tracking-wide">{item.service}</h3>
          <p className="text-[10px] text-neutral-400 font-bold">{item.date}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 bg-neutral-50 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer text-neutral-600"
          >
            {isVisible ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>

          {copied && (
              <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
                <div className="bg-black text-white text-xs py-2 px-4 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                  Скопировано!
                </div>
              </div>
          )}

          <button onClick={onCopyClick} className="p-2 bg-neutral-50 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          
        </div>
      </div>
      <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100 font-mono text-xs font-bold text-center tracking-widest text-neutral-600 min-h-[34px] flex items-center justify-center">
        {isVisible ? item.pass : "••••••••••••"}
      </div>
    </div>
  );
};

export default PasswordCard;