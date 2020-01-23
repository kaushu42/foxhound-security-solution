from utils import get_db_engine, get_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy import Column, Integer, String, BigInteger, Boolean, Enum
import sqlalchemy


from datetime import datetime
Base = declarative_base()


class Log(Base):
    __tablename__ = 'batch_log'

    id = Column(Integer, primary_key=True)
    start_date = Column(DateTime)
    log_name = Column(String)
    batch_type = Column(String)
    batch_sub_type = Column(String)
    message = Column(String)
    exit_message = Column(String)
    state = Column(String)
    status = Column(String)
    end_date = Column(DateTime)

    def __repr__(self):
        return self.log_name


def create_batch_log(log_name, batch_type, batch_sub_type, batch_message, state, status):
    engine = get_db_engine()
    session = get_session(engine)
    batch = Log(
        start_date=datetime.now(),
        log_name=log_name,
        batch_type=batch_type,
        batch_sub_type=batch_sub_type,
        message=batch_message,
        exit_message="NOT EXIT",
        state=state,
        status=status)
    session.add(batch)
    session.flush()
    session.refresh(batch)
    session.commit()
    return batch.id


def update_batch_state(batch_id, batch_exit_message, state, status):
    engine = get_db_engine()
    session = get_session(engine)
    batch_from_db = session.query(Log).get(batch_id)
    batch_from_db.exit_message = batch_exit_message
    batch_from_db.state = state
    batch_from_db.status = status
    batch_from_db.end_date = datetime.now()
    session.commit()
    return batch_from_db.id
