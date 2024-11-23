from flask import Flask, g, request, make_response, render_template, redirect, url_for, session
import pymysql
from FDataBase import FDataBase
from flask_login import LoginManager, login_user, UserMixin
from UserLogin import UserLogin
from collections import namedtuple
from werkzeug.security import generate_password_hash, check_password_hash
import jsonify
from flask_bcrypt import Bcrypt

# Инициализация Flask приложения
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Для Flask-Login и сессий

# Инициализация Flask-Bcrypt и Flask-Login
bcrypt = Bcrypt(app)
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

# Пример пользователя для Flask-Login
class User(UserMixin):
    def __init__(self, id):
        self.id = id

# Настроим функцию загрузки пользователя
@login_manager.user_loader
def load_user(user_id):
    # Вернуть пользователя по ID из базы данных
    return User(user_id)

@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == 'POST':
        # Получаем данные из формы
        login = request.form['login']
        password = request.form['psw']
        hash = generate_password_hash(password)
        db = FDataBase(connect_db())
        user = dbase.getUserByLogin(login)

        # Проверяем данные пользователя
        if user and check_password_hash(user[6], password):
            session['user_id'] = user[0]
            # Сохраняем пользователя в сессии
            return redirect(url_for('dashboard'))
        else:
            return "Неверный логин или пароль", 401

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    # Проверяем, авторизован ли пользователь
    if 'user_id' in session:
        return f"Добро пожаловать, пользователь {session['user_id']}!"
    else:
        return redirect(url_for('login'))
    
@app.route('/add_user', methods=['GET', 'POST'])
def add_user():
    if request.method == 'POST':
        # Получаем данные из формы
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


@app.route('/user_added_successfully')
def user_added_successfully():
    return "Пользователь успешно добавлен!"

@app.route('/user_add_failed')
def user_add_failed():
    return "Не удалось добавить пользователя. Попробуйте снова."

if __name__ == "__main__":
    app.run(debug=True)