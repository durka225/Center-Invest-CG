import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = (props) => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const errors = {
    emailError: "Пожалуйста введите свою почту",
    emailCorrectError: "Пожалуйста введите правильный адрес эл.почты",
    
    usernameError: "Пожалуйста введите имя пользователя",
    usernameLengthError:"Имя пользователя должно содержать более 3 символов",
    
    passwordError: "Пожалуйста введите пароль",
    rePasswordError: "Пожалуйста введите повторно пароль",
    passwordLengthError:"Пароль должен состоять из 8 и более символов",
    correspondsPasswords: "Пароли не совпадают",
  }

  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rePasswordError, setRePasswordError] = useState('');

  const navigate = useNavigate();

  const onButtonClickBack = () => {
    window.history.go(-1);
    return false;
  };

  const onButtonClick = () => {
    setRePasswordError('');
    setEmailError('');
    setPasswordError('');
    setUsernameError('');

    if (username.trim() === '') {
      setUsernameError(errors.usernameError);
      return;
    }

    if (username.length < 3) {
      setUsernameError(errors.usernameLengthError);
      return;
    }

    if (email.trim() === '') {
      setEmailError(errors.emailError);
      return;
    }

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError(errors.emailCorrectError);
      return;
    }

    if (password.trim() === '') {
      setPasswordError(errors.passwordError);
      return;
    }

    if (password.length < 8) {
      setPasswordError(errors.passwordLengthError);
      return;
    }

    if (rePassword.trim() === '') {
      setRePasswordError(errors.rePasswordError);
      return;
    } 

    if (password !== rePassword) {
      setRePasswordError(errors.correspondsPasswords);
      return;
    }
    alert('Регистрация прошла успешно');
    navigate('/toDoList');
  };

  return (
    <div className={'mainContainer'}>
      <div className={'titleContainer'}>
        <div>Регистрация</div>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={username}
          placeholder="Введите имя пользователя"
          onChange={(ev) => setUsername(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{usernameError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={email}
          placeholder="Введите адрес эл.почты"
          onChange={(ev) => setEmail(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{emailError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={password}
          placeholder="Введите пароль"
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          className={'inputBox'}
        />
        <label className="errorLabel">{passwordError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={rePassword}
          placeholder="Повторно введите пароль"
          onChange={(ev) => setRePassword(ev.target.value)}
          type="password"
          className={'inputBox'}
        />
        <label className="errorLabel">{rePasswordError}</label>
      </div>
      <div className={'buttonContainer'}>
        <input
          className={'button'}
          type="button"
          onClick={onButtonClick}
          value={'Зарегистрироваться'}
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

export default Registration;