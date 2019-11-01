from sqlalchemy import Column, Integer, String, BigInteger, Boolean
from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

from .core_models import TrafficLog, User
Base = declarative_base()


class TroubleTicketAnomaly(Base):
    __tablename__ = 'troubleticket_troubleticketanomaly'
    id = Column(Integer, primary_key=True)
    created_datetime = Column(DateTime)
    is_closed = Column(Boolean)
    log_id = Column(
        ForeignKey(
            TrafficLog.id,
            ondelete='CASCADE'
        )
    )
    log_record_number = Column(Integer)
    source_ip = Column(String)
    destination_ip = Column(String)
    source_port = Column(String)
    destination_port = Column(String)

    def __str__(self):
        return f'{self.log_id}-{self.log_record_number}-{self.created_datetime}'

    def __repr__(self):
        return self.__str__()


class TroubleTicketFollowUpAnomaly(Base):
    __tablename__ = 'troubleticket_troubleticketfollowupanomaly'

    id = Column(Integer, primary_key=True)
    trouble_ticket_id = Column(
        ForeignKey(
            TroubleTicketAnomaly.id,
            ondelete='CASCADE'
        )
    )
    follow_up_datetime = Column(DateTime)
    assigned_by_id = Column(
        ForeignKey(
            User.id,
            ondelete='CASCADE'
        )
    )
    assigned_to_id = Column(
        ForeignKey(
            User.id,
            ondelete='CASCADE'
        )
    )
    description = Column(String)

    def __str__(self):
        return f'{self.trouble_ticket_id}-{self.created_datetime}-followup'

    def __repr__(self):
        return self.__str__()
