import enum

from sqlalchemy import Column, Integer, String, BigInteger, Boolean, Enum
from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class VirtualSystem(Base):
    __tablename__ = 'core_virtualsystem'

    id = Column(Integer, primary_key=True)
    code = Column(String)
    name = Column(String)

    def __repr__(self):
        return self.name


class Tenant(Base):
    __tablename__ = 'core_tenant'

    id = Column(Integer, primary_key=True)
    virtual_system_id = Column(ForeignKey(
        VirtualSystem.id, ondelete='CASCADE'))
    name = Column(String)

    def __repr__(self):
        return self.name


class Domain(Base):
    __tablename__ = 'core_domain'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    url = Column(String)
    tenant_id = Column(ForeignKey(
        Tenant.id, ondelete='CASCADE'))

    def __repr__(self):
        return self.name


class FoxhoundUser(Base):
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
    processed_datetime = Column(DateTime)
    log_date = Column(DateTime)
    log_name = Column(String)

    def __repr__(self):
        return self.log_name


class ProcessedLogDetail(Base):
    __tablename__ = 'core_processedlogdetail'

    id = Column(Integer, primary_key=True)
    tenant_id = Column(ForeignKey(
        Tenant.id,
        ondelete='CASCADE'
    ))
    log_id = Column(ForeignKey(
        TrafficLog.id,
        ondelete='CASCADE'
    ))
    n_rows = Column(Integer())
    size = Column(BigInteger())

    def __repr__(self):
        return f'{self.tenant}-{self.n_rows}-{self.size}'

    def __str__(self):
        return self.__repr__()


class IPAddress(Base):
    __tablename__ = 'core_ipaddress'

    id = Column(Integer, primary_key=True)
    address = Column(String)

    def __repr__(self):
        return self.address


class Application(Base):
    __tablename__ = 'core_application'

    id = Column(Integer, primary_key=True)
    name = Column(String)

    def __repr__(self):
        return self.name


class Protocol(Base):
    __tablename__ = 'core_protocol'

    id = Column(Integer, primary_key=True)
    name = Column(String)

    def __repr__(self):
        return self.name


class FirewallRule(Base):
    __tablename__ = 'core_firewallrule'

    id = Column(Integer, primary_key=True)
    tenant_id = Column(ForeignKey(
        Tenant.id, ondelete='CASCADE'))
    name = Column(String)

    def __repr__(self):
        return self.name


class Zone(Base):
    __tablename__ = 'core_zone'

    id = Column(Integer, primary_key=True)
    name = Column(String)

    def __repr__(self):
        return f"{self.name}"


class FirewallRuleZone(Base):
    __tablename__ = 'core_firewallrulezone'

    id = Column(Integer, primary_key=True)
    firewall_rule_id = Column(ForeignKey(FirewallRule.id, ondelete='CASCADE'))
    source_zone_id = Column(ForeignKey(Zone.id, ondelete='CASCADE'))
    destination_zone_id = Column(ForeignKey(Zone.id, ondelete='CASCADE'))

    def __str__(self):
        return f'{self.firewall_rule_id}:{self.source_zone_id}-{self.destination_zone_id}'

    def __repr__(self):
        return self.__str__()


class TrafficLogDetail(Base):
    __tablename__ = 'core_trafficlogdetail'

    id = Column(Integer, primary_key=True)
    traffic_log_id = Column(ForeignKey(TrafficLog.id, ondelete='CASCADE'))
    source_ip_id = Column(ForeignKey(IPAddress.id, ondelete='CASCADE'))
    destination_ip_id = Column(ForeignKey(IPAddress.id, ondelete='CASCADE'))
    application_id = Column(ForeignKey(Application.id, ondelete='CASCADE'))
    protocol_id = Column(ForeignKey(Protocol.id, ondelete='CASCADE'))
    source_zone_id = Column(ForeignKey(Zone.id, ondelete='CASCADE'))
    destination_zone_id = Column(ForeignKey(Zone.id, ondelete='CASCADE'))
    firewall_rule_id = Column(ForeignKey(FirewallRule.id, ondelete='CASCADE'))
    row_number = Column(BigInteger)
    source_port = Column(Integer)
    destination_port = Column(Integer)
    bytes_sent = Column(BigInteger)
    bytes_received = Column(BigInteger)
    repeat_count = Column(Integer)
    packets_received = Column(BigInteger)
    packets_sent = Column(BigInteger)
    time_elapsed = Column(BigInteger)
    logged_datetime = Column(DateTime)

    def __repr__(self):
        return f'Log-{self.traffic_log_id}:{self.row_number}'

    def __str__(self):
        return self.__repr__()


class Country(Base):
    __tablename__ = 'core_country'

    id = Column(Integer, primary_key=True)
    ip_address = Column(ForeignKey(IPAddress.id, ondelete='CASCADE'))
    country_name = Column(String)
    country_iso_code = Column(String)

    def __repr__(self):
        return f'{self.ip_address}-{self.country_iso_code}'

    def __str__(self):
        return self.__repr__()


class TenantIPAddressInfo(Base):
    __tablename__ = 'core_tenantipaddressinfo'

    id = Column(Integer, primary_key=True)
    firewall_rule_id = Column(ForeignKey(FirewallRule.id, ondelete='CASCADE'))
    created_date = Column(Date)
    ip_address = Column(String)

    def __repr__(self):
        return f'{self.firewall_rule_id}-{self.ip_address}'

    def __str__(self):
        return self.__repr__()


class TenantApplicationInfo(Base):
    __tablename__ = 'core_tenantapplicationinfo'

    id = Column(Integer, primary_key=True)
    firewall_rule_id = Column(ForeignKey(FirewallRule.id, ondelete='CASCADE'))
    created_date = Column(Date)
    application = Column(String)

    def __repr__(self):
        return f'{self.firewall_rule_id}-{self.application}'

    def __str__(self):
        return self.__repr__()
