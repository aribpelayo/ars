# Generated by Django 2.1.2 on 2018-11-19 07:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0006_auto_20181119_1446'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='retrain',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]