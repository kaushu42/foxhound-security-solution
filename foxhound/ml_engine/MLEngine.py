import os
import numpy as np
import pandas as pd

import csv
import pickle

from .variables import features_list
from .model import pca


class MLEngine():
    def __init__(self, ip_profile_dir, ip_model_dir, daily_csv_path):
        if isinstance(ip_profile_dir, str) is not True:
            raise TypeError('IP profile dir must be a string')

        if isinstance(ip_model_dir, str) is not True:
            raise TypeError("IP model dir must be a string")

        self._IP_PROFILE_DIR = ip_profile_dir
        self._IP_MODEL_DIR = ip_model_dir
        self._FEATURES = features_list
        self._DAILY_CSV_DIR = daily_csv_path


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


    def _save_model_params(self, params_dict, model_path):
        pickle.dump(params_dict, open(model_path, 'wb'))

    def _load_model_params(self, model_path):
        return pickle.load(open(model_path, 'rb'))

    def _predict(self, ip, df, model_path):
        params = self._load_model_params(model_path)
        x = params['standarizer'].transform(df)
        out = params['model'].transform(x)
        #plt.plot(out, 'ro')
        indices = np.where(np.abs(out) > params['std']*3)[0]
        return indices


    def parse_all_csv(self, csv_to_parse_dir):
        if os.path.exists(self._IP_PROFILE_DIR) is not True:
            os.makedirs(self._IP_PROFILE_DIR)
            print(f'**********Directory {self._IP_PROFILE_DIR} created **********')

        if os.path.exists(csv_to_parse_dir):
            files = os.listdir(csv_to_parse_dir)
            total = len(files)
            count = 0
            for csv in os.listdir(csv_to_parse_dir):
                csv_file_path = os.path.join(csv_to_parse_dir, csv)
                print(
                    f'[{count}/{total}]**********Processing {csv_file_path} file **********')
                self._create_ip_profile(csv_file_path, self._IP_PROFILE_DIR, self._FEATURES)
                count = count+1
        else:
            print(f'{csv_to_parse_dir} doesnt exist')

    def _create_models(self):
        if os.path.exists(self._IP_MODEL_DIR) is not True:
            os.makedirs(self._IP_MODEL_DIR)

        if os.path.exists(self._IP_PROFILE_DIR) is True:
            for vsys in os.listdir(self._IP_PROFILE_DIR):
                vsys_profile_dir = os.path.join(self._IP_PROFILE_DIR, vsys)
                vsys_model_dir = os.path.join(self._IP_MODEL_DIR, vsys)

                if os.path.exists(vsys_model_dir) is not True:
                    os.makedirs(vsys_model_dir)

                for ip_csv_file in os.listdir(vsys_profile_dir):
                    ip_csv_path = os.path.join(
                        self._IP_PROFILE_DIR, vsys, ip_csv_file)
                    ip_model_path = os.path.join(vsys_model_dir, (ip_csv_file[:-3] + 'pkl'))
                    ip_df = pd.read_csv(ip_csv_path)
                    if len(ip_df.index) > 100:
                        print(f'Creating model for {ip_csv_file}')
                        model_with_params = pca(ip_df, ip_model_path)
                        self._save_model_params(model_with_params, ip_model_path)
                        print(f'Model created for {ip_csv_file}')
                    else:
                        print(f'Not suffiecient data to create model for {ip_csv_file}')
        else:
            print(f'IP profile path {self._IP_PROFILE_DIR} doesnot exist')



    def get_anomalous_df(self, input_csv, save_data_for_ip_profile=False):
        df = pd.read_csv(input_csv)
        truncated_df = df[self._FEATURES]
        anomalous_df = df.head(0)
        anomalous_without_model_count = 0
        for vsys in df['Virtual System'].unique():
            vsys_df = truncated_df[truncated_df['Virtual System'] == vsys]

            for ip in df['Source address'].unique():
                ip_csv_path = os.path.join(self._IP_PROFILE_DIR, vsys, f'{ip}.csv')
                model_path = os.path.join(self._IP_MODEL_DIR, vsys, f'{ip}.pkl')

                ip_df = vsys_df[vsys_df['Source address'] == ip].copy()
                ip_df = self._preprocess(ip_df)

                if os.path.exists(model_path) is True:
                    indices = self._predict(ip, ip_df, model_path)
                    anomalous_df = pd.concat(
                        [anomalous_df, df.iloc[ip_df.index[indices]]], axis=0)
                else:
                    anomalous_without_model_count += len(ip_df.index)
                    anomalous_df = pd.concat(
                        [anomalous_df, df.iloc[ip_df.index]], axis=0)


                if save_data_for_ip_profile is True:
                    self._save_to_csv(ip_df, ip, ip_csv_path)
                    print(f'Saved data for ip {ip}')

        anomalous_df['log_name'] = input_csv.split('/'  )[-1]
        print(f'{anomalous_without_model_count}/{len(anomalous_df.index)} Anomalous without model')
        return anomalous_df

    def _predict(self):
        if os.path.exists(self._DAILY_CSV_DIR) is True:
            anomalous_df = []
            for csv in os.listdir(self._DAILY_CSV_DIR):
                print(f'**********Processing {csv} **********')
                csv_file_path = os.path.join(self._DAILY_CSV_DIR, csv)
                anomalous_df.append(self.get_anomalous_df(csv_file_path, save_data_for_ip_profile=True))

            anomalous_df = pd.concat(anomalous_df)
            return anomalous_df

        else:
            print("Daily csv directory does not exist")


    def run(self, create_model=False, predict=False):
        if predict:
            return self._predict()
        elif create_model:
            self._create_models()
