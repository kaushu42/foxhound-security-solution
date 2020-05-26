import os
import math
import time

import numpy as np
import pandas as pd
import ipaddress

import csv

from pyspark.sql.functions import udf

from .spark_config import raw_datafield_schema
from .variables import features_list, features_to_convert_to_number


class Initialize():
    """Initialize Class

    Returns
    -------
    Object
        Object to parse all history data to create tenant profile
    """

    def __init__(self, dir_to_parse, tenant_profile_dir, spark_session):
        """Constructor for Initialize class

        Parameters
        ----------
        dir_to_parse : str
            Provide the location of csv create individual tenant profile
        tenant_profile_dir : str
            Provide the location where individual tenant's profile needs to be stored
        """
        self._dir_to_parse = dir_to_parse
        self._TENANT_PROFILE_DIR = tenant_profile_dir
        self._features = features_list
        self._TENANT_FEATURE = 'Rule'
        self._USER_FEATURE = 'Source address'
        self._TIME_FEATURE = 'Time Logged'

        self._SPARK = spark_session

    def _str_to_num(self, column):
        return sum([(weight+1)*char for weight, char in enumerate(list(bytearray(column, encoding='utf8'))[::-1])])

    def _preprocess(self, df):
        """Method to preprocess dataframe

        Parameters
        ----------
        df : Pandas Dataframe
            Input the dataframe of csv file

        Returns
        -------
        Pandas Dataframe
            Dataframe after removing unnecessary features and numeric representation
        """
        # temp = df.copy()
        def str_to_num(x): # passing object function i.e self._str to lambda function causes pickling error
            return sum([(weight+1)*char for weight, char in enumerate(list(bytearray(x, encoding='utf8'))[::-1])])

        slice_hour = udf(lambda x: x[-8:-6])
        sin_time = udf(lambda x: round(math.sin((2*math.pi/24)*int(x)), 3))
        cos_time = udf(lambda x: round(math.cos((2*math.pi/24)*int(x)), 3))
        convert_to_num = udf(lambda x: str_to_num(x))

        df = df.withColumn(self._TIME_FEATURE, slice_hour(df[self._TIME_FEATURE]))     
        df = df.withColumn('sin_time', sin_time(df[self._TIME_FEATURE]))
        df = df.withColumn('cos_time', cos_time(df[self._TIME_FEATURE]))

        df = df.drop(*[self._TIME_FEATURE])
        df = df.select(*[convert_to_num(column).name(column) if column in features_to_convert_to_number else column for column in df.columns])
        
        return df

    def _save_to_csv(self, df, dest_file_path):
        """Method to save dataframe to respective tenant's csv if available, else create one

        Parameters
        ----------
        df : Pandas Dataframe
            Contains individual tenant's data i.e tenant profile
        dest_file_path : str
            Provide the location of tenant's csv file in tenant profile directory to search/use tosave data
        """
        if os.path.isdir(dest_file_path):
            df.write.csv(dest_file_path, mode='append', header=False)
        else:
            df.write.csv(dest_file_path, header=True)

    def _create_ip_profile(self, df, dest_path):
        """Method to create tenant profile from daily csv file

        Parameters
        ----------
        src_file_path : str
            Location of input csv file to read
        dest_path : str
            Location of tenant profile directory to save tenant's profile to
        features_list : list of strings
            List of features to consider for analysis
        """
        start = time.time()
        df = df.na.fill('unknown', subset=['Session End Reason'])
        ips = np.array(df.select(self._USER_FEATURE).distinct().rdd.flatMap(lambda x: x).collect())
        # ips = df.select(self._USER_FEATURE).toPandas()[self._USER_FEATURE].unique()
        private_ips = ips[[ipaddress.ip_address(ip).is_private for ip in ips]].tolist()

        df = df.filter(df[self._USER_FEATURE].isin(private_ips))
        df = self._preprocess(df)

        df.repartition(1).write.partitionBy([self._TENANT_FEATURE, self._USER_FEATURE]).csv(dest_path, mode='append', header=True)
    
        print(time.time() - start)          

    def parse_all_csv(self):
        """Method to parse all history csv to create tenant profile
        """
        if os.path.exists(self._TENANT_PROFILE_DIR) is not True:
            os.makedirs(self._TENANT_PROFILE_DIR)

        if os.path.exists(self._dir_to_parse):
            spark_csv_files = sorted(os.listdir(self._dir_to_parse))
            total_spark_csv_files = len(spark_csv_files)
            spark_csv_file_count = 1

            for spark_csv in spark_csv_files:
                spark_csv_path = os.path.join(self._dir_to_parse, spark_csv)

                if spark_csv_path.endswith('.csv'):
                    print(
                        f'[{spark_csv_file_count}/{total_spark_csv_files}]-> **********Processing {spark_csv} file **********')
                    df = self._SPARK.read.csv(spark_csv_path, inferSchema=True, header=True)
                    df = df.select(self._features)
                    self._create_ip_profile(df, self._TENANT_PROFILE_DIR)

                    print(f"[{spark_csv_file_count}/{total_spark_csv_files}]-> ********** Parsed {spark_csv} file **********")
                spark_csv_file_count += 1
        else:
            print(f'{self._dir_to_parse} doesnt exist')
