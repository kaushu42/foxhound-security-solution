import os
import numpy as np
import pandas as pd
import pickle

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from .variables import features_list
from .data_manip import preprocess, save_to_csv


def predict(ip, df, file_path):
    params = pickle.load(open(file_path, 'rb'))
    x = params['standarizer'].transform(df)
    out = params['model'].transform(x)
    #plt.plot(out, 'ro')
    indices = np.where(np.abs(out) > params['std']*3)[0]
    return indices


def get_anomalous_df(input_csv, ip_profile_dir, ip_model_dir):
    df = pd.read_csv(input_csv)
    temp = df[features_list]
    anomalous_df = df.head(0)
    for vsys in df['Virtual System'].unique():
        temp2 = temp[temp['Virtual System'] == vsys]

        for ip in ['198.98.182.153']:  # df['Source address'].unique():
            ip_csv_path = os.path.join(ip_profile_dir, f'{vsys}', f'{ip}.csv')
            model_path = os.path.join(ip_model_dir, f'{vsys}', f'{ip}.pkl')

            ip_df = temp2[temp2['Source address'] == ip].copy()
            ip_df = preprocess(ip_df)

            if os.path.exists(model_path):
                indices = predict(ip, ip_df, model_path)
                anomalous_df = pd.concat(
                    [anomalous_df, df.iloc[indices]], axis=0)
            else:
                anomalous_df = pd.concat(
                    [anomalous_df, df.iloc[ip_df.indices]], axis=0)
                print(f'No model found for ip :{ip}')
            save_to_csv(ip_df, ip, ip_csv_path)

    anomalous_df['log_name'] = input_csv.split('/')[-1]
    return anomalous_df
