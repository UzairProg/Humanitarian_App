import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { Business, VerificationStatus } from '@al-husseiniya/types';
import { Store, CheckCircle2, Clock, MapPin, Mail } from 'lucide-react';

export const BusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await ApiClient.request<Business[]>('/businesses');
      if (res.success && res.data) {
        setBusinesses(res.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Community Businesses & Partners</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Local halal merchants, wholesale grocers, and ethical businesses supporting community services.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading business registry...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {businesses.map((biz) => {
            const isVerified = biz.verificationStatus === VerificationStatus.APPROVED;
            return (
              <div key={biz.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-neutral">{biz.category}</span>
                  {isVerified ? (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={12} />
                      <span>Verified Merchant</span>
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.35rem' }}>
                    {biz.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                    {biz.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="#64748b" />
                    <span>{biz.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} color="#64748b" />
                    <span>{biz.contactEmail}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
