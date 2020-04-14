class Logger:
    def __init__(self, filename='main.log'):
        self.file = open(filename, 'a')

    def error(self, msg):
        self.file.write(f'[ERROR]: {msg}\n')

    def info(self, msg):
        self.file.write(f'[INFO]: {msg}\n')

    def debug(self, msg):
        self.file.write(f'[DEBUG]: {msg}\n')

    def close(self):
        self.file.close()
