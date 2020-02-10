# Generated by Django 2.2.5 on 2020-02-10 14:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0017_auto_20200208_2206'),
    ]

    operations = [
        migrations.CreateModel(
            name='ThreatLogs',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logged_datetime', models.DateTimeField()),
                ('processed_datetime', models.DateField()),
                ('log_name', models.CharField(max_length=500)),
                ('received_datetime', models.DateTimeField()),
                ('log_type', models.CharField(max_length=300, null=True)),
                ('threat_content_type', models.CharField(max_length=300, null=True)),
                ('config_version', models.CharField(max_length=300, null=True)),
                ('source_ip', models.CharField(max_length=300, null=True)),
                ('destination_ip', models.CharField(max_length=300, null=True)),
                ('application', models.CharField(max_length=300, null=True)),
                ('virtual_system', models.CharField(max_length=300, null=True)),
                ('source_zone', models.CharField(max_length=300, null=True)),
                ('destination_zone', models.CharField(max_length=300, null=True)),
                ('inbound_interface', models.CharField(max_length=300, null=True)),
                ('outbound_interface', models.CharField(max_length=300, null=True)),
                ('log_action', models.CharField(max_length=300, null=True)),
                ('repeat_count', models.IntegerField(null=True)),
                ('source_port', models.IntegerField(null=True)),
                ('destination_port', models.IntegerField(null=True)),
                ('flags', models.CharField(max_length=300, null=True)),
                ('ip_protocol', models.CharField(max_length=300, null=True)),
                ('action', models.CharField(max_length=300, null=True)),
                ('url_filename', models.CharField(max_length=300, null=True)),
                ('threat_content_name', models.CharField(max_length=300, null=True)),
                ('category', models.CharField(max_length=300, null=True)),
                ('severity', models.CharField(max_length=300, null=True)),
                ('direction', models.CharField(max_length=300, null=True)),
                ('sequence_number', models.CharField(max_length=300, null=True)),
                ('action_flags', models.CharField(max_length=300, null=True)),
                ('source_country', models.CharField(max_length=300, null=True)),
                ('destination_country', models.CharField(max_length=300, null=True)),
                ('cpadding', models.CharField(max_length=300, null=True)),
                ('contenttype', models.CharField(max_length=300, null=True)),
                ('url_idx', models.CharField(max_length=300, null=True)),
                ('device_name', models.CharField(max_length=300, null=True)),
                ('file_url', models.CharField(max_length=300, null=True)),
                ('thr_category', models.CharField(max_length=300, null=True)),
                ('contentver', models.CharField(max_length=300, null=True)),
                ('sig_flags', models.CharField(max_length=300, null=True)),
                ('firewall_rule_id', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='threat_log_firewall_rule_id', to='core.FirewallRule')),
            ],
        ),
    ]
