import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';
import API from './services/api';

jest.mock('./services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
  errorMessage: (error, fallback) => fallback,
}));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, '', '/');
  API.get.mockReset().mockResolvedValue({ data: [] });
  API.post.mockReset();
  API.put.mockReset();
});

const job = { _id: 'job-1', title: 'Platform Engineer', companyName: 'Acme', location: 'Pune',
  salary: 800000, jobType: 'full-time', description: 'Build reliable services.', skillsRequired: ['React'], isOpen: true };

function signInAs(role) {
  localStorage.setItem('user', JSON.stringify({ role, token: 'test-session' }));
}

test('homepage lists recent jobs from the existing API', async () => {
  API.get.mockResolvedValue({ data: [job] });
  render(<App />);
  const recent = screen.getByRole('region', { name: 'Recently posted jobs' });
  expect(await within(recent).findByRole('link', { name: job.title })).toHaveAttribute('href', '/jobs/job-1');
  expect(API.get).toHaveBeenCalledWith('/jobs', expect.objectContaining({ params: { limit: 3 } }));
});

test('landing search passes literal job and location terms to the listings API', async () => {
  render(<App />);
  const form = screen.getByRole('form', { name: 'Search jobs' });
  fireEvent.change(within(form).getByLabelText('Job title'), { target: { value: 'C++ & Platform' } });
  fireEvent.change(within(form).getByLabelText('Location'), { target: { value: 'Pune' } });
  fireEvent.click(within(form).getByRole('button', { name: 'Search jobs' }));
  expect(await screen.findByRole('heading', { name: 'No open roles found' })).toBeInTheDocument();
  expect(API.get).toHaveBeenCalledWith('/jobs', expect.objectContaining({
    params: { search: 'C++ & Platform', location: 'Pune', jobType: '', salary: '' },
  }));
});

test('employer signup selects the employer role and ignores an invalid stored session', () => {
  localStorage.setItem('user', 'broken JSON');
  window.history.replaceState({}, '', '/register?role=employer');
  render(<App />);
  expect(screen.getByRole('radio', { name: 'Employer' })).toBeChecked();
  expect(screen.getByLabelText('Company name (optional)')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'Job seeker' }));
  expect(screen.queryByLabelText('Company name (optional)')).toBeNull();
});

test('signing out from a protected page returns to the landing page', async () => {
  signInAs('seeker');
  window.history.replaceState({}, '', '/seeker/find-contacts');
  render(<App />);
  expect(within(screen.getByRole('navigation', { name: 'Main navigation' })).queryByRole('link', { name: 'Find contacts' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByRole('heading', { name: /find work/i })).toBeInTheDocument();
  expect(localStorage.getItem('user')).toBeNull();
  expect(window.location.pathname).toBe('/');
});

test('password visibility preserves the entered value', () => {
  window.history.replaceState({}, '', '/login');
  render(<App />);
  const password = screen.getByLabelText('Password');
  fireEvent.change(password, { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveValue('test-password');
  fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
  expect(password).toHaveAttribute('type', 'password');
});

test('application validates a selected file before calling the API and uploads a valid PDF', async () => {
  signInAs('seeker');
  window.history.replaceState({}, '', '/jobs/job-1');
  API.get.mockResolvedValue({ data: job });
  API.post.mockResolvedValue({ data: {} });
  render(<App />);
  const resume = await screen.findByLabelText('Resume');
  const submit = screen.getByRole('button', { name: 'Submit application' });
  fireEvent.change(resume, { target: { files: [new File(['text'], 'resume.txt', { type: 'text/plain' })] } });
  expect(screen.getByRole('alert')).toHaveTextContent('Choose a PDF resume.');
  fireEvent.click(submit);
  expect(API.post).not.toHaveBeenCalled();
  expect(resume).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Remove file' }));
  expect(resume).not.toHaveAttribute('aria-invalid');
  fireEvent.change(resume, { target: { files: [new File(['%PDF-1.7'], 'resume.pdf', { type: 'application/pdf' })] } });
  fireEvent.click(submit);
  expect(await screen.findByText('Application submitted.')).toBeInTheDocument();
  expect(API.post.mock.calls.map(([path]) => path)).toEqual(['/upload/resume', '/applications/job-1']);
  expect(API.post.mock.calls[0][1].get('resume').name).toBe('resume.pdf');
});

test('employer edits a listing using the existing update contract', async () => {
  signInAs('employer');
  window.history.replaceState({}, '', '/employer/dashboard');
  API.get.mockResolvedValue({ data: [job] });
  API.put.mockResolvedValue({ data: { ...job, title: 'Senior Platform Engineer', isOpen: false } });
  render(<App />);
  fireEvent.click(await screen.findByRole('button', { name: 'Edit job Platform Engineer' }));
  const form = screen.getByRole('form', { name: 'Edit job listing' });
  expect(within(form).getByLabelText('Job title')).toHaveValue(job.title);
  fireEvent.change(within(form).getByLabelText('Job title'), { target: { value: 'Senior Platform Engineer' } });
  fireEvent.change(within(form).getByLabelText('Listing status'), { target: { value: 'closed' } });
  fireEvent.click(within(form).getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByRole('link', { name: 'Senior Platform Engineer' })).toBeInTheDocument();
  const [endpoint, payload] = API.put.mock.calls[0];
  expect(endpoint).toBe('/jobs/job-1');
  expect(payload).toEqual(expect.objectContaining({ title: 'Senior Platform Engineer', isOpen: false }));
  expect(payload).not.toHaveProperty('skillsRequired');
});
