# Generated by Django 2.2.5 on 2019-11-19 03:50

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_auto_20191119_0321'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='processedlogdetail',
            name='tenant',
        ),
        migrations.AddField(
            model_name='processedlogdetail',
            name='firewall_rule',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
    ]