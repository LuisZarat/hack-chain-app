import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate">redirect:{to}</div>
  ),
}));

const mockUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret Dashboard</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent(
      'redirect:/login',
    );

    expect(
      screen.queryByText('Secret Dashboard'),
    ).not.toBeInTheDocument();
  });

  it('renders children when authenticated (no role check)', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'a@b.com',
        role: 'issuer',
        name: 'Ana',
        lastName: null,
        walletAddress: null,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Educator Dashboard</div>
      </ProtectedRoute>,
    );

    expect(
      screen.getByText('Educator Dashboard'),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId('navigate'),
    ).not.toBeInTheDocument();
  });

  it('renders children when user has the required role', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 2,
        email: 'r@b.com',
        role: 'recruiter',
        name: 'Bob',
        lastName: null,
        walletAddress: null,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute roles={['recruiter']}>
        <div>Recruiter Dashboard</div>
      </ProtectedRoute>,
    );

    expect(
      screen.getByText('Recruiter Dashboard'),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId('navigate'),
    ).not.toBeInTheDocument();
  });

  it('redirects to /login when authenticated but wrong role', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 3,
        email: 's@b.com',
        role: 'student',
        name: 'Sam',
        lastName: null,
        walletAddress: null,
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute roles={['issuer']}>
        <div>Educator Only</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent(
      'redirect:/login',
    );

    expect(
      screen.queryByText('Educator Only'),
    ).not.toBeInTheDocument();
  });

  it('shows a loading indicator while authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Secret Dashboard</div>
      </ProtectedRoute>,
    );

    expect(
      screen.queryByText('Secret Dashboard'),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId('navigate'),
    ).not.toBeInTheDocument();
  });
});

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

/**
 * Component that always throws on render — used to trigger ErrorBoundary.
 */
function BrokenComponent(): never {
  throw new Error('Render bomb!');
}

describe('ErrorBoundary', () => {
  it('renders children normally when no error', () => {
    render(
      <ErrorBoundary>
        <div>All Good</div>
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('All Good'),
    ).toBeInTheDocument();
  });

  it('shows error UI when a child throws', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('Something went wrong'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Reload Page'),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('shows the error message in the details section', () => {
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText('Render bomb!'),
    ).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

