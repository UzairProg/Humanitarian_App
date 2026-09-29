import React, { useState, useEffect } from 'react';
import ApiClient from '../services/api';
import { FoodProgram } from '@al-husseiniya/types';
import { Utensils, Calendar, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export const FoodProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<FoodProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadPrograms = async () => {
    setLoading(true);
    const res = await ApiClient.request<FoodProgram[]>('/food-programs');
    if (res.success && res.data) {
      setPrograms(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleReserve = async (programId: string) => {
    setSuccessMsg('');
    setErrorMsg('');

    const res = await ApiClient.request(`/food-programs/${programId}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ count: 1 }),
    });

    if (res.success) {
      setSuccessMsg('Meal kit successfully reserved! Please show your confirmation upon pickup.');
      loadPrograms();
    } else {
      setErrorMsg(res.error?.message || 'Failed to complete reservation');
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Community Food Programs</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Year-round nutritious meal distribution organized by community Hussainiyas and relief partners.
        </p>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#10b981', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading scheduled programs...</p>
        </div>
      ) : programs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No food programs currently scheduled.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {programs.map((p) => {
            const isFull = p.remainingCapacity <= 0;
            return (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="badge badge-success">{p.status}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isFull ? '#ef4444' : '#1b6b63' }}>
                    {p.remainingCapacity} / {p.capacity} Available
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0b1b2b', marginBottom: '0.35rem' }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                    {p.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} color="#1b6b63" />
                    <span>Date: {p.programDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={15} color="#1b6b63" />
                    <span>Time: {p.startTime} – {p.endTime}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="#1b6b63" />
                    <span>{p.location}</span>
                  </div>
                </div>

                {p.instructions && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                    Note: {p.instructions}
                  </p>
                )}

                <button
                  onClick={() => handleReserve(p.id)}
                  disabled={isFull}
                  className={`btn ${isFull ? 'btn-secondary' : 'btn-teal'}`}
                  style={{ marginTop: 'auto', width: '100%' }}
                >
                  <Utensils size={16} />
                  <span>{isFull ? 'Program Full' : 'Reserve 1 Meal Kit'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
