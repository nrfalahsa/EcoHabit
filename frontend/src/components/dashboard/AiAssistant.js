import React, { useState } from 'react';
import { authFetch } from '../../services/api';

function formatAIResponse(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)$/gm, '<li>$1</li>');
  if (html.includes('<li>')) {
    html = '<ul>' + html.replace(/<\/li>\s*<li>/g, '</li><li>') + '</ul>';
  }
  return html;
}

function AiAssistant({ completedToday = [] }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question) return;
    setIsLoading(true);
    setResponse('Asisten Eco sedang berpikir...');
    try {
      const data = await authFetch('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question })
      });
      setResponse(formatAIResponse(data.answer));
      setQuestion('');
    } catch (err) {
      setResponse(`Maaf, terjadi kesalahan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggest = async () => {
    setIsLoading(true);
    setResponse('Mencari saran aktivitas...');
    try {
      const data = await authFetch('/ai/suggest', {
        method: 'POST',
        body: JSON.stringify({ completedActivities: completedToday })
      });
      setResponse(formatAIResponse(data.suggestion));
    } catch (err) {
      setResponse(`Maaf, terjadi kesalahan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Asisten Eco</h2>
      <div className="ai-assistant">
        <div className="form-group">
          <textarea 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="form-input" 
            rows="3" 
            placeholder="Tanya apa saja tentang lingkungan..."
          />
        </div>
        <div className="ai-buttons">
          <button onClick={handleAsk} disabled={isLoading} className="btn btn-sm">Tanya AI</button>
          <button onClick={handleSuggest} disabled={isLoading} className="btn btn-secondary btn-sm">Beri Saran</button>
        </div>
        <div 
          className="ai-response"
          dangerouslySetInnerHTML={{ __html: response || '...' }}
        />
      </div>
    </div>
  );
}

export default AiAssistant;