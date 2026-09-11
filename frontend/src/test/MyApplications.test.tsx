import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import MyApplications from "@/pages/MyApplications";

const mockRefetch = vi.fn();
const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();
const mockUseMyApplications = vi.fn();

vi.mock("react-router-dom", () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),

  useNavigate: () => mockNavigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "jobTalent.back": "Regresar",

        "jobTalent.applicationsPage.eyebrow": "Mis postulaciones",
        "jobTalent.applicationsPage.title": "Mis postulaciones",
        "jobTalent.applicationsPage.description":
          "Consulta el estado de las vacantes a las que te has postulado.",
        "jobTalent.applicationsPage.exploreOpenVacancies":
          "Explorar vacantes abiertas",
        "jobTalent.applicationsPage.talentOnlyNotice":
          "Esta sección está disponible únicamente para perfiles de Talento.",

        "jobTalent.applicationsPage.submittedOn": "Enviada el",

        "jobTalent.applicationsPage.status.enviada": "Enviada",
        "jobTalent.applicationsPage.status.vista": "Vista",
        "jobTalent.applicationsPage.status.contactado": "Contactado",
        "jobTalent.applicationsPage.status.descartada": "Descartada",
        "jobTalent.applicationsPage.status.cerrada_sin_respuesta":
          "Cerrada sin respuesta",
      };

      return translations[key] ?? key;
    },
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  useReducedMotion: () => false,
}));

vi.mock("lucide-react", () => ({
  ArrowUpRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="arrow-up-right" {...props} />
  ),
  Clock3: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="clock-icon" {...props} />
  ),
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="arrow-left" {...props} />
  ),
}));

vi.mock("@/components/jobs/JobShell", () => ({
  JobShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="job-shell">{children}</div>
  ),
}));

vi.mock("@/components/jobs/JobPrimitives", () => ({
  EmptyJobs: ({ action }: { action?: React.ReactNode }) => (
    <div data-testid="empty-jobs">
      <p>No hay postulaciones.</p>
      {action}
    </div>
  ),

  JobsError: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="jobs-error">
      <span>Error al cargar.</span>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  ),

  JobsSkeleton: ({ count }: { count: number }) => (
    <div data-testid="jobs-skeleton">Skeleton {count}</div>
  ),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/hooks/useVacancyApplications", () => ({
  useMyApplications: () => mockUseMyApplications(),
}));

const applications = [
  {
    id: "application-1",
    status: "enviada",
    submitted_at: "2026-09-05T12:00:00Z",
    vacancy: {
      slug: "frontend-engineer",
      position: "Frontend Engineer",
      company: "HackChain",
    },
  },
  {
    id: "application-2",
    status: "contactado",
    submitted_at: "2026-09-07T12:00:00Z",
    vacancy: {
      slug: "backend-developer",
      position: "Backend Developer",
      company: "Tech Company",
    },
  },
];

function renderPage() {
  return render(<MyApplications />);
}

describe("MyApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: {
        role: "student",
      },
    });

    mockUseMyApplications.mockReturnValue({
      data: {
        applications,
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });
  });

  it("muestra el estado de carga", () => {
    mockUseMyApplications.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByTestId("jobs-skeleton")).toHaveTextContent("Skeleton 4");
  });

  it("muestra el estado de error", () => {
    mockUseMyApplications.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByTestId("jobs-error")).toBeInTheDocument();
    expect(screen.getByText("Error al cargar.")).toBeInTheDocument();
  });

  it("permite reintentar cuando ocurre un error", () => {
    mockUseMyApplications.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mockRefetch,
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("muestra el estado vacío cuando no existen postulaciones", () => {
    mockUseMyApplications.mockReturnValue({
      data: {
        applications: [],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByTestId("empty-jobs")).toBeInTheDocument();
    expect(screen.getByText("No hay postulaciones.")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Explorar vacantes abiertas/i }),
    ).toHaveAttribute("href", "/jobs");
  });

  it("muestra el encabezado de la página", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Mis postulaciones", level: 1 }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Consulta el estado de las vacantes a las que te has postulado.",
      ),
    ).toBeInTheDocument();
  });

  it("muestra todas las postulaciones con vacante asociada", () => {
    renderPage();

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("HackChain")).toBeInTheDocument();

    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(screen.getByText("Tech Company")).toBeInTheDocument();
  });

  it("muestra el estado traducido de cada postulación", () => {
    renderPage();

    expect(screen.getByText("Enviada")).toBeInTheDocument();
    expect(screen.getByText("Contactado")).toBeInTheDocument();
  });

  it("muestra la fecha de envío de cada postulación", () => {
    renderPage();

    const dates = screen.getAllByText(/Enviada el/);

    expect(dates).toHaveLength(2);
  });

  it("muestra el icono de fecha", () => {
    renderPage();

    expect(screen.getAllByTestId("clock-icon")).toHaveLength(2);
  });

  it("cada postulación enlaza con el detalle de su vacante", () => {
    renderPage();

    expect(
      screen.getByRole("link", { name: /Frontend Engineer HackChain/i }),
    ).toHaveAttribute("href", "/jobs/frontend-engineer");

    expect(
      screen.getByRole("link", { name: /Backend Developer Tech Company/i }),
    ).toHaveAttribute("href", "/jobs/backend-developer");
  });

  it("regresa a la página anterior", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /Regresar/i }));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("muestra el aviso cuando el usuario no es Talento", () => {
    mockUseAuth.mockReturnValue({
      user: {
        role: "recruiter",
      },
    });

    renderPage();

    expect(
      screen.getByText(
        "Esta sección está disponible únicamente para perfiles de Talento.",
      ),
    ).toBeInTheDocument();
  });

  it("no muestra el aviso para un usuario Talento", () => {
    renderPage();

    expect(
      screen.queryByText(
        "Esta sección está disponible únicamente para perfiles de Talento.",
      ),
    ).not.toBeInTheDocument();
  });

  it("ignora postulaciones que no tienen una vacante asociada", () => {
    mockUseMyApplications.mockReturnValue({
      data: {
        applications: [
          ...applications,
          {
            id: "application-without-vacancy",
            status: "vista",
            submitted_at: "2026-09-08T12:00:00Z",
            vacancy: undefined,
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Backend Developer")).toBeInTheDocument();
    expect(
      screen.queryByText("application-without-vacancy"),
    ).not.toBeInTheDocument();
  });

  it("tolera que data sea undefined y muestra el estado vacío", () => {
    mockUseMyApplications.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByTestId("empty-jobs")).toBeInTheDocument();
  });
});
