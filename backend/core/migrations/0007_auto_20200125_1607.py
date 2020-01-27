# Generated by Django 2.2.8 on 2020-01-25 16:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_auto_20200124_1808'),
    ]

    operations = [
        migrations.RenameField(
            model_name='applicationchart',
            old_name='bytes',
            new_name='bytes_received',
        ),
        migrations.AddField(
            model_name='applicationchart',
            name='bytes_sent',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='applicationchart',
            name='count',
            field=models.BigIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='applicationchart',
            name='packets_received',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='applicationchart',
            name='packets_sent',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ipchart',
            name='packets_received',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='ipchart',
            name='packets_sent',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='requestoriginchart',
            name='bytes_received',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='requestoriginchart',
            name='bytes_sent',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='requestoriginchart',
            name='packets_received',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='requestoriginchart',
            name='packets_sent',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='timeserieschart',
            name='count',
            field=models.BigIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='timeserieschart',
            name='packets_received',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='timeserieschart',
            name='packets_sent',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='requestoriginchart',
            name='count',
            field=models.BigIntegerField(default=0),
        ),
    ]