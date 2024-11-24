import pymysql
import re
from datetime import datetime

class FDataBase:
    def __init__(self, db):
        self.db = db
        self.__cur = db.cursor()

    def getMenu(self):
        sql = "SELECT * FROM workspace"
        try:
            self.__cur.execute(sql)
            res = self.__cur.fetchall()
            if res: return res
        except:
            print("Ошибка чтения из Базы Данных")
        return []
    
    def addUser(self, email, login, name, lastname, patronymic, password, role, workspace=None):
        try:
            # Проверка на существование login
            self.__cur.execute("SELECT COUNT(*) FROM users WHERE login=%s", (login,))
            res_login = self.__cur.fetchone()
            if res_login[0] > 0:
                print("Пользователь с таким login уже зарегистрирован")
                return False

            # Проверка на существование email
            self.__cur.execute("SELECT COUNT(*) FROM users WHERE email=%s", (email,))
            res_email = self.__cur.fetchone()
            if res_email[0] > 0:
                print("Пользователь с таким email уже зарегистрирован")
                return False

            # Добавление нового пользователя
            self.__cur.execute(
                """
                INSERT INTO users (email, login, name, lastname, patronymic, password, role, workspace, taskComplete)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0)
                """,
                (email, login, name, lastname, patronymic, password, role, workspace)
            )
            self.db.commit()
        except pymysql.connect.Error as e:
            print("Ошибка при добавлении пользователя:" + str(e))
            return False

        return True

    def getUser(self, user_id):
        try:
            self.__cur.execute("SELECT * FROM users WHERE id = %s LIMIT 1", (user_id,))
            res = self.__cur.fetchone()
            if not res:
                print("Пользователь не найден")
                return None

            return res
        except pymysql.connect.Error as e:
            print("Ошибка получения данных из БД: " + str(e))

        return False

    def getUserByLogin(self, login):
        try:
            self.__cur.execute("SELECT * FROM users WHERE login = %s LIMIT 1", (login,))
            res = self.__cur.fetchone()
            if not res:
                print("Пользователь не найден")
                return False

            return res
        except pymysql.connect.Error as e:
            print("Ошибка получения данных из БД: " + str(e))

        return False
    
    def update_user(self, user_id, name, lastname, patronymic, login, role, workspace):
        query = '''UPDATE users 
                SET name=%s, lastname=%s, patronymic=%s, login=%s, role=%s, workspace=%s 
                WHERE id=%s'''
        try:
            self.__cur.execute(query, (name, lastname, patronymic, login, role, workspace, user_id))
            self.db.commit()
            return True
        except pymysql.connect.Error as e:
            print(f"Ошибка при обновлении данных пользователя: {e}")
            return False
        
    def delete_user(self, user_id):
        query = '''DELETE FROM users WHERE id=%s'''
        try:
            self.__cur.execute(query, (user_id,))
            self.db.commit()
            return True
        except pymysql.connect.Error as e:
            print(f"Ошибка при удалении пользователя: {e}")
            return False

    def assign_task_to_user(self, user_id, task_id):
        query = """
            INSERT INTO task_user (user_id, task_id, assigned_at) 
            VALUES (%s, %s, NOW())
        """
        self.__cur.execute(query, (user_id, task_id))
        self.db.commit()

    def get_user_tasks(self, user_id):
        query = """
            SELECT t.id, t.title, t.description, t.priority, t.deadline, tu.status
            FROM tasks t
            JOIN task_user tu ON tu.task_id = t.id
            WHERE tu.user_id = %s
        """
        self.__cur.execute(query, (user_id,))
        return self.__cur.fetchall()

    def get_user_workspace(self, user_id):
        query = """
            SELECT w.id, w.name
            FROM workspace w
            WHERE w.owner_id = %s
        """
        self.__cur.execute(query, (user_id,))
        return self.__cur.fetchall()

    def get_workspace_tasks(self, workspace_id):
        query = """
            SELECT t.id, t.title, t.description, t.priority, t.deadline
            FROM tasks t
            WHERE t.workspace_id = %s
        """
        self.__cur.execute(query, (workspace_id,))
        return self.__cur.fetchall()

    def get_task_details(self, task_id):
        query = """
            SELECT *
            FROM tasks
            WHERE id = %s
        """
        self.__cur.execute(query, (task_id,))
        return self.__cur.fetchone()


    def addTask(self, title, description, priority, deadline, workspace_id):
        try:
            # Парсим строку deadline, чтобы преобразовать её в datetime
            deadline_datetime = self.parse_deadline(deadline)

            if not deadline_datetime:
                print(f"Ошибка формата данных: {deadline}")
                return False

            # Извлекаем день недели и время из deadline
            assigned_day = deadline_datetime.strftime('%A')  # День недели
            assigned_time = deadline_datetime.strftime('%H:%M')  # Время

            # Выполнение вставки в базу данных
            self.__cur.execute(
                '''
                INSERT INTO tasks (title, description, priority, deadline, workspace_id, assigned_day, assigned_time, assigned_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ''',
                (title, description, priority, deadline_datetime, workspace_id, assigned_day, assigned_time, deadline_datetime)
            )
            self.db.commit()

            # Получаем id новой задачи
            task_id = self.__cur.lastrowid  # Получаем ID последней вставленной строки
            return task_id  # Возвращаем ID новой задачи

        except pymysql.MySQLError as e:
            print("Ошибка при добавлении задачи: " + str(e))
            return False
        except ValueError as e:
            print("Ошибка формата данных: " + str(e))
            return False


    def parse_deadline(self, deadline):
        
        # Проверяем, если строка в формате YYYY-MM-DD
        date_pattern = r"^\d{4}-\d{2}-\d{2}$"
        if re.match(date_pattern, deadline):
            # Преобразуем строку формата YYYY-MM-DD в datetime
            return datetime.strptime(deadline, '%Y-%m-%d')
        
        # Преобразуем строку вида "Сбт, 23 ноября 15:50" в datetime
        pattern = r"(\w{2,3}),\s*(\d{1,2})\s+(\w+)\s+(\d{2}:\d{2})"
        
        # Проверяем соответствие строки формату
        match = re.match(pattern, deadline)
        if not match:
            print("Некорректный формат строки")
            return None

        try:
            # Извлекаем день, число, месяц и время
            day_of_week, day, month_str, time_str = match.groups()

            # Словарь для преобразования месяца в число
            months = {
                "января": 1, "февраля": 2, "марта": 3, "апреля": 4, "мая": 5, "июня": 6,
                "июля": 7, "августа": 8, "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12
            }

            # Преобразуем месяц в число
            month = months.get(month_str)
            if not month:
                print(f"Некорректное название месяца: {month_str}")
                return None

            # Преобразуем день в число
            day = int(day)

            # Используем текущий год для формирования даты
            current_year = datetime.now().year
            date_str = f"{current_year}-{month:02d}-{day:02d} {time_str}"

            # Преобразуем строку в datetime
            return datetime.strptime(date_str, '%Y-%m-%d %H:%M')
        except Exception as e:
            print(f"Ошибка парсинга строки {deadline}: {e}")
            return None


    def addWorkspace(self, name, owner_id):
        try:
            self.__cur.execute(
                '''
                INSERT INTO workspace (name, owner_id)
                VALUES (%s, %s)
                ''',
                (name, owner_id)
            )
            self.db.commit()
        except pymysql.connect.Error as e:
            print("Ошибка при добавлении рабочего пространства: " + str(e))
            return False
        return True

    def get_all_workspaces(self):
        self.__cur.execute("SELECT * FROM workspace")
        return self.__cur.fetchall()

    def get_all_tasks(self):
        self.__cur.execute("SELECT * FROM tasks")
        return self.__cur.fetchall()

    def get_analytics(self, user_id, workspace_id):
        query = """
            SELECT metric, value, date
            FROM analytics
            WHERE user_id = %s AND workspace_id = %s
        """
        self.__cur.execute(query, (user_id, workspace_id))
        return self.__cur.fetchall()
    
    def updateProfile(self, login, name, lastname, email):
        query = """
            UPDATE users
            SET name=%s, lastname=%s, email=%s
            WHERE login=%s
        """
        try:
            self.__cur.execute(query, (name, lastname, email, login))
            self.db.commit()
            return True
        except pymysql.connect.Error as e:
            print(f"Ошибка при изменении профиля: {e}")
            return False

    def addTasksFromSchedule(self, schedule_data):
        try:
            # Получаем таблицу из расписания
            table = schedule_data.get('table', {}).get('table', [])
            
            # Проходим по всем строкам расписания
            for i in range(2, len(table)):  # Начинаем с 2-й строки (первая — это заголовок)
                date_str = table[i][0]  # Дата в первой ячейке (например, "Пнд,18 ноября")
                
                for j in range(1, len(table[i])):  # Пропускаем первый элемент, это дата
                    subject = table[i][j]  # Название предмета в текущем времени

                    if subject.strip() == "":  # Пропускаем пустые занятия
                        continue

                    # Парсим время занятия
                    time_slot = table[1][j]  # Время занятия (например, "08:00-09:35")
                    start_time, end_time = time_slot.split("-")  # Разделяем на время начала и окончания

                    # Формируем дату (используя первую строку таблицы для дня недели)
                    assigned_day = date_str.split(',')[0].strip()  # День недели (например, "Пнд")
                    assigned_time = start_time.strip()  # Время начала занятия

                    # Формируем строку deadline
                    deadline = f"{date_str} {start_time}"  # Формируем дату и время для deadline

                    # Добавляем задачу в базу данных, передаем workspace_id=1
                    self.addTask(
                        title=subject,
                        description=f"Занятие по {subject}",
                        priority=3,  # Здесь можно задать нужный приоритет
                        deadline=deadline,  # Формируем строку для deadline
                        workspace_id=1,  # Передаем просто число 1 как идентификатор рабочего пространства
                    )

            return True
        except Exception as e:
            print(f"Ошибка при добавлении задач из расписания: {e}")
            return False
        
    def addTaskUser(self, user_id, task_id):
        try:
            # Получаем текущее время через Python
            assigned_at = datetime.now()

            # Выполняем вставку в таблицу
            self.__cur.execute("""
                INSERT INTO task_user (user_id, task_id, status, assigned_at)
                VALUES (%s, %s, %s, %s)
            """, (user_id, task_id, "Not Started", assigned_at))

            self.db.commit()  # Подтверждаем изменения
        except pymysql.MySQLError as e:
            print(f"Ошибка при добавлении пользователя к задаче: {e}")
            return False
        return True

    def get_user_tasks(self):
        """
        Получает все задачи из таблицы tasks, включая дедлайн.

        :return: Список задач (id+1, title, description, priority, deadline).
        """
        try:
            self.__cur.execute("""
                SELECT id + 1 AS id, title, description, priority, deadline
                FROM tasks
            """)
            tasks = self.__cur.fetchall()
            print(tasks)
            return tasks
        except Exception as e:
            print(f"Ошибка при выполнении запроса: {e}")
            return []

    def add_subtask(self, title, description, priority, deadline, workspace_id, parent_id):
        try:
            query = """
                INSERT INTO tasks (title, description, priority, deadline, workspace_id, parent_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            self.__cur.execute(query, (title, description, priority, deadline, workspace_id, parent_id))
            self.db.commit()
            return self.__cur.lastrowid  # Возвращаем ID новой подзадачи
        except pymysql.MySQLError as e:
            print(f"Ошибка при добавлении подзадачи: {e}")
            return False
        
    def get_task_tree(self, task_id=None):
        try:
            if task_id:
                query = """
                    SELECT * FROM tasks WHERE parent_id = %s
                """
                self.__cur.execute(query, (task_id,))
            else:
                query = """
                    SELECT * FROM tasks WHERE parent_id IS NULL
                """
                self.__cur.execute(query)
            tasks = self.__cur.fetchall()

            task_tree = []
            for task in tasks:
                subtasks = self.get_task_tree(task['id'])  # Рекурсия
                task_tree.append({**task, "subtasks": subtasks})
            return task_tree
        except Exception as e:
            print(f"Ошибка при построении дерева задач: {e}")
            return []


    def add_task_with_user(self, title, description, priority, deadline, workspace_id, user_id):
        try:
            # Создаём задачу
            query_task = """
                INSERT INTO tasks (title, description, priority, deadline, workspace_id)
                VALUES (%s, %s, %s, %s, %s)
            """
            self.__cur.execute(query_task, (title, description, priority, deadline, 0))
            self.db.commit()

            # Получаем ID только что созданной задачи
            task_id = self.__cur.lastrowid

            # Добавляем связь с пользователем в таблице task_user
            query_task_user = """
                INSERT INTO task_user (user_id, task_id, status, assigned_at)
                VALUES (%s, %s, %s, NOW())
            """
            self.__cur.execute(query_task_user, (user_id, task_id, 'not started'))
            self.db.commit()

            return task_id  # Возвращаем ID задачи
        except pymysql.MySQLError as e:
            print(f"Ошибка при добавлении задачи и связывании с пользователем: {e}")
            return False
