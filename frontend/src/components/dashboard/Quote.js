import React, { useState, useEffect } from 'react';
import { authFetch } from '../../services/api';

function RandomQuote() {
  const [quote, setQuote] = useState({ 
    text: "Memuat...", 
    author: "EcoHabit" 
  });

  useEffect(() => {
    authFetch('/quotes/random', {
      method: 'GET'
    })
    .then(data => {

    const cleanedText = data.text.replace(/\s+/g, ' ').trim();

    setQuote({ 
      text: cleanedText, 
      author: data.author 
    });
  })
    .catch(err => {
      console.warn('Gagal memuat quote:', err.message);
      setQuote({
        text: "Setiap tindakan kecil untuk lingkungan membawa perubahan besar untuk masa depan.",
        author: "EcoHabit"
      });
    });
  }, []);

  return (
    <div className="card">
      <h2 className="card-title">Quote Harian</h2>
      <div className="quote-section">
        <div className="quote-text">{quote.text}</div>
        <div className="quote-author">- {quote.author}</div>
      </div>
    </div>
  );
}

export default RandomQuote;