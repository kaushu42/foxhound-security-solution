from sqlalchemy import Column, Integer, String, BigInteger, Boolean
from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

from .core_models import TrafficLog, FoxhoundUser, FirewallRule
from .rule_models import Rule

Base = declarative_base()


class TroubleTicketAnomaly(Base):
    __tablename__ = 'troubleticket_troubleticketanomaly'

    id = Column(Integer, primary_key=True)
    log_id = Column(
        ForeignKey(
            TrafficLog.id,
            ondelete='CASCADE'
        )
    )
    firewall_rule_id = Column(
        ForeignKey(
            FirewallRule.id,
            ondelete='CASCADE'
        )
    )
    created_datetime = Column(DateTime)
    is_closed = Column(Boolean)
    row_number = Column(BigInteger)

    def __str__(self):
        return f'{self.log_id}-{self.row_number}'

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
    assigned_by_id = Column(
        ForeignKey(
            FoxhoundUser.id,
            ondelete='CASCADE'
        )
    )
    assigned_to_id = Column(
        ForeignKey(
            FoxhoundUser.id,
            ondelete='CASCADE'
        )
    )
    follow_up_datetime = Column(DateTime)
    description = Column(String)

    def __str__(self):
        return f'{self.trouble_ticket_id}-{self.assigned_by_id}-{self.assigned_to_id}-followup'

    def __repr__(self):
        return self.__str__()


class TroubleTicketRule(Base):
    __tablename__ = 'troubleticket_troubleticketrule'

    id = Column(Integer, primary_key=True)
    rule_id = Column(
        ForeignKey(
            Rule.id,
            ondelete='CASCADE'
        )
    )

    created_datetime = Column(DateTime)
    is_closed = Column(Boolean)

    def __str__(self):
        return f'{self.rule_id}'

    def __repr__(self):
        return self.__str__()
