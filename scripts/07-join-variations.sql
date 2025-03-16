-- Enable EXPLAIN QUERY PLAN for SQLite
.explain on

-- Original join order

SELECT 
    m.match_date,
    ht.team_name AS home_team,
    at.team_name AS away_team,
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
WHERE m.match_date > '2010-01-01' AND t.tournament_name = 'FIFA World Cup'
LIMIT 100;

-- Alternative join order 1

SELECT 
    m.match_date,
    ht.team_name AS home_team,
    at.team_name AS away_team,
    m.home_score,
    m.away_score,
    t.tournament_name,
    l.city,
    l.country
FROM TOURNAMENTS t
JOIN MATCHES m ON t.tournament_id = m.tournament_id
JOIN TEAMS ht ON m.home_team_id = ht.team_id
JOIN TEAMS at ON m.away_team_id = at.team_id
JOIN LOCATIONS l ON m.location_id = l.location_id
WHERE m.match_date > '2010-01-01' AND t.tournament_name = 'FIFA World Cup'
LIMIT 100;

-- Using Common Table Expression (CTE)

WITH WorldCupMatches AS (
    SELECT m.*
    FROM MATCHES m
    JOIN TOURNAMENTS t ON m.tournament_id = t.tournament_id
    WHERE t.tournament_name = 'FIFA World Cup' AND m.match_date > '2010-01-01'
)
SELECT 
    wcm.match_date,
    ht.team_name AS home_team,
    at.team_name AS away_team,
    wcm.home_score,
    wcm.away_score,
    'FIFA World Cup' AS tournament_name,
    l.city,
    l.country
FROM WorldCupMatches wcm
JOIN TEAMS ht ON wcm.home_team_id = ht.team_id
JOIN TEAMS at ON wcm.away_team_id = at.team_id
JOIN LOCATIONS l ON wcm.location_id = l.location_id
LIMIT 100;

-- Using LEFT OUTER JOIN

SELECT 
    t.team_name,
    COUNT(m.match_id) AS matches_played,
    COALESCE(SUM(CASE WHEN m.home_team_id = t.team_id THEN m.home_score ELSE m.away_score END), 0) AS goals_scored
FROM TEAMS t
LEFT OUTER JOIN MATCHES m ON t.team_id = m.home_team_id OR t.team_id = m.away_team_id
LEFT OUTER JOIN TOURNAMENTS tour ON m.tournament_id = tour.tournament_id AND tour.tournament_name = 'FIFA World Cup'
GROUP BY t.team_id, t.team_name
ORDER BY matches_played DESC
LIMIT 20;

-- Using subquery

SELECT 
    t.team_name,
    (
        SELECT COUNT(*)
        FROM MATCHES m
        WHERE m.home_team_id = t.team_id OR m.away_team_id = t.team_id
    ) AS total_matches,
    (
        SELECT COUNT(*)
        FROM MATCHES m
        JOIN TOURNAMENTS tour ON m.tournament_id = tour.tournament_id
        WHERE (m.home_team_id = t.team_id OR m.away_team_id = t.team_id)
        AND tour.tournament_name = 'FIFA World Cup'
    ) AS world_cup_matches
FROM TEAMS t
WHERE t.team_name IN ('Brazil', 'Germany', 'Italy', 'Argentina', 'France')
ORDER BY total_matches DESC;