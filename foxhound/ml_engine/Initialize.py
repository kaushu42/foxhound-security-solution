import os
import numpy as np
import pandas as pd
import ipaddress

import csv

from .variables import features_list


class Initialize():
    """Initialize Class

    Returns
    -------
    Object
        Object to parse all history data to create tenant profile
    """

    def __init__(self, dir_to_parse, tenant_profile_dir):
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
        self._TENANT_FEATURE = 'firewall_rule_id'
        self._USER_FEATURE = 'source_ip_id'
        self._TIME_FEATURE = 'logged_datetime'

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
        temp = df.copy()

        temp[self._TIME_FEATURE] = temp[self._TIME_FEATURE].apply(
            lambda x: x[-8:-6])  # remove date information from dataframe
        temp['sin_time'] = temp.logged_datetime.apply(lambda x: np.sin((2*np.pi/24)*int(x)))
        temp['cos_time'] = temp.logged_datetime.apply(lambda x: np.cos((2*np.pi/24)*int(x)))
        temp.drop(columns=[self._TIME_FEATURE], inplace=True)

        columns = temp.columns
        rows = temp = temp.values

        rows = [[sum([(weight+1)*char for weight, char in enumerate(list(bytearray(cell, encoding='utf8'))[::-1])])
                 if isinstance(cell, str) else cell for cell in row] for row in rows]
        return pd.DataFrame(rows, index=df.index, columns=columns)

    def _save_to_csv(self, df, dest_file_path):
        """Method to save dataframe to respective tenant's csv if available, else create one

        Parameters
        ----------
        df : Pandas Dataframe
            Contains individual tenant's data i.e tenant profile
        dest_file_path : str
            Provide the location of tenant's csv file in tenant profile directory to search/use tosave data
        """
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
        df.session_end_reason_id.fillna('unknown', inplace=True)

        for tenant in df[self._TENANT_FEATURE].unique():
            tenant_path = os.path.join(dest_path, tenant)
            if os.path.exists(tenant_path) is not True:
                os.makedirs(tenant_path)
            tenant_df = df[df[self._TENANT_FEATURE] == tenant]

            ips = tenant_df[self._USER_FEATURE].unique()
            private_ips = ips[[ipaddress.ip_address(
                ip).is_private for ip in ips]]

            for ip in sorted(private_ips):
                ip_csv_path = os.path.join(tenant_path, (ip+'.csv'))
                ip_df = tenant_df[tenant_df[self._USER_FEATURE] == ip]
                ip_df.reset_index(inplace=True)
                ip_df = ip_df.drop(
                    columns=['index', self._TENANT_FEATURE, self._USER_FEATURE])
                ip_df = self._preprocess(ip_df)

                self._save_to_csv(ip_df, ip_csv_path)

    def _parse_in_chunks(self, src_file_path, dest_path, features_list):
        n_chunks = 0
        df = pd.read_csv(src_file_path, usecols=features_list, chunksize=100000000)# 100 million

        for df_chunk in df:
            self._create_ip_profile(df_chunk, dest_path)
            n_chunks += 1

        return n_chunks

    def parse_all_csv(self):
        """Method to parse all history csv to create tenant profile
        """
        if os.path.exists(self._TENANT_PROFILE_DIR) is not True:
            os.makedirs(self._TENANT_PROFILE_DIR)

        if os.path.exists(self._dir_to_parse):
            csv_folders = sorted(os.listdir(self._dir_to_parse))
            total_csv_folders = len(csv_folders)
            csv_folder_count = 1

            for csv_folder in csv_folders:
                csv_folder_path = os.path.join(self._dir_to_parse, csv_folder)
                csv_folder_files = sorted([file for file in os.listdir(csv_folder_path) if file.endswith('.csv')])
                total_folder_files = len(csv_folder_files)
                csv_file_count = 1

                for csv_file in csv_folder_files:
                    if csv_file.endswith('.csv'):
                        csv_file_path = os.path.join(csv_folder_path, csv_file)
                        print(
                            f'[{csv_folder_count}/{total_csv_folders}]->[Part: {csv_file_count}/{total_folder_files}]**********Processing {csv_folder} file **********')
                        n_chunks = self._parse_in_chunks(
                            csv_file_path, self._TENANT_PROFILE_DIR, self._features)

                        print(f"[{csv_folder_count}/{total_csv_folders}]->[Part: {csv_file_count}/{total_folder_files}]********** Parsed {csv_folder} in {n_chunks} chunks **********")
                        csv_file_count += 1
                csv_folder_count += 1
        else:
            print(f'{self._dir_to_parse} doesnt exist')
