const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

const authRequest = async (endpoint, email, password, keyword) => {
    try {
        const response = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, keyword: keyword }),
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
  return await response.json(); 
};

export const registerUser = (email, password, masterKey) => {
    return authRequest('/auth/register', email, password, masterKey);
};

export const loginUser = (email, password) => {
    return authRequest('/auth/login', email, password);
};

export const getPasswords = async () => {
    const response = await fetch(`${API_GATEWAY_URL}/passwords/get`, {
        method: 'GET', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
  
    if (!response.ok) throw new Error('Failed to fetch passwords');
    
    const data = await response.json();
    return data;
};

export const savePassword = async (passwordData) => {
    const response = await fetch(`${API_GATEWAY_URL}/passwords/save`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(passwordData) 
    });
  
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сохранения');
    }
    return await response.json();
};

export const deletePassword = async (passwordId) => {
    const response = await fetch(`${API_GATEWAY_URL}/passwords/delete`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ password_id: passwordId })
    });

    if (!response.ok) throw new Error('Failed to delete preset');
};

export const decryptPassword = async (passwordId, masterKey) => {
    const response = await fetch(`${API_GATEWAY_URL}/passwords/decrypt`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
            password_id: passwordId, 
            keyword: masterKey 
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ошибка доступа');
    return data;
};

export const savePreset = async (settings) => {
    const response = await fetch(`${API_GATEWAY_URL}/presets/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(settings)
  });
  
  if (!response.ok) throw new Error('Failed to save preset');
  return await response.json();
};

export const deletePreset = async (presetId) => {
    const response = await fetch(`${API_GATEWAY_URL}/presets/delete`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ preset_id: presetId })
    });

    if (!response.ok) throw new Error('Failed to delete preset');
};

export const getPresets = async () => {
    const response = await fetch(`${API_GATEWAY_URL}/presets/get`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!response.ok) throw new Error('Failed to fetch presets');
    const data = await response.json();
    return data.presets;
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('masterKey');
};
