import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = (props) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const navigate = useNavigate()
  const onButtonClickBack = () => {
    window.history.go(-1); 
    return false;
  }
  const onButtonClick = () => {

    setEmailError('')
    setPasswordError('')
  
    if ('' === email) {
      setEmailError('Пожалуйста введите свою почту')
      return
    }
  
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError('Пожалуйста введите правильный адресс эл.почты')
      return
    }
  
    if ('' === password) {
      setPasswordError('Пожалуйста введите пароль')
      return
    }
  
    /*if (password.length < 7) {
      setPasswordError('Пароль должен состоять из 8 и более')
      return
    }*/

    navigate('/toDoList')
  }

  return (
    <div className={'mainContainer'}>
      <div className={'titleContainer'}>
        <div>Авторизация</div>
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
      <div className={'buttonContainer'}>
        <input className={'button'} type="button" onClick={onButtonClick} value={'Войти'} />
      </div>
      <div className={'buttonAuthBack'}>
        <input className={'button'} type="button" onClick={onButtonClickBack} value={'Назад'} />
      </div>
    </div>
  )
}

export default Login