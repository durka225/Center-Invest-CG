import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './profile.css'; // Подключаем стили из CSS-файла
import { useNavigate } from 'react-router-dom';

const Profile = ({ token }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние для открытия меню
  const [isEditing, setIsEditing] = useState(false); // Режим редактирования
  const [profileData, setProfileData] = useState(null); // Данные профиля
  const [editData, setEditData] = useState({}); // Данные для редактирования
  const navigate = useNavigate();

  // Загрузка данных профиля
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfileData(response.data);
        setEditData({
          firstName: response.data.name || '',
          lastName: response.data.lastname || '',
          email: response.data.email || '',
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        alert('Не удалось загрузить данные профиля');
        if (error.response?.status === 401) {
          navigate('/login'); // Перенаправление на вход при ошибке авторизации
        }
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token, navigate]);

  // Сохранение данных профиля
  const saveProfile = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/update_profile',
        {
          first_name: editData.firstName,
          last_name: editData.lastName,
          email: editData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setProfileData({
          ...profileData,
          name: editData.firstName,
          lastname: editData.lastName,
          email: editData.email,
        });
        setIsEditing(false); // Выход из режима редактирования
      }
    } catch (error) {
      console.error('Ошибка сохранения профиля:', error);
      alert('Не удалось сохранить изменения');
    }
  };

  // Выход из аккаунта
  const handleLogout = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        navigate('/login'); // Перенаправление на страницу входа
        console.log('Выход выполнен');
      }
    } catch (error) {
      console.error('Ошибка выхода из аккаунта:', error);
      alert('Не удалось выполнить выход');
    }
  };

  const toTasks = () => navigate('/tasks');
  const toLoads = () => navigate('/toDoList');
  const toProfile = () => navigate('/profile');

  if (!profileData) {
    return <div>Загрузка...</div>; // Показ загрузки, пока данные не получены
  }

  return (
    <div className="page" style={{ background: 'linear-gradient(to bottom, #a6c0fe, #f68084)' }}>
      <div className="container">
        <h2 className="title" style={{ color: 'black' }}>Профиль пользователя</h2>

        {/* Аватар пользователя */}
        <div className="avatarContainer">
          <img
            src={profileData.avatar || 'https://ey.kommersant.ru/wp-content/uploads/sites/3/2023/03/unknownspeaker.jpg'}
            alt="Аватар пользователя"
            className="avatar"
          />
        </div>

        {/* Информация о профиле */}
        {!isEditing ? (
          <div className="profileInfo">
            <div className="infoItem">
              <strong>Имя:</strong> <span className="infoText">{profileData.name}</span>
            </div>
            <div className="infoItem">
              <strong>Фамилия:</strong> <span className="infoText">{profileData.lastname}</span>
            </div>
            <div className="infoItem">
              <strong>Электронная почта:</strong> <span className="infoText">{profileData.email}</span>
            </div>
            <button
              className="button"
              onClick={() => setIsEditing(true)}
              style={{ background: 'linear-gradient(to bottom, #d4fc79, #96e6a1)', color: 'black' }}
            >
              Редактировать
            </button>
          </div>
        ) : (
          <div className="editForm">
            <div className="inputGroup">
              <label className="label">Имя:</label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                className="input"
              />
            </div>
            <div className="inputGroup">
              <label className="label">Фамилия:</label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                className="input"
              />
            </div>
            <div className="inputGroup">
              <label className="label">Электронная почта:</label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="input"
              />
            </div>
            <button className="button" onClick={saveProfile}>
              Сохранить
            </button>
          </div>
        )}

        {/* Кнопка выхода */}
        <div className="buttonContainer">
          <button className="logoutButton" onClick={handleLogout}>
            Выйти из аккаунта
          </button>
        </div>

        {/* Сайдбар (выезжающее меню) */}
        <div className="toDoContainer1">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menuButton">
            ☰
          </button>

          {isMenuOpen && (
            <div className="sidebar">
              <button className="menuItem" onClick={toProfile}>Профиль</button>
              <button className="menuItem" onClick={toLoads}>Нагрузка и задачи</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
