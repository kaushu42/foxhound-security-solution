from foxhound.db_engine.core_models import (
    VirtualSystem, Tenant,
    Domain
)


def seed_virtual_system(session):
    if session.query(VirtualSystem).count() == 0:
        print(f'Seeding Database: Virtual System')
        vsys1 = VirtualSystem(
            code='vsys1',
            name='Virtual System 1',
        )
        vsys2 = VirtualSystem(
            code='vsys2',
            name='Virtual System 2',
        )
        vsys3 = VirtualSystem(
            code='vsys3',
            name='Virtual System 3',
        )
        session.add(vsys1)
        session.add(vsys2)
        session.add(vsys3)
        session.commit()


def seed_domain(session):
    if session.query(Domain).count() == 0:
        print(f'Seeding Database: Domain')
        domain1 = Domain(
            name='Domain1',
            url='domain1'
        )
        vsys2 = Domain(
            name='Domain2',
            url='domain2'
        )
        vsys3 = Domain(
            name='Domain3',
            url='domain4'
        )
        session.add(domain1)
        session.add(vsys2)
        session.add(vsys3)
        session.commit()


def seed_tenant(session):
    if session.query(Tenant).count() == 0:
        print(f'Seeding Database: Tenant')
        tenant1 = Tenant(
            code='tenant1',
            name='Tenant 1',
            virtual_system_id=1,
            domain_id=1
        )
        tenant2 = Tenant(
            code='tenant2',
            name='Tenant 2',
            virtual_system_id=1,
            domain_id=2
        )
        tenant3 = Tenant(
            code='tenant3',
            name='Tenant 3',
            virtual_system_id=2,
            domain_id=3
        )
        session.add(tenant1)
        session.add(tenant2)
        session.add(tenant3)
        session.commit()


def seed(session):
    seed_virtual_system(session)
    seed_domain(session)
    seed_tenant(session)
