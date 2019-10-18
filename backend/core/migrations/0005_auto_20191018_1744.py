# Generated by Django 2.2.5 on 2019-10-18 17:44

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_auto_20191018_1640'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrafficLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('processed_datetime', models.DateField(auto_now_add=True)),
                ('log_date', models.DateField(auto_now_add=True)),
                ('log_name', models.CharField(max_length=200)),
                ('virtual_system', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.VirtualSystem')),
            ],
        ),
        migrations.CreateModel(
            name='TrafficLogDetail',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_ip', models.CharField(max_length=50)),
                ('source_port', models.PositiveIntegerField()),
                ('destination_ip', models.CharField(max_length=50)),
                ('destination_port', models.PositiveIntegerField()),
                ('bytes_sent', models.BigIntegerField()),
                ('bytes_received', models.BigIntegerField()),
                ('repeat_count', models.PositiveIntegerField()),
                ('application', models.CharField(max_length=50)),
                ('packets_received', models.BigIntegerField()),
                ('packets_sent', models.BigIntegerField()),
                ('protocol', models.CharField(max_length=50)),
                ('time_elapsed', models.BigIntegerField()),
                ('source_zone', models.CharField(max_length=50)),
                ('destination_zone', models.CharField(max_length=50)),
                ('firewall_rule', models.CharField(max_length=50)),
                ('traffic_log', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.TrafficLog')),
            ],
        ),
        migrations.DeleteModel(
            name='Log',
        ),
    ]
