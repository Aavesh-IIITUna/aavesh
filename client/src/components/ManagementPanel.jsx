import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import './ManagementPanel.css';

const permissionOptions = [
  { key: 'members.manage', label: 'Manage members' },
  { key: 'events.manage', label: 'Manage events' },
  { key: 'contacts.read', label: 'Read contact inbox' },
];
const builtinRoleKeys = ['member', 'secretary', 'president', 'developer'];

const isDeveloper = (user) => (user?.roleKeys || []).includes('developer');
const can = (user, permission) => isDeveloper(user) || (user?.permissions || []).includes(permission) || (user?.permissions || []).includes('*');
const messageFor = (error) => error.status ? error.message : 'Unable to reach the server. Please try again.';
const reportFailure = (error, setError, onUserChanged) => {
  setError(messageFor(error));
  if (error.status === 401) onUserChanged().catch(() => {});
};
const emptyEvent = () => ({ title: '', startsAt: '', endsAt: '', description: '', location: '', status: 'DRAFT' });
const emptyMember = () => ({ name: '', role: '', track: '', email: '', github: '', linkedin: '', joinedYear: '', active: true });
const notifyPublicSection = (name) => window.dispatchEvent(new Event(`aavesh:${name}-updated`));

const toLocalDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function ManagementPanel({ user, onUserChanged }) {
  const canManageEvents = can(user, 'events.manage');
  const canManageMembers = can(user, 'members.manage');
  const canManageRoles = can(user, 'roles.manage');
  const developer = isDeveloper(user);

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [eventError, setEventError] = useState('');
  const [memberError, setMemberError] = useState('');
  const [roleError, setRoleError] = useState('');
  const [eventNotice, setEventNotice] = useState('');
  const [memberNotice, setMemberNotice] = useState('');
  const [roleNotice, setRoleNotice] = useState('');
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [editingEvent, setEditingEvent] = useState('');
  const [editingMember, setEditingMember] = useState('');
  const [roleForm, setRoleForm] = useState({ key: '', name: '', permissions: [] });
  const [editingRole, setEditingRole] = useState('');
  const [selectedRoleKeys, setSelectedRoleKeys] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    if (canManageEvents) {
      setEventLoading(true);
      api.listEvents({ signal })
        .then(setEvents)
        .catch((error) => { if (!signal.aborted) reportFailure(error, setEventError, onUserChanged); })
        .finally(() => { if (!signal.aborted) setEventLoading(false); });
    }
    if (canManageMembers) {
      setMemberLoading(true);
      api.listManagedMembers({ signal })
        .then(setMembers)
        .catch((error) => { if (!signal.aborted) reportFailure(error, setMemberError, onUserChanged); })
        .finally(() => { if (!signal.aborted) setMemberLoading(false); });
    }
    if (canManageRoles) {
      setRoleLoading(true);
      Promise.all([api.listRoles({ signal }), api.listUsers({ signal })])
        .then(([roleRows, userRows]) => {
          setRoles(roleRows);
          setUsers(userRows);
        })
        .catch((error) => { if (!signal.aborted) reportFailure(error, setRoleError, onUserChanged); })
        .finally(() => { if (!signal.aborted) setRoleLoading(false); });
    }

    return () => controller.abort();
  }, [canManageEvents, canManageMembers, canManageRoles]);

  const submitEvent = async (event) => {
    event.preventDefault();
    setEventError('');
    setEventNotice('');
    const start = new Date(eventForm.startsAt);
    const end = eventForm.endsAt ? new Date(eventForm.endsAt) : null;
    if (Number.isNaN(start.getTime()) || (end && Number.isNaN(end.getTime()))) {
      setEventError('Enter valid start and end dates.');
      return;
    }
    if (end && end < start) {
      setEventError('Event end time must be after its start time.');
      return;
    }
    const body = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim() || null,
      location: eventForm.location.trim() || null,
      startsAt: start.toISOString(),
      endsAt: end ? end.toISOString() : null,
      status: eventForm.status,
    };
    if (!body.title || body.title.length > 160) {
      setEventError('Event title must be between 1 and 160 characters.');
      return;
    }
    if (body.description?.length > 5000 || body.location?.length > 200) {
      setEventError('Description must be at most 5000 characters and location at most 200.');
      return;
    }

    setEventLoading(true);
    try {
      const saved = editingEvent
        ? await api.updateEvent(editingEvent, body)
        : await api.createEvent(body);
      setEvents((current) => {
        const next = editingEvent
          ? current.map((item) => item._id === saved._id ? saved : item)
          : [...current, saved];
        return next.sort((first, second) => new Date(first.startsAt) - new Date(second.startsAt));
      });
      notifyPublicSection('events');
      setEventForm(emptyEvent());
      setEditingEvent('');
      setEventNotice(editingEvent ? 'Event updated.' : 'Event created.');
    } catch (error) {
      reportFailure(error, setEventError, onUserChanged);
    } finally {
      setEventLoading(false);
    }
  };

  const editEvent = (event) => {
    setEditingEvent(event._id);
    setEventForm({
      title: event.title || '',
      startsAt: toLocalDateTime(event.startsAt),
      endsAt: toLocalDateTime(event.endsAt),
      description: event.description || '',
      location: event.location || '',
      status: event.status || 'DRAFT',
    });
    setEventError('');
    setEventNotice('');
  };

  const deleteEvent = async (event) => {
    if (!window.confirm(`Remove event "${event.title}"?`)) return;
    setEventError('');
    setEventNotice('');
    setEventLoading(true);
    try {
      await api.deleteEvent(event._id);
      setEvents((current) => current.filter((item) => item._id !== event._id));
      notifyPublicSection('events');
      setEventNotice('Event removed.');
    } catch (error) {
      reportFailure(error, setEventError, onUserChanged);
    } finally {
      setEventLoading(false);
    }
  };

  const submitMember = async (event) => {
    event.preventDefault();
    setMemberError('');
    setMemberNotice('');
    const body = {
      name: memberForm.name.trim(),
      role: memberForm.role.trim() || null,
      track: memberForm.track.trim() || null,
      email: memberForm.email.trim().toLowerCase() || null,
      github: memberForm.github.trim() || null,
      linkedin: memberForm.linkedin.trim() || null,
      joinedYear: memberForm.joinedYear === '' ? null : Number(memberForm.joinedYear),
      active: memberForm.active,
    };
    if (!body.name || body.name.length > 100) {
      setMemberError('Member name must be between 1 and 100 characters.');
      return;
    }
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      setMemberError('Enter a valid member email address.');
      return;
    }
    if (body.joinedYear !== null && (!Number.isInteger(body.joinedYear) || body.joinedYear < 1900 || body.joinedYear > 2200)) {
      setMemberError('Joined year must be a whole year between 1900 and 2200.');
      return;
    }

    setMemberLoading(true);
    try {
      const saved = editingMember
        ? await api.updateMember(editingMember, body)
        : await api.createMember(body);
      setMembers((current) => {
        const next = editingMember
          ? current.map((item) => item._id === saved._id ? saved : item)
          : [...current, saved];
        return next.sort((first, second) => first.name.localeCompare(second.name));
      });
      notifyPublicSection('members');
      setMemberForm(emptyMember());
      setEditingMember('');
      setMemberNotice(editingMember ? 'Member updated.' : 'Member added.');
    } catch (error) {
      reportFailure(error, setMemberError, onUserChanged);
    } finally {
      setMemberLoading(false);
    }
  };

  const editMember = (member) => {
    setEditingMember(member._id);
    setMemberForm({
      name: member.name || '',
      role: member.role || '',
      track: member.track || '',
      email: member.email || '',
      github: member.github || '',
      linkedin: member.linkedin || '',
      joinedYear: member.joinedYear == null ? '' : String(member.joinedYear),
      active: member.active !== false,
    });
    setMemberError('');
    setMemberNotice('');
  };

  const deleteMember = async (member) => {
    if (!window.confirm(`Remove member "${member.name}"?`)) return;
    setMemberError('');
    setMemberNotice('');
    setMemberLoading(true);
    try {
      await api.deleteMember(member._id);
      setMembers((current) => current.filter((item) => item._id !== member._id));
      notifyPublicSection('members');
      setMemberNotice('Member removed.');
    } catch (error) {
      reportFailure(error, setMemberError, onUserChanged);
    } finally {
      setMemberLoading(false);
    }
  };

  const toggleRolePermission = (permission) => {
    setRoleForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const submitRole = async (event) => {
    event.preventDefault();
    setRoleError('');
    setRoleNotice('');
    const key = roleForm.key.trim().toLowerCase();
    if (!editingRole && (!/^[a-z][a-z0-9-]{1,39}$/.test(key) || builtinRoleKeys.includes(key))) {
      setRoleError('Use a 2-40 character custom key starting with a letter. Built-in keys are reserved.');
      return;
    }
    if (roleForm.name.trim().length < 2 || roleForm.name.trim().length > 60) {
      setRoleError('Role name must be between 2 and 60 characters.');
      return;
    }

    setRoleLoading(true);
    try {
      if (editingRole) {
        await api.updateRole(editingRole, { name: roleForm.name.trim(), permissions: roleForm.permissions });
      } else {
        await api.createRole({ key, name: roleForm.name.trim(), permissions: roleForm.permissions });
      }
      setRoles(await api.listRoles());
      setRoleForm({ key: '', name: '', permissions: [] });
      setEditingRole('');
      setRoleNotice(editingRole ? 'Role updated.' : 'Role created.');
    } catch (error) {
      reportFailure(error, setRoleError, onUserChanged);
    } finally {
      setRoleLoading(false);
    }
  };

  const startEditRole = (role) => {
    setEditingRole(role.key);
    setRoleForm({ key: role.key, name: role.name, permissions: role.permissions || [] });
    setRoleError('');
    setRoleNotice('');
  };

  const roleOptions = [...new Set([
    'member', 'secretary',
    ...(developer ? ['president', 'developer'] : []),
    ...roles.filter((role) => !role.system).map((role) => role.key),
  ])];

  const updateUserRoles = async (target, action) => {
    const roleKey = selectedRoleKeys[target.id];
    if (!roleKey) return;
    setRoleError('');
    setRoleNotice('');
    setRoleLoading(true);
    try {
      const response = await api.changeUserRoles(target.id, {
        grant: action === 'grant' ? [roleKey] : [],
        revoke: action === 'revoke' ? [roleKey] : [],
      });
      setUsers((current) => current.map((item) => item.id === target.id ? { ...item, roleKeys: response.roleKeys } : item));
      if (target.id === user.id) await onUserChanged();
      setRoleNotice(`Access updated for ${target.displayName}.`);
    } catch (error) {
      reportFailure(error, setRoleError, onUserChanged);
    } finally {
      setRoleLoading(false);
    }
  };

  const saveUserPermissions = async (target) => {
    const current = target.permissions || [];
    const desired = selectedPermissions[target.id] ?? current;
    const grant = desired.filter((permission) => !current.includes(permission));
    const revoke = current.filter((permission) => !desired.includes(permission));
    if (!grant.length && !revoke.length) return;
    setRoleError('');
    setRoleNotice('');
    setRoleLoading(true);
    try {
      const response = await api.changeUserPermissions(target.id, { grant, revoke });
      setUsers((rows) => rows.map((item) => item.id === target.id ? { ...item, permissions: response.permissions } : item));
      setSelectedPermissions((currentSelections) => ({ ...currentSelections, [target.id]: response.permissions }));
      if (target.id === user.id) await onUserChanged();
      setRoleNotice(`Permissions updated for ${target.displayName}.`);
    } catch (error) {
      reportFailure(error, setRoleError, onUserChanged);
    } finally {
      setRoleLoading(false);
    }
  };

  if (!canManageEvents && !canManageMembers && !canManageRoles) return null;

  return (
    <div className="management-panel">
      <span className="auth-panel__eyebrow">AUTHORIZED MANAGEMENT</span>
      {canManageEvents && (
        <details className="management-panel__section">
          <summary>Events</summary>
          {eventLoading && !events.length ? <p className="management-panel__muted" role="status">Loading events...</p> : null}
          {eventError && <p className="auth-panel__error" role="alert">{eventError}</p>}
          {eventNotice && <p className="management-panel__success" role="status">{eventNotice}</p>}
          <form className="management-panel__form" onSubmit={submitEvent}>
            <h3>{editingEvent ? 'Update event' : 'Create event'}</h3>
            <label>Title<input maxLength={160} onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })} required value={eventForm.title} /></label>
            <div className="management-panel__columns">
              <label>Starts<input onChange={(event) => setEventForm({ ...eventForm, startsAt: event.target.value })} required type="datetime-local" value={eventForm.startsAt} /></label>
              <label>Ends<input onChange={(event) => setEventForm({ ...eventForm, endsAt: event.target.value })} type="datetime-local" value={eventForm.endsAt} /></label>
            </div>
            <label>Location<input maxLength={200} onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })} value={eventForm.location} /></label>
            <label>Description<textarea maxLength={5000} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} rows={3} value={eventForm.description} /></label>
            <label>Status<select onChange={(event) => setEventForm({ ...eventForm, status: event.target.value })} value={eventForm.status}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CANCELLED">Cancelled</option></select></label>
            <div className="management-panel__actions">
              <button className="button button--primary" disabled={eventLoading} type="submit">{eventLoading ? 'Saving...' : editingEvent ? 'Save event' : 'Create event'}</button>
              {editingEvent && <button className="button button--secondary" onClick={() => { setEditingEvent(''); setEventForm(emptyEvent()); }} type="button">Cancel</button>}
            </div>
          </form>
          <div className="management-panel__list">
            <h3>Stored events</h3>
            {!eventLoading && !events.length && <p className="management-panel__muted">No events found.</p>}
            {events.map((event) => (
              <div className="management-panel__row" key={event._id}>
                <div><strong>{event.title}</strong><span>{event.status} / {new Date(event.startsAt).toLocaleString()}</span></div>
                <div className="management-panel__actions">
                  <button className="button button--secondary" disabled={eventLoading} onClick={() => editEvent(event)} type="button">Edit</button>
                  <button className="button button--secondary" disabled={eventLoading} onClick={() => deleteEvent(event)} type="button">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {canManageMembers && (
        <details className="management-panel__section">
          <summary>Members</summary>
          {memberLoading && !members.length ? <p className="management-panel__muted" role="status">Loading members...</p> : null}
          {memberError && <p className="auth-panel__error" role="alert">{memberError}</p>}
          {memberNotice && <p className="management-panel__success" role="status">{memberNotice}</p>}
          <form className="management-panel__form" onSubmit={submitMember}>
            <h3>{editingMember ? 'Update member' : 'Add member'}</h3>
            <label>Name<input maxLength={100} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} required value={memberForm.name} /></label>
            <div className="management-panel__columns">
              <label>Role<input maxLength={500} onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value })} value={memberForm.role} /></label>
              <label>Department / track<input maxLength={500} onChange={(event) => setMemberForm({ ...memberForm, track: event.target.value })} value={memberForm.track} /></label>
            </div>
            <label>Email<input maxLength={500} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} type="email" value={memberForm.email} /></label>
            <div className="management-panel__columns">
              <label>GitHub URL<input maxLength={500} onChange={(event) => setMemberForm({ ...memberForm, github: event.target.value })} value={memberForm.github} /></label>
              <label>LinkedIn URL<input maxLength={500} onChange={(event) => setMemberForm({ ...memberForm, linkedin: event.target.value })} value={memberForm.linkedin} /></label>
            </div>
            <label>Joined year<input max={2200} min={1900} onChange={(event) => setMemberForm({ ...memberForm, joinedYear: event.target.value })} step={1} type="number" value={memberForm.joinedYear} /></label>
            <label className="management-panel__checkbox"><input checked={memberForm.active} onChange={(event) => setMemberForm({ ...memberForm, active: event.target.checked })} type="checkbox" />Active member</label>
            <div className="management-panel__actions">
              <button className="button button--primary" disabled={memberLoading} type="submit">{memberLoading ? 'Saving...' : editingMember ? 'Save member' : 'Add member'}</button>
              {editingMember && <button className="button button--secondary" onClick={() => { setEditingMember(''); setMemberForm(emptyMember()); }} type="button">Cancel</button>}
            </div>
          </form>
          <div className="management-panel__list">
            <h3>Member records</h3>
            {!memberLoading && !members.length && <p className="management-panel__muted">No member records found.</p>}
            {members.map((member) => (
              <div className="management-panel__row" key={member._id}>
                <div><strong>{member.name}</strong><span>{member.role || 'Member'} / {member.track || 'No department'} / {member.active === false ? 'Inactive' : 'Active'}</span></div>
                <div className="management-panel__actions">
                  <button className="button button--secondary" disabled={memberLoading} onClick={() => editMember(member)} type="button">Edit</button>
                  <button className="button button--secondary" disabled={memberLoading} onClick={() => deleteMember(member)} type="button">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {canManageRoles && (
        <details className="management-panel__section">
          <summary>Roles and permissions</summary>
          {roleLoading && !roles.length && !users.length ? <p className="management-panel__muted" role="status">Loading roles and users...</p> : null}
          {roleError && <p className="auth-panel__error" role="alert">{roleError}</p>}
          {roleNotice && <p className="management-panel__success" role="status">{roleNotice}</p>}
          <form className="management-panel__form" onSubmit={submitRole}>
            <h3>{editingRole ? `Update ${editingRole}` : 'Create custom role'}</h3>
            {!editingRole && <label>Role key<input maxLength={40} onChange={(event) => setRoleForm({ ...roleForm, key: event.target.value.toLowerCase() })} pattern="[a-z][a-z0-9-]{1,39}" required value={roleForm.key} /></label>}
            <label>Role name<input maxLength={60} minLength={2} onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })} required value={roleForm.name} /></label>
            <fieldset className="management-panel__permissions"><legend>Delegable permissions</legend>
              {permissionOptions.map(({ key, label }) => <label className="management-panel__checkbox" key={key}><input checked={roleForm.permissions.includes(key)} onChange={() => toggleRolePermission(key)} type="checkbox" />{label}<small>{key}</small></label>)}
            </fieldset>
            <div className="management-panel__actions">
              <button className="button button--primary" disabled={roleLoading} type="submit">{roleLoading ? 'Saving...' : editingRole ? 'Save role' : 'Create role'}</button>
              {editingRole && <button className="button button--secondary" onClick={() => { setEditingRole(''); setRoleForm({ key: '', name: '', permissions: [] }); }} type="button">Cancel</button>}
            </div>
          </form>
          <div className="management-panel__list">
            <h3>Existing roles</h3>
            {roles.map((role) => (
              <div className="management-panel__row" key={role.key}>
                <div><strong>{role.name} ({role.key})</strong><span>{role.system ? 'Built-in role' : (role.permissions || []).join(', ') || 'No delegated permissions'}</span></div>
                {!role.system && <button className="button button--secondary" onClick={() => startEditRole(role)} type="button">Edit</button>}
              </div>
            ))}
          </div>
          <div className="management-panel__list">
            <h3>Assign access to users</h3>
            {users.map((target) => {
              const targetIsProtected = (target.roleKeys || []).some((key) => ['developer', 'president'].includes(key));
              const canEditTarget = developer || (target.id !== user.id && !targetIsProtected);
              const currentDirect = target.permissions || [];
              const desired = selectedPermissions[target.id] ?? currentDirect;
              return (
                <details className="management-panel__user" key={target.id}>
                  <summary>{target.displayName} / {target.email}</summary>
                  <p className="management-panel__muted">Assigned roles: {(target.roleKeys || []).join(', ') || 'member'}</p>
                  {canEditTarget ? (
                    <>
                      <div className="management-panel__actions">
                        <select aria-label={`Role for ${target.displayName}`} onChange={(event) => setSelectedRoleKeys({ ...selectedRoleKeys, [target.id]: event.target.value })} value={selectedRoleKeys[target.id] || ''}>
                          <option value="">Choose a role</option>
                          {roleOptions.map((key) => <option key={key} value={key}>{key}</option>)}
                        </select>
                        <button className="button button--secondary" disabled={roleLoading || !selectedRoleKeys[target.id]} onClick={() => updateUserRoles(target, 'grant')} type="button">Grant role</button>
                        <button className="button button--secondary" disabled={roleLoading || !selectedRoleKeys[target.id]} onClick={() => updateUserRoles(target, 'revoke')} type="button">Revoke role</button>
                      </div>
                      <fieldset className="management-panel__permissions"><legend>Direct permissions</legend>
                        {permissionOptions.map(({ key, label }) => <label className="management-panel__checkbox" key={key}><input checked={desired.includes(key)} onChange={(event) => setSelectedPermissions({ ...selectedPermissions, [target.id]: event.target.checked ? [...desired, key] : desired.filter((permission) => permission !== key) })} type="checkbox" />{label}</label>)}
                        <button className="button button--secondary" disabled={roleLoading} onClick={() => saveUserPermissions(target)} type="button">Save permissions</button>
                      </fieldset>
                    </>
                  ) : <p className="management-panel__muted">You cannot change your own access or manage Developer/President assignments.</p>}
                </details>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
