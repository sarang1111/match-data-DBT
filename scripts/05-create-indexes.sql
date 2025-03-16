-- Create index on match_date (for date range queries)
CREATE INDEX IF NOT EXISTS idx_match_date ON MATCHES(match_date);

-- Create index on team_name (for name searches)
CREATE INDEX IF NOT EXISTS idx_team_name ON TEAMS(team_name);

-- Create index on tournament_name (for filtering by tournament)
CREATE INDEX IF NOT EXISTS idx_tournament_name ON TOURNAMENTS(tournament_name);

-- Create composite index for home and away scores (for score filtering)
CREATE INDEX IF NOT EXISTS idx_match_scores ON MATCHES(home_score, away_score);

-- Create index on location country (for filtering by country)
CREATE INDEX IF NOT EXISTS idx_location_country ON LOCATIONS(country);