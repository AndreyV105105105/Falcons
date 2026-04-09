const API_GATEWAY_URL = 'https://d5d5sl318gmabr3ciul9.z7jmlavt.apigw.yandexcloud.net';

const authRequest = async (endpoint, login, password) => {
    try {
        const response = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({ login, password }),
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

export const registerUser = (login, password) => {
    return authRequest('/auth/register', login, password);
};

export const loginUser = (login, password) => {
    return authRequest('/auth/login', login, password);
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('iserId');
};
