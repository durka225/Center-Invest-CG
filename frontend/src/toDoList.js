import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'

const ToDoList = (props) => {
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');

  const [descriptionInput, setDescriptionInput] = useState('');
  const [priorityInput, setPriorityInput] = useState('низкий');

  const [deadlineInput, setDeadlineInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для модального окна
  const onButtonClickProfile = () =>{
    navigate("/profile")
  }
  const onButtonClickBack = () => {
    window.history.go(-1);
    return false;
  };

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

  const isTaskOverdue = (deadline) => {
    const currentDate = new Date();
    const taskDate = new Date(deadline);
    return taskDate < currentDate;
  };

  return (
    <div className="toDoContainer">
      <div>
      <button
        onClick={onButtonClickProfile}
        className="buttonProfile"
      >
      </button>
      </div>
      <p className="textToDoList">Создание списка задач</p>

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
        <p className='input'>Выберите приоритет</p>
        <select
          value={priorityInput}
          onChange={(e) => setPriorityInput(e.target.value)}
          className="priorityInput"
        >
          <option value="низкий">Низкий</option>
          <option value="средний">Средний</option>
          <option value="высокий">Высокий</option>
        </select>
        <div className='dataText'>Укажите дату, до которой</div>
        <div className='dataText'>необходимо выполнить задание</div>
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
      <button onClick={() => setIsModalOpen(true)} className="openModalButton">
        Открыть задачи
      </button>
      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <button onClick={() => setIsModalOpen(false)} className="closeModalButton">
              X
            </button>
            <ul className="taskList">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`taskItem ${task.completed ? 'completed' : ''} ${
                    isTaskOverdue(task.deadline) ? 'overdue' : ''
                  }`}
                >
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
                      {isTaskOverdue(task.deadline) && (
                        <div className="overdueWarning">Просрочено!</div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="deleteButton"
                    >
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
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
