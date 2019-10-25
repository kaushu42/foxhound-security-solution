import os
import numpy as np
import pandas as pd


def create_ip_model(ip_profile_dir, ip_model_dir):
    if not os.path.exists(ip_model_dir):
        os.makedirs(ip_model_dir)

    if os.path.exists(ip_profile_dir):
        for vsys in os.listdir(ip_profile_dir):
            csv_path = os.path.join(ip_profile_dir, f'{vsys}')
            vsys_model_dir = os.path.join(ip_model_dir, f'{vsys}')
            if not os.path.exists(vsys_model_dir):
                os.makedirs(vsys_model_dir)
            for ip_csv in os.listdir(csv_path)[0:100]:
                ip_profile_csv_path = os.path.join(
                    ip_profile_dir, vsys, ip_csv)
                ip_model_path = os.path.join(vsys_model_dir, ip_csv[:-3]+'pkl')
                ip_df = pd.read_csv(ip_profile_csv_path)
                if len(ip_df.index) > 100:
                    print(f'Creating model for {ip_csv}')
                    pca(ip_df, ip_model_path)
                    print(f'Model created for {ip_csv}')
                else:
                    print(f'Not suffiecient data to create model for {ip_csv}')
    else:
        print(f'{ip_profile_dir} dir doesnot exist')
