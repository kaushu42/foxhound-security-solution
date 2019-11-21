import numpy as np

from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA

from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense
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
    def __init__(self, input_size, verbose):
        self.model = None
        self.input_size = input_size
        self._create_architecture(input_size)

    def _create_architecture(self):
        clear_session()
        self.model = Sequential()
        self.model.add(Dense(16, activation='tanh', activity_regularizer=regularizers.l1(10e-5), input_shape=(self.input_size,)))
        self.model.add(Dense(12, activation='tanh', activity_regularizer=regularizers.l1(10e-5)))
        self.model.add(Dense(8, activation='tanh', activity_regularizer=regularizers.l1(10e-5)))
        self.model.add(Dense(4, activation='tanh', activity_regularizer=regularizers.l1(10e-5)))
        self.model.add(Dense(10, activation='tanh', activity_regularizer=regularizers.l1(10e-5)))
        self.model.add(Dense(16, activation='tanh', activity_regularizer=regularizers.l1(10e-5)))

        checkpointer = EarlyStopping(
            monitor='val_loss', patience=3,
            restore_best_weights=True, verbose=verbose)

    def train_model(self, X):
        self.model.compile(
            optimizer='adam', loss='mean_squared_error', metrics=['accuracy'])
        self.model.fit(
            X, X, epochs=100, batch_size=32, shuffle=True,
            validation_split=0.2, verbose=verbose, callbacks=[checkpointer])

    def save_model(self, model_path):
        self.model.save(f'{model_path}/model.h5')

    def load_model(self, model_path):
        return load_model(f'{model_path}/model.h5')
