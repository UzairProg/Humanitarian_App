import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { Organization, VerificationStatus, PermissionKey } from '@al-husseiniya/types';
import { Building2, CheckCircle2, Clock, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';

export const OrganizationsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const canVerify = hasPermission(PermissionKey.ORGANIZATION_VERIFY);

  const loadOrgs = async () => {
    setLoading(true);
    const res = await ApiClient.request<Organization[]>('/organizations');
    if (res.success && res.data) {
      setOrganizations(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleVerify = async (orgId: string) => {
    const res = await ApiClient.request(`/organizations/${orgId}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        status: VerificationStatus.APPROVED,
        decision: 'Administrative verification complete',
        notes: 'Organization verified after operational credential review',
      }),
    });

    if (res.success) {
      loadOrgs();
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Hussainiyas & Community Organizations</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Registered charitable foundations, community centers and Hussainiyas serving families year-round.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading directory...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {organizations.map((org) => {
            const isVerified = org.verificationStatus === VerificationStatus.APPROVED;
            return (
              <div key={org.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#f0f4f8', color: '#1d3557' }}>
                      <Building2 size={20} />
                    </div>
                    <span className="badge badge-neutral">{org.status}</span>
                  </div>

                  {isVerified ? (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
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
                    {org.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                    {org.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="#64748b" />
                    <span>{org.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} color="#64748b" />
                    <span>{org.contactEmail}</span>
                  </div>
                  {org.contactPhone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={14} color="#64748b" />
                      <span>{org.contactPhone}</span>
                    </div>
                  )}
                </div>

                {canVerify && !isVerified && (
                  <button
                    onClick={() => handleVerify(org.id)}
                    className="btn btn-teal"
                    style={{ marginTop: 'auto', width: '100%', fontSize: '0.8125rem' }}
                  >
                    <ShieldCheck size={16} />
                    <span>Approve Verification</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
