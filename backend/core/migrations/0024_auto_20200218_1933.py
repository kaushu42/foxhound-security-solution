# Generated by Django 2.2.8 on 2020-02-18 13:48

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0023_auto_20200218_1800'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='threatlog',
            name='action',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='action_flags',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='application',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='category',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='config_version',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='contenttype',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='contentver',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='cpadding',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='destination_country',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='destination_ip',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='destination_port',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='destination_zone',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='device_name',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='direction',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='file_url',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='firewall_rule',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='flags',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='inbound_interface',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='ip_protocol',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='log_action',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='log_type',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='logged_datetime',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='outbound_interface',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='received_datetime',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='repeat_count',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='sequence_number',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='severity',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='sig_flags',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='source_country',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='source_ip',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='source_port',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='source_zone',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='thr_category',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='threat_content_name',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='threat_content_type',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='url_filename',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='url_idx',
        ),
        migrations.RemoveField(
            model_name='threatlog',
            name='virtual_system',
        ),
        migrations.AddField(
            model_name='threatlog',
            name='log_date',
            field=models.DateField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='threatlog',
            name='log_name',
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name='threatlog',
            name='processed_datetime',
            field=models.DateField(auto_now_add=True),
        ),
        migrations.CreateModel(
            name='ThreatLogDetail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logged_datetime', models.DateTimeField()),
                ('processed_datetime', models.DateTimeField()),
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
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='threat_log_firewall_rule_id', to='core.FirewallRule')),
            ],
        ),
    ]