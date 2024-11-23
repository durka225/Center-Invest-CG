import React, { useState } from 'react';

const UserProfileModal = ({ profileData, setProfileData, saveProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...profileData });
  const [avatarPreview, setAvatarPreview] = useState(editData.avatar);

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setEditData({ ...editData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileChanges = () => {
    setProfileData(editData);
    setIsEditing(false);
    saveProfile();
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <button onClick={() => setIsEditing(false)} className="closeModalButton">
          X
        </button>
        <div className="profileContent">
          <h2>Профиль пользователя</h2>
          <div className="profileAvatar">
            <img
              src={avatarPreview || 'https://ey.kommersant.ru/wp-content/uploads/sites/3/2023/03/unknownspeaker.jpg'}
              alt="Аватар пользователя"
              className="avatarImage"
              style={{ width: '150px', height: '150px', borderRadius: '50%' }}
            />
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatarUploadInput"
                />
                {!avatarPreview && (
                  <span className="noFileSelectedText">Не выбран ни один файл</span>
                )}
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="profileDetails">
              <div className="profileField">
                <strong>Имя:</strong> {editData.firstName}
              </div>
              <div className="profileField">
                <strong>Фамилия:</strong> {editData.lastName}
              </div>
              <div className="profileField">
                <strong>Email:</strong> {editData.email}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="editProfileButton"
              >
                Редактировать
              </button>
            </div>
          ) : (
            <div className="profileEditForm">
              <div className="profileField">
                <label>
                  Имя:
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    className="editField"
                  />
                </label>
              </div>
              <div className="profileField">
                <label>
                  Фамилия:
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    className="editField"
                  />
                </label>
              </div>
              <div className="profileField">
                <label>
                  Email:
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="editField"
                  />
                </label>
              </div>
              <button onClick={saveProfileChanges} className="saveProfileButton">
                Сохранить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
