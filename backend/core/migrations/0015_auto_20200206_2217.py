# Generated by Django 2.2.8 on 2020-02-06 16:32

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0014_processedlogdetail_processed_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='trafficlogdetailgranularhour',
            name='destination_country',
            field=models.CharField(max_length=3, null=True),
        ),
        migrations.AddField(
            model_name='trafficlogdetailgranularhour',
            name='source_country',
            field=models.CharField(max_length=3, null=True),
        ),
        migrations.AlterField(
            model_name='trafficlogdetailgranularhour',
            name='firewall_rule',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='firewall_rule_granular_hour', to='core.FirewallRule'),
        ),
    ]
