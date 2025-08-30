# game/migrations/0001_initial.py

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('budget', models.IntegerField(default=1000000, validators=[django.core.validators.MinValueValidator(0)])),
                ('money_left', models.IntegerField(default=1000000, validators=[django.core.validators.MinValueValidator(0)])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'teams',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='PitchCondition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('condition', models.CharField(choices=[('DRY', 'Dry'), ('GREEN', 'Green'), ('DUSTY', 'Dusty'), ('FLAT', 'Flat'), ('BOUNCY', 'Bouncy')], max_length=10)),
                ('spin', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('seam', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('swing', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('reverse_swing', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('boundary_size', models.IntegerField(default=70, validators=[django.core.validators.MinValueValidator(50), django.core.validators.MaxValueValidator(90)])),
            ],
            options={
                'db_table': 'pitch_conditions',
            },
        ),
        migrations.CreateModel(
            name='WeatherCondition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('condition', models.CharField(choices=[('SUNNY', 'Sunny'), ('OVERCAST', 'Overcast'), ('RAINY', 'Rainy'), ('HUMID', 'Humid'), ('WINDY', 'Windy')], max_length=10)),
                ('spin', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('swing', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('seam', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('humidity', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
            ],
            options={
                'db_table': 'weather_conditions',
            },
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('player_type', models.CharField(choices=[('BATSMAN', 'Batsman'), ('BOWLER', 'Bowler'), ('ALL_ROUNDER', 'All-Rounder'), ('WICKET_KEEPER', 'Wicket-Keeper'), ('WICKET_KEEPER_BATSMAN', 'Wicket-Keeper Batsman')], max_length=25)),
                ('batting_hand', models.CharField(choices=[('RIGHT', 'Right-Handed'), ('LEFT', 'Left-Handed')], max_length=10)),
                ('bowling_style', models.CharField(blank=True, choices=[('RIGHT_ARM_OFF_SPIN', 'Right-Arm Off-Spin'), ('LEFT_ARM_OFF_SPIN', 'Left-Arm Off-Spin'), ('RIGHT_ARM_LEG_SPIN', 'Right-Arm Leg-Spin'), ('LEFT_ARM_LEG_SPIN', 'Left-Arm Leg-Spin'), ('RIGHT_ARM_FAST', 'Right-Arm Fast'), ('LEFT_ARM_FAST', 'Left-Arm Fast'), ('RIGHT_ARM_MEDIUM', 'Right-Arm Medium'), ('LEFT_ARM_MEDIUM', 'Left-Arm Medium')], max_length=25, null=True)),
                ('overall_skill', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('batting', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('bowling', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('fielding', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('wicketkeeping', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('fitness', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('bio', models.TextField(blank=True, null=True)),
                ('first_eleven', models.BooleanField(default=False)),
                ('base_price', models.IntegerField(default=100000, validators=[django.core.validators.MinValueValidator(0)])),
                ('sold_price', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('team', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='players', to='game.team')),
            ],
            options={
                'db_table': 'players',
                'ordering': ['-overall_skill', 'name'],
            },
        ),
        migrations.CreateModel(
            name='BowlingAttributes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bowler_type', models.CharField(choices=[('OFF_SPIN', 'Off-Spin'), ('LEG_SPIN', 'Leg-Spin'), ('FAST', 'Fast'), ('MEDIUM', 'Medium')], default='OFF_SPIN', max_length=10)),
                ('off_break', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('arm_ball', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('doosra', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('carrom_ball', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('leg_break', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('googly', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('slider', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('flipper', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('top_spin', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('pace', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('swing', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('seam', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('bouncer', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('yorkers', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('variation', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('control', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('player', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='bowling_attributes', to='game.player')),
            ],
            options={
                'db_table': 'bowling_attributes',
            },
        ),
        migrations.CreateModel(
            name='BattingAttributes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('off_break', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('arm_ball', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('doosra', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('carrom_ball', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('leg_break', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('googly', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('slider', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('flipper', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('top_spin', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('pace', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('swing', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('seam', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('bouncer', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('yorkers', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('power_hitting', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('technique', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('footwork', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('shot_selection', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('player', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='batting_attributes', to='game.player')),
            ],
            options={
                'db_table': 'batting_attributes',
            },
        ),
        migrations.CreateModel(
            name='WicketKeepingAttributes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('overall_skill', models.IntegerField(default=50, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('catching', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('stumping', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('reflexes', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('positioning', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('communication', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('player', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='wicketkeeping_attributes', to='game.player')),
            ],
            options={
                'db_table': 'wicketkeeping_attributes',
            },
        ),
        migrations.CreateModel(
            name='FieldingAttributes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('catching', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('ground_fielding', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('throwing_accuracy', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('throwing_distance', models.IntegerField(default=0, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('player', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='fielding_attributes', to='game.player')),
            ],
            options={
                'db_table': 'fielding_attributes',
            },
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('SCHEDULED', 'Scheduled'), ('IN_PROGRESS', 'In Progress'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')], default='SCHEDULED', max_length=15)),
                ('team1_score', models.IntegerField(default=0)),
                ('team2_score', models.IntegerField(default=0)),
                ('team1_wickets', models.IntegerField(default=0)),
                ('team2_wickets', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('pitch_condition', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='game.pitchcondition')),
                ('team1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_team1', to='game.team')),
                ('team2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_team2', to='game.team')),
                ('weather_condition', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='game.weathercondition')),
                ('winner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='won_matches', to='game.team')),
            ],
            options={
                'db_table': 'matches',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Auction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('status', models.CharField(choices=[('UPCOMING', 'Upcoming'), ('ACTIVE', 'Active'), ('COMPLETED', 'Completed'), ('CANCELLED', 'Cancelled')], default='UPCOMING', max_length=15)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('participating_teams', models.ManyToManyField(related_name='auctions', to='game.team')),
                ('players_pool', models.ManyToManyField(related_name='auctions', to='game.player')),
            ],
            options={
                'db_table': 'auctions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Bid',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('OUTBID', 'Outbid'), ('WON', 'Won'), ('WITHDRAWN', 'Withdrawn')], default='ACTIVE', max_length=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('auction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids', to='game.auction')),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids', to='game.player')),
                ('team', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids', to='game.team')),
            ],
            options={
                'db_table': 'bids',
                'ordering': ['-amount', '-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='bid',
            constraint=models.UniqueConstraint(fields=('auction', 'player', 'team', 'amount'), name='unique_bid_per_auction_player_team_amount'),
        ),
    ]
