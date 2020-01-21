# Generated by Django 2.2.8 on 2020-01-21 02:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Action',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='BlacklistedIP',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.CharField(max_length=15)),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='CeleryTaskmeta',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('task_id', models.CharField(blank=True, max_length=155, null=True, unique=True)),
                ('status', models.CharField(blank=True, max_length=50, null=True)),
                ('result', models.BinaryField(blank=True, null=True)),
                ('date_done', models.DateTimeField(blank=True, null=True)),
                ('traceback', models.TextField(blank=True, null=True)),
            ],
            options={
                'db_table': 'celery_taskmeta',
            },
        ),
        migrations.CreateModel(
            name='CeleryTasksetmeta',
            fields=[
                ('id', models.IntegerField(primary_key=True, serialize=False)),
                ('taskset_id', models.CharField(blank=True, max_length=155, null=True, unique=True)),
                ('result', models.BinaryField(blank=True, null=True)),
                ('date_done', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'db_table': 'celery_tasksetmeta',
            },
        ),
        migrations.CreateModel(
            name='DBLock',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('table_name', models.CharField(max_length=80, null=True, unique=True)),
                ('is_locked', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Filter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Application')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='FirewallRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
            ],
        ),
        migrations.CreateModel(
            name='Interface',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='IPAddress',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('address', models.CharField(max_length=15)),
                ('alias', models.CharField(max_length=200, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Protocol',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SessionEndReason',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TrafficLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('processed_datetime', models.DateField(auto_now_add=True)),
                ('log_date', models.DateField()),
                ('log_name', models.CharField(max_length=200)),
                ('is_log_detail_written', models.BooleanField(default=False, null=True)),
                ('is_rule_written', models.BooleanField(default=False, null=True)),
                ('is_info_written', models.BooleanField(default=False, null=True)),
                ('is_granular_hour_written', models.BooleanField(default=False, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='VirtualSystem',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=20, unique=True)),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='Zone',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TrafficLogDetailGranularHour',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('destination_port', models.PositiveIntegerField()),
                ('bytes_sent', models.BigIntegerField()),
                ('bytes_received', models.BigIntegerField()),
                ('repeat_count', models.PositiveIntegerField()),
                ('packets_received', models.BigIntegerField()),
                ('packets_sent', models.BigIntegerField()),
                ('time_elapsed', models.BigIntegerField()),
                ('logged_datetime', models.DateTimeField()),
                ('action', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_action', to='core.Action')),
                ('application', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_application', to='core.Application')),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_category', to='core.Category')),
                ('destination_ip', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_destination_ip', to='core.IPAddress')),
                ('destination_zone', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_destination_zone', to='core.Zone')),
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_firewall_rule', to='core.FirewallRule')),
                ('inbound_interface', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_inbound_interface', to='core.Interface')),
                ('outbound_interface', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_outbound_interface', to='core.Interface')),
                ('protocol', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_protocol', to='core.Protocol')),
                ('session_end_reason', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_session_end_reason', to='core.SessionEndReason')),
                ('source_ip', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_source_ip', to='core.IPAddress')),
                ('source_zone', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='granular_hour_source_zone', to='core.Zone')),
                ('traffic_log', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.TrafficLog')),
            ],
        ),
        migrations.CreateModel(
            name='TrafficLogDetail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('row_number', models.BigIntegerField()),
                ('source_port', models.PositiveIntegerField()),
                ('destination_port', models.PositiveIntegerField()),
                ('bytes_sent', models.BigIntegerField()),
                ('bytes_received', models.BigIntegerField()),
                ('repeat_count', models.PositiveIntegerField()),
                ('packets_received', models.BigIntegerField()),
                ('packets_sent', models.BigIntegerField()),
                ('time_elapsed', models.BigIntegerField()),
                ('logged_datetime', models.DateTimeField(auto_now_add=True)),
                ('action', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='action', to='core.Action')),
                ('application', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='application', to='core.Application')),
                ('category', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='category', to='core.Category')),
                ('destination_ip', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='destination_ip', to='core.IPAddress')),
                ('destination_zone', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='destination_zone', to='core.Zone')),
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='firewall_rule', to='core.FirewallRule')),
                ('inbound_interface', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='inbound_interface', to='core.Interface')),
                ('outbound_interface', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='outbound_interface', to='core.Interface')),
                ('protocol', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='protocol', to='core.Protocol')),
                ('session_end_reason', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='session_end_reason', to='core.SessionEndReason')),
                ('source_ip', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='source_ip', to='core.IPAddress')),
                ('source_zone', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='source_zone', to='core.Zone')),
                ('traffic_log', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.TrafficLog')),
            ],
        ),
        migrations.CreateModel(
            name='TimeSeriesChart',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logged_datetime', models.DateTimeField()),
                ('bytes_sent', models.BigIntegerField()),
                ('bytes_received', models.BigIntegerField()),
                ('filter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Filter')),
            ],
        ),
        migrations.CreateModel(
            name='TenantIPAddressInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date', models.DateField(auto_now=True, null=True)),
                ('address', models.CharField(max_length=15)),
                ('alias', models.CharField(max_length=250, null=True)),
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TenantApplicationInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date', models.DateField(auto_now=True, null=True)),
                ('application', models.CharField(max_length=250)),
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Tenant',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('virtual_system', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.VirtualSystem')),
            ],
        ),
        migrations.CreateModel(
            name='StagingFilter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_zone', models.IntegerField()),
                ('destination_zone', models.IntegerField()),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Application')),
                ('firewall_rule', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule')),
                ('protocol', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Protocol')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='RequestOriginChart',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('country_name', models.CharField(max_length=100)),
                ('country_code', models.CharField(max_length=10)),
                ('count', models.BigIntegerField()),
                ('filter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Filter')),
            ],
        ),
        migrations.CreateModel(
            name='ProcessedLogDetail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('n_rows', models.IntegerField(default=0)),
                ('size', models.BigIntegerField(default=0)),
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule')),
                ('log', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.TrafficLog')),
            ],
        ),
        migrations.CreateModel(
            name='IPChart',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logged_datetime', models.DateTimeField()),
                ('address', models.CharField(max_length=15)),
                ('bytes_sent', models.BigIntegerField()),
                ('bytes_received', models.BigIntegerField()),
                ('filter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Filter')),
            ],
        ),
        migrations.CreateModel(
            name='FirewallRuleZone',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('destination_zone', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='firewall_destination_zone', to='core.Zone')),
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule')),
                ('source_zone', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='firewall_source_zone', to='core.Zone')),
            ],
        ),
        migrations.AddField(
            model_name='firewallrule',
            name='tenant',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.Tenant'),
        ),
        migrations.AddField(
            model_name='filter',
            name='destination_zone',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='filter_destination_zone', to='core.Zone'),
        ),
        migrations.AddField(
            model_name='filter',
            name='firewall_rule',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
        migrations.AddField(
            model_name='filter',
            name='protocol',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Protocol'),
        ),
        migrations.AddField(
            model_name='filter',
            name='source_zone',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='filter_source_zone', to='core.Zone'),
        ),
        migrations.CreateModel(
            name='Domain',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('url', models.CharField(max_length=250)),
                ('tenant', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.Tenant')),
            ],
        ),
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('iso_code', models.CharField(max_length=5)),
                ('ip_address', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.IPAddress')),
            ],
        ),
        migrations.CreateModel(
            name='BackgroundJob',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='task_background_job', to='core.CeleryTasksetmeta')),
                ('tenant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tenant_background_job', to='core.Tenant')),
            ],
        ),
        migrations.CreateModel(
            name='ApplicationChart',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logged_datetime', models.DateTimeField()),
                ('application', models.CharField(max_length=250)),
                ('bytes', models.BigIntegerField()),
                ('firewall_rule', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule')),
            ],
        ),
    ]
