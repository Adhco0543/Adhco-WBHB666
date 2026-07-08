'use client';

import { useState, useEffect } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedDate: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'You',
      email: 'user@example.com',
      role: 'owner',
      joinedDate: '2024-01-01',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [isInviting, setIsInviting] = useState(false);

  async function handleInvite() {
    if (!inviteEmail) return;

    setIsInviting(true);
    try {
      // In a real app, this would call inviteTeamMember from supabase database
      const newMember: TeamMember = {
        id: `${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        joinedDate: new Date().toISOString(),
      };

      setMembers([...members, newMember]);
      setInviteEmail('');
    } finally {
      setIsInviting(false);
    }
  }

  function handleRemoveMember(memberId: string) {
    if (confirm('Are you sure you want to remove this member?')) {
      setMembers(members.filter((m) => m.id !== memberId));
    }
  }

  const roleDescriptions: Record<string, string> = {
    owner: 'Full access, can invite members and delete team',
    admin: 'Full access to all projects and settings',
    editor: 'Can create and edit projects',
    viewer: 'Read-only access to projects',
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Team Management</h1>

      {/* Invite section */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f0f7ff',
          border: '1px solid #b3d9ff',
          borderRadius: '8px',
          marginBottom: '30px',
        }}
      >
        <h2 style={{ marginTop: '0', fontSize: '18px' }}>Invite Team Member</h2>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="email"
            placeholder="Enter email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleInvite}
            disabled={isInviting || !inviteEmail}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isInviting || !inviteEmail ? 'not-allowed' : 'pointer',
              opacity: isInviting || !inviteEmail ? 0.6 : 1,
            }}
          >
            {isInviting ? 'Inviting...' : 'Invite'}
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#666' }}>
          <strong>Role:</strong> {roleDescriptions[inviteRole]}
        </div>
      </div>

      {/* Members list */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>Team Members ({members.length})</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {members.map((member) => (
            <div
              key={member.id}
              style={{
                padding: '16px',
                backgroundColor: '#fff',
                border: '1px solid #eee',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>{member.name}</div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>{member.email}</div>
                <div>
                  <span
                    style={{
                      padding: '3px 10px',
                      backgroundColor: '#e3f2fd',
                      color: '#007bff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {member.role}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#999' }}>
                <span>Joined {new Date(member.joinedDate).toLocaleDateString()}</span>
                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions legend */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3 style={{ marginTop: '0' }}>Permissions Legend</h3>
        {Object.entries(roleDescriptions).map(([role, desc]) => (
          <div key={role} style={{ marginBottom: '12px' }}>
            <strong style={{ textTransform: 'capitalize' }}>{role}:</strong> {desc}
          </div>
        ))}
      </div>
    </div>
  );
}
