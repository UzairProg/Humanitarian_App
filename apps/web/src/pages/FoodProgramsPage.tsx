import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ApiClient from '../services/api';
import { FoodProgram, RoleType, Organization } from '@al-husseiniya/types';
import {
  Utensils,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Building2,
  Info,
} from 'lucide-react';

export const FoodProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<FoodProgram[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Create Program Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormError, setCreateFormError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orgId, setOrgId] = useState('');
  const [programDate, setProgramDate] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [mealType, setMealType] = useState('HOT_MEAL');
  const [instructions, setInstructions] = useState('');

  const isStaffOrAdmin =
    user?.roles?.some((r) =>
      [
        RoleType.SUPER_ADMIN,
        RoleType.COMMUNITY_ADMIN,
        RoleType.ORGANIZATION_ADMIN,
        RoleType.ORGANIZATION_STAFF,
      ].includes(r as RoleType)
    ) ||
    user?.role === RoleType.ORGANIZATION_ADMIN ||
    user?.role === RoleType.ORGANIZATION_STAFF ||
    user?.role === RoleType.SUPER_ADMIN;

  const loadData = async () => {
    setLoading(true);
    const [progRes, orgRes] = await Promise.all([
      ApiClient.request<FoodProgram[]>('/food-programs'),
      ApiClient.request<Organization[]>('/organizations'),
    ]);

    if (progRes.success && progRes.data) {
      setPrograms(progRes.data);
    }
    if (orgRes.success && orgRes.data) {
      setOrganizations(orgRes.data);
      if (orgRes.data.length > 0 && !orgId) {
        setOrgId(orgRes.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReserve = async (programId: string) => {
    setSuccessMsg('');
    setErrorMsg('');

    const res = await ApiClient.request(`/food-programs/${programId}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ count: 1 }),
    });

    if (res.success) {
      setSuccessMsg('Meal kit successfully reserved! Please show your confirmation code upon pickup.');
      loadData();
    } else {
      setErrorMsg(res.error?.message || 'Failed to complete reservation');
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateFormError('');

    const res = await ApiClient.request('/food-programs', {
      method: 'POST',
      body: JSON.stringify({
        organizationId: orgId,
        title,
        description,
        programDate,
        startTime,
        endTime,
        location,
        capacity: Number(capacity),
        mealType,
        instructions,
      }),
    });

    if (res.success) {
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setInstructions('');
      loadData();
    } else {
      setCreateFormError(res.error?.message || 'Failed to create food program');
    }
  };

  const filteredPrograms = programs.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (
      searchQuery &&
      !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Editorial Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0b1f2a 0%, #123744 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 4px 15px rgba(11, 31, 42, 0.1)',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <span style={{ color: '#deb95f', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            NUTRITION & NOURISHMENT
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.4rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0.35rem 0 0.5rem' }}>
            Food should never be out of reach.
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
            Fresh, hot meals prepared daily by verified community kitchens, religious centers, and generous volunteers.
            Served openly to anyone in need with total dignity and warmth.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
            <Plus size={16} />
            <span>Schedule Meal Distribution</span>
          </button>
        )}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 250px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search kitchens by name or neighborhood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', color: '#475569' }}>Availability:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open (Meals Available)</option>
            <option value="LIMITED">Limited Spots</option>
            <option value="FULL">Fully Reserved</option>
            <option value="CLOSED">Completed</option>
          </select>
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b' }}>
          Showing {filteredPrograms.length} of {programs.length} programs
        </span>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading scheduled community meals...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No community meals match your search criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredPrograms.map((p) => {
            const isFull = p.remainingCapacity <= 0;
            const percentRemaining = Math.round((p.remainingCapacity / p.capacity) * 100);

            return (
              <div
                key={p.id}
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
                    <span className={`badge ${isFull ? 'badge-error' : p.remainingCapacity < 20 ? 'badge-warning' : 'badge-success'}`}>
                      {isFull ? 'FULLY RESERVED' : p.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isFull ? '#ef4444' : '#087f78' }}>
                      {p.remainingCapacity} / {p.capacity} Available
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0b1f2a', marginBottom: '0.35rem' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      {p.description}
                    </p>
                  </div>

                  {/* Serving Information */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      fontSize: '0.8125rem',
                      color: '#475569',
                      backgroundColor: '#f8fafc',
                      padding: '0.75rem',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} color="#087f78" />
                      <span>Date: {p.programDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={14} color="#087f78" />
                      <span>Serving: {p.startTime} – {p.endTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} color="#087f78" />
                      <span>{p.location}</span>
                    </div>
                  </div>

                  {p.instructions && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                      <strong>Pickup Instructions:</strong> {p.instructions}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => handleReserve(p.id)}
                    disabled={isFull}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      opacity: isFull ? 0.6 : 1,
                      cursor: isFull ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isFull ? 'Distribution Full' : 'Reserve Meal Kit'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Program Modal */}
      {showCreateModal && (
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
          <div className="card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0b1b2b', marginBottom: '0.5rem' }}>
              Schedule Community Food Distribution
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Register an upcoming fresh meal service hosted by your verified organization.
            </p>

            {createFormError && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {createFormError}
              </div>
            )}

            <form onSubmit={handleCreateProgram} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Host Organization *
                </label>
                <select
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily Community Iftar & Dinner Distribution"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Distribution Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={programDate}
                    onChange={(e) => setProgramDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Location / Distribution Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Al-Husseiniya Courtyard, Najaf"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    Meal Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding menu, allergens, and dietary accommodations..."
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Pickup Instructions
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Enter through Gate B, bring confirmation SMS"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Meal Distribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
