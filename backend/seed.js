const mongoose = require('mongoose');
const Quote = require('./models/Quote');
const Activity = require('./models/Activity'); 
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

const seedActivities = [
  // Kategori: Konsumsi
  {
    name: 'Bawa tumbler minum',
    points: 10, category: 'Konsumsi',
    impact_co2_kg: 0.08, impact_water_liter: 2, impact_plastic_gram: 20,
    description: 'Jutaan botol plastik sekali pakai berakhir di lautan setiap tahun, membahayakan kehidupan laut. Menggunakan tumbler mengurangi limbah ini secara drastis.',
    howTo: 'Jadikan kebiasaan untuk selalu membawa tumbler di tas Anda. Isi ulang di rumah sebelum pergi atau di dispenser air yang tersedia di kantor atau kafe.'
  },
  {
    name: 'Gunakan produk daur ulang',
    points: 10, category: 'Konsumsi',
    impact_co2_kg: 0.2, impact_water_liter: 20, impact_plastic_gram: 0,
    description: 'Membeli produk dari bahan daur ulang (seperti kertas atau kemasan) membantu mengurangi permintaan bahan baku baru dan menghemat energi yang dibutuhkan untuk produksi.',
    howTo: 'Saat berbelanja, cari label "dibuat dari bahan daur ulang" pada produk seperti tisu, kertas, atau bahkan beberapa jenis pakaian dan tas.'
  },
  {
    name: 'Belanja tanpa tas plastik',
    points: 15, category: 'Konsumsi',
    impact_co2_kg: 0.05, impact_water_liter: 0, impact_plastic_gram: 50,
    description: 'Tas plastik (kresek) adalah salah satu polutan paling umum. Mereka membutuhkan ratusan tahun untuk terurai dan sering disalahartikan sebagai makanan oleh hewan.',
    howTo: 'Simpan beberapa tas belanja lipat di mobil, motor, atau tas ransel Anda. Ingatkan kasir bahwa Anda tidak memerlukan tas plastik sebelum mereka memberikannya.'
  },
  {
    name: 'Makan sayuran (Vegetarian)',
    points: 20, category: 'Konsumsi',
    impact_co2_kg: 1.5, impact_water_liter: 50, impact_plastic_gram: 0,
    description: 'Industri peternakan adalah salah satu penyumbang emisi gas rumah kaca terbesar. Mengurangi konsumsi daging, bahkan sehari saja, dapat menghemat banyak air dan mengurangi jejak karbon Anda.',
    howTo: 'Cobalah "Meatless Monday" atau ganti satu porsi daging Anda dengan sumber protein nabati seperti tahu, tempe, atau kacang-kacangan.'
  },
  {
    name: 'Kurangi sisa makanan',
    points: 20, category: 'Konsumsi',
    impact_co2_kg: 0.5, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Sisa makanan yang membusuk di TPA (Tempat Pembuangan Akhir) menghasilkan gas metana, gas rumah kaca yang puluhan kali lebih kuat dari CO2.',
    howTo: 'Rencanakan belanja mingguan Anda, ambil porsi makan secukupnya, dan simpan sisa makanan dengan benar di lemari es untuk dimakan nanti.'
  },

  // Kategori: Rumah
  {
    name: 'Matikan lampu saat tidak digunakan',
    points: 5, category: 'Rumah',
    impact_co2_kg: 0.01, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Menghemat listrik berarti mengurangi jumlah bahan bakar fosil yang dibakar oleh pembangkit listrik. Ini adalah salah satu cara termudah untuk mengurangi emisi CO2.',
    howTo: 'Jadikan kebiasaan untuk selalu mematikan lampu, AC, dan TV saat Anda meninggalkan ruangan, bahkan jika hanya untuk beberapa menit.'
  },
  {
    name: 'Cabut charger tidak terpakai',
    points: 5, category: 'Rumah',
    impact_co2_kg: 0.005, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Peralatan elektronik yang masih tercolok (bahkan saat tidak mengisi daya) tetap menggunakan sedikit listrik. Ini disebut "vampire power" atau "phantom load".',
    howTo: 'Cabut charger laptop, ponsel, dan peralatan lain dari stopkontak setelah selesai digunakan atau gunakan stopkontak dengan saklar on/off.'
  },
  {
    name: 'Kurangi penggunaan AC',
    points: 15, category: 'Rumah',
    impact_co2_kg: 0.7, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Pendingin ruangan (AC) adalah salah satu konsumen energi terbesar di rumah. Menguranginya 1-2 jam sehari dapat menghemat energi secara signifikan.',
    howTo: 'Atur suhu AC di 24-25°C. Gunakan kipas angin untuk membantu sirkulasi udara, atau buka jendela di pagi/sore hari saat udara lebih sejuk.'
  },
  {
    name: 'Kompos sampah organik',
    points: 25, category: 'Rumah',
    impact_co2_kg: 1.2, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Mengompos mengembalikan nutrisi sisa sayuran dan buah ke tanah, mengurangi kebutuhan pupuk kimia, dan mencegah sampah organik menghasilkan gas metana di TPA.',
    howTo: 'Mulai dengan komposter sederhana di halaman atau balkon Anda. Masukkan sisa sayuran, buah, dan daun kering. Hindari daging, susu, dan minyak.'
  },
  {
    name: 'Hemat penggunaan air mandi',
    points: 10, category: 'Rumah',
    impact_co2_kg: 0.1, impact_water_liter: 20, impact_plastic_gram: 0,
    description: 'Air bersih adalah sumber daya yang terbatas. Menghemat air tidak hanya menjaga ketersediaan air, tetapi juga menghemat energi yang digunakan untuk memompa dan memanaskannya.',
    howTo: 'Cobalah untuk mandi 5 menit lebih cepat dari biasanya. Matikan keran saat menggunakan sabun atau sampo.'
  },

  // Kategori: Transportasi
  {
    name: 'Gunakan transportasi umum',
    points: 20, category: 'Transportasi',
    impact_co2_kg: 1.0, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Satu bus penuh dapat menggantikan puluhan mobil di jalan, mengurangi emisi gas buang dan kemacetan secara signifikan per orang.',
    howTo: 'Jika memungkinkan, ganti satu perjalanan mobil pribadi Anda minggu ini dengan bus, KRL, atau MRT.'
  },
  {
    name: 'Berjalan kaki (min. 1 km)',
    points: 15, category: 'Transportasi',
    impact_co2_kg: 0.2, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Berjalan kaki adalah transportasi tanpa emisi. Ini tidak hanya baik untuk lingkungan, tetapi juga sangat baik untuk kesehatan fisik dan mental Anda.',
    howTo: 'Untuk jarak dekat (seperti ke warung atau minimarket), pilih berjalan kaki daripada menggunakan motor atau mobil.'
  },
  {
    name: 'Bersepeda ke tujuan',
    points: 20, category: 'Transportasi',
    impact_co2_kg: 0.3, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Bersepeda adalah cara yang efisien dan nol emisi untuk perjalanan jarak menengah. Ini mengurangi polusi udara di perkotaan dan menjaga kebugaran Anda.',
    howTo: 'Gunakan sepeda untuk ke kantor, sekolah, atau sekadar berkeliling lingkungan. Selalu utamakan keselamatan dengan helm dan lampu.'
  },

  // Kategori: Lainnya
  {
    name: 'Tanam pohon',
    points: 30, category: 'Lainnya',
    impact_co2_kg: 0, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Pohon adalah penyerap karbon alami terbaik di planet ini. Mereka menyerap CO2, menghasilkan oksigen, dan menyediakan habitat bagi satwa liar.',
    howTo: 'Tanam pohon di halaman rumah Anda, atau ikuti acara penanaman pohon lokal. Bahkan merawat tanaman di pot balkon pun membantu.'
  },
  {
    name: 'Kurangi sampah plastik (umum)',
    points: 15, category: 'Lainnya',
    impact_co2_kg: 0.02, impact_water_liter: 0, impact_plastic_gram: 10,
    description: 'Plastik ada di mana-mana. Mengurangi penggunaannya secara sadar, seperti menolak sedotan atau alat makan sekali pakai, sangat berdampak jika dilakukan kolektif.',
    howTo: 'Saat memesan minuman, katakan "Tidak pakai sedotan, ya". Bawa set alat makan Anda sendiri jika Anda berencana untuk makan di luar.'
  },
  {
    name: 'Edukasi teman tentang lingkungan',
    points: 10, category: 'Lainnya',
    impact_co2_kg: 0, impact_water_liter: 0, impact_plastic_gram: 0,
    description: 'Menyebarkan kesadaran adalah pengganda dampak. Satu orang yang Anda inspirasi mungkin akan menginspirasi orang lain, menciptakan efek berantai yang positif.',
    howTo: 'Bagikan salah satu fakta yang Anda pelajari dari aplikasi ini kepada teman atau keluarga, atau ajak mereka untuk bergabung dengan EcoHabit!'
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