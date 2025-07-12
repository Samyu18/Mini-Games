from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///games.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    games_played = db.relationship('GameRecord', backref='player', lazy=True)

class GameRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_type = db.Column(db.String(50), nullable=False)  # 'rps', 'ttt', 'memory'
    game_mode = db.Column(db.String(20), nullable=False)  # 'single', 'multiplayer'
    player1_score = db.Column(db.Integer, default=0)
    player2_score = db.Column(db.Integer, default=0)
    winner = db.Column(db.String(20))  # 'player1', 'player2', 'draw'
    duration = db.Column(db.Integer)  # game duration in seconds
    played_at = db.Column(db.DateTime, default=datetime.utcnow)

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_type = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, default=0)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)
    draws = db.Column(db.Integer, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        login_user(user)
        return jsonify({'message': 'Login successful', 'user_id': user.id})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})

@app.route('/api/save-game', methods=['POST'])
@login_required
def save_game():
    data = request.get_json()
    
    game_record = GameRecord(
        user_id=current_user.id,
        game_type=data['game_type'],
        game_mode=data['game_mode'],
        player1_score=data['player1_score'],
        player2_score=data['player2_score'],
        winner=data['winner'],
        duration=data.get('duration', 0)
    )
    
    db.session.add(game_record)
    
    # Update leaderboard
    leaderboard = Leaderboard.query.filter_by(
        user_id=current_user.id,
        game_type=data['game_type']
    ).first()
    
    if not leaderboard:
        leaderboard = Leaderboard(
            user_id=current_user.id,
            game_type=data['game_type']
        )
        db.session.add(leaderboard)
    
    # Update stats
    if data['winner'] == 'player1':
        leaderboard.wins += 1
    elif data['winner'] == 'player2':
        leaderboard.losses += 1
    else:
        leaderboard.draws += 1
    
    leaderboard.score = leaderboard.wins * 3 + leaderboard.draws
    leaderboard.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': 'Game saved successfully'})

@app.route('/api/leaderboard/<game_type>')
def get_leaderboard(game_type):
    leaderboard = Leaderboard.query.filter_by(game_type=game_type)\
        .order_by(Leaderboard.score.desc(), Leaderboard.wins.desc())\
        .limit(10).all()
    
    result = []
    for entry in leaderboard:
        user = User.query.get(entry.user_id)
        result.append({
            'username': user.username,
            'score': entry.score,
            'wins': entry.wins,
            'losses': entry.losses,
            'draws': entry.draws
        })
    
    return jsonify(result)

@app.route('/api/user-stats')
@login_required
def get_user_stats():
    stats = {}
    
    for game_type in ['rps', 'ttt', 'memory', 'snake']:
        leaderboard = Leaderboard.query.filter_by(
            user_id=current_user.id,
            game_type=game_type
        ).first()
        
        if leaderboard:
            stats[game_type] = {
                'score': leaderboard.score,
                'wins': leaderboard.wins,
                'losses': leaderboard.losses,
                'draws': leaderboard.draws,
                'total_games': leaderboard.wins + leaderboard.losses + leaderboard.draws
            }
        else:
            stats[game_type] = {
                'score': 0,
                'wins': 0,
                'losses': 0,
                'draws': 0,
                'total_games': 0
            }
    
    return jsonify(stats)

@app.route('/api/recent-games')
@login_required
def get_recent_games():
    games = GameRecord.query.filter_by(user_id=current_user.id)\
        .order_by(GameRecord.played_at.desc())\
        .limit(10).all()
    
    result = []
    for game in games:
        result.append({
            'game_type': game.game_type,
            'game_mode': game.game_mode,
            'player1_score': game.player1_score,
            'player2_score': game.player2_score,
            'winner': game.winner,
            'played_at': game.played_at.strftime('%Y-%m-%d %H:%M')
        })
    
    return jsonify(result)

@app.route('/api/check-auth')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email
            }
        })
    return jsonify({'authenticated': False})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5001) 