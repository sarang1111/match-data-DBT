-- Create TEAMS table
CREATE TABLE TEAMS (
    team_id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_name TEXT NOT NULL,
    country_code TEXT,
    confederation TEXT,
    region TEXT,
    first_match TEXT,
    created_by TEXT DEFAULT 'PES2UG22CS508_SARANG' -- Include your SRN and Name
);

-- Create TOURNAMENTS table
CREATE TABLE TOURNAMENTS (
    tournament_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_name TEXT NOT NULL,
    tournament_type TEXT,
    host_country TEXT
);

-- Create LOCATIONS table
CREATE TABLE LOCATIONS (
    location_id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT,
    country TEXT,
    continent TEXT,
    stadium TEXT
);

-- Create MATCHES table
CREATE TABLE MATCHES (
    match_id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team_id INTEGER,
    away_team_id INTEGER,
    tournament_id INTEGER,
    location_id INTEGER,
    match_date TEXT NOT NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    match_status TEXT DEFAULT 'Completed',
    FOREIGN KEY (home_team_id) REFERENCES TEAMS(team_id),
    FOREIGN KEY (away_team_id) REFERENCES TEAMS(team_id),
    FOREIGN KEY (tournament_id) REFERENCES TOURNAMENTS(tournament_id),
    FOREIGN KEY (location_id) REFERENCES LOCATIONS(location_id)
);

-- Create MATCH_STATISTICS table
CREATE TABLE MATCH_STATISTICS (
    stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER,
    home_shots INTEGER,
    away_shots INTEGER,
    home_possession INTEGER,
    away_possession INTEGER,
    home_cards INTEGER,
    away_cards INTEGER,
    weather_conditions TEXT,
    FOREIGN KEY (match_id) REFERENCES MATCHES(match_id)
);