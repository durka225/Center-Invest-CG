import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = (props) => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [surname,setSurname] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [login, setLogin] = useState('');
  const errors = {
    emailError: "Пожалуйста введите свою почту",
    emailCorrectError: "Пожалуйста введите правильный адрес эл.почты",
    
    surnameError: "Фамилия пользователя должна содержать более 3 символов",
    patronymicError: "Отчество пользователя должно содержать более 3 символов",

    usernameError: "Пожалуйста введите имя пользователя",
    usernameLengthError:"Имя пользователя должно содержать более 3 символов",
    
    passwordError: "Пожалуйста введите пароль",
    rePasswordError: "Пожалуйста введите повторно пароль",
    passwordLengthError:"Пароль должен состоять из 8 и более символов",
    correspondsPasswords: "Пароли не совпадают",
  }
  const [rePasswordError, setRePasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [surnameError, setSurnameError] = useState('');
  const [patronymicError, setPatronymicError] = useState('');

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
    setSurnameError('');
    setPatronymicError('');

    if (username.trim() === '') {
      setUsernameError(errors.usernameError);
      return;
    }

    if (surname.length < 3) {
      setSurnameError(errors.surnameError);
      return;
    }

    if (username.length < 3) {
      setUsernameError(errors.usernameLengthError);
      return;
    }

    if (patronymic.length < 3) {
      setPatronymicError(errors.patronymicError);
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
          placeholder="Введите имя"
          onChange={(ev) => setUsername(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{usernameError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={surname}
          placeholder="Введите фамилию"
          onChange={(ev) => setSurname(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{surnameError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={patronymic}
          placeholder="Введите отчество"
          onChange={(ev) => setPatronymic(ev.target.value)}
          className={'inputBox'}
        />
        <label className="errorLabel">{patronymicError}</label>
      </div>
      <br />
      <div className={'inputContainer'}>
        <input
          value={login}
          placeholder="Введите логин"
          onChange={(ev) => setLogin(ev.target.value)}
          className={'inputBox'}
        />
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