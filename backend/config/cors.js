const allowedOrigin = process.env.NODE_ENV === 'production' 
  ? process.env.FRONTEND_URL 
  : process.env.FRONTEND_URL_DEV;

const corsOptions = {
  origin: allowedOrigin,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Izinkan cookies dan header otentikasi
  optionsSuccessStatus: 204 // Untuk legacy browser
};

module.exports = corsOptions;