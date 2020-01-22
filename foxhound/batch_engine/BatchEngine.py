import pandas as pd

import sqlalchemy
from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker
from .batch_models import Log


class BatchEngine(object):
    def __init__(self, db_engine):
        if not isinstance(db_engine, sqlalchemy.engine.base.Engine):
            raise TypeError('db_engine must be an sqlalchemy engine instance')
        self._db_engine = db_engine
        self._session = sessionmaker(bind=db_engine, autoflush=False)()

    def _create_log(self, log_name, batch_type, batch_sub_type, batch_message, state, status):
        batch = Log(
            batch_log=log_name,
            batch_type=batch_type,
            batch_sub_type=batch_sub_type,
            message=batch_message,
            state=state,
            status=status)
        self._session.add(batch)
        self._session.flush()
        self._session.refresh(batch)
        print("batch added: ", f)

    def _update_batch_sub_type(self, batch_id, batch_exit_message, state, status):
        batch_from_db = self._session.query(Log).get(batch_id)
        batch_from_db.batch_exit_message = batch_exit_message
        batch_from_db.state = state
        batch_from_db.status = status
        self._session.commit()
        return batch_from_db.id
