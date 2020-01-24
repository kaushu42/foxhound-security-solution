# Generated by Django 2.2.8 on 2020-01-21 19:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20200121_0417'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trafficlog',
            name='is_granular_hour_written',
        ),
        migrations.RemoveField(
            model_name='trafficlog',
            name='is_info_written',
        ),
        migrations.RemoveField(
            model_name='trafficlog',
            name='is_log_detail_written',
        ),
        migrations.RemoveField(
            model_name='trafficlog',
            name='is_rule_written',
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='action',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='application',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='category',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='destination_ip',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='destination_zone',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='inbound_interface',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='outbound_interface',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='protocol',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='session_end_reason',
            field=models.CharField(max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='source_ip',
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='source_zone',
            field=models.CharField(max_length=250, null=True),
        ),
    ]