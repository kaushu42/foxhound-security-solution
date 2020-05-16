# Generated by Django 2.2.8 on 2020-05-16 23:12

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('troubleticket', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='troubleticketfollowupanomaly',
            name='assigned_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assigned_by', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='troubleticketfollowupanomaly',
            name='assigned_to',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assigned_to', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='troubleticketfollowupanomaly',
            name='trouble_ticket',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='troubleticket.TroubleTicketAnomaly'),
        ),
        migrations.AddField(
            model_name='troubleticketanomaly',
            name='assigned_to',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='troubleticketanomaly',
            name='firewall_rule',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
        migrations.AddField(
            model_name='troubleticketanomaly',
            name='log',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.TrafficLog'),
        ),
        migrations.AddField(
            model_name='troubleticketanomaly',
            name='verified_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='verified_by_tt', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='stagetroubleticketanomaly',
            name='assigned_to',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='stagetroubleticketanomaly',
            name='firewall_rule',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
        migrations.AddField(
            model_name='stagetroubleticketanomaly',
            name='log',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.TrafficLog'),
        ),
        migrations.AddField(
            model_name='stagetroubleticketanomaly',
            name='verified_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='verified_by_tt_stg', to=settings.AUTH_USER_MODEL),
        ),
    ]
