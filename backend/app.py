import requests
from flask import Flask, g, request, make_response, render_template, redirect, url_for, session
from flask import Flask, jsonify
import pymysql
from datetime import datetime
import re
from FDataBase import FDataBase
from flask_login import LoginManager, login_user, UserMixin
from flask_cors import CORS
from UserLogin import UserLogin
from collections import namedtuple
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify, session, url_for
from werkzeug.security import check_password_hash
from datetime import timedelta

# Инициализация Flask приложения
app = Flask(__name__)
CORS(app, origins=["http://localhost:3001"], supports_credentials=True)
app.secret_key = 'iewqenwqbdksclklhfd1312asd'  # Для Flask-Login и сессий
app.config['JWT_SECRET_KEY'] = 'fdsffrdwwvwbv1232dfdwsf'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)


# Инициализация Flask-Bcrypt и Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

#========================= База Данных MySQL ==============================

def connect_db():
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="123456789",
        database="service-cg",
        autocommit=True
    )
    conn.row_factory = lambda cursor, row: namedtuple('Row', [x[0] for x in cursor.description])(*row)
    return conn

def create_database():
    db = connect_db()
    with app.open_resource('sq_db.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()
    db.close()

def get_db():
    if not hasattr(g,'link_db'):
        g.link_db = connect_db()
    return g.link_db

dbase = None
@app.before_request
def before_request():
    global dbase
    db = get_db()
    dbase = FDataBase(db)

@app.teardown_appcontext
def close_db(error):
    if hasattr(g,'link_db'):
        g.link_db.close()

#============================================================================

@app.route('/')
@app.route('/index')
def index():
    return 0

# Пример пользователя для Flask-Login
class User(UserMixin):
    def __init__(self, id):
        self.id = id

# Настроим функцию загрузки пользователя
@login_manager.user_loader
def load_user(user_id):
    # Вернуть пользователя по ID из базы данных
    return User(user_id)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    login = data.get('login')
    password = data.get('password')

    if not login or not password:
        return jsonify({"error": "Логин и пароль обязательны"}), 400

    db = FDataBase(connect_db())
    user = db.getUserByLogin(login)

    if user and check_password_hash(user[6], password):
        # Получаем идентификатор пользователя
        user_id = user[0]  # Идентификатор пользователя (например, user[0])

        return jsonify({
            "message": "Успешный вход",
            "user_id": user_id,  # Отправляем user_id в ответе
            "redirect_url": url_for('profile')
        }), 200
    else:
        return jsonify({"error": "Неверный логин или пароль"}), 401




@app.route('/profile', methods=['GET'])
def profile():
    user_id = request.cookies.get('user_id')  # Извлекаем user_id из куки

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401  # Если куки нет или она пустая

    db = FDataBase(connect_db())
    user = db.getUser(user_id)  # Получаем пользователя по ID из базы данных

    if user:
        # Возвращаем необходимые данные, согласно вашему описанию
        return jsonify({
            "user_id": user_id,
            "email": user[1],  # Изменено для email
            "name": user[3],  # Изменено для имени
            "lastname": user[4]  # Изменено для фамилии
        })
    else:
        return jsonify({"error": "User not found"}), 404

    

@app.route("/profile_admin")
def profile_admin():
    db = FDataBase(connect_db())
    if session.get('role') != 'admin':
        return redirect(url_for('login'))
    

    user_id = session.get('user_id')
    user = db.getUser(user_id)

    return render_template('adminPage/profileAdmin.html', user=user)

@app.route("/manage_users", methods=["GET", "POST"])
def manage_users():
    db = FDataBase(connect_db())
    if session.get('role') != 'admin':
        return redirect(url_for('login'))

    if request.method == 'POST':
        user_id = request.form['user_id']
        new_role = request.form['role']
        db.updateUserRole(user_id, new_role)
        return redirect(url_for('manage_users'))


    users = db.getAllUsers()
    return render_template('adminPage/adminUsers.html', users=users)

@app.route("/adminStatistics")
def statistics():
    db = FDataBase(connect_db())
    if session.get('role') != 'admin':
        return redirect(url_for('login'))

    tasks_count = db.getTasksCount()
    users_count = db.getUsersCount()

    return render_template('adminPage/adminStatistics.html', tasks_count=tasks_count, users_count=users_count)

@app.route("/adminManageRoles", methods=["GET", "POST"])
def manage_roles():
    db = FDataBase(connect_db())
    if session.get('role') != 'admin':
        return redirect(url_for('login'))

    if request.method == 'POST':
        user_id = request.form['user_id']
        new_role = request.form['new_role']
        db.updateUserRole(user_id, new_role)
        return redirect(url_for('manage_roles'))

    users = db.getAllUsers()
    return render_template('adminPage/adminManageRoles.html', users=users)


@app.route('/profile_owner')
def profile_owner():
    db = FDataBase(connect_db())
    if session.get('role') != 'owner':
        return redirect(url_for('login'))
    

    user_id = session.get('user_id')
    user = db.getUser(user_id)

    return render_template('ownerPage/profileOwner.html', user=user)


@app.route('/add_user', methods=['GET', 'POST'])
def add_user():
    if request.method == 'POST':
        name = request.form['name']
        lastname = request.form['lastname']
        patronymic = request.form['patronymic']
        login = request.form['login']
        password = request.form['password']
        role = request.form['role']
        email = request.form['email']  # Получаем email
        workspace = request.form.get('workspace')  # Может быть пустым

        # Создаем объект базы данных и добавляем пользователя
        db = FDataBase(connect_db())
        hash = generate_password_hash(password)
        if db.addUser(email, login, name, lastname, patronymic, hash, role, workspace):
            return redirect(url_for('user_added_successfully'))
        else:
            return redirect(url_for('user_add_failed'))

    return render_template('add_user.html')

@app.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Вы успешно вышли"}))
    response.delete_cookie('user_id')  # Удаляем куки с user_id
    return response

@app.route('/user_added_successfully')
def user_added_successfully():
    return "Пользователь успешно добавлен!"

@app.route('/user_add_failed')
def user_add_failed():
    return "Не удалось добавить пользователя. Попробуйте снова."

@app.route('/update_profile', methods=['POST'])
def update_profile():
    try:
        # Извлекаем данные из формы
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form['email']

        # Получаем информацию о пользователе из базы данных
        db = FDataBase(connect_db())
        user = db.getUser(session['user_id'])

        # Обновляем профиль
        if db.updateProfile(user[2], first_name, last_name, email):
            # Если обновление прошло успешно, перенаправляем на страницу профиля
            return redirect(url_for('profile'))
        else:
            # Если произошла ошибка, выводим сообщение об ошибке
            return "Ошибка при обновлении профиля. Попробуйте снова."
    except Exception as e:
        print(f"Ошибка при обработке запроса: {e}")
        return "Возникла ошибка при обработке вашего запроса."

        
@app.route('/add_tasks', methods=['GET', 'POST']) 
def add_tasks(): 
    if request.method == 'POST': 
        # Получаем данные из формы 
        title = request.form['title'] 
        description = request.form['discription'] 
        priority = request.form['priority'] 
        deadline = request.form['deadline'] 
        workspace_id = request.form['workspace_id'] 
        # Создаем объект базы данных и добавляем задачу 
        db = FDataBase(connect_db()) 
        if db.addTask(title, description, priority, deadline, workspace_id): 
            return redirect(url_for('tasks_added_successfully')) 
        else:    
            return redirect(url_for('tasks_add_failed')) 
 
    return render_template('add_tasks.html') 
 
@app.route('/task_added_successfully') 
def tasks_added_successfully(): 
    return "Задача успешно добавлен!" 
 
@app.route('/task_add_failed') 
def tasks_add_failed(): 
    return "Не удалось добавить задачу. Попробуйте снова."

# Функция для получения расписания через API
def load_schedule(group_name):
    url = f"https://webictis.sfedu.ru/schedule-api/?query={group_name}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()  # Возвращаем данные в формате JSON
    else:
        return None

def parse_schedule_time(time_str):
    # Регулярное выражение для извлечения дня, даты и времени
    match = re.search(r'([а-яА-Я]+),(\d{1,2})\s([а-яА-Я]+)\s(\d{2}:\d{2})', time_str)
    if match:
        # Возвращаем день недели, число, месяц и время
        day_of_week = match.group(1)
        day_of_month = match.group(2)
        month = match.group(3)
        time = match.group(4)
        return day_of_week, day_of_month, month, time
    return None

def addTaskFromSchedule(schedule_data):
    for day_schedule in schedule_data:
        for time_str in day_schedule[1:]:  # Пропускаем первый элемент, это заголовок времени
            if time_str:  # Если строка не пуста
                # Парсим строку времени
                parsed_time = parse_schedule_time(time_str)
                if parsed_time:
                    day_of_week, day_of_month, month, time_only = parsed_time
                    try:
                        # Формируем строку для даты и времени
                        current_year = datetime.today().year
                        date_str = f"{current_year}-{month}-{day_of_month} {time_only}"
                        task_datetime = datetime.strptime(date_str, '%Y-%b-%d %H:%M')  # Преобразуем в datetime
                        print(f"Parsed datetime: {task_datetime}")
                    except ValueError as e:
                        print(f"Error parsing time: {e}")
                        continue
                else:
                    print(f"Time string could not be parsed: {time_str}")

# Функция для добавления задач из расписания
def addTasksFromSchedule(schedule_data, current_user_id):
    db = FDataBase(connect_db())
    try:
        print("Step 1: Database connection established")
        
        # Проверка типа объекта db
        print(f"db type: {type(db)}")  # Убедитесь, что db - это объект FDataBase

        # Получаем таблицу из расписания
        table = schedule_data.get('table', {}).get('table', [])
        print("Step 2: Table extracted from schedule data")

        # Проверка типа таблицы
        print(f"Table type: {type(table)}")
        print(f"Number of rows in the table: {len(table)}")

        # Проходим по всем строкам расписания
        for i in range(2, len(table)):  # Начинаем с 2-й строки (первая — это заголовок)
            date_str = table[i][0]  # Дата в первой ячейке (например, "Пнд,18 ноября")
            print(f"Processing row {i}, date_str: {date_str}")

            for j in range(1, len(table[i])):  # Пропускаем первый элемент, это дата
                subject = table[i][j]  # Название предмета в текущем времени

                if subject.strip() == "":  # Пропускаем пустые занятия
                    continue

                # Парсим время занятия
                time_slot = table[1][j]  # Время занятия (например, "08:00-09:35")
                print(f"Time slot for subject {subject}: {time_slot}")
                start_time, end_time = time_slot.split("-")  # Разделяем на время начала и окончания

                # Формируем дату (используя первую строку таблицы для дня недели)
                assigned_day = date_str.split(',')[0].strip()  # День недели (например, "Пнд")
                assigned_time = start_time.strip()  # Время начала занятия

                # Формируем строку deadline
                deadline = f"{date_str} {start_time}"  # Формируем дату и время для deadline
                print(f"Deadline for task: {deadline}")

                # Добавляем задачу в базу данных
                print(f"Adding task: {subject} with deadline: {deadline}")
                task_id = db.addTask(
                    title=subject,
                    description=f"Занятие по {subject}",
                    priority=3,  # Здесь можно задать нужный приоритет
                    deadline=deadline,  # Формируем строку для deadline
                    workspace_id=1,  # Название группы или рабочего пространства
                )

                print(f"Task added with ID: {task_id}")

                # Привязываем задачу к пользователю
                print(f"Adding task-user association: task_id={task_id}, user_id={current_user_id}")
                db.addTaskUser(current_user_id, task_id)  # Привязываем задачу к текущему пользователю

        return True
    except Exception as e:
        print(f"Ошибка при добавлении задач из расписания: {e}")
        return False

# Маршрут для страницы выбора группы
@app.route('/select_group', methods=['GET', 'POST'])
def select_group():
    if request.method == 'POST':
        # Получаем данные формы
        education_level = request.form.get('education_level')
        course = request.form.get('course')
        group_number = request.form.get('group_number')

        # Формируем имя группы
        group_name = f"КТ{education_level}о{course}-{group_number}"

        # Загружаем расписание для группы
        schedule_data = load_schedule(group_name)

        if schedule_data:
            # Добавляем задачи из расписания
            if addTasksFromSchedule(schedule_data, session['user_id']):
                return redirect(url_for('profile'))  # Перенаправление на профиль
            else:
                return "Ошибка при загрузке расписания в базу данных"
        else:
            return "Ошибка при получении расписания"

    return render_template('select_group.html')


from datetime import datetime

@app.route('/analytics', methods=['GET', 'POST'])
def analytics():
    """
    Страница аналитики для пользователя.
    Получает задачи пользователя и передает их в шаблон analytics.html.
    """
    user_id = session['user_id']
    tasks = dbase.get_user_tasks()  # Получаем задачи пользователя из базы

    # Получение фильтра для выбранной даты
    selected_date = request.args.get('date', default=None, type=str)
    
    # Проверяем, если кнопка "Показать все" была нажата
    show_all = request.args.get('show_all', default=None, type=str)
    
    # Если нажата кнопка "Показать все", выводим все задачи
    if show_all:
        tasks = tasks  # Просто оставляем все задачи, не фильтруем
    
    # Если выбрана дата или по умолчанию должны отображаться задачи за сегодня
    elif selected_date:
        # Преобразуем строку в объект даты для фильтрации
        selected_date = datetime.strptime(selected_date, '%Y-%m-%d').date()
        tasks = [task for task in tasks if task[4].date() == selected_date]
    else:
        # Если дата не выбрана, фильтруем по сегодняшней дате
        today = datetime.today().date()
        tasks = [task for task in tasks if task[4].date() == today]

    # Формируем данные для передачи в шаблон
    data = {
        "page_title": "Аналитика пользователя",
        "tasks": tasks,
        "user_id": user_id
    }

    return render_template('analytics.html', data=data)

@app.route('/add_subtask', methods=['POST'])
def add_subtask():
    title = request.form['title']
    description = request.form['description']
    priority = request.form['priority']
    deadline = request.form['deadline']
    workspace_id = request.form['workspace_id']
    parent_id = request.form.get('parent_id')  # Может быть NULL

    db = FDataBase(connect_db())
    if db.add_subtask(title, description, priority, deadline, workspace_id, parent_id):
        return redirect(url_for('tasks_added_successfully'))
    else:
        return redirect(url_for('tasks_add_failed'))
    
@app.route('/add_task_with_user', methods=['POST'])
def add_task_with_user():
    title = request.form['title']
    description = request.form['description']
    priority = request.form['priority']
    deadline = request.form['deadline']
    workspace_id = request.form['workspace_id']
    user_id = session.get('user_id')  # Получаем ID текущего пользователя из сессии

    if not user_id:
        return "Пользователь не авторизован", 401

    db = FDataBase(connect_db())
    task_id = db.add_task_with_user(title, description, priority, deadline, workspace_id, user_id)

    if task_id:
        return redirect(url_for('tasks_added_successfully'))
    else:
        return redirect(url_for('tasks_add_failed'))



if __name__ == "__main__":
    app.run(debug=True)

