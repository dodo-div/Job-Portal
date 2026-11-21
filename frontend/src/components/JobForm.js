import { useEffect, useRef, useState } from 'react';
import { JobTypeOptions } from './jobs';
import { Field, Notice } from './ui';

export default function JobForm({ job, busy, error, onSave, onCancel }) {
  const heading = useRef(null);
  const [skillsError, setSkillsError] = useState('');
  const editing = Boolean(job._id);
  const originalSkills = job.skillsRequired?.join(', ') || '';

  useEffect(() => { heading.current?.focus(); }, []);

  function submit(event) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const skills = fields.skillsRequired.split(',').map(skill => skill.trim()).filter(Boolean);
    if (editing && fields.skillsRequired === originalSkills) {
      delete fields.skillsRequired;
    } else {
      if (skills.length > 30 || skills.some(skill => skill.length > 80)) {
        setSkillsError('Use up to 30 skills with no more than 80 characters each.');
        event.currentTarget.elements.skillsRequired.focus();
        return;
      }
      fields.skillsRequired = skills;
    }
    if (editing) fields.isOpen = fields.isOpen === 'open';
    onSave(fields);
  }

  return <form id="job-form" onSubmit={submit} aria-labelledby="job-form-title" aria-busy={busy}
    className="surface padded form-stack post-form">
    <h2 id="job-form-title" ref={heading} tabIndex={-1}>{editing ? 'Edit job listing' : 'New job listing'}</h2>
    <Notice>{error}</Notice>
    <div className="form-grid">
      <Field label="Job title"><input name="title" defaultValue={job.title} maxLength={150} required /></Field>
      <Field label="Company name"><input name="companyName" defaultValue={job.companyName} maxLength={150} required /></Field>
      <Field label="Location"><input name="location" defaultValue={job.location} maxLength={150} required /></Field>
      <Field label="Annual salary (₹)"><input name="salary" defaultValue={job.salary} type="number" min="0" max={Number.MAX_SAFE_INTEGER} step="any" required /></Field>
      <Field label="Work type"><select name="jobType" defaultValue={job.jobType || 'full-time'}><JobTypeOptions /></select></Field>
      <Field label="Required skills (optional)" help="Separate skills with commas." error={skillsError}>
        <input name="skillsRequired" defaultValue={originalSkills} maxLength={2430} onChange={() => setSkillsError('')} />
      </Field>
      {editing && <Field label="Listing status"><select name="isOpen" defaultValue={job.isOpen ? 'open' : 'closed'}>
        <option value="open">Open</option><option value="closed">Closed</option>
      </select></Field>}
    </div>
    <Field label="Job description"><textarea name="description" defaultValue={job.description} rows={5} maxLength={12000} required /></Field>
    <div className="actions">
      <button className="button" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Publish job'}</button>
      <button type="button" className="button button-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
    </div>
  </form>;
}
