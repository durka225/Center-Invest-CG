class UserLogin():
    def fromDB(self, user_id, db):
        self.__user = db.getUser(user_id)
        if self.__user is None:
            return None
        return self
    
    def get_user_details(self, db):
        self.__user = db.getUser(self.get_id())
        if self.__user is None:
            return None
        return self.__user
 
    def create(self, user):
        self.__user = user
        return self
    def is_authenticated(self):
        return True
    def is_active(self):
        return True
    def is_anonymous(self):
        return False
    def get_id(self):
        return str(self.__user[0])
    def get_name(self):
        if self.__user:
            return str(self.__user[1])
        else:
            return None
    def get_surname(self):
        return str(self.__user[2])
    def get_patronymic(self):
        return str(self.__user[3])
    def get_role(self):
        return str(self.__user[7])
    def get_levels(self):
        return int(self.__user[4])
    def get_progress(self):
        return int(self.__user[4])
    def get_avatar(self):
        return self.__user[8]
    def get_login(self):
        return str(self.__user[5])