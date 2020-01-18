# Generated by Django 2.2.8 on 2020-01-13 18:56

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0015_applicationchart_filter_ipchart_requestoriginchart_stagingfilter_timeserieschart'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ipchart',
            name='firewall_rule',
        ),
        migrations.RemoveField(
            model_name='requestoriginchart',
            name='firewall_rule',
        ),
        migrations.RemoveField(
            model_name='timeserieschart',
            name='firewall_rule',
        ),
        migrations.AlterField(
            model_name='applicationchart',
            name='firewall_rule',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
        migrations.AlterField(
            model_name='filter',
            name='firewall_rule',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
        migrations.AlterField(
            model_name='stagingfilter',
            name='firewall_rule',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
    ]