export const handleCopy = (text, setCopied) => {
    if (text) {
    navigator.clipboard.writeText(text);
    setCopied(true); 
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }
  };

