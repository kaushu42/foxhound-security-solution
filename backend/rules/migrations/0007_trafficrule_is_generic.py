# Generated by Django 2.2.8 on 2020-05-15 00:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rules', '0006_trafficrule_parent'),
    ]

    operations = [
        migrations.AddField(
            model_name='trafficrule',
            name='is_generic',
            field=models.BooleanField(default=False, null=True),
        ),
    ]
