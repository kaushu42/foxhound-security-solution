import os
import numpy as np
import pandas as pd

import csv

# input : data frame (not a series)


def preprocess(df):
    temp = df.copy()
    temp['Receive Time'] = temp['Receive Time'].apply(lambda x: x[-8:])
    rows = temp.values
    rows = [[sum(bytearray(cell, encoding='utf8')) if isinstance(
        cell, str) else cell for cell in row] for row in rows]
    return pd.DataFrame(rows, columns=temp.columns)


def save_to_csv(df, ip, dest_file_path):
    if os.path.isfile(dest_file_path):
        with open(dest_file_path, 'a') as outfile:
            c = csv.writer(outfile)
            for index, row in df.iterrows():
                c.writerow(row.values)
    else:
        count = 0
        with open(dest_file_path, 'a') as outfile:
            c = csv.writer(outfile)
            for index, row in df.iterrows():
                if count == 0:
                    count = 1
                    c.writerow(df.columns)
                c.writerow(row.values)
