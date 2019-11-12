from sqlalchemy import Column, Integer, String, BigInteger, Boolean, Enum
from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

from .core_models import (
    FirewallRule, FoxhoundUser
)
Base = declarative_base()


class Rule(Base):
    __tablename__ = 'rules_rule'

    id = Column(Integer, primary_key=True)

    firewall_rule_id = Column(ForeignKey(FirewallRule.id, ondelete='CASCADE'))
    verified_by_user_id = Column(ForeignKey(
        FoxhoundUser.id, ondelete='CASCADE'))

    created_date_time = Column(DateTime)
    name = Column(String)
    source_ip = Column(String)
    destination_ip = Column(String)
    application = Column(String)
    description = Column(String)
    is_verified_rule = Column(Boolean)
    verified_date_time = Column(DateTime)
