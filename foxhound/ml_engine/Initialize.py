import os
import numpy as np
import pandas as pd

import csv

from .variables import features_list


class Initialize():

    def __init__(self, dir_to_parse, ip_profile_dir):
        self._dir_to_parse = dir_to_parse
        self._ip_profile_dir = ip_profile_dir
        self._features = features_list

    def _preprocess(self, df):
        temp = df.copy()
        temp['Receive Time'] = temp['Receive Time'].apply(lambda x: x[-8:])
        rows = temp.values
        rows = [[sum(bytearray(cell, encoding='utf8')) if isinstance(
            cell, str) else cell for cell in row] for row in rows]
        return pd.DataFrame(rows, index=df.index, columns=temp.columns)

    def _save_to_csv(self, df, ip, dest_file_path):
        if os.path.isfile(dest_file_path):
            with open(dest_file_path, 'a') as outfile:
                c = csv.writer(outfile)
                for index, row in df.iterrows():
                    c.writerow(row.values)
        else:
            count = 0
            with open(dest_file_path, 'w') as outfile:
                c = csv.writer(outfile)
                for index, row in df.iterrows():
                    if count == 0:
                        count = 1
                        c.writerow(df.columns)
                    c.writerow(row.values)

    def _create_ip_profile(self, src_file_path, dest_path, features_list):
        df = pd.read_csv(src_file_path)
        df = df[features_list]  # feature selection
        df['Receive Time'] = df['Receive Time'].apply(
            lambda x: x[-8:])  # remove date information from dataframe
        ips = df['Source address'].unique()  # get a list of unique ips
        print(f'{len(ips)} ips found')

        for vsys in df['Virtual System'].unique():
            vsys_csv_path = os.path.join(dest_path, vsys)
            if os.path.exists(vsys_csv_path) is not True:
                os.makedirs(vsys_csv_path)
            vsys_df = df[df['Virtual System'] == vsys]

            for ip in ips:  # create csv file for individual ips
                ip_csv_path = os.path.join(vsys_csv_path, (ip+'.csv'))
                ip_df = vsys_df[vsys_df['Source address'] == ip]
                # call method to write to csv file
                ip_df = self._preprocess(ip_df)
                self._save_to_csv(ip_df, ip, ip_csv_path)

    def parse_all_csv(self):
        if os.path.exists(self._ip_profile_dir) is not True:
            print("hello world")
            os.makedirs(self._ip_profile_dir)
            print(
                f'**********Directory {self._ip_profile_dir} created **********')

        if os.path.exists(self._dir_to_parse):
            files = os.listdir(self._dir_to_parse)
            total = len(files)
            count = 1
            for csv in os.listdir(self._dir_to_parse):
                csv_file_path = os.path.join(self._dir_to_parse, csv)
                print(
                    f'[{count}/{total}]**********Processing {csv_file_path} file **********')
                self._create_ip_profile(
                    csv_file_path, self._ip_profile_dir, self._features)
                count = count+1
        else:
            print(f'{self._dir_to_parse} doesnt exist')
