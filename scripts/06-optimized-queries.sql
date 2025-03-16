-- Enable EXPLAIN QUERY PLAN for SQLite
.explain on

-- Query that now uses index scan on match_date

SELECT * FROM MATCHES WHERE match_date > '2010-01-01';

-- Query that now uses index scan on team_name

SELECT * FROM TEAMS WHERE team_name LIKE 'Bra%';

-- Query with ordering that now uses index

SELECT * FROM MATCHES ORDER BY match_date DESC LIMIT 100;

-- 3-table join that should now be faster

SELECT 
    m.match_date,
    ht.team_name AS home_team,
    at.team_name AS away_team,
    m.home_score,
    m.away_score,
    t.tournament_name
FROM MATCHES m
JOIN TEAMS ht ON m.home_team_id = ht.team_id
JOIN TEAMS at ON m.away_team_id = at.team_id
JOIN TOURNAMENTS t ON m.tournament_id = t.tournament_id
WHERE m.home_score > 3 OR m.away_score > 3
LIMIT 100;

-- Complex query for analysis (should be faster with indexes)

SELECT 
    ht.team_name AS home_team,
    at.team_name AS away_team,
    m.match_date,
    m.home_score,
    m.away_score,
    t.tournament_name,
    l.city,
    l.country
FROM MATCHES m
JOIN TEAMS ht ON m.home_team_id = ht.team_id
JOIN TEAMS at ON m.away_team_id = at.team_id
JOIN TOURNAMENTS t ON m.tournament_id = t.tournament_id
JOIN LOCATIONS l ON m.location_id = l.location_id
WHERE m.match_date BETWEEN '2010-01-01' AND '2014-12-31'
AND t.tournament_name = 'FIFA World Cup'
AND (m.home_score > 2 OR m.away_score > 2)
ORDER BY m.match_date;