export const generatePassword = (length, settings) => {
    let charset = "";
    const characters = {
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        numbers: "0123456789",
        symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
    };

    if (settings.lowercase) charset += characters.lowercase;
    if (settings.uppercase) charset += characters.uppercase;
    if (settings.symbols) charset += characters.symbols;
    charset += characters.numbers;

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

export const handleCopy = (text, setCopied) => {
    if (text) {
    navigator.clipboard.writeText(text);
    setCopied(true); 
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }
  };

