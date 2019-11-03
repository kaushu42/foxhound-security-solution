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
        Object to parse all history data to create ip profile
    """

    def __init__(self, dir_to_parse, ip_profile_dir):
        """Constructor for Initialize class

        Parameters
        ----------
        dir_to_parse : str
            Provide the location of csv create individual ip profile
        ip_profile_dir : str
            Provide the location where individual ip profile needs to be stored
        """
        self._dir_to_parse = dir_to_parse
        self._ip_profile_dir = ip_profile_dir
        self._features = features_list

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
        temp['Receive Time'] = temp['Receive Time'].apply(lambda x: x[-8:])
        rows = temp.values
        rows = [[sum([(weight+1)*char for weight, char in enumerate(list(bytearray(cell, encoding='utf8'))[::-1])])
                 if isinstance(cell, str) else cell for cell in row] for row in rows]
        return pd.DataFrame(rows, index=df.index, columns=temp.columns)

    def _save_to_csv(self, df, dest_file_path):
        """Method to save dataframe to respective ip's csv if available, else create one

        Parameters
        ----------
        df : Pandas Dataframe
            Contains individual ip's data i.e ip profile
        dest_file_path : str
            Provide the location of ip's csv file in ip profile directory to search/use tosave data
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

    def _create_ip_profile(self, src_file_path, dest_path, features_list):
        """Method to create ip profile from daily csv file

        Parameters
        ----------
        src_file_path : str
            Location of input csv file to read
        dest_path : str
            Location of ip profile directory to save ip's profile to
        features_list : list
            List of features to consider for analysis
        """
        df = pd.read_csv(src_file_path)
        df = df[features_list]  # feature selection
        df['Receive Time'] = df['Receive Time'].apply(
            lambda x: x[-8:])  # remove date information from dataframe
        ips = df['Source address'].unique()  # get a list of unique ips
        print(f'{len(ips)} ips found')
        private_ips = ips[[ipaddress.ip_address(ip).is_private for ip in ips]]
        print(f'{len(private_ips)} private ips found')

        for vsys in df['Virtual System'].unique():
            vsys_csv_path = os.path.join(dest_path, vsys)
            if os.path.exists(vsys_csv_path) is not True:
                os.makedirs(vsys_csv_path)
            vsys_df = df[df['Virtual System'] == vsys]
            ips = vsys_df['Source address'].unique()
            private_ips = ips[[ipaddress.ip_address(
                ip).is_private for ip in ips]]

            for ip in private_ips:  # create csv file for individual ips
                ip_csv_path = os.path.join(vsys_csv_path, (ip+'.csv'))
                ip_df = vsys_df[vsys_df['Source address'] == ip]
                # call method to write to csv file
                ip_df = self._preprocess(ip_df)
                self._save_to_csv(ip_df, ip_csv_path)

    def parse_all_csv(self):
        """Method to parse all history csv to create ip profile
        """
        if os.path.exists(self._ip_profile_dir) is not True:
            os.makedirs(self._ip_profile_dir)
            print(
                f'**********Directory {self._ip_profile_dir} created **********')

        if os.path.exists(self._dir_to_parse):
            files = os.listdir(self._dir_to_parse)
            total = len(files)
            count = 1
            for csv in sorted(os.listdir(self._dir_to_parse)):
                csv_file_path = os.path.join(self._dir_to_parse, csv)
                print(
                    f'[{count}/{total}]**********Processing {csv_file_path} file **********')
                self._create_ip_profile(
                    csv_file_path, self._ip_profile_dir, self._features)
                count = count+1
        else:
            print(f'{self._dir_to_parse} doesnt exist')
