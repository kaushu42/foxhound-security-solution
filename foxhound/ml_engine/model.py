import numpy as np

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


def pca(X, output_path):
    model = PCA(n_components=1)
    standarizer = StandardScaler()
    x = standarizer.fit_transform(X).copy()
    out = model.fit_transform(x)
    std = np.std(out)
    params = {'model': model, 'standarizer': standarizer, 'std': std}
    #filename = 'finalized_model.sav'
    return params
