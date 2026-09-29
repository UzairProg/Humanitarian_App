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
      ].includes(r),
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
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0b1b2b' }}>Community Food Programs</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Year-round nutritious meal distribution organized by community Hussainiyas and relief partners.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-teal">
            <Plus size={16} />
            <span>Schedule Program</span>
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
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 250px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search programs by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.8125rem', color: '#475569' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="LIMITED">LIMITED</option>
            <option value="FULL">FULL</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#64748b' }}>
          Showing {filteredPrograms.length} of {programs.length}
        </span>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>Loading scheduled programs...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#64748b' }}>No food programs match the selected criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredPrograms.map((p) => {
            const isFull = p.remainingCapacity <= 0;
            const statusClass = isFull
              ? 'badge-error'
              : p.remainingCapacity < 20
              ? 'badge-warning'
              : 'badge-success';

            return (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className={`badge ${statusClass}`}>{p.status}</span>
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

      {/* Schedule Food Program Modal */}
      {showCreateModal && (
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
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Schedule Community Food Program
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Organize meals, hot soup kitchens, or dry rations distribution for the local community.
            </p>

            {createFormError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                {createFormError}
              </div>
            )}

            <form onSubmit={handleCreateProgram} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Host Organization</label>
                <select
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Program Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Friday Community Lunch Drive"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding the food offerings and packaging..."
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Date</label>
                  <input
                    type="date"
                    value={programDate}
                    onChange={(e) => setProgramDate(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Location / Pickup Point</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Al-Kawthar Hall Main Gate"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Meal Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.35rem' }}>Instructions for Beneficiaries</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please bring clean reusable bags"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal">
                  Publish Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
