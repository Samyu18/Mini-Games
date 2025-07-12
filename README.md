# 🎮 Mini Games Collection with Flask Backend

A full-stack mini games collection built with Flask backend and vanilla JavaScript frontend. Features user authentication, leaderboards, game statistics, and persistent data storage.

## 🎯 Games Included

### ✂️ Rock Paper Scissors
- **Single Player**: Challenge the computer AI
- **2 Players**: Play with a friend on the same device
- Score tracking for both players
- Animated results with emojis
- Turn-based gameplay

### ⭕ Tic Tac Toe
- **2 Players**: Classic X's and O's game
- Turn-based gameplay with visual indicators
- Win detection and draw scenarios
- Persistent score tracking across games
- New game functionality

### 🧠 Memory Game
- **2 Players**: Competitive card matching
- Players take turns finding matches
- Score tracking for each player
- Smooth card flip animations
- Randomized card placement

## 🚀 Features

### 🎮 Game Features
- **Multiplayer Support**: All games support 2-player modes
- **Single Player Options**: Play against computer AI
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Glassmorphism design with smooth animations
- **Visual Effects**: Animated backgrounds, gradients, and particle effects
- **Easy Navigation**: Simple menu system to switch between games
- **Score Tracking**: Keep track of your performance in each game
- **No Dependencies**: Pure vanilla JavaScript - no frameworks required

### 🔐 Backend Features
- **User Authentication**: Secure login/register system
- **Session Management**: Flask-Login integration
- **Database Storage**: SQLite database with SQLAlchemy ORM
- **Game Statistics**: Track wins, losses, draws, and scores
- **Leaderboards**: Global rankings for each game
- **Game History**: Recent games tracking
- **RESTful API**: Clean API endpoints for frontend integration

### 🎨 Visual Enhancements
- **Animated Background**: Dynamic gradient shifts with particle effects
- **Glassmorphism Design**: Modern frosted glass effects throughout
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Gradient Text**: Animated gradient titles with glow effects
- **Card Animations**: Bouncing icons and smooth hover transitions
- **Color-coded Players**: Different colors for each player (red/blue)
- **Result Animations**: Pop-in effects for game results

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3 (with Flexbox, Grid, and advanced animations)
- Vanilla JavaScript (ES6+)
- Google Fonts (Orbitron)
- CSS Animations and Transitions
- Glassmorphism Design Patterns

### Backend
- Python 3.8+
- Flask 2.3.3
- Flask-SQLAlchemy 3.0.5
- Flask-Login 0.6.3
- SQLite Database
- Werkzeug (for password hashing)

## 📦 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/mini-games-flask.git
cd mini-games-flask
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Application
```bash
python app.py
```

The application will be available at `http://localhost:5000`

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Hashed password
- `created_at`: Account creation timestamp

### Game Records Table
- `id`: Primary key
- `user_id`: Foreign key to Users
- `game_type`: Type of game (rps, ttt, memory)
- `game_mode`: Single or multiplayer
- `player1_score`: Player 1's score
- `player2_score`: Player 2's score
- `winner`: Game winner (player1, player2, draw)
- `duration`: Game duration in seconds
- `played_at`: Game completion timestamp

### Leaderboard Table
- `id`: Primary key
- `user_id`: Foreign key to Users
- `game_type`: Type of game
- `score`: Total score (wins * 3 + draws)
- `wins`: Number of wins
- `losses`: Number of losses
- `draws`: Number of draws
- `updated_at`: Last update timestamp

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/logout` - User logout
- `GET /api/check-auth` - Check authentication status

### Game Data
- `POST /api/save-game` - Save game result
- `GET /api/user-stats` - Get user statistics
- `GET /api/leaderboard/<game_type>` - Get leaderboard for specific game
- `GET /api/recent-games` - Get user's recent games

## 📱 How to Play

### Game Modes
1. **Single Player**: Select "Play vs Computer" to challenge the AI
2. **2 Players**: Select "2 Players" to play with a friend

### Game Instructions

#### Rock Paper Scissors
- **Single Player**: Click Rock, Paper, or Scissors to play against the computer
- **2 Players**: Players take turns choosing their weapons
- First to win gets a point, rounds continue until you choose to restart

#### Tic Tac Toe
- Players take turns placing X's and O's on the board
- First player to get 3 in a row (horizontally, vertically, or diagonally) wins
- If the board fills up without a winner, it's a draw
- Scores are tracked across multiple games

#### Memory Game
- Players take turns flipping two cards to find matching pairs
- If you find a match, you get a point and another turn
- If no match, the turn passes to the other player
- Game ends when all pairs are found - highest score wins

## 🌐 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment

#### Option 1: Heroku
1. Create a `Procfile`:
   ```
   web: gunicorn app:app
   ```

2. Add to requirements.txt:
   ```
   gunicorn==20.1.0
   ```

3. Deploy to Heroku:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

#### Option 2: Python Anywhere
1. Upload files to PythonAnywhere
2. Install requirements: `pip install -r requirements.txt`
3. Configure WSGI file to point to `app.py`
4. Set up static files serving

#### Option 3: VPS/Server
1. Install Python and dependencies
2. Use Gunicorn as WSGI server
3. Set up Nginx as reverse proxy
4. Configure SSL certificates

### Environment Variables
For production, set these environment variables:
```bash
export FLASK_ENV=production
export SECRET_KEY=your-secure-secret-key
export DATABASE_URL=your-database-url
```

## 🔧 Configuration

### Database Configuration
The app uses SQLite by default. For production, you can switch to PostgreSQL or MySQL:

```python
# PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:pass@localhost/dbname'

# MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://user:pass@localhost/dbname'
```

### Security Settings
- Change the `SECRET_KEY` in production
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Add CSRF protection for forms

## 🎨 Customization

You can easily customize the games by:
- Changing colors in `static/css/styles.css`
- Adding new symbols to the Memory Game
- Modifying game logic in `static/js/script.js`
- Adding new games by extending the existing structure
- Adjusting animation timings and effects
- Adding new API endpoints in `app.py`

## 🎮 Game Features

### Multiplayer Enhancements
- **Turn Indicators**: Clear visual cues for whose turn it is
- **Score Persistence**: Scores maintained across game sessions
- **Player Colors**: Different colors for each player (red/blue)
- **Competitive Scoring**: Win-based scoring system

### Visual Improvements
- **Animated Backgrounds**: Dynamic gradient shifts
- **Glassmorphism**: Modern frosted glass effects
- **Smooth Transitions**: 60fps animations throughout
- **Responsive Design**: Optimized for all screen sizes
- **Accessibility**: High contrast and readable fonts

## 📊 Statistics & Analytics

The backend tracks:
- **Game Results**: Wins, losses, draws for each game type
- **Player Performance**: Individual statistics and rankings
- **Game Duration**: Time spent playing each game
- **Leaderboards**: Global rankings across all players
- **Recent Activity**: Last 10 games played by each user

## 🔒 Security Features

- **Password Hashing**: Secure password storage using Werkzeug
- **Session Management**: Flask-Login for secure sessions
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **XSS Protection**: Proper HTML escaping in templates

## 🐛 Troubleshooting

### Common Issues

1. **Database Errors**: Ensure the database file is writable
2. **Import Errors**: Make sure all requirements are installed
3. **Port Conflicts**: Change the port in `app.py` if 5000 is busy
4. **Static Files**: Ensure the static folder structure is correct

### Debug Mode
For development, enable debug mode:
```python
app.run(debug=True, host='0.0.0.0', port=5000)
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to contribute by:
- Adding new games
- Improving the UI/UX
- Adding more multiplayer features
- Fixing bugs
- Adding new animations
- Enhancing the backend API
- Adding new database features

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.

---

**Enjoy playing with friends! 🎮👥** 