import os
import datetime as dt
import ipaddress

import numpy as np
import pandas as pd

import csv
import joblib

from .variables import features_list, categorical_features
from .model import AutoEncoder


class MLEngine(AutoEncoder):
    """MLEngine class

    Returns
    -------
    Object
        MLEngine class object to create model for tenant profile and predict anomaly
    """

    def __init__(self, tenant_profile_dir, tenant_model_dir, daily_csv_path, anomalies_csv_output_path, verbose=0):
        """Constructor for MLEngine class

        Arguments:
            tenant_profile_dir {str} -- Location of csv files where tenant's profile is stored
            tenant_model_dir {str} -- Location of model files where tenant's model is stored
            daily_csv_path {str} -- Location of csv files where daily transactions is stored
            anomalies_csv_output_path {str} -- Location of files where anomaly csv file is to be stored

        Keyword Arguments:
            verbose {int} -- Verbose (default: {0})

        Raises:
            TypeError: if tenant_profile_dir parameter is not a string
            TypeError: if tenant_model_dir parameter is not a string
            TypeError: if daily_csv_path parameter is not a string
            TypeError: if anomalies_csv_output_path is not a string
        """
        if isinstance(tenant_profile_dir, str) is not True:
            raise TypeError('tenant profile dir parameter must be a string')

        if isinstance(tenant_model_dir, str) is not True:
            raise TypeError("tenant model dir parameter must be a string")

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
        self._CATEGORICAL_FEATURES = categorical_features
        self._DAILY_CSV_DIR = daily_csv_path
        self._ANOMALIES_CSV_OUTPUT_DIR = anomalies_csv_output_path

        super(MLEngine, self).__init__(verbose=verbose)

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
        # temp['logged_datetime'] = temp['logged_datetime'].apply(
        #     lambda x: x[-8:])

        temp['logged_datetime'] = temp['logged_datetime'].apply(
            lambda x: x[-8:-6])  # remove date information from dataframe
        temp['sin_time'] = temp.logged_datetime.apply(lambda x: np.sin((2*np.pi/24)*int(x)))
        temp['cos_time'] = temp.logged_datetime.apply(lambda x: np.cos((2*np.pi/24)*int(x)))
        temp.drop(columns=['logged_datetime'], inplace=True)

        rows = temp.values
        rows = [[sum([(weight+1)*char for weight, char in enumerate(list(bytearray(cell, encoding='utf8'))[::-1])])
                 if isinstance(cell, str) else cell for cell in row] for row in rows]
        return pd.DataFrame(rows, index=df.index, columns=temp.columns)

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

    def _save_model_params(self, params_dict, model_path, categorical_params):
        """Method to save parameters of ml model

        Parameters
        ----------
        params_dict : dictionary
            Contains model's parameters to save eg. standarizer
        model_path : str
            Location to save model's parameters to
        """
        if os.path.exists(model_path) is not True:
            os.makedirs(model_path)
        self.save_model(model_path)
        joblib.dump(params_dict, f'{model_path}/params.sav')

        self.save_categorical_features_params(categorical_params, model_path)

    def _load_model_params(self, model_path):
        """Method to load ml model's parameters

        Parameters
        ----------
        model_path : str
            Location of model to load from

        Returns
        -------
        model and dictionary
            Contains model's parameters
        """
        model = self.load_model(model_path)
        params = joblib.load(f'{model_path}/params.pkl')

        # categorical_params = self.load_categorical_features_params(model_path)

        return model, params

    def _create_models(self):
        """Method to create models for tenant in tenant profile directory
        """
        if os.path.exists(self._TENANT_MODEL_DIR) is not True:
            os.makedirs(self._TENANT_MODEL_DIR)

        if os.path.exists(self._TENANT_PROFILE_DIR) is True:
            for tenant in sorted(os.listdir(self._TENANT_PROFILE_DIR)):
                tenant_profile_dir = os.path.join(
                    self._TENANT_PROFILE_DIR, tenant)
                tenant_model_dir = os.path.join(self._TENANT_MODEL_DIR, tenant)

                if os.path.exists(tenant_model_dir) is not True:
                    os.makedirs(tenant_model_dir)

                for csv_file in sorted(os.listdir(tenant_profile_dir)):
                    csv_path = os.path.join(tenant_profile_dir, csv_file)
                    model_path = os.path.join(tenant_model_dir, csv_file[:-4])
                    print(model_path)
                    df = pd.read_csv(csv_path)
                    if len(df.index) > 1000:
                        categorical_params =  self.get_categorical_features_params(df)
                        df, standarizer = self.normalize_data(df)
                        print(
                            f'**************** Training model for {csv_path}****************')
                        self.train_model(df, model_path)
                        print(
                            f'**************** Trained model for {csv_path}****************')
                        self._save_model_params(
                            {
                                'standarizer': standarizer,
                            },
                            model_path,
                            categorical_params
                            )

                    else:
                        pass

    def get_categorical_features_params(self, df):
        total = len(df.index)
        prop = dict([(category, dict(df[category].value_counts()/total)) for category in self._CATEGORICAL_FEATURES])
        params = {'total': total, 'proportion': prop}

        return params

    def save_categorical_features_params(self, params, model_path):
        joblib.dump(params, model_path+"/categorical_params.sav")

    def load_categorical_features_params(self, model_path):
        params = joblib.load(model_path+'/categorical_params.sav')

        return params

    def update_history_params(self, df_params, model_path):
        # To be called only once for one csv while detecting anomaly

        history_params = self.load_categorical_features_params(model_path)
        history_prop = history_params['proportion']
        history_total = history_params['total']

        df_prop = df_params['proportion']
        df_total = df_params['total']

        history_ratio = history_total/(history_total+df_total)
        df_ratio = df_total/(history_total+df_total)

        updated_prop = dict([[feature, dict([(key, history_ratio*history_prop[feature].get(key, 0)+df_ratio*df_prop[feature].get(key, 0)) for key in history_prop[feature].keys()|df_prop[feature].keys()])] for feature in self._CATEGORICAL_FEATURES])
        updated_total = history_total+df_total

        max_prop = dict([(feature, updated_prop[feature][max(updated_prop[feature], key=updated_prop[feature].get)]) for feature in updated_prop])

        updated_params = {'total': updated_total, 'proportion': updated_prop, 'max_proportion': max_prop}

        return updated_params

    def _get_anomaly_reasons(self, df, model_params, history_params, df_params, anomaly_prop_threshold):
        anomalies = df.copy()

        mean = model_params['standarizer'].mean_
        std = np.sqrt(model_params['standarizer'].var_)

        max_prop = history_params['max_proportion']
        df_prop = df_params['proportion']

        truth_table = np.abs(anomalies-mean) > 3*std

        truth_table[self._CATEGORICAL_FEATURES] = False

        proportion = lambda anomaly, features, params: pd.Series([params[feature].get(anomaly[feature], 0) for feature in features])

        anomalies[self._CATEGORICAL_FEATURES] = anomalies.apply(lambda x: proportion(x, self._CATEGORICAL_FEATURES, df_prop), axis=1)
        max_prop = np.array([max_prop[feature] for feature in self._CATEGORICAL_FEATURES])

        truth_table[self._CATEGORICAL_FEATURES] = anomalies[self._CATEGORICAL_FEATURES] < (max_prop*anomaly_prop_threshold)

        reasons = [', '.join(df.columns[row])
                   for index, row in truth_table.iterrows()]

        return reasons

    def _predict(self, df, df_params, history_params, model_path):
        """Method to predict anomaly from tenant's dataframe using respective model

        Parameters
        ----------
        df : Pandas Dataframe
            Dataframe of tenant to find whether each transaction is an anomaly or not
        model_path : str
            Location of tenant's model

        Returns
        -------
        Boolean, list of int, array of str
            True if anomaly found, List of indices that are anomalous, Reasons of anomaly
        """
        model, params = self._load_model_params(model_path)
        x = params['standarizer'].transform(df)

        preds = model.predict(x)
        mse = np.mean(np.power(x - preds, 2), axis=1)
        #plt.plot(out, 'ro')
        indices = np.where(mse > 50)[0]

        if len(indices) is not 0:
            reasons = self._get_anomaly_reasons(
                df.iloc[indices], params, history_params, df_params, 0.05
            )
            return True, indices, reasons
        else:
            return False, None, None

    def get_tenant_anomalies(self, input_csv, save_data_for_tenant_profile=False):
        """Method to get anomaly from input csv

        Parameters
        ----------
        input_csv : str
            Location of input csv to find anomaly from
        save_data_for_tenant_profile : bool, optional
            Set it to True in order to save this new data for tenant profile, by default False

        Returns
        -------
        Pandas Dataframe
            Dataframe containing anomalous entries from the input csv
        """
        df = pd.read_csv(input_csv)
        truncated_df = df[self._FEATURES].copy()

        truncated_df.session_end_reason_id.fillna('unknown', inplace=True)

        private_ips_index = truncated_df.source_ip_id.apply(lambda x: ipaddress.ip_address(x).is_private)
        truncated_df = truncated_df[private_ips_index]

        anomalous_df = df.head(0)
        anomalous_without_model_count = 0
        anomalous_features = []

        for tenant in df['firewall_rule_id'].unique():
            csv_path = os.path.join(
                self._TENANT_PROFILE_DIR, tenant, f'{tenant}.csv')
            model_path = os.path.join(
                self._TENANT_MODEL_DIR, tenant, tenant)

            tenant_df = truncated_df[truncated_df['firewall_rule_id'] == tenant]
            #tenant_df.reset_index(inplace=True)
            tenant_df = tenant_df.drop(columns=['firewall_rule_id'])
            tenant_df = self._preprocess(tenant_df)

            if os.path.exists(model_path) is True:
                has_anomaly, indices, reasons = self._predict(
                    tenant_df, model_path)
                if has_anomaly:
                    anomalous_features.extend(reasons)
                    anomalous_df = pd.concat(
                        [anomalous_df, df.iloc[tenant_df.index[indices]]],
                        axis=0
                    )
                    #print((df.iloc[tenant_df.index[indices]]).source_ip_id)
            else:
                anomalous_without_model_count += len(tenant_df.index)
                anomalous_features.extend(['No model']*len(tenant_df.index))
                anomalous_df = pd.concat(
                    [anomalous_df, df.iloc[tenant_df.index]],
                    axis=0, ignore_index=True
                )

            if save_data_for_tenant_profile is True:
                self._save_to_csv(tenant_df, csv_path)
                #print(f'Saved data for tenant {tenant}')

        anomalous_features_df = pd.DataFrame(
            data=np.array(anomalous_features), columns=['Reasons']
        )
        anomalous_df = pd.concat([anomalous_df, anomalous_features_df], axis=1)
        # anomalous_df.reset_index(inplace=True)

        anomalous_df['log_name'] = input_csv.split('/')[-1]
        print(
            f'{anomalous_without_model_count}/{len(anomalous_df.index)} : Anomalous without model')

        return anomalous_df

    def get_ip_anomalies(self, input_csv, save_data_for_ip_profile=False):
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
        truncated_df = df[self._FEATURES].copy()

        truncated_df.session_end_reason_id.fillna('unknown', inplace=True)

        private_ips_index = truncated_df.source_ip_id.apply(lambda x: ipaddress.ip_address(x).is_private)
        truncated_df = truncated_df[private_ips_index]

        anomalous_df = df.head(0)
        anomalous_without_model_count = 0
        anomalous_features = []

        for tenant in truncated_df['firewall_rule_id'].unique():
            tenant_df = truncated_df[truncated_df['firewall_rule_id'] == tenant]

            ips = tenant_df['source_ip_id'].unique()

            for ip in ips:
                ip_csv_path = os.path.join(
                    self._TENANT_PROFILE_DIR, tenant, f'{ip}.csv')
                model_path = os.path.join(
                    self._TENANT_MODEL_DIR, tenant, ip)

                ip_df = tenant_df[tenant_df['source_ip_id'] == ip]
                #ip_df.reset_index(inplace=True)
                #print(ip)
                ip_df = ip_df.drop(
                    columns=['firewall_rule_id', 'source_ip_id'])

                if os.path.exists(model_path) is True:
                    ip_df = self._preprocess(ip_df)

                    df_params = self.get_categorical_features_params(ip_df)
                    history_params = self.update_history_params(df_params, model_path)

                    has_anomaly, indices, reasons = self._predict(
                        ip_df, df_params, history_params, model_path)
                    if has_anomaly:
                        anomalous_features.extend(reasons)
                        anomalous_df = pd.concat(
                            [anomalous_df, df.iloc[ip_df.index[indices]]],
                            axis=0
                        )
                        # print(reasons)
                        # print('************************')
                else:
                    anomalous_without_model_count += len(ip_df.index)
                    anomalous_features.extend(['No model']*len(ip_df.index))
                    anomalous_df = pd.concat(
                        [anomalous_df, df.iloc[ip_df.index]],
                        axis=0, ignore_index=True
                        )

                if save_data_for_ip_profile is True:
                    self._save_to_csv(ip_df, ip_csv_path)
                    self.save_categorical_features_params(history_params, model_path)
                    #print(f'Saved data for ip {ip}')

        anomalous_features_df = pd.DataFrame(
            data=np.array(anomalous_features), columns=['Reasons']
        )
        anomalous_df = pd.concat([anomalous_df, anomalous_features_df], axis=1)

        anomalous_df['log_name'] = input_csv.split('/')[-1]
        print(
            f'{anomalous_without_model_count}/{len(anomalous_df.index)} : Anomalous without model')
        print(anomalous_df.head(2))
        return anomalous_df

    def _predict_anomalies(self):
        """Method to predict anomalies from csvs' from input directory
        """
        if os.path.exists(self._DAILY_CSV_DIR) is True:
            if len(os.listdir(self._DAILY_CSV_DIR)) != 0:
                anomalous_df = []
                for csv in sorted(os.listdir(self._DAILY_CSV_DIR)):
                    print(f'**********Processing {csv} **********')
                    csv_file_path = os.path.join(self._DAILY_CSV_DIR, csv)
                    anomalous_df.append(self.get_ip_anomalies(
                        csv_file_path, save_data_for_ip_profile=False))
                    # print(anomalous_df)

                anomalous_df = pd.concat(anomalous_df)
                anomalous_df.to_csv(os.path.join(
                    self._ANOMALIES_CSV_OUTPUT_DIR, str(dt.datetime.now().date())+'.csv'))
            else:
                print("[Warning]: No csv to find anomaly, TRAFFIC_LOGS_OUTPUT_DIR is empty")

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
            self._create_models()
            print("Model created")
        if predict:
            self._predict_anomalies()
