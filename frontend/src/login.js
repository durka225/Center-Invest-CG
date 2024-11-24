import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const navigate = useNavigate();  // Инициализируем хук navigate

  const onButtonClickBack = () => {
    window.history.go(-1); 
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setPasswordError('');
    setUsernameError('');

    if (username === '') {
      setUsernameError('Пожалуйста введите логин');
      return;
    }

    if (password === '') {
      setPasswordError('Пожалуйста введите пароль');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', {
          username,
          password
      });
      const token = response.data.access_token;
      console.log("Метка")
      localStorage.setItem('token', token);  // Сохраняем токен в localStorage
      console.log("Метка 1")  // Локальное сохранение, если нужно
      console.log("Метка 2")
      navigate('/profile');  // Перенаправляем на страницу профиля
  } catch (error) {
      alert('Ошибка входа');
  }
  };

  return (
    <div className={'mainContainer'}>
      <div className={'titleContainer'}>
        <div>Авторизация</div>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          type="text"
          placeholder="Введите логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{usernameError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{passwordError}</label>
      </div>
      <br />
      <div className={'buttonContainer'}>
        <input
          className={'button'}
          type="button"
          onClick={handleSubmit}
          value={'Войти'}
        />
      </div>
      <div className={'buttonAuthBack'}>
        <input
          className={'button'}
          type="button"
          onClick={onButtonClickBack}
          value={'Назад'}
        />
      </div>
    </div>
  );
};

export default Login;
