const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to get random date between two dates
function getRandomDate(start, end) {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

// Function to format date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Function to get all files recursively
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Skip node_modules, .git, and .next directories
      if (!['node_modules', '.git', '.next'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      // Only add relevant file types
      if (file.match(/\.(js|jsx|ts|tsx|css|html|md|json)$/)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Function to execute git commands
function executeGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Function to sleep for specified milliseconds
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to commit and push a file with a specific date
async function commitAndPushFile(filePath, date) {
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist`);
    return false;
  }

  const fileName = path.basename(filePath);

  // Add the file to git
  executeGitCommand(`git add "${filePath}"`);

  // Create the commit with the specified date
  const commitDate = date.toISOString();
  const commitMessage = `Added ${fileName}`;

  // Set GIT_AUTHOR_DATE and GIT_COMMITTER_DATE to the specified date
  const command = `git commit --date="${commitDate}" -m "${commitMessage}"`;
  const env =
    process.platform === 'win32'
      ? `set GIT_AUTHOR_DATE=${commitDate}&& set GIT_COMMITTER_DATE=${commitDate}&& `
      : `export GIT_AUTHOR_DATE="${commitDate}" && export GIT_COMMITTER_DATE="${commitDate}" && `;

  executeGitCommand(env + command);

  // Push this single commit
  console.log(`Pushing ${fileName}...`);
  executeGitCommand('git push origin main');

  // Wait for 2 seconds before next operation
  await sleep(2000);

  return true;
}

// Main function to process files
async function processFiles(files, startDate, endDate) {
  // Sort files randomly to make commit order more natural
  const shuffledFiles = [...files].sort(() => Math.random() - 0.5);

  for (const file of shuffledFiles) {
    const randomDate = getRandomDate(startDate, endDate);
    const success = await commitAndPushFile(file, randomDate);
    if (success) {
      console.log(
        `Committed and pushed ${file} with date ${formatDate(randomDate)}`,
      );
      // Wait for 2 seconds before next file
      await sleep(2000);
    }
  }

  console.log('All files have been committed and pushed!');
}

// Get command line arguments for dates
const args = process.argv.slice(2);
const startDateArg = args
  .find((arg) => arg.startsWith('--start='))
  ?.split('=')[1];
const endDateArg = args.find((arg) => arg.startsWith('--end='))?.split('=')[1];

// Default date range if not provided
const startDate = startDateArg
  ? new Date(startDateArg)
  : new Date('2023-01-20');
const endDate = endDateArg ? new Date(endDateArg) : new Date('2023-05-20');

// Validate dates
if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
  console.error('Invalid date format. Please use YYYY-MM-DD format.');
  process.exit(1);
}

if (endDate < startDate) {
  console.error('End date must be after start date.');
  process.exit(1);
}

// Get all files from the project
const filesToCommit = getAllFiles('.')
  // Sort files to ensure consistent order
  .sort((a, b) => a.localeCompare(b))
  // Convert Windows backslashes to forward slashes
  .map((file) => file.replace(/\\/g, '/'));

console.log('Files to be committed:');
filesToCommit.forEach((file, index) => {
  console.log(`${index + 1}. ${file}`);
});

console.log('\nTotal files to commit:', filesToCommit.length);
console.log(`Date range: ${formatDate(startDate)} to ${formatDate(endDate)}`);
console.log(
  '\nTo proceed with the commits, run this script with --execute flag',
);

// Only run processFiles if --execute flag is provided
if (process.argv.includes('--execute')) {
  // Using async/await with IIFE (Immediately Invoked Function Expression)
  (async () => {
    await processFiles(filesToCommit, startDate, endDate);
  })();
} else {
  console.log('\nTo execute the commits, run one of these commands:');
  console.log('1. Use default date range (Jan 1, 2024 - Mar 20, 2024):');
  console.log('   node commit-history.js --execute');
  console.log('\n2. Specify custom date range:');
  console.log(
    '   node commit-history.js --start=2024-01-01 --end=2024-03-20 --execute',
  );
}
