import numpy as np

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, LeakyReLU
from tensorflow.keras import regularizers
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.backend import clear_session


def pca(X, output_path):
    model = PCA(n_components=1)
    standarizer = StandardScaler()
    x = standarizer.fit_transform(X).copy()
    out = model.fit_transform(x)
    std = np.std(out)
    params = {'model': model, 'standarizer': standarizer, 'std': std}
    #filename = 'finalized_model.sav'
    return params


class AutoEncoder:
    def __init__(self, verbose=0):
        self._model = None
        self._call_backs = None
        self._verbose = verbose
        #self._create_architecture()

    def _create_architecture(self, input_size):
        clear_session()
        self._model = Sequential()
        self._model.add(Dense(16, activity_regularizer=regularizers.l1(10e-4), input_shape=(input_size,)))
        self._model.add(LeakyReLU())
        self._model.add(Dense(12, activity_regularizer=regularizers.l1(10e-4)))
        self._model.add(LeakyReLU())
        self._model.add(Dense(8, activity_regularizer=regularizers.l1(10e-4)))
        self._model.add(LeakyReLU())
        self._model.add(Dense(4, activity_regularizer=regularizers.l1(10e-4)))
        self._model.add(LeakyReLU())
        self._model.add(Dense(10, activity_regularizer=regularizers.l1(10e-4)))
        self._model.add(LeakyReLU())
        self._model.add(Dense(input_size, activity_regularizer=regularizers.l1(10e-4)))
        self._model.add(LeakyReLU())

        self._call_backs = [
            EarlyStopping(
                monitor='val_loss', patience=5,
                restore_best_weights=True, verbose=self._verbose)
            ]

    def normalize_data(self, X):
        standarizer = StandardScaler()
        X = standarizer.fit_transform(X)
        return X, standarizer

    def train_model(self, X, model_path):
        try:
            # self._create_architecture(X.shape[1])
            clear_session()
            self._model = load_model(model_path+'/model.h5')
        except:
            self._create_architecture(X.shape[1])
            self._model.compile(
                optimizer='adam', loss='mean_squared_error', metrics=['accuracy'])
        finally:
            self._model.fit(
                X, X, epochs=200, batch_size=256, shuffle=True,
                validation_split=0.2, verbose=self._verbose, callbacks=self._call_backs)

    def save_model(self, model_path):
        self._model.save(f'{model_path}/model.h5')

    def load_model(self, model_path):
        clear_session()
        self._model = load_model(f'{model_path}/model.h5')

        return self._model
