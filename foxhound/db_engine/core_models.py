from sqlalchemy import Column, Integer, String, BigInteger, Boolean
from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class VirtualSystem(Base):
    __tablename__ = 'core_virtualsystem'

    id = Column(Integer, primary_key=True)
    code = Column(String)
    name = Column(String)
    domain_code = Column(String)
    tenant_name = Column(String)
    domain_url = Column(String)

    def __repr__(self):
        return self.name


class User(Base):
    __tablename__ = 'users_foxhounduser'
    __table_args__ = (UniqueConstraint('username', name='_username_uc'),)

    id = Column(Integer, primary_key=True)
    password = Column(String)
    last_login = Column(DateTime)
    is_superuser = Column(Boolean)
    username = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    is_staff = Column(Boolean)
    is_active = Column(Boolean)
    date_joined = Column(DateTime)
    tenant_id = Column(Integer)

    def __repr__(self):
        return self.username

    def __str__(self):
        return self.__repr__()


class TrafficLog(Base):
    __tablename__ = 'core_trafficlog'

    id = Column(Integer, primary_key=True)
    virtual_system_id = Column(
        ForeignKey(
            VirtualSystem.id,
            ondelete='CASCADE'
        )
    )
    processed_datetime = Column(DateTime)
    log_date = Column(DateTime)
    log_name = Column(String)

    def __repr__(self):
        return self.log_name


class TrafficLogDetail(Base):
    __tablename__ = 'core_trafficlogdetail'

    id = Column(Integer, primary_key=True)
    traffic_log_id = Column(ForeignKey(TrafficLog.id, ondelete='CASCADE'))
    source_ip = Column(String)
    source_port = Column(Integer)
    destination_ip = Column(String)
    destination_port = Column(Integer)
    bytes_sent = Column(BigInteger)
    bytes_received = Column(BigInteger)
    repeat_count = Column(Integer)
    application = Column(String)
    packets_received = Column(BigInteger)
    packets_sent = Column(BigInteger)
    protocol = Column(String)
    time_elapsed = Column(BigInteger)
    source_zone = Column(String)
    destination_zone = Column(String)
    firewall_rule = Column(String)
    logged_datetime = Column(DateTime)

    def __repr__(self):
        return f'Log-{self.date}'

    def __str__(self):
        return self.__repr__()


class RuleDictionary(Base):
    __tablename__ = 'core_ruledictionary'

    id = Column(Integer, primary_key=True)
    virtual_system_id = Column(
        ForeignKey(
            VirtualSystem.id,
            ondelete='CASCADE'
        )
    )
    verified_by_user_id = Column(ForeignKey(User.id, ondelete='CASCADE'))
    created_date_time = Column(DateTime)
    rule_name = Column(String)
    source_ip = Column(String)
    destination_ip = Column(String)
    application = Column(String)
    rule_description = Column(String)
    is_verified_rule = Column(Boolean)

    verified_date_time = Column(DateTime)

    def __repr__(self):
        return self.rule_name

    def __str__(self):
        return self.__repr__()
