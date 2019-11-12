# Generated by Django 2.2.5 on 2019-11-12 12:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('rules', '0002_auto_20191112_1223'),
        ('troubleticket', '0003_auto_20191108_1609'),
    ]

    operations = [
        migrations.CreateModel(
            name='TroubleTicketRule',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_datetime', models.DateTimeField(auto_now_add=True)),
                ('is_closed', models.BooleanField(default=False)),
                ('rule', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='rules.Rule')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]