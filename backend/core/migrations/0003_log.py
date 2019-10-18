# Generated by Django 2.2.5 on 2019-10-17 09:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_auto_20191017_0924'),
    ]

    operations = [
        migrations.CreateModel(
            name='Log',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('source_ip', models.CharField(max_length=50)),
                ('source_port', models.PositiveIntegerField()),
                ('destinaton_ip', models.CharField(max_length=50)),
                ('destinaton_port', models.PositiveIntegerField()),
                ('bytes_sent', models.BigIntegerField()),
                ('bytes_received', models.BigIntegerField()),
                ('repeat_count', models.PositiveIntegerField()),
                ('application', models.CharField(max_length=50)),
                ('packets_received', models.BigIntegerField()),
                ('packets_sent', models.BigIntegerField()),
                ('ip_protocol', models.CharField(max_length=50)),
                ('time_elapsed', models.BigIntegerField()),
                ('virtual_system', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.VirtualSystem')),
            ],
        ),
    ]
