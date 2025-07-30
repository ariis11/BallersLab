const prisma = require('../config/database');

/**
 * Generates a random tournament code
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} - Random code in uppercase
 */
function generateRandomCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Generates a unique tournament code that doesn't exist in the database
 * @param {number} length - Length of the code (default: 6)
 * @param {number} maxAttempts - Maximum attempts to generate unique code (default: 10)
 * @returns {Promise<string>} - Unique tournament code
 */
async function generateUniqueTournamentCode(length = 6, maxAttempts = 10) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const code = generateRandomCode(length);
    
    // Check if code already exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { code }
    });
    
    if (!existingTournament) {
      return code;
    }
    
    console.log(`Tournament code ${code} already exists, trying again... (attempt ${attempt}/${maxAttempts})`);
  }
  
  // If we've exhausted all attempts, try with a longer code
  if (maxAttempts === 10) {
    console.log('Exhausted attempts with 6-character code, trying with 7 characters...');
    return generateUniqueTournamentCode(length + 1, 5);
  }
  
  throw new Error('Failed to generate unique tournament code after maximum attempts');
}

module.exports = {
  generateRandomCode,
  generateUniqueTournamentCode
}; 