# Cricket Auction Django Backend

A comprehensive Django REST API backend for a cricket auction game with match simulation capabilities.

## Features

- **Team Management**: Create and manage cricket teams with budgets
- **Player Management**: Detailed player profiles with cricket-specific attributes
- **Auction System**: Real-time bidding system for player auctions
- **Match Simulation**: Advanced cricket match simulation engine
- **Match Conditions**: Configurable pitch and weather conditions affecting gameplay

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cricket-auction-backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Setup PostgreSQL Database**

   ```sql
   CREATE DATABASE cricket;
   CREATE USER div WITH PASSWORD 'yanshu';
   GRANT ALL PRIVILEGES ON DATABASE cricket TO div;
   ```

5. **Configure Environment Variables**

   Create a `.env` file in the project root:
    ```
    DB_NAME=cricket
    DB_USER=div
    DB_PASSWORD=yanshu
    DB_HOST=localhost
    DB_PORT=5432
    SECRET_KEY=your-super-secret-key-here
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    ```

6. **Run Migrations**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create Sample Data** (Optional)

   ```bash
   python manage.py create_sample_data --teams 8 --players 100
   ```

8. **Create Superuser**

   ```bash
   python manage.py createsuperuser
   ```

9. **Run Development Server**

   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Teams

- `GET /api/teams/` - List all teams
- `POST /api/teams/` - Create a new team
- `GET /api/teams/{id}/` - Get team details
- `GET /api/teams/{id}/players/` - Get team players
- `GET /api/teams/{id}/playing_eleven/` - Get team's playing eleven

### Players

- `GET /api/players/` - List all players
- `POST /api/players/` - Create a new player
- `GET /api/players/{id}/` - Get player details
- `GET /api/players/available/` - Get available players (not in any team)

### Matches

- `GET /api/matches/` - List all matches
- `POST /api/matches/` - Create a new match
- `POST /api/matches/{id}/simulate/` - Simulate complete match
- `POST /api/matches/{id}/simulate_ball/` - Simulate single ball

### Auctions

- `GET /api/auctions/` - List all auctions
- `POST /api/auctions/` - Create a new auction
- `POST /api/auctions/{id}/add_team/` - Add team to auction
- `POST /api/auctions/{id}/add_player/` - Add player to auction pool

### Bids

- `GET /api/bids/` - List all bids
- `POST /api/bids/` - Place a new bid
- `POST /api/bids/{id}/finalize/` - Finalize bid (assign player to team)

## Match Simulation

The match engine uses a sophisticated probabilistic model that considers:

- **Player Attributes**: Bowling skills, batting skills, fielding, wicketkeeping
- **Pitch Conditions**: Spin help, seam movement, swing assistance
- **Weather Conditions**: Humidity, cloud cover affecting ball movement
- **Real Cricket Statistics**: Based on actual cricket match data

### Simulation Example

```python
# Simulate a single ball
POST /api/matches/1/simulate_ball/
{
    "bowler_id": 1,
    "batsman_id": 2,
    "wicketkeeper_id": 3
}

# Simulate full match
POST /api/matches/1/simulate/
{
    "max_overs": 20
}
```

## Database Schema

The system uses the following main models:

- **Team**: Team information and budget
- **Player**: Player details and overall skills
- **BowlingAttributes**: Detailed bowling skills
- **BattingAttributes**: Batting skills against different deliveries
- **FieldingAttributes**: Fielding capabilities
- **WicketKeepingAttributes**: Wicketkeeping skills
- **Match**: Match details and results
- **Auction**: Auction management
- **Bid**: Bidding information

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` to:
    - Manage teams and players
    - View match results
    - Monitor auction progress
    - Configure pitch and weather conditions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
"""
