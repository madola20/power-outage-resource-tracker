# Generated manually for updating reporter contact fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='location',
            name='reporter_contact',
        ),
        migrations.AddField(
            model_name='location',
            name='reporter_email',
            field=models.EmailField(blank=True, help_text="Reporter's email address"),
        ),
        migrations.AddField(
            model_name='location',
            name='reporter_phone',
            field=models.CharField(blank=True, help_text="Reporter's phone number", max_length=20),
        ),
    ]
