const mongoose = require('mongoose');
const Quote = require('./models/Quote');
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
    
    // Tampilkan quotes yang sudah di-seed
    const quotes = await Quote.find();
    console.log(`📝 Total quotes: ${quotes.length}`);
    
    await mongoose.disconnect();
    console.log('✅ Seeding selesai, koneksi ditutup');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
