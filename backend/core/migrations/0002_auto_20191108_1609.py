# Generated by Django 2.2.5 on 2019-11-08 16:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='country',
            name='ip_address',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.IPAddress'),
        ),
        migrations.AlterField(
            model_name='domain',
            name='tenant',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.Tenant'),
        ),
        migrations.AlterField(
            model_name='firewallrule',
            name='tenant',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.Tenant'),
        ),
        migrations.AlterField(
            model_name='firewallrulezone',
            name='destination_zone',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='firewall_destination_zone', to='core.Zone'),
        ),
        migrations.AlterField(
            model_name='firewallrulezone',
            name='firewall_rule',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.FirewallRule'),
        ),
        migrations.AlterField(
            model_name='firewallrulezone',
            name='source_zone',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='firewall_source_zone', to='core.Zone'),
        ),
        migrations.AlterField(
            model_name='tenant',
            name='virtual_system',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.VirtualSystem'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='application',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='application', to='core.Application'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='destination_ip',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='destination_ip', to='core.IPAddress'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='destination_zone',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='destination_zone', to='core.Zone'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='firewall_rule',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='firewall_rule', to='core.FirewallRule'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='protocol',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='protocol', to='core.Protocol'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='source_ip',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='source_ip', to='core.IPAddress'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='source_zone',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='source_zone', to='core.Zone'),
        ),
        migrations.AlterField(
            model_name='trafficlogdetail',
            name='traffic_log',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='core.TrafficLog'),
        ),
    ]
