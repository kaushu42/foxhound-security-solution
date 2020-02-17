import luigi
import datetime

class LogTask(luigi.Task):
    def output(self):
        return luigi.LocalTarget('luigitemp.tmp')

    def run(self):
        print("hello world")
