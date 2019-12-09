import findspark
findspark.init()
from pyspark.sql import SparkSession

from pyspark.sql import SQLContext
from pyspark import SparkContext

class Spark:
   __sparkSession = None
   __sqlContext = None
   __sparkContext = None
   __instance = None
   @staticmethod
   def initSparkSession():
      """ Static access method. """
      if Spark.__sparkContext == None and Spark.__sqlContext == None and Spark.__sparkContext== None :
         Spark()
      Spark.__sparkSession = SparkSession.builder.appName("foxhound").getOrCreate()
      Spark.__sparkContext =SparkContext.getOrCreate()
      Spark.__sqlContext = SQLContext(Spark.__sparkContext)
      return Spark.__sparkSession,Spark.__sparkContext,Spark.__sqlContext
   def __init__(self):
      """ Virtually private constructor. """
      if Spark.__sparkContext != None and Spark.__sqlContext != None and Spark.__sparkSession != None:
         raise Exception("This class is a singleton!")
      else:
         Spark.__sparkContext = self.__sparkContext
         Spark.__sparkSession = self.__sparkSession
         Spark.__sqlContext = self.__sqlContext