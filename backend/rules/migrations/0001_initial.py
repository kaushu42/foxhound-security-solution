# Generated by Django 2.2.8 on 2020-05-16 23:12

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StageTrafficRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date_time', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=250)),
                ('source_address', models.CharField(max_length=50, null=True)),
                ('destination_address', models.CharField(max_length=50, null=True)),
                ('application', models.CharField(max_length=50, null=True)),
                ('description', models.CharField(blank=True, max_length=250, null=True)),
                ('is_verified_rule', models.BooleanField(default=False)),
                ('is_anomalous_rule', models.BooleanField(default=False)),
                ('verified_date_time', models.DateTimeField(auto_now=True, null=True)),
                ('is_generic', models.BooleanField(default=False, null=True)),
            ],
            options={
                'db_table': 'fh_stg_trfc_rule_f',
            },
        ),
        migrations.CreateModel(
            name='TrafficRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_date_time', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=250)),
                ('source_address', models.CharField(max_length=50, null=True)),
                ('destination_address', models.CharField(max_length=50, null=True)),
                ('application', models.CharField(max_length=50, null=True)),
                ('description', models.CharField(blank=True, max_length=250, null=True)),
                ('is_verified_rule', models.BooleanField(default=False)),
                ('is_anomalous_rule', models.BooleanField(default=False)),
                ('verified_date_time', models.DateTimeField(auto_now=True, null=True)),
                ('is_generic', models.BooleanField(default=False, null=True)),
                ('firewall_rule', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule')),
                ('parent', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, to='rules.TrafficRule')),
            ],
            options={
                'db_table': 'fh_prd_trfc_rule_f',
            },
        ),
    ]
