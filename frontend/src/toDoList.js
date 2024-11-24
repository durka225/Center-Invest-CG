import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';

// Регистрация необходимых компонентов для chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const ToDoList = ({ token }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние для открытия меню
  const [taskInput, setTaskInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('низкий');
  const [deadlineInput, setDeadlineInput] = useState('');
  const [startTimeInput, setStartTimeInput] = useState(''); // Время начала
  const [endTimeInput, setEndTimeInput] = useState(''); // Время окончания
  const [tasks, setTasks] = useState([]); // Задачи, которые получаем с сервера
  const [fetchedTasks, setFetchedTasks] = useState([]); // Состояние для задач, полученных с сервера

  useEffect(() => {
    // Функция для запроса к API Flask
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Токен отсутствует. Пользователь не авторизован.');
        }

        const response = await axios.get('http://127.0.0.1:5000/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFetchedTasks(response.data); // Сохраняем полученные данные в состояние
      } catch (error) {
        console.error('Ошибка при запросе к Flask API:', error);
      }
    };

    fetchTasks();
  }, []); // Выполнится один раз при загрузке компонента

  const addTask = async () => {
    if (taskInput.trim() === '') {
      alert('Введите текст задачи!');
      return;
    }
    if (!deadlineInput || !startTimeInput || !endTimeInput) {
      alert('Укажите все данные (срок выполнения, время начала и время окончания)!');
      return;
    }
  
    const newTask = {
      title: taskInput,
      description: descriptionInput,
      priority: priorityInput,
      deadline: deadlineInput,
      startTime: startTimeInput, // Время начала
      endTime: endTimeInput, // Время окончания
      workspace_id: 1, // Example workspace_id, you might need to adjust this based on your app's requirements
    };
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен отсутствует. Пользователь не авторизован.');
      }
  
      const response = await axios.post(
        'http://127.0.0.1:5000/add_task',
        newTask,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 201) {
        alert('Задача успешно добавлена!');
        setTasks([
          ...tasks,
          {
            id: Date.now(),
            title: taskInput,
            description: descriptionInput,
            priority: priorityInput,
            deadline: deadlineInput,
            startTime: startTimeInput, // Время начала
            endTime: endTimeInput, // Время окончания
          },
        ]);
        // Clear input fields after adding the task
        setTaskInput('');
        setDescriptionInput('');
        setPriorityInput('низкий');
        setDeadlineInput('');
        setStartTimeInput('');
        setEndTimeInput('');
      } else {
        alert('Не удалось добавить задачу');
      }
    } catch (error) {
      console.error('Ошибка при добавлении задачи:', error);
      alert('Ошибка при добавлении задачи');
    }
  };
  

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

// Рассчитываем процент заполнения графика, если список задач пуст, процент равен 0
const totalTasks = fetchedTasks.length; // Используем fetchedTasks вместо tasks
const filledPercentage = totalTasks === 0 ? 0 : Math.min((totalTasks / 12) * 100, 100); // Прогресс заполнения (до 100%)

// Определение цвета сегмента графика в зависимости от количества задач
let segmentColor = '#4caf50'; // Зеленый по умолчанию
if (totalTasks > 4 && totalTasks <= 8) {
  segmentColor = '#e0cb09'; // Желтый
} else if (totalTasks > 8) {
  segmentColor = '#f44336'; // Красный
}

const data = {
  labels: ['Задачи'],
  datasets: [
    {
      data: [filledPercentage, 100 - filledPercentage],
      backgroundColor: [segmentColor, '#e4e5e9'],
      borderColor: [segmentColor, '#e4e5e9'],
      borderWidth: 1,
    },
  ],
};

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.label + ': ' + context.raw + '%';
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Корректируем время на -3 часа (сдвиг для вашего региона)
    date.setHours(date.getHours() - 3);
    
    const options = {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-часовой формат
    };
  
    return date.toLocaleString('ru-RU', options).replace(',', '');
  };

  return (
    <div className="toDoContainer">
      {/* Кнопка для открытия/закрытия меню */}
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menuButton">
        ☰
      </button>

      {/* Сайдбар (выезжающее меню) */}
      {isMenuOpen && (
        <div className="sidebar">
          <button className="menuItem" onClick={() => navigate('../profile')}>
            Профиль
          </button>
          <button className="menuItem" onClick={() => navigate('../toDoList')}>
            Нагрузки
          </button>
        </div>
      )}

      <div className="contentContainer">
        {/* Контейнер для графика */}
        <div
          className="chartContainer"
          style={{
            width: '850px',
            height: '850px',
            margin: 50,
            padding: 0,
            position: 'absolute',
            left: '0',
            top: '0',
          }}
        >
          <Doughnut data={data} options={options} />
        </div>

        {/* Контейнер для списка задач */}
        <div
          className="taskContainer"
          style={{
            width: '850px',
            height: '850px',
            marginRight: 450,
            marginTop: 120,
            padding: 0,
            position: 'absolute',
            right: '0',
            top: '0',
          }}
        >
          <h2 className="taskTitle">Список задач</h2>
          <ul className="taskList">
            {fetchedTasks.map((task) => (
              <li key={task.id} className="taskItem">
                <div className="taskHeader">
                  <strong>{task.title}</strong> <span className="priority">{task.priority}</span>
                </div>
                <p className="description">{task[2]}</p>
                <div className="taskFooter">
                  <span className="time">Время: {formatDate(task[4])}</span>
                  <button className="deleteButton" onClick={() => deleteTask(task.id)}>
                    Х
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Контейнер для ввода новой задачи */}
        <div
          className="taskInputContainer"
          style={{
            marginRight: 75,
            marginTop: 185,
            padding: 0,
            position: 'absolute',
            right: '0',
            top: '0',
            background: 'white',
            borderRadius: '8px',
          }}
        >
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
            <option value="Low">Низкий</option>
            <option value="Medium">Средний</option>
            <option value="High">Высокий</option>
          </select>
          <div className="dataText">Укажите срок сдачи задания</div>
          <input
            type="date"
            value={deadlineInput}
            onChange={(e) => setDeadlineInput(e.target.value)}
            className="deadlineInput"
          />
          <div className="dataText">Укажите время начала задачи</div>
          <input
            type="time"
            value={startTimeInput}
            onChange={(e) => setStartTimeInput(e.target.value)}
            className="startTimeInput"
          />
          <div className="dataText">Укажите время окончания задачи</div>
          <input
            type="time"
            value={endTimeInput}
            onChange={(e) => setEndTimeInput(e.target.value)}
            className="endTimeInput"
          />
          <button onClick={addTask} className="addButton">
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToDoList;
