// Daftar semua lencana yang tersedia
const badgeDefinitions = {
  // Lencana Poin
  POIN_1: { name: 'Poin Pertama', description: 'Mendapatkan poin pertama Anda!' },
  POIN_100: { name: 'Kolektor Poin', description: 'Mencapai total 100 poin.' },
  POIN_500: { name: 'Master Poin', description: 'Mencapai total 500 poin.' },

  // Lencana Level
  LEVEL_EXPLORER: { name: 'Eco Explorer', description: 'Mencapai level Eco Explorer.' },
  LEVEL_HERO: { name: 'Planet Hero', description: 'Mencapai level Planet Hero.' },

  // Lencana Dampak
  AIR_50L: { name: 'Penghemat Air', description: 'Menghemat total 50 Liter air.' },
  AIR_200L: { name: 'Pahlawan Air', description: 'Menghemat total 200 Liter air.' },
  CO2_10KG: { name: 'Penyerap Karbon', description: 'Mencegah total 10 kg CO2.' },
  CO2_50KG: { name: 'Pejuang Iklim', description: 'Mencegah total 50 kg CO2.' },
  PLASTIK_100G: { name: 'Anti-Plastik', description: 'Mengurangi 100 gram sampah plastik.' },
  PLASTIK_500G: { name: 'Bebas Plastik', description: 'Mengurangi 500 gram sampah plastik.' },
};

/**
 * Memeriksa dan memberikan lencana baru kepada pengguna.
 * @param {object} user - Objek User dari Mongoose
 * @returns {Array<object>} - Array berisi lencana baru yang didapat
 */
function checkAndAwardBadges(user) {
  const newBadges = [];

  const addBadge = (badgeId) => {
    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      newBadges.push(badgeDefinitions[badgeId]);
    }
  };

  // --- Cek Lencana Poin ---
  if (user.totalPoints > 0) addBadge('POIN_1');
  if (user.totalPoints >= 100) addBadge('POIN_100');
  if (user.totalPoints >= 500) addBadge('POIN_500');

  // --- Cek Lencana Level ---
  if (user.level === 'Eco Explorer') addBadge('LEVEL_EXPLORER');
  if (user.level === 'Planet Hero') addBadge('LEVEL_HERO');

  // --- Cek Lencana Dampak ---
  if (user.totalWater >= 50) addBadge('AIR_50L');
  if (user.totalWater >= 200) addBadge('AIR_200L');
  if (user.totalCo2 >= 10) addBadge('CO2_10KG');
  if (user.totalCo2 >= 50) addBadge('CO2_50KG');
  if (user.totalPlastic >= 100) addBadge('PLASTIK_100G');
  if (user.totalPlastic >= 500) addBadge('PLASTIK_500G');

  return newBadges;
}

module.exports = { checkAndAwardBadges, badgeDefinitions };