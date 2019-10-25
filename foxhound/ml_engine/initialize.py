import os
import numpy as np
import pandas as pd
import csv
import re

from .variables import features_list


def preprocess_df_and_save_to_csv(df, ip, dest_path):
    dest_file_path = f'{dest_path}/{ip}.csv'
    if os.path.isfile(dest_file_path):
        with open(dest_file_path, 'a') as outfile:
            c = csv.writer(outfile)
            for index, row in df.iterrows():
                c.writerow([sum(bytearray(cell, encoding='utf8')) if isinstance(
                    cell, str) else cell for cell in row.values])  # convert to numeric for string data

    else:
        count = 0
        with open(dest_file_path, 'a') as outfile:
            c = csv.writer(outfile)
            for index, row in df.iterrows():
                if count == 0:
                    count = 1
                    c.writerow(df.columns)
                c.writerow([sum(bytearray(cell, encoding='utf8')) if isinstance(
                    cell, str) else cell for cell in row.values])


def create_ip_profile(src_file_path, dest_path, features_list):
    df = pd.read_csv(src_file_path)
    df = df[features_list]  # feature selection
    df['Receive Time'] = df['Receive Time'].apply(
        lambda x: x[-8:])  # remove date information from dataframe
    ips = df['Source address'].unique()  # get a list of unique ips
    print(f'{len(ips)} ips found')
    for vsys in df['Virtual System'].unique():
        vsys_csv_path = os.path.join(dest_path, vsys)
        if not os.path.exists(vsys_csv_path):
            os.makedirs(vsys_csv_path)
        vsys_df = df[df['Virtual System'] == vsys]
        for ip in ips:  # create csv file for individual ips
            temp = vsys_df[vsys_df['Source address'] == ip]
            # call method to write to csv file
            preprocess_df_and_save_to_csv(temp, ip, vsys_csv_path)


def parse_all_csv(src_path, dest_path, features_list):
    if not os.path.exists(dest_path):
        os.makedirs(dest_path)
        print(f'**********Directory {dest_path} created **********')
    if os.path.exists(src_path):
        files = os.listdir(src_path)
        total = len(files)
        count = 0
        for file in os.listdir(src_path):
            src_file_path = src_path+'/'+file
            print(
                f'[{count}/{total}]**********Processing {src_file_path} file **********')
            create_ip_profile(src_file_path, dest_path, features_list)
            count = count+1
    else:
        print(f'{src_path} doesnt exist')
