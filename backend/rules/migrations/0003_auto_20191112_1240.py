# Generated by Django 2.2.5 on 2019-11-12 12:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rules', '0002_auto_20191112_1223'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rule',
            name='application',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rule_application', to='core.Application'),
        ),
        migrations.AlterField(
            model_name='rule',
            name='destination_ip',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rule_destination_ip', to='core.IPAddress'),
        ),
        migrations.AlterField(
            model_name='rule',
            name='source_ip',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='rule_source_ip', to='core.IPAddress'),
        ),
    ]