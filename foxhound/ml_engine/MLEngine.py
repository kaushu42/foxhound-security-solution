import os
import datetime as dt
import ipaddress

import numpy as np
import pandas as pd

import csv
import pickle

from .variables import features_list
from .model import AutoEncoder


class MLEngine(AutoEncoder):
    """MLEngine class

    Returns
    -------
    Object
        MLEngine class object to create model for ip profile and predict anomaly
    """

    def __init__(self, tenant_profile_dir, tenant_model_dir, daily_csv_path, anomalies_csv_output_path, verbose=0):
        """Constructor for MLEngine class

        Parameters
        ----------
        ip_profile_dir : str
            Location of csv files where individual ip's profile is stored
        ip_model_dir : str
            Location of model files where individual ip's model is stored
        daily_csv_path : str
            Location of csv files where daily transactions is stored
        anomalies_csv_output_path : str
            Location of files where anomaly csv file is to be stored

        Raises
        ------
        TypeError
            if ip_profile_dir parameter is not a string
        TypeError
            if ip_model_dir parameter is not a string
        TypeError
            if daily_csv_path parameter is not a string
        TypeError
            if anomalies_csv_output_path is not a string
        """
        if isinstance(tenant_profile_dir, str) is not True:
            raise TypeError('IP profile dir parameter must be a string')

        if isinstance(tenant_model_dir, str) is not True:
            raise TypeError("IP model dir parameter must be a string")

        if isinstance(daily_csv_path, str) is not True:
            raise TypeError("Daily csv dir parameter must be a string")

        if isinstance(anomalies_csv_output_path, str) is not True:
            raise TypeError("Anomalies csv dir parameter must be a string")

        assert os.path.exists(
            tenant_profile_dir) is True, "Initialize the system first."

        if os.path.exists(anomalies_csv_output_path) is not True:
            os.makedirs(anomalies_csv_output_path)

        self._TENANT_PROFILE_DIR = tenant_profile_dir
        self._TENANT_MODEL_DIR = tenant_model_dir
        self._FEATURES = features_list
        self._DAILY_CSV_DIR = daily_csv_path
        self._ANOMALIES_CSV_OUTPUT_DIR = anomalies_csv_output_path

        super(MLEngine, self).__init__(len(self._FEATURES)-1, verbose=verbose)

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

    def _save_model_params(self, params_dict, model_path):
        """Method to save parameters of ml model

        Parameters
        ----------
        params_dict : dictionary
            Contains model's parameters to save
        model_path : str
            Location to save model's parameters to
        """
        self.save_model(model_path)
        pickle.dump(params_dict, open(f'{model_path}/params.pkl', 'wb'))

    def _load_model_params(self, model_path):
        """Method to load ml model's parameters

        Parameters
        ----------
        model_path : str
            Location of model to load from

        Returns
        -------
        dictionary
            Contains model's parameters
        """
        model = self.load_model(model_path)
        params = pickle.load(open(f'{model_path}/params.pkl', 'rb'))

        return model, params

    def _create_tenant_models(self):
        if os.path.exists(self._TENANT_MODEL_DIR) is not True:
            os.makedirs(self._TENANT_MODEL_DIR)

        if os.path.exists(self._TENANT_PROFILE_DIR) is True:
            for tenant in sorted(os.listdir(self._TENANT_PROFILE_DIR)):
                tenant_profile_dir = os.path.join(self._TENANT_PROFILE_DIR, tenant)
                tenant_model_dir = os.path.join(self._TENANT_MODEL_DIR, tenant)

                if os.path.exists(tenant_model_dir) is not True:
                    os.makedirs(tenant_model_dir)

                for profile_csv in sorted(os.listdir(tenant_profile_dir)):
                    tenant_csv_path = os.path.join(tenant_profile_dir, profile_csv)
                    tenant_df = pd.read_csv(tenant_csv_path)
                    tenant_df, mean, std = self.normalize_data(tenant_df)
                    print(f'**************** Training model for {tenant_profile_dir}****************')
                    self.train_model(tenant_df)
                    print(f'**************** Training model for {tenant_profile_dir}****************')
                    self._save_model_params({'mean': mean, 'std': std}, tenant_model_dir)

    def _create_models(self):
        """Method to create models for ips in ip profile directory
        """
        if os.path.exists(self._IP_MODEL_DIR) is not True:
            os.makedirs(self._IP_MODEL_DIR)

        if os.path.exists(self._IP_PROFILE_DIR) is True:
            for zone in sorted(os.listdir(self._IP_PROFILE_DIR)):
                zone_profile_dir = os.path.join(self._IP_PROFILE_DIR, zone)
                zone_model_dir = os.path.join(self._IP_MODEL_DIR, zone)

                if os.path.exists(zone_model_dir) is not True:
                    os.makedirs(zone_model_dir)

                for ip_csv_file in sorted(os.listdir(zone_profile_dir)):
                    ip_csv_path = os.path.join(
                        self._IP_PROFILE_DIR, zone, ip_csv_file)
                    ip_model_path = os.path.join(
                        zone_model_dir, (ip_csv_file[:-3] + 'pkl'))
                    ip_df = pd.read_csv(ip_csv_path)

                    if len(ip_df.index) > 50:
                        model_with_params = pca(ip_df, ip_model_path)
                        self._save_model_params(
                            model_with_params, ip_model_path)
                    else:
                        pass
                        # print(
                        #    f'Not sufficient data to create model for {ip_csv_file}')
        else:
            print(f'IP profile path {self._IP_PROFILE_DIR} doesnot exist')

    def _predict(self, df, model_path):
        """Method to predict anomaly from ip's dataframe using respective model

        Parameters
        ----------
        df : Pandas Dataframe
            Dataframe of ip to find whether each transaction is an anomaly or not
        model_path : str
            Location of ip's model

        Returns
        -------
        list of int
            List of indices that are anomalous
        """
        params = self._load_model_params(model_path)
        x = params['standarizer'].transform(df)
        out = params['model'].transform(x)
        #plt.plot(out, 'ro')
        indices = np.where(np.abs(out) > params['std']*3)[0]
        return indices

    def get_anomalies(self, input_csv, save_data_for_ip_profile=False):
        """Method to get anomaly from input csv

        Parameters
        ----------
        input_csv : str
            Location of input csv to find anomaly from
        save_data_for_ip_profile : bool, optional
            Set it to True in order to save this new data for ip profile, by default False

        Returns
        -------
        Pandas Dataframe
            Dataframe containing anomalous entries from the input csv
        """
        df = pd.read_csv(input_csv)
        truncated_df = df[self._FEATURES]
        anomalous_df = df.head(0)
        anomalous_without_model_count = 0
        for zone in df['Source Zone'].unique():
            zone_df = truncated_df[truncated_df['Source Zone'] == zone]

            ips = zone_df['Source address'].unique()
            private_ips = ips[[ipaddress.ip_address(
                ip).is_private for ip in ips]]

            for ip in private_ips:
                ip_csv_path = os.path.join(
                    self._IP_PROFILE_DIR, zone, f'{ip}.csv')
                model_path = os.path.join(
                    self._IP_MODEL_DIR, zone, f'{ip}.pkl')

                ip_df = zone_df[zone_df['Source address'] == ip].copy()
                ip_df = self._preprocess(ip_df)

                if os.path.exists(model_path) is True:
                    indices = self._predict(ip_df, model_path)
                    anomalous_df = pd.concat(
                        [anomalous_df, df.iloc[ip_df.index[indices]]], axis=0)
                else:
                    anomalous_without_model_count += len(ip_df.index)
                    anomalous_df = pd.concat(
                        [anomalous_df, df.iloc[ip_df.index]], axis=0)

                if save_data_for_ip_profile is True:
                    self._save_to_csv(ip_df, ip_csv_path)
                    #print(f'Saved data for ip {ip}')

        anomalous_df['log_name'] = input_csv.split('/')[-1]
        print(
            f'{anomalous_without_model_count}/{len(anomalous_df.index)} : Anomalous without model')
        return anomalous_df

    def _predict_anomalies(self):
        """Method to predict anomalies from csvs' from input directory
        """
        if os.path.exists(self._DAILY_CSV_DIR) is True:
            anomalous_df = []
            for csv in sorted(os.listdir(self._DAILY_CSV_DIR)):
                print(f'**********Processing {csv} **********')
                csv_file_path = os.path.join(self._DAILY_CSV_DIR, csv)
                anomalous_df.append(self.get_anomalies(
                    csv_file_path, save_data_for_ip_profile=True))

            anomalous_df = pd.concat(anomalous_df)
            anomalous_df.to_csv(os.path.join(
                self._ANOMALIES_CSV_OUTPUT_DIR, str(dt.datetime.now().date())+'.csv'))

        else:
            print("Daily csv directory does not exist")

    def run(self, create_model=False, predict=False):
        """Method to perform create_model and predict operation using MLEngine object

        Parameters
        ----------
        create_model : bool, optional
            Set it True to perform model creation, by default False
        predict : bool, optional
            Set it True to perform anomaly prediction, by default False
        """
        if create_model:
            print("Creating models")
            self._create_tenant_models()
            print("Model created")
        if predict:
            self._predict_anomalies()
