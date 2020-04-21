import os

import datetime as dt
import ipaddress

import numpy as np
import pandas as pd

# import dask.dataframe as dd
# import multiprocessing

import csv
import joblib

from .variables import features_list, categorical_features, features_to_convert_to_number
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

        self._TENANT_FEATURE = 'firewall_rule_id'
        self._USER_FEATURE = 'source_ip_id'
        self._TIME_FEATURE = 'logged_datetime'

        self._model_path = None

        super(MLEngine, self).__init__(verbose=verbose)

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
            df.to_csv(dest_file_path, mode='a', index=False, header=False)
        else:
            df.to_csv(dest_file_path, mode='a', index=False)

    def _str_to_num(self, column):
        column = [sum([(weight+1)*char for weight, char in enumerate(list(bytearray(cell,
                                                                                    encoding='utf8'))[::-1])]) if isinstance(cell, str) else cell for cell in column]
        return column

    # def _dask_apply(self, df, apply_func, axis): # axis col because canot operate using axis=0 for sin cos time int coversion and axis=0 is faster than axis=1
    #     df = df.copy()
    #     temp = dd.from_pandas(df, npartitions=2*multiprocessing.cpu_count()).map_partitions(lambda data: data.apply(lambda series: apply_func(series), axis=axis, result_type='broadcast'), meta=df.head(0))
    #     df = temp.compute(scheduler='processes')
    #     return df

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

        temp[self._TIME_FEATURE] = temp[[self._TIME_FEATURE]].apply(
            lambda x: x.str[-8:-6], 1)
        temp['sin_time'] = temp[[self._TIME_FEATURE]].apply(
            lambda x: np.sin((2*np.pi/24)*int(x)), 1)
        temp['cos_time'] = temp[[self._TIME_FEATURE]].apply(
            lambda x: np.cos((2*np.pi/24)*int(x)), 1)

        temp.drop(columns=[self._TIME_FEATURE], inplace=True)

        # _str_to_num = lambda column : [sum([(weight+1)*char for weight, char in enumerate(list(bytearray(cell, encoding='utf8'))[::-1])]) if isinstance(cell, str) else cell for cell in column]
        # temp[features_to_convert_to_number] = temp[features_to_convert_to_number].apply(_str_to_num, 0)

        temp[features_to_convert_to_number] = temp[features_to_convert_to_number].apply(
            self._str_to_num, 0)

        return temp

    def _get_categorical_params(self, df):
        total = len(df.index)
        prop = dict([(category, dict(df[category].value_counts()/total))
                     for category in self._CATEGORICAL_FEATURES])
        params = {'total': total, 'proportion': prop}

        return params

    def _update_categorical_params(self, history_params, df_params):
        # To be called only once for one csv while detecting anomaly
        history_prop = history_params['proportion']
        history_total = history_params['total']
        df_prop = df_params['proportion']
        df_total = df_params['total']

        history_ratio = history_total/(history_total+df_total)
        df_ratio = df_total/(history_total+df_total)

        updated_prop = dict([[feature, dict([(key, history_ratio*history_prop[feature].get(key, 0)+df_ratio*df_prop[feature].get(key, 0))
                                             for key in history_prop[feature].keys() | df_prop[feature].keys()])] for feature in self._CATEGORICAL_FEATURES])
        updated_total = history_total+df_total

        max_prop = dict([(feature, updated_prop[feature][max(
            updated_prop[feature], key=updated_prop[feature].get)]) for feature in updated_prop])
        updated_params = {'total': updated_total,
                          'proportion': updated_prop, 'max_proportion': max_prop}

        return updated_params

    def _save_categorical_params(self, categorical_params):
        joblib.dump(categorical_params, self._model_path +
                    "/categorical_params.sav")

    def _load_categorical_params(self):
        categorical_params = joblib.load(
            self._model_path+'/categorical_params.sav')

        return categorical_params

    def _save_model_and_params(self, model_params, categorical_params, has_model):
        """Method to save parameters of ml model

        Parameters
        ----------
        params_dict : dictionary
            Contains model's parameters to save eg. standarizer
        model_path : str
            Location to save model's parameters to
        """
        if os.path.exists(self._model_path) is not True:
                os.makedirs(self._model_path)
        if has_model:
            self.save_model(self._model_path)
        joblib.dump(model_params, f'{self._model_path}/model_params.sav')
        self._save_categorical_params(categorical_params)

    def _load_model_and_params(self, has_model):
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
        if has_model:
            model = self.load_model(self._model_path)
        else:
            model = None
        model_params = joblib.load(f'{self._model_path}/model_params.sav')
        categorical_params = self._load_categorical_params()

        return model, model_params, categorical_params

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
                    self._model_path = os.path.join(
                        tenant_model_dir, csv_file[:-4])
                    df = pd.read_csv(csv_path)
                    
                    categorical_params = self._get_categorical_params(df)
                    df, standarizer = self.normalize_data(df)

                    if len(df) > 10000:
                        training_for = ': '.join(csv_path.split('/')[-2:])[:-4]
                        print(
                            f'**************** Training model for {training_for}****************')
                        self.train_model(df, self._model_path)
                        print(
                            f'**************** Trained model for {training_for}****************')
                        self._save_model_and_params(
                            {'standarizer': standarizer}, categorical_params, True
                        )
                    else:
                        self._save_model_and_params(
                            {'standarizer': standarizer}, categorical_params, False
                        )

    def _get_anomaly_reasons(self, df, model_params, updated_categorical_params, df_categorical_params, anomaly_prop_threshold):
        anomalies = df.copy()

        mean = model_params['standarizer'].mean_
        std = np.sqrt(model_params['standarizer'].var_)

        max_prop = updated_categorical_params['max_proportion']
        df_prop = df_categorical_params['proportion']

        truth_table = np.abs(anomalies-mean) > 2.57*std

        truth_table[self._CATEGORICAL_FEATURES] = False

        def get_proportion(anomaly, features, params): return pd.Series(
            [params[feature].get(anomaly[feature], 0) for feature in features])

        anomalies[self._CATEGORICAL_FEATURES] = anomalies.apply(
            lambda x: get_proportion(x, self._CATEGORICAL_FEATURES, df_prop), axis=1)
        max_prop = np.array([max_prop[feature]
                             for feature in self._CATEGORICAL_FEATURES])

        truth_table[self._CATEGORICAL_FEATURES] = anomalies[self._CATEGORICAL_FEATURES] < (
            max_prop*anomaly_prop_threshold)

        reasons = [', '.join(df.columns[row])
                   for index, row in truth_table.iterrows()]

        return reasons

    def _predict(self, df, mse_threshold, has_model):
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
        model, model_params, history_categorical_params = self._load_model_and_params(has_model=has_model)
        
        df_categorical_params = self._get_categorical_params(df)
        updated_categorical_params = self._update_categorical_params(
            history_categorical_params, df_categorical_params)

        if has_model:
            x = model_params['standarizer'].transform(df)
            preds = model.predict(x)
            mse = np.mean(np.power(x - preds, 2), axis=1)
            #plt.plot(out, 'ro')
            indices = np.where(mse > mse_threshold)[0]
            if len(indices) is not 0:
                anomalies_reasons = self._get_anomaly_reasons(
                    df.iloc[indices], model_params, updated_categorical_params, df_categorical_params, 0.05
                )
        else:
            # print('no model')
            anomalies_reasons = self._get_anomaly_reasons(
                    df, model_params, updated_categorical_params, df_categorical_params, 0.01
                )
            # print('**************************old*********************************')
            # print(anomalies_reasons)
            indices = [index for index, anomaly_reasons in enumerate(anomalies_reasons) if len(anomaly_reasons.split(','))>6]
            # print('***********************new************************************')
            anomalies_reasons = np.array(anomalies_reasons)[indices]
            # print(anomalies_reasons)
            # print('************************new finish***********************************')

        if len(indices) is not 0:
                return True, indices, anomalies_reasons, updated_categorical_params
        else:
            return False, None, None, updated_categorical_params

    def get_ip_anomalies(self, df, save_data_for_ip_profile=False):
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
        truncated_df = df[self._FEATURES].copy()

        truncated_df.session_end_reason_id.fillna('unknown', inplace=True)

        private_ips_index = truncated_df.source_ip_id.apply(
            lambda x: ipaddress.ip_address(x).is_private)
        truncated_df = truncated_df[private_ips_index]

        anomalous_df = df.head(0)
        anomalous_without_model_count = 0
        anomalous_features = []

        for tenant in truncated_df[self._TENANT_FEATURE].unique():
            tenant_df = truncated_df[truncated_df[self._TENANT_FEATURE] == tenant]

            ips = tenant_df[self._USER_FEATURE].unique()

            for ip in ips:
                ip_csv_path = os.path.join(
                    self._TENANT_PROFILE_DIR, tenant, f'{ip}.csv')
                self._model_path = os.path.join(
                    self._TENANT_MODEL_DIR, tenant, ip)

                ip_df = tenant_df[tenant_df[self._USER_FEATURE] == ip].copy()
                # ip_df.reset_index(inplace=True)
                # print(ip)
                ip_df = ip_df.drop(
                    columns=[self._TENANT_FEATURE, self._USER_FEATURE])

                ip_df = self._preprocess(ip_df)

                if os.path.exists(self._model_path+f'/model.h5') is True:
                    has_model = True
                else:
                    has_model = False
                has_anomaly, indices, reasons, updated_categorical_params = self._predict(
                    ip_df, 800, has_model)

                if has_anomaly:
                    anomalous_features.extend(reasons)
                    anomalous_df = pd.concat(
                        [anomalous_df, df.iloc[ip_df.index[indices]]],
                        axis=0, ignore_index=True
                    )

                if save_data_for_ip_profile is True:
                    self._save_to_csv(ip_df, ip_csv_path)
                    self._save_categorical_params(updated_categorical_params)
        anomalous_features_df = pd.DataFrame(
            data=np.array(anomalous_features), columns=['reasons']
        )
        anomalous_df = pd.concat([anomalous_df, anomalous_features_df], axis=1)

        return anomalous_df

    def _predict_in_chunks(self, csv_file_path):
        n_chunks = 0
        ano_with_model_count = 0
        total_data_count = 0

        df = pd.read_csv(csv_file_path)  # 100 million

        # for df_chunk in df:
        anomalous_df = self.get_ip_anomalies(
            df, save_data_for_ip_profile=False
        )
        anomalous_df['log_name'] = csv_file_path.split('/')[-2]

        if len(anomalous_df.index):
            self._save_to_csv(anomalous_df, os.path.join(
                self._ANOMALIES_CSV_OUTPUT_DIR, str(dt.datetime.now().date())+'.csv')
            )
        ano_with_model_count += len(anomalous_df.index)
        n_chunks += 1

        return ano_with_model_count, n_chunks

    def _predict_anomalies(self):
        """Method to predict anomalies from csvs' from input directory
        """
        if os.path.exists(self._DAILY_CSV_DIR) is True:
            csv_folders = sorted(os.listdir(self._DAILY_CSV_DIR))
            total_csv_folders = len(csv_folders)
            csv_folder_count = 1
            if total_csv_folders is not 0:
                for csv_folder in csv_folders:
                    csv_folder_path = os.path.join(
                        self._DAILY_CSV_DIR, csv_folder)
                    csv_folder_files = sorted([file for file in os.listdir(
                        csv_folder_path) if file.endswith('.csv')])
                    total_folder_files = len(csv_folder_files)
                    csv_file_count = 1

                    total_ano_with_model_count = 0
                    for csv in csv_folder_files:
                        # print(objgraph.show_most_common_types())
                        if csv.endswith('.csv'):
                            csv_file_path = os.path.join(csv_folder_path, csv)
                            print(
                                f'[{csv_folder_count}/{total_csv_folders}]->[Part: {csv_file_count}/{total_folder_files}] ********** Processing {csv_folder} file **********')
                            ano_with_model_count, n_chunks = self._predict_in_chunks(
                                csv_file_path)
                            print(
                                f"[{csv_folder_count}/{total_csv_folders}]->[Part: {csv_file_count}/{total_folder_files}] ********** Processed {csv_folder} in {n_chunks} chunk **********")
                            print(
                                f'[{csv_folder_count}/{total_csv_folders}]->[Part: {csv_file_count}/{total_folder_files}] ********** Predictions: Anomalous model -> [{ano_with_model_count}]**********'
                            )
                            total_ano_with_model_count += ano_with_model_count
                            # print(anomalous_df)
                            csv_file_count += 1
                        else:
                            pass
                    csv_folder_count += 1
                    print(
                        f'Total Anomaly: {total_ano_with_model_count} in file {csv_folder}')
            else:
                print(
                    "[Warning]: No csv to find anomaly, TRAFFIC_LOGS_OUTPUT_DIR is empty")

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
