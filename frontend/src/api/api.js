const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

const authRequest = async (endpoint, email, password) => {
    try {
        const response = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
        }

        return data;

    } catch (error) {
        console.error(`API Error at ${endpoint}:`, error.message);
        throw error;
    }
};

export const getPassword = async (settings) => {
  const response = await fetch(`${API_GATEWAY_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  
  if (!response.ok) throw new Error('Generation failed');
  return await response.json(); // Returns {password: "...", entropy: {...}}
};

export const registerUser = (email, password) => {
    return authRequest('/register', email, password);
};

export const loginUser = (email, password) => {
    return authRequest('/login', email, password);
};

export const savePreset = async (settings) => {
    const response = await fetch(`${API_GATEWAY_URL}/preset/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(settings)
  });
  
  if (!response.ok) throw new Error('Failed to save preset');
  return await response.json();
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
};
