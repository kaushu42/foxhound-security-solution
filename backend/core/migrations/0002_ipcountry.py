# Generated by Django 2.2.5 on 2019-11-01 07:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='IPCountry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip', models.CharField(max_length=50, unique=True)),
                ('country_name', models.CharField(max_length=50)),
                ('country_iso_code', models.CharField(max_length=5)),
            ],
        ),
    ]