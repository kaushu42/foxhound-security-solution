# Generated by Django 2.2.8 on 2020-05-16 23:12

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='StageTroubleTicketAnomaly',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('is_closed', models.BooleanField(default=False)),
                ('description', models.CharField(max_length=500, null=True)),
                ('repeat_count', models.PositiveIntegerField(null=True)),
                ('time_elapsed', models.BigIntegerField(null=True)),
                ('reasons', models.CharField(max_length=500, null=True)),
                ('logged_datetime', models.DateTimeField(null=True)),
                ('threat_content_type', models.CharField(max_length=50, null=True)),
                ('source_address', models.CharField(max_length=50, null=True)),
                ('destination_address', models.CharField(max_length=50, null=True)),
                ('nat_source_ip', models.CharField(max_length=50, null=True)),
                ('nat_destination_ip', models.CharField(max_length=50, null=True)),
                ('destination_port', models.PositiveIntegerField(null=True)),
                ('source_port', models.PositiveIntegerField(null=True)),
                ('nat_destination_port', models.PositiveIntegerField(null=True)),
                ('application', models.CharField(max_length=250, null=True)),
                ('protocol', models.CharField(max_length=50, null=True)),
                ('log_action', models.CharField(max_length=50, null=True)),
                ('source_zone', models.CharField(max_length=250, null=True)),
                ('destination_zone', models.CharField(max_length=250, null=True)),
                ('inbound_interface', models.CharField(max_length=250, null=True)),
                ('outbound_interface', models.CharField(max_length=250, null=True)),
                ('action', models.CharField(max_length=250, null=True)),
                ('category', models.CharField(max_length=250, null=True)),
                ('session_end_reason', models.CharField(max_length=250, null=True)),
                ('source_country', models.CharField(max_length=3, null=True)),
                ('destination_country', models.CharField(max_length=3, null=True)),
                ('device_name', models.CharField(max_length=250, null=True)),
                ('flags', models.CharField(max_length=50, null=True)),
                ('vsys', models.CharField(max_length=50, null=True)),
                ('bytes_sent', models.BigIntegerField(null=True)),
                ('bytes_received', models.BigIntegerField(null=True)),
                ('packets_received', models.BigIntegerField(null=True)),
                ('packets_sent', models.BigIntegerField(null=True)),
                ('verified_datetime', models.DateTimeField(auto_now=True, null=True)),
            ],
            options={
                'db_table': 'fh_stg_tt_anmly_f',
            },
        ),
        migrations.CreateModel(
            name='TroubleTicketAnomaly',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('is_closed', models.BooleanField(default=False)),
                ('description', models.CharField(max_length=500, null=True)),
                ('repeat_count', models.PositiveIntegerField(null=True)),
                ('time_elapsed', models.BigIntegerField(null=True)),
                ('reasons', models.CharField(max_length=500, null=True)),
                ('logged_datetime', models.DateTimeField(null=True)),
                ('threat_content_type', models.CharField(max_length=50, null=True)),
                ('source_address', models.CharField(max_length=50, null=True)),
                ('destination_address', models.CharField(max_length=50, null=True)),
                ('nat_source_ip', models.CharField(max_length=50, null=True)),
                ('nat_destination_ip', models.CharField(max_length=50, null=True)),
                ('destination_port', models.PositiveIntegerField(null=True)),
                ('source_port', models.PositiveIntegerField(null=True)),
                ('nat_destination_port', models.PositiveIntegerField(null=True)),
                ('application', models.CharField(max_length=250, null=True)),
                ('protocol', models.CharField(max_length=50, null=True)),
                ('log_action', models.CharField(max_length=50, null=True)),
                ('source_zone', models.CharField(max_length=250, null=True)),
                ('destination_zone', models.CharField(max_length=250, null=True)),
                ('inbound_interface', models.CharField(max_length=250, null=True)),
                ('outbound_interface', models.CharField(max_length=250, null=True)),
                ('action', models.CharField(max_length=250, null=True)),
                ('category', models.CharField(max_length=250, null=True)),
                ('session_end_reason', models.CharField(max_length=250, null=True)),
                ('source_country', models.CharField(max_length=3, null=True)),
                ('destination_country', models.CharField(max_length=3, null=True)),
                ('device_name', models.CharField(max_length=250, null=True)),
                ('flags', models.CharField(max_length=50, null=True)),
                ('vsys', models.CharField(max_length=50, null=True)),
                ('bytes_sent', models.BigIntegerField(null=True)),
                ('bytes_received', models.BigIntegerField(null=True)),
                ('packets_received', models.BigIntegerField(null=True)),
                ('packets_sent', models.BigIntegerField(null=True)),
                ('verified_datetime', models.DateTimeField(auto_now=True, null=True)),
                ('is_anomaly', models.BooleanField(default=None, null=True)),
                ('severity_level', models.CharField(max_length=50, null=True)),
            ],
            options={
                'db_table': 'fh_prd_tt_anmly_f',
            },
        ),
        migrations.CreateModel(
            name='TroubleTicketFollowUpAnomaly',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('follow_up_datetime', models.DateTimeField(auto_now_add=True)),
                ('description', models.CharField(max_length=1000)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
