import fs from 'fs';
import { execSync } from 'child_process';

// Function to measure query execution time
async function measureQueryTime(sqlFilePath, outputFilePath) {
  try {
    console.log(`🔍 Measuring execution time for queries in: ${sqlFilePath}`);

    // Read and process SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0); // Remove empty statements

    console.log(`🔍 Found ${statements.length} queries to execute.`);
    statements.forEach((stmt, i) => console.log(`Query ${i + 1}: ${stmt}`));

    let results = [];
    const tempSqlFile = 'temp_execution.sql';

    if (statements.length === 0) {
      console.error('❌ No valid SQL queries found in the file.');
      fs.writeFileSync(outputFilePath, 'No valid SQL queries found in the file.');
      return;
    }

    statements.forEach((query, index) => {
      console.log(`⚡ Executing Query ${index + 1}/${statements.length}...`);
      
      // Write query to temporary file
      fs.writeFileSync(tempSqlFile, query);

      const startTime = performance.now();

      try {
        const output = execSync(`sqlite3 football_results.db ".read ${tempSqlFile}"`, { encoding: 'utf8', stdio: 'pipe' });
        const executionTime = performance.now() - startTime;

        results.push({ query, executionTime, output });
        console.log(`✅ Query ${index + 1} executed in ${executionTime.toFixed(2)} ms`);
      } catch (execError) {
        console.error(`❌ Error executing query: ${execError.message}\nQuery: ${query}`);
        results.push({ query, executionTime: -1, error: execError.message });
      }
    });

    // Clean up temp file
    if (fs.existsSync(tempSqlFile)) fs.unlinkSync(tempSqlFile);

    // Write results to output file
    const output = results
      .map(r => r.error
        ? `❌ Query: ${r.query}\nError: ${r.error}\n\n`
        : `✅ Query: ${r.query}\nExecution Time: ${r.executionTime.toFixed(2)} ms\nOutput:\n${r.output}\n\n`
      )
      .join('');

    fs.writeFileSync(outputFilePath, output || 'No queries executed or errors occurred.');
    console.log(`📂 Results saved to: ${outputFilePath}`);
  } catch (error) {
    console.error(`🚨 Fatal Error: ${error.message}`);
    fs.writeFileSync(outputFilePath, `Fatal Error: ${error.message}\n`);
  }
}

// Main Execution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node measure-query-time.js <sql-file-path> <output-file-path>');
  process.exit(1);
}

measureQueryTime(args[0], args[1]);
