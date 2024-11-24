import React from 'react'
import { useNavigate } from 'react-router-dom'
        
const Home = (props) => {
    const { loggedIn, email } = props
    const navigate = useNavigate();
    
    const onButtonClickRegistration = () => {
        navigate("/registration")
    }
    const onButtonClick = () => {
        if (loggedIn) {
            localStorage.removeItem("user")
            props.setLoggedIn(false)
        } else {
            navigate("/login")
        }
    }

  return (
    <div className="mainContainer">
      <div className={'titleContainer'}>
        <div>Сервис для управления задачами</div>
        <div>и анализа нагрузки студентов</div>
      </div>
      <div className="authContainer">Для продолжения необходимо авторизоваться.</div>
      <div className={'buttonContainer'}>
        <input
          className={'mainButton'}
          onClick={onButtonClick}
          value={loggedIn ? 'Выйти' : 'Авторизоваться'}
        />
      </div>
      <div className={'buttonContainer'}>
        <input
          className={'mainButton'}
          onClick={onButtonClickRegistration}
          value={loggedIn ? 'Выйти' : 'Зарегистрироваться'}
        />
      </div>
    </div>
  )
}

export default Home