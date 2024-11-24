import React, { useState } from 'react';
import './list.css'; 
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const List = () => {
  const navigate = useNavigate();
  const toTasks = () =>{
    navigate('../tasks')
  }
  const toLoads = () =>{
    navigate('../toDoList')
  }
  const toProfile = () =>{
    navigate('../profile')
  }
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('низкий');
  const [deadlineInput, setDeadlineInput] = useState('');
   // Состояние для открытия меню
  const [activePage, setActivePage] = useState('Нагрузки');
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
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Сделать проект',
      description: 'Завершить разработку проекта React',
      priority: 'Высокий',
      deadline: '2024-12-01',
    },
    {
      id: 2,
      title: 'Проверить почту',
      description: 'Просмотреть важные письма',
      priority: 'Низкий',
      deadline: '2024-12-05',
    },
    {
      id: 3,
      title: 'Прочитать книгу',
      description: 'Дочитать книгу по программированию',
      priority: 'Средний',
      deadline: '2024-12-10',
    },
  ]);

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="taskPage" style={{background: 'linear-gradient(to bottom, #d4fc79, #96e6a1)'}}>
      <div className="taskContainer">
        <h2 className="taskTitle">Список задач</h2>
        <ul className="taskList"style={{ margin: 0, padding: 0, position: 'absolute', top: '0' }}>
          {tasks.map((task) => (
            <li key={task.id} className="taskItem">
              <div className="taskHeader">
                <strong>{task.title}</strong> <span className="priority">{task.priority}</span>
              </div>
              <p className="description">{task.description}</p>
              <div className="taskFooter">
                <span className="deadline">Дедлайн: {task.deadline}</span>
                <button className="deleteButton" onClick={() => deleteTask(task.id)}>
                  Х
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
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
            <option value="низкий">Низкий</option>
            <option value="средний">Средний</option>
            <option value="высокий">Высокий</option>
          </select>
          <div className="dataText">Укажите срок сдачи задания</div>
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
      <div className="toDoContainer">
      {/* Кнопка для открытия/закрытия меню */}
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menuButton">
        ☰
      </button>

      {/* Сайдбар (выезжающее меню) */}
      {isMenuOpen && (
        <div className="sidebar">
          <button className="menuItem" onClick={toProfile}>Профиль</button>
          <button className="menuItem" onClick={toLoads}>Нагрузки</button>
          <button className="menuItem" onClick={toTasks}>Задачи</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default List;
