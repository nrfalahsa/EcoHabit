const mongoose = require('mongoose');
const Quote = require('./models/Quote');
const Activity = require('./models/Activity'); // <-- 1. IMPORT
require('dotenv').config();

const seedQuotes = [
  {
    text: "Bumi tidak warisan dari nenek moyang kita, tapi pinjaman untuk anak cucu kita.",
    author: "Peribahasa Indian"
  },
  {
    text: "Yang terbaik dari alam adalah ketika kita menjaganya.",
    author: "Anonymous"
  },
  {
    text: "Tidak ada planet B. Jadilah bagian dari solusi, bukan polusi.",
    author: "Anonymous"
  },
  {
    text: "Lingkungan yang sehat dimulai dengan kebiasaan yang sehat.",
    author: "EcoHabit"
  },
  {
    text: "Kecil-kecil jadi bukit, sedikit-sedikit jadi laut.",
    author: "Peribahasa Indonesia"
  },
  {
    text: "Jadilah perubahan yang ingin kamu lihat di dunia.",
    author: "Mahatma Gandhi"
  },
  {
    text: "Masa depan yang hijau dimulai dengan tindakan hijau hari ini.",
    author: "EcoHabit"
  }
];

// 2. BUAT ARRAY AKTIVITAS (berdasarkan Langkah 1)
const seedActivities = [
  // Kategori: Konsumsi
  { name: 'Bawa tumbler minum', points: 10, category: 'Konsumsi', impact_co2_kg: 0.08, impact_water_liter: 2, impact_plastic_gram: 20 },
  { name: 'Gunakan produk daur ulang', points: 10, category: 'Konsumsi', impact_co2_kg: 0.2, impact_water_liter: 20, impact_plastic_gram: 0 },
  { name: 'Belanja tanpa tas plastik', points: 15, category: 'Konsumsi', impact_co2_kg: 0.05, impact_water_liter: 0, impact_plastic_gram: 50 },
  { name: 'Makan sayuran (Vegetarian)', points: 20, category: 'Konsumsi', impact_co2_kg: 1.5, impact_water_liter: 50, impact_plastic_gram: 0 },
  { name: 'Kurangi sisa makanan', points: 20, category: 'Konsumsi', impact_co2_kg: 0.5, impact_water_liter: 0, impact_plastic_gram: 0 },

  // Kategori: Rumah
  { name: 'Matikan lampu saat tidak digunakan', points: 5, category: 'Rumah', impact_co2_kg: 0.01, impact_water_liter: 0, impact_plastic_gram: 0 },
  { name: 'Cabut charger tidak terpakai', points: 5, category: 'Rumah', impact_co2_kg: 0.005, impact_water_liter: 0, impact_plastic_gram: 0 },
  { name: 'Kurangi penggunaan AC', points: 15, category: 'Rumah', impact_co2_kg: 0.7, impact_water_liter: 0, impact_plastic_gram: 0 },
  { name: 'Kompos sampah organik', points: 25, category: 'Rumah', impact_co2_kg: 1.2, impact_water_liter: 0, impact_plastic_gram: 0 },
  { name: 'Hemat penggunaan air mandi', points: 10, category: 'Rumah', impact_co2_kg: 0.1, impact_water_liter: 20, impact_plastic_gram: 0 },

  // Kategori: Transportasi
  { name: 'Gunakan transportasi umum', points: 20, category: 'Transportasi', impact_co2_kg: 1.0, impact_water_liter: 0, impact_plastic_gram: 0 },
  { name: 'Berjalan kaki (min. 1 km)', points: 15, category: 'Transportasi', impact_co2_kg: 0.2, impact_water_liter: 0, impact_plastic_gram: 0 },
  { name: 'Bersepeda ke tujuan', points: 20, category: 'Transportasi', impact_co2_kg: 0.3, impact_water_liter: 0, impact_plastic_gram: 0 },
  
  // Kategori: Lainnya
  { name: 'Tanam pohon', points: 30, category: 'Lainnya', impact_co2_kg: 0, impact_water_liter: 0, impact_plastic_gram: 0 },
  { name: 'Kurangi sampah plastik (umum)', points: 15, category: 'Lainnya', impact_co2_kg: 0.02, impact_water_liter: 0, impact_plastic_gram: 10 },
  { name: 'Edukasi teman tentang lingkungan', points: 10, category: 'Lainnya', impact_co2_kg: 0, impact_water_liter: 0, impact_plastic_gram: 0 }
];


async function seedDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecohabit';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Terhubung ke MongoDB untuk seeding...');
    
    // Hapus quotes lama
    await Quote.deleteMany({});
    console.log('🗑️ Quotes lama dihapus');
    // Tambah quotes baru
    await Quote.insertMany(seedQuotes);
    console.log('✅ Quotes berhasil di-seed');

    // 3. TAMBAHKAN SEEDING AKTIVITAS
    await Activity.deleteMany({});
    console.log('🗑️ Aktivitas lama dihapus');
    await Activity.insertMany(seedActivities);
    console.log('✅ Aktivitas berhasil di-seed');
    
    await mongoose.disconnect();
    console.log('✅ Seeding selesai, koneksi ditutup');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();