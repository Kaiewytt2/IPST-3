import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuth from '../useAuth';
import { loginUser, registerUser } from '../api';

const Start = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoginForm, setIsLoginForm] = useState(true); // Состояние для переключения между формами
    const { login: handleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Вызов handleSubmit');
        if (!login || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        try {
            const userData = isLoginForm ? await loginUser(login, password) : await registerUser(login, password);
            console.log('Получены данные пользователя:', userData);
            handleLogin(userData);
            navigate('/home');
        } catch (error) {
            console.error('Ошибка при входе или регистрации:', error);
            alert('Ошибка при входе или регистрации. Пожалуйста, попробуйте еще раз.');
        }
    };

    const toggleForm = () => {
        setIsLoginForm(!isLoginForm);
    };

    return (
        <Container maxWidth="xs">
            <Typography variant="h4" align="center" gutterBottom>
                {isLoginForm ? 'Форма авторизации' : 'Форма регистрации'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Логин"
                    fullWidth
                    margin="normal"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <TextField
                    label="Пароль"
                    fullWidth
                    margin="normal"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                </Button>
                <Button variant="contained" color="primary" fullWidth type="submit">
                    {isLoginForm ? 'Войти' : 'Зарегистрироваться'}
                </Button>
                <Button variant="text" color="secondary" fullWidth onClick={toggleForm}>
                    {isLoginForm ? 'Зарегистрироваться' : 'Войти'}
                </Button>
            </form>
        </Container>
    );
};

export default Start;