# Generated by Django 2.2.5 on 2019-10-20 08:02

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ruledictionary',
            name='verified_by_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ruledictionary',
            name='virtual_system',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.VirtualSystem'),
        ),
    ]
