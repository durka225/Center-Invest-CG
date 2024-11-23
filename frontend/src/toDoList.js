import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ToDoList = () => {
  const navigate = useNavigate();

  // State for tasks and modal
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('низкий');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for profile modal and data
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Иван',
    lastName: 'Иванов',
    email: 'ivan.ivanov@example.com',
    registrationDate: '12.03.2023',
  });
  const [editData, setEditData] = useState({ ...profileData });

  // Task management functions
  const addTask = () => {
    if (taskInput.trim() === '') {
      alert('Введите текст задачи!');
      return;
    }
    if (!deadlineInput) {
      alert('Укажите срок выполнения задачи!');
      return;
    }
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: taskInput,
        description: descriptionInput,
        priority: priorityInput,
        deadline: deadlineInput,
        completed: false,
      },
    ]);
    setTaskInput('');
    setDescriptionInput('');
    setPriorityInput('низкий');
    setDeadlineInput('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const renderStars = (priority) => {
    let starsCount = 0;
    if (priority === 'низкий') starsCount = 1;
    else if (priority === 'средний') starsCount = 2;
    else if (priority === 'высокий') starsCount = 3;

    return (
      <span className="priorityStars">
        {[...Array(3)].map((_, index) => (
          <FaStar
            key={index}
            color={index < starsCount ? '#ffc107' : '#e4e5e9'}
            size={14}
          />
        ))}
      </span>
    );
  };

  // Chart data generation
  const groupTasksByDate = () => {
    const taskCountPerDay = {};
    tasks.forEach((task) => {
      const date = new Date(task.deadline).toLocaleDateString();
      taskCountPerDay[date] = taskCountPerDay[date] ? taskCountPerDay[date] + 1 : 1;
    });
    return taskCountPerDay;
  };

  const taskCountPerDay = groupTasksByDate();
  const dates = Object.keys(taskCountPerDay);
  const taskCounts = Object.values(taskCountPerDay);

  const data = {
    labels: dates,
    datasets: [
      {
        label: 'Количество задач',
        data: taskCounts,
        fill: false,
        borderColor: '#4caf50',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Дата',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Количество задач',
        },
        beginAtZero: true,
      },
    },
  };

  // Profile modal handling
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditData({ ...editData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const onButtonClickBack = () => {
    window.history.go(-1);
    return false;
  };

  return (
    <div className="toDoContainer">
      {/* Profile Button */}
      <button onClick={() => setIsProfileModalOpen(true)} className="buttonProfile">
        Профиль
      </button>

      <p className="textToDoList">Создание списка задач</p>

      {/* Task Chart */}
      <div className="chartContainer">
        <Line data={data} options={options} />
      </div>

      {/* Task Input Section */}
      <div className="taskInputContainer">
        <input
          type="text"
          value={taskInput}
          placeholder="Введите задачу"
          onChange={(e) => setTaskInput(e.target.value)}
          className="taskInput"
        />
        <textarea
          value={descriptionInput}
          placeholder="Введите описание задачи"
          onChange={(e) => setDescriptionInput(e.target.value)}
          className="descriptionInput"
        />
        <p className="input">Выберите приоритет</p>
        <select
          value={priorityInput}
          onChange={(e) => setPriorityInput(e.target.value)}
          className="priorityInput"
        >
          <option value="низкий">Похуй</option>
          <option value="средний">Средний</option>
          <option value="высокий">ЕБАТЬ сроки горят</option>
        </select>
        <div className="dataText">Укажите дату, до которой необходимо выполнить задание</div>
        <input
          type="date"
          value={deadlineInput}
          onChange={(e) => setDeadlineInput(e.target.value)}
          className="deadlineInput"
        />
        <button onClick={addTask} className="addButton">
          Добавить
        </button>
      </div>

      {/* Open Tasks Modal Button */}
      <button onClick={() => setIsModalOpen(true)} className="openModalButton">
        Открыть задачи
      </button>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button onClick={() => setIsModalOpen(false)} className="closeModalButton">X</button>
            <ul className="taskList">
              {tasks.map((task) => (
                <li key={task.id} className={`taskItem ${task.completed ? 'completed' : ''}`}>
                  <div className="taskContainer">
                    <div>
                      <div className="taskTitle">
                        {task.text}{' '}
                        <span className="starsContainer">
                          ({renderStars(task.priority)})
                        </span>
                      </div>
                      {task.description && (
                        <div className="taskDescription">{task.description}</div>
                      )}
                      <div className="taskDeadline">
                        Срок: {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="deleteButton">X</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button onClick={() => setIsProfileModalOpen(false)} className="closeModalButton">X</button>
            <div className="profileContent">
              <h2>Профиль пользователя</h2>
              <div className="profileAvatar">
                <img
                  src={profileData.avatar || 'https://via.placeholder.com/150'}
                  alt="Аватар пользователя"
                  className="avatarImage"
                />
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="avatarUploadInput"
                    />
                  </>
                )}
              </div>
              {!isEditing ? (
                <>
                  <div className="profileField"><strong>Имя:</strong> {profileData.firstName}</div>
                  <div className="profileField"><strong>Фамилия:</strong> {profileData.lastName}</div>
                  <div className="profileField"><strong>Email:</strong> {profileData.email}</div>
                  <div className="profileField"><strong>Дата регистрации:</strong> {profileData.registrationDate}</div>
                  <button onClick={() => setIsEditing(true)} className="editButton">Редактировать</button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    className="editField"
                  />
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    className="editField"
                  />
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="editField"
                  />
                  <button onClick={saveProfile} className="saveButton">Сохранить</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
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

export default ToDoList;
