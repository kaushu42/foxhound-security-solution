# Generated by Django 2.2.5 on 2019-11-14 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_remove_ipaddress_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlacklistedIP',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.CharField(max_length=15)),
            ],
        ),
    ]
