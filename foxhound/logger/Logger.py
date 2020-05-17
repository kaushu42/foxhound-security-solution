import datetime


class Logger:
    __instance = None
    @staticmethod
    def getInstance():
        """ Static access method. """
        if Logger.__instance is None:
            Logger()
        return Logger.__instance

    def __init__(self, filename='main.log'):
        """ Virtually private constructor. """
        if Logger.__instance is not None:
            pass
        else:
            Logger.__instance = self
            self.file = open(filename, 'a')

    def flush(self):
        self.file.flush()

    def error(self, msg):
        self.file.write(f'[ERROR]: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} {msg}\n')
        self.flush()

    def info(self, msg):
        self.file.write(f'[INFO]: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} {msg}\n')
        self.flush()

    def debug(self, msg):
        self.file.write(f'[DEBUG]: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")} {msg}\n')
        self.flush()

    def close(self):
        self.file.close()
