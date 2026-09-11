import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/services/api';
import { vacancyService } from '@/services/vacancyService';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    getPublic: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

beforeEach(() => vi.clearAllMocks());

describe('vacancyService', () => {
  it('builds the public vacancies query with supported filters', async () => {
    mockedApi.getPublic.mockResolvedValue({ vacancies: [] });
    await vacancyService.list({ area: 'backend', modalidad: 'hibrido', q: ' node ' });
    expect(mockedApi.getPublic).toHaveBeenCalledWith('/api/vacancies?area=backend&modalidad=hibrido&q=node');
  });
it('builds the public vacancies query without filters', async () => {
  mockedApi.getPublic.mockResolvedValue({ vacancies: [] });

  await vacancyService.list({});

  expect(mockedApi.getPublic).toHaveBeenCalledWith('/api/vacancies');
});
it('propagates mutation API errors without changing them', async () => {
  const error = new Error('Conflict');

  mockedApi.post.mockRejectedValue(error);

  await expect(
    vacancyService.create({
      position: 'Backend',
      company: 'HackChain',
    } as never),
  ).rejects.toBe(error);
});
it('propagates update API errors without changing them', async () => {
  const error = new Error('Forbidden');

  mockedApi.put.mockRejectedValue(error);

  await expect(
    vacancyService.update(
      'v1',
      {
        position: 'Backend',
        company: 'HackChain',
      } as never,
    ),
  ).rejects.toBe(error);
});
  it('uses public detail and authenticated recruiter endpoints', async () => {
    mockedApi.getPublic.mockResolvedValue({ vacancy: {} });
    mockedApi.get.mockResolvedValue({ vacancies: [] });
    await vacancyService.getBySlug('senior frontend/dev');
    await vacancyService.listMine();
    expect(mockedApi.getPublic).toHaveBeenCalledWith('/api/vacancies/senior%20frontend%2Fdev');
    expect(mockedApi.get).toHaveBeenCalledWith('/api/vacancies/mine');
  });

  it('sends CRUD, application and status request payloads to exact routes', async () => {
    mockedApi.post.mockResolvedValue({});
    mockedApi.put.mockResolvedValue({});
    const payload = { position: 'Backend', company: 'HackChain' } as never;
    const application = { shared_certificates: ['12'], message: 'Hola' };

    await vacancyService.create(payload);
    await vacancyService.update('v1', payload);
    await vacancyService.close('v1');
    await vacancyService.apply('v1', application);
    await vacancyService.listMyApplications();
    await vacancyService.listApplications('v1');
    await vacancyService.updateApplicationStatus('a1', 'descartada');

    expect(mockedApi.post).toHaveBeenNthCalledWith(1, '/api/vacancies', payload);
    expect(mockedApi.put).toHaveBeenNthCalledWith(1, '/api/vacancies/v1', payload);
    expect(mockedApi.post).toHaveBeenNthCalledWith(2, '/api/vacancies/v1/close');
    expect(mockedApi.post).toHaveBeenNthCalledWith(3, '/api/vacancies/v1/applications', application);
    expect(mockedApi.get).toHaveBeenNthCalledWith(1, '/api/vacancies/applications/mine');
    expect(mockedApi.get).toHaveBeenNthCalledWith(2, '/api/vacancies/v1/applications');
    expect(mockedApi.put).toHaveBeenNthCalledWith(2, '/api/vacancies/applications/a1', { status: 'descartada' });
  });

  it('propagates API errors without changing them', async () => {
    const error = new Error('Forbidden');
    mockedApi.getPublic.mockRejectedValue(error);
    await expect(vacancyService.getBySlug('missing')).rejects.toBe(error);
  });
});
