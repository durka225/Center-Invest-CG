import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ToDoList = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [priorityInput, setPriorityInput] = useState("низкий");
  const [deadlineInput, setDeadlineInput] = useState("");

  const addTask = () => {
    if (taskInput.trim() === "") {
      alert("Введите текст задачи!");
      return;
    }
    if (!deadlineInput) {
      alert("Укажите срок выполнения задачи!");
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
    setTaskInput("");
    setDescriptionInput("");
    setPriorityInput("низкий");
    setDeadlineInput("");
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const renderStars = (priority) => {
    const starsCount =
      priority === "высокий" ? 3 : priority === "средний" ? 2 : 1;
    return (
      <span className="priorityStars">
        {[...Array(3)].map((_, index) => (
          <FaStar
            key={index}
            color={index < starsCount ? "#4caf50" : "#e4e5e9"}
            size={14}
          />
        ))}
      </span>
    );
  };

  const groupTasksByDate = () => {
    const taskCountPerDay = {};
    tasks.forEach((task) => {
      const date = new Date(task.deadline).toLocaleDateString();
      taskCountPerDay[date] = (taskCountPerDay[date] || 0) + 1;
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
        label: "Количество задач",
        data: taskCounts,
        fill: false,
        borderColor: "#4caf50",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: "Дата" } },
      y: {
        title: { display: true, text: "Количество задач" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="toDoContainer">
      <button
        onClick={() => navigate("/profile")}
        style={{
          minWidth: 0,
          minHeight: 0,
          position: "absolute",
          top: "3%",
          right: "2%",
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          padding: "2% 1%",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        Профиль
      </button>

      <div className="chartContainer">
        <Line data={data} options={options} />
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
        <select
          value={priorityInput}
          onChange={(e) => setPriorityInput(e.target.value)}
          className="priorityInput"
        >
          <option value="низкий">Низкий</option>
          <option value="средний">Средний</option>
          <option value="высокий">Высокий</option>
        </select>
        <input
          type="date"
          value={deadlineInput}
          onChange={(e) => setDeadlineInput(e.target.value)}
          className="deadlineInput"
        />
        <button
          onClick={addTask}
          style={{
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          Добавить задачу
        </button>
      </div>

      <div className="taskListContainer">
        <h2>Список задач</h2>
        {/* добавь ul фикс высоту и overflow-y: scroll  */}
        {/* а то у тебя ебать страница улетает когда много задач */}
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <div>{task.text}</div>
              <div>Приоритет: {renderStars(task.priority)}</div>
              <div style={{ marginBottom: "1rem" }}>
                Дедлайн: {new Date(task.deadline).toLocaleDateString()}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                style={{
                  backgroundColor: "#ff4d4d",
                  color: "#fff",
                  border: "none",
                  padding: "5px",
                  borderRadius: "5px",
                  marginBottom: "1.5rem"                }}
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ToDoList;
