import fs from 'fs';
import { parse } from 'csv-parse/sync';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadData() {
  try {
  
    const db = await open({
      filename: path.join(__dirname, '..', 'football_results.db'),
      driver: sqlite3.Database
    });
    
    console.log('Connected to SQLite database');
    
    
    await db.run('PRAGMA foreign_keys = ON');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '..', 'data', 'results.csv');
    const fileContent = fs.readFileSync(csvPath, { encoding: 'utf-8' });
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Loaded ${records.length} records from CSV`);
    
    // Create a map to store unique teams
    const teamsMap = new Map();
    // Create a map to store unique tournaments
    const tournamentsMap = new Map();
    // Create a map to store unique locations
    const locationsMap = new Map();
    
    // Extract unique teams, tournaments, and locations
    records.forEach(record => {
      // Process home team
      if (!teamsMap.has(record.home_team)) {
        teamsMap.set(record.home_team, {
          team_name: record.home_team,
          country_code: null, // Not available in the dataset
          confederation: null, // Not available in the dataset
          region: null, // Not available in the dataset
          first_match: record.date
        });
      }
      
      // Process away team
      if (!teamsMap.has(record.away_team)) {
        teamsMap.set(record.away_team, {
          team_name: record.away_team,
          country_code: null, // Not available in the dataset
          confederation: null, // Not available in the dataset
          region: null, // Not available in the dataset
          first_match: record.date
        });
      }
      
      // Process tournament
      if (record.tournament && !tournamentsMap.has(record.tournament)) {
        tournamentsMap.set(record.tournament, {
          tournament_name: record.tournament,
          tournament_type: null, // Not available in the dataset
          host_country: null // Not available in the dataset
        });
      }
      
      // Process location
      const locationKey = `${record.city || 'Unknown'}-${record.country || 'Unknown'}`;
      if (record.city && !locationsMap.has(locationKey)) {
        locationsMap.set(locationKey, {
          city: record.city,
          country: record.country,
          continent: null, // Not available in the dataset
          stadium: null // Not available in the dataset
        });
      }
    });
    
    console.log(`Found ${teamsMap.size} unique teams`);
    console.log(`Found ${tournamentsMap.size} unique tournaments`);
    console.log(`Found ${locationsMap.size} unique locations`);
    
    // Begin transaction for faster inserts
    await db.run('BEGIN TRANSACTION');
    
    // Insert teams into the database
    console.log('Inserting teams...');
    const teamIds = new Map();
    let counter = 0;
    
    for (const [teamName, teamData] of teamsMap.entries()) {
      const result = await db.run(
        'INSERT INTO TEAMS (team_name, country_code, confederation, region, first_match) VALUES (?, ?, ?, ?, ?)',
        [teamData.team_name, teamData.country_code, teamData.confederation, teamData.region, teamData.first_match]
      );
      
      teamIds.set(teamName, result.lastID);
      
      counter++;
      if (counter % 50 === 0) {
        console.log(`Inserted ${counter} teams`);
      }
    }
    
    // Insert tournaments into the database
    console.log('Inserting tournaments...');
    const tournamentIds = new Map();
    counter = 0;
    
    for (const [tournamentName, tournamentData] of tournamentsMap.entries()) {
      const result = await db.run(
        'INSERT INTO TOURNAMENTS (tournament_name, tournament_type, host_country) VALUES (?, ?, ?)',
        [tournamentData.tournament_name, tournamentData.tournament_type, tournamentData.host_country]
      );
      
      tournamentIds.set(tournamentName, result.lastID);
      
      counter++;
      if (counter % 50 === 0) {
        console.log(`Inserted ${counter} tournaments`);
      }
    }
    
    // Insert locations into the database
    console.log('Inserting locations...');
    const locationIds = new Map();
    counter = 0;
    
    for (const [locationKey, locationData] of locationsMap.entries()) {
      const result = await db.run(
        'INSERT INTO LOCATIONS (city, country, continent, stadium) VALUES (?, ?, ?, ?)',
        [locationData.city, locationData.country, locationData.continent, locationData.stadium]
      );
      
      locationIds.set(locationKey, result.lastID);
      
      counter++;
      if (counter % 50 === 0) {
        console.log(`Inserted ${counter} locations`);
      }
    }
    
    // Insert matches and match statistics
    console.log('Inserting matches and statistics...');
    counter = 0;
    
    for (const record of records) {
      // Get IDs for related entities
      const homeTeamId = teamIds.get(record.home_team);
      const awayTeamId = teamIds.get(record.away_team);
      const tournamentId = record.tournament ? tournamentIds.get(record.tournament) : null;
      
      const locationKey = `${record.city || 'Unknown'}-${record.country || 'Unknown'}`;
      const locationId = record.city ? locationIds.get(locationKey) : null;
      
      // Insert match
      const matchResult = await db.run(
        `INSERT INTO MATCHES 
         (home_team_id, away_team_id, tournament_id, location_id, match_date, home_score, away_score) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          homeTeamId,
          awayTeamId,
          tournamentId,
          locationId,
          record.date,
          parseInt(record.home_score) || 0,
          parseInt(record.away_score) || 0
        ]
      );
      
      const matchId = matchResult.lastID;
      
      // Insert match statistics (with random data since the dataset doesn't have these details)
      await db.run(
        `INSERT INTO MATCH_STATISTICS 
         (match_id, home_shots, away_shots, home_possession, away_possession, home_cards, away_cards) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          matchId,
          Math.floor(Math.random() * 20), // Random home shots
          Math.floor(Math.random() * 20), // Random away shots
          Math.floor(Math.random() * 70) + 30, // Random home possession
          Math.floor(Math.random() * 70) + 30, // Random away possession
          Math.floor(Math.random() * 5), // Random home cards
          Math.floor(Math.random() * 5) // Random away cards
        ]
      );
      
      counter++;
      if (counter % 1000 === 0) {
        console.log(`Inserted ${counter} matches with statistics`);
      }
    }
    
    // Commit transaction
    await db.run('COMMIT');
    
    console.log(`Successfully inserted ${counter} matches with statistics`);
    console.log('Data loading complete!');
    
    // Close database connection
    await db.close();
    
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

loadData();