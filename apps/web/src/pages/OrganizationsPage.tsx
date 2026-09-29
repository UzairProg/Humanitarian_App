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
  Plus,
  Search,
  Filter,
  X,
  Users,
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
  const { hasPermission, isAuthenticated } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<OrgDetailModalData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);

  // Register Organization modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [newOrg, setNewOrg] = useState({
    name: '',
    description: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
  });

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegisterError('');

    const slug = newOrg.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const res = await ApiClient.request<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify({
        ...newOrg,
        slug: slug || `org-${Date.now()}`,
      }),
    });

    setRegistering(false);
    if (res.success) {
      setShowRegisterModal(false);
      setNewOrg({
        name: '',
        description: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
      });
      loadOrgs();
    } else {
      setRegisterError(res.error?.message || 'Failed to register organization');
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    if (filterVerifiedOnly && org.verificationStatus !== VerificationStatus.APPROVED) {
      return false;
    }
    if (
      searchQuery &&
      !org.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !org.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !org.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0b1b2b', letterSpacing: '-0.02em', margin: 0 }}>
            Organizations Serving the Community
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Verified Hussainiyas, relief funds, and civil society partners mobilizing humanitarian aid.
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem' }}
          >
            <Plus size={16} />
            <span>Register Organization</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search organizations by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterVerifiedOnly}
            onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
            style={{ width: '16px', height: '16px' }}
          />
          <span>Show Verified Partners Only</span>
        </label>

        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b' }}>
          Showing {filteredOrgs.length} of {organizations.length} organizations
        </span>
      </div>

      {/* Organizations Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading community organizations...</p>
        </div>
      ) : filteredOrgs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No organizations found matching your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredOrgs.map((org) => {
            const isVerified = org.verificationStatus === VerificationStatus.APPROVED;

            return (
              <div
                key={org.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#0b1f2a',
                          color: '#deb95f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                        }}
                      >
                        {org.name ? org.name[0] : 'O'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0b1b2b', margin: 0 }}>
                          {org.name}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                          <MapPin size={12} color="#087f78" /> {org.location}
                        </div>
                      </div>
                    </div>

                    {isVerified ? (
                      <span className="verified-pill" title="Verified by Al-Husseiniya administrative team">
                        <ShieldCheck size={13} /> Verified
                      </span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {org.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: '#64748b' }}>
                    {org.contactEmail && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Mail size={12} /> {org.contactEmail}
                      </div>
                    )}
                    {org.contactPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={12} /> {org.contactPhone}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => handleViewDetails(org)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.4rem 0.85rem' }}
                  >
                    View Programs & Impact &rarr;
                  </button>

                  {canVerify && !isVerified && (
                    <button
                      onClick={() => handleVerify(org.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                    >
                      Verify Org
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Organization Detail & Impact Modal */}
      {selectedOrg && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '750px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  {selectedOrg.organization.verificationStatus === VerificationStatus.APPROVED ? (
                    <span className="verified-pill">
                      <ShieldCheck size={13} /> Verified Organization
                    </span>
                  ) : (
                    <span className="badge badge-warning">Unverified</span>
                  )}
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    <MapPin size={13} style={{ display: 'inline', marginRight: '0.2rem' }} />
                    {selectedOrg.organization.location}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1f2a', margin: 0 }}>
                  {selectedOrg.organization.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              {selectedOrg.organization.description}
            </p>

            {/* Impact Metric Storytelling */}
            {selectedOrg.impact && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0b1f2a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Community Outcomes & Verified Impact
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#087f78' }}>
                      {selectedOrg.impact.mealsDistributed.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Meals Distributed</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1' }}>
                      {selectedOrg.impact.requestsFulfilled.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Requests Supported</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#85530f' }}>
                      {selectedOrg.impact.activeProgramsCount}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Programs</div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Programs & Events */}
            {selectedOrg.organization.activeFoodPrograms && selectedOrg.organization.activeFoodPrograms.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.5rem' }}>
                  Active Food Programs ({selectedOrg.organization.activeFoodPrograms.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedOrg.organization.activeFoodPrograms.map((p) => (
                    <div key={p.id} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', borderRadius: '6px', fontSize: '0.8125rem', border: '1px solid #bbf7d0' }}>
                      <strong>{p.title}</strong> — {p.programDate} ({p.startTime} - {p.endTime})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button onClick={() => setSelectedOrg(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Organization Modal */}
      {showRegisterModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              Register Community Organization
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Register your Hussainiya, charitable fund, or community center on the Al-Husseiniya platform.
            </p>

            {registerError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Husseiniya Al-Kubra"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  City / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karbala, Iraq"
                  value={newOrg.location}
                  onChange={(e) => setNewOrg({ ...newOrg, location: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@hussainiya.org"
                    value={newOrg.contactEmail}
                    onChange={(e) => setNewOrg({ ...newOrg, contactEmail: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+964 770 000 0000"
                    value={newOrg.contactPhone}
                    onChange={(e) => setNewOrg({ ...newOrg, contactPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Mission & Scope of Service *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your regular food distributions, educational programs, and humanitarian reach..."
                  value={newOrg.description}
                  onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn btn-secondary"
                  disabled={registering}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={registering}>
                  {registering ? 'Registering...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
