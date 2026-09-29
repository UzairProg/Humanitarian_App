import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { KnowledgeContent } from '@al-husseiniya/types';
import { BookOpen, Info } from 'lucide-react';

export const KnowledgePage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await ApiClient.request<KnowledgeContent[]>('/knowledge?lang=en');
      if (res.success && res.data) {
        setArticles(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Knowledge & Cultural Content</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Educational articles, teachings, and ethical reflections inspired by the values of Karbala.
        </p>
      </div>

      {/* Religious Authority Distinction Notice */}
      <div
        style={{
          backgroundColor: '#fbf4e6',
          border: '1px solid #f5e4be',
          color: '#7e5b10',
          padding: '1rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Platform Architectural Notice:</strong> Al-Husseiniya provides technical, administrative, and
          operational publishing infrastructure. The platform does not independently issue religious rulings.
          Religious guidance remains the domain of certified specialists and scholarly authorities.
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading knowledge library...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No published articles available at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {articles.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span className="badge badge-neutral" style={{ alignSelf: 'flex-start' }}>
                {item.category}
              </span>

              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.35rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
                  {item.summary}
                </p>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                <span>Language: {item.language.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
