import pymysql

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
            self.__cur.execute(
                '''
                INSERT INTO tasks (title, description, priority, deadline, workspace_id)
                VALUES (%s, %s, %s, %s, %s)
                ''',
                (title, description, priority, deadline, workspace_id)
            )
            self.db.commit()
        except pymysql.connect.Error as e:
            print("Ошибка при добавлении задачи: " + str(e))
            return False
        return True

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
