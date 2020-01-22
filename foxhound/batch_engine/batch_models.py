from sqlalchemy import Column, Integer, String, BigInteger, Boolean, Enum
from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

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
