from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AuthToken',
            fields=[
                ('key', models.CharField(max_length=64, primary_key=True, serialize=False, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auth_tokens', to='api.member')),
            ],
            options={
                'verbose_name': 'Auth Token',
                'verbose_name_plural': 'Auth Tokens',
                'db_table': 'api_authtoken',
            },
        ),
    ]
