import {jwtDecode} from "jwt-decode";

const API_URL = 'http://5.35.93.223:7000/auth/';

export const loginUser = async (login, password) => {
    console.log('Вызов loginUser');
    const response = await fetch(`${API_URL}login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
    });
    if (!response.ok) {
        throw new Error('Ошибка при входе');
    }
    const data = await response.json();

    const userData = decodeJwtToken(data.token)
    localStorage.setItem('userData', JSON.stringify(userData))
    localStorage.setItem('token', data.token);
    return userData;
};

export const registerUser = async (login, password) => {
    console.log('Вызов registerUser');
    const response = await fetch(`${API_URL}register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
    });
    if (!response.ok) {
        throw new Error('Ошибка при регистрации');
    }

    const data = await response.json();
    const userData = decodeJwtToken(data.token)
    localStorage.setItem('userData', JSON.stringify(userData))
    localStorage.setItem('token', data.token)
    return userData;
};

function decodeJwtToken(token) {
    try {
        const decodedToken = jwtDecode(token);
        console.log('Декодированный токен:', decodedToken);
        return decodedToken;
    } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        return null;
    }
}
