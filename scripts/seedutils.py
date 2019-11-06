from foxhound.db_engine.core_models import (
    VirtualSystem, Tenant,
    Domain
)


def seed(session):
    if session.query(VirtualSystem).count() == 0:
        print('Seeding database....')
        print('Creating Default Virtual System')
        default_vsys = VirtualSystem(code='default', name='default')
        session.add(default_vsys)
        session.flush()
        print('Creating Default Tenant')
        default_tenant = Tenant(
            virtual_system_id=default_vsys.id, name='default')
        session.add(default_tenant)
        session.flush()
        session.commit()
