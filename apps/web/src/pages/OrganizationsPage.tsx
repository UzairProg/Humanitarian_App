import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { Organization, VerificationStatus, PermissionKey, FoodProgram, Event } from '@al-husseiniya/types';
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Utensils,
  Calendar,
  ExternalLink,
  HeartHandshake,
  Activity,
  X,
} from 'lucide-react';

interface OrgDetailModalData {
  organization: Organization & {
    activeFoodPrograms?: FoodProgram[];
    upcomingEvents?: Event[];
  };
  impact?: {
    mealsDistributed: number;
    requestsFulfilled: number;
    activeProgramsCount: number;
    eventsCount: number;
  };
}

export const OrganizationsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<OrgDetailModalData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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
      if (selectedOrg && selectedOrg.organization.id === orgId) {
        setSelectedOrg({
          ...selectedOrg,
          organization: {
            ...selectedOrg.organization,
            verificationStatus: VerificationStatus.APPROVED,
          },
        });
      }
    }
  };

  const handleViewDetails = async (org: Organization) => {
    setLoadingDetail(true);
    try {
      const [detailRes, impactRes] = await Promise.all([
        ApiClient.request<any>(`/organizations/${org.id}`),
        ApiClient.request<any>(`/impact/organization/${org.id}`),
      ]);

      setSelectedOrg({
        organization: detailRes.success && detailRes.data ? detailRes.data : org,
        impact: impactRes.success && impactRes.data ? impactRes.data : undefined,
      });
    } catch {
      setSelectedOrg({ organization: org });
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Hussainiyas & Community Organizations</h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Registered charitable foundations, community centers, and Hussainiyas serving families year-round.
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

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button
                    onClick={() => handleViewDetails(org)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.8125rem' }}
                  >
                    <Activity size={14} />
                    <span>View Profile & Programs</span>
                  </button>

                  {canVerify && !isVerified && (
                    <button
                      onClick={() => handleVerify(org.id)}
                      className="btn btn-teal"
                      style={{ fontSize: '0.8125rem' }}
                      title="Approve verification"
                    >
                      <ShieldCheck size={16} />
                      <span>Verify</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Organization Details & Programs Modal */}
      {selectedOrg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(11, 27, 43, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0b1b2b', margin: 0 }}>
                    {selectedOrg.organization.name}
                  </h3>
                  {selectedOrg.organization.verificationStatus === VerificationStatus.APPROVED ? (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckCircle2 size={12} />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="badge badge-warning">Pending Review</span>
                  )}
                </div>
                <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>
                  {selectedOrg.organization.location} • {selectedOrg.organization.contactEmail}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrg(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              {selectedOrg.organization.description}
            </p>

            {/* Impact Metrics Aggregated for this Organization */}
            {selectedOrg.impact && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '0.75rem',
                  textAlign: 'center',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Meals Distributed</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1b6b63', margin: 0 }}>
                    {selectedOrg.impact.mealsDistributed.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Requests Fulfilled</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
                    {selectedOrg.impact.requestsFulfilled.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Active Programs</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1d3557', margin: 0 }}>
                    {selectedOrg.impact.activeProgramsCount}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Upcoming Events</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#c29b38', margin: 0 }}>
                    {selectedOrg.impact.eventsCount}
                  </p>
                </div>
              </div>
            )}

            {/* Active Food Programs Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Utensils size={16} color="#1b6b63" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0b1b2b', margin: 0 }}>
                  Active Food Programs
                </h4>
              </div>

              {(!selectedOrg.organization.activeFoodPrograms || selectedOrg.organization.activeFoodPrograms.length === 0) ? (
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No active food distribution programs currently registered for this organization.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedOrg.organization.activeFoodPrograms.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#065f46', margin: 0 }}>
                          {p.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#047857', margin: 0 }}>
                          {p.programDate} • {p.startTime} - {p.endTime} • {p.location}
                        </p>
                      </div>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        {p.remainingCapacity} available
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scheduled Events Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Calendar size={16} color="#1d3557" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0b1b2b', margin: 0 }}>
                  Upcoming Events & Orientations
                </h4>
              </div>

              {(!selectedOrg.organization.upcomingEvents || selectedOrg.organization.upcomingEvents.length === 0) ? (
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No upcoming community gatherings currently listed.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedOrg.organization.upcomingEvents.map((evt) => (
                    <div
                      key={evt.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#f0f4f8',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1d3557', margin: 0 }}>
                          {evt.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>
                          {new Date(evt.startAt).toLocaleString()} • {evt.location}
                        </p>
                      </div>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        {evt.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              {canVerify && selectedOrg.organization.verificationStatus !== VerificationStatus.APPROVED && (
                <button
                  onClick={() => handleVerify(selectedOrg.organization.id)}
                  className="btn btn-teal"
                >
                  <ShieldCheck size={16} />
                  <span>Approve Organization</span>
                </button>
              )}
              <button onClick={() => setSelectedOrg(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
