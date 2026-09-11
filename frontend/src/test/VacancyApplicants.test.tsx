import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import VacancyApplicants from "@/pages/VacancyApplicants";

const mockRefetch = vi.fn();
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
const mockUseVacancyApplications = vi.fn();
const mockUseUpdateApplicationStatus = vi.fn();
const mockMutate = vi.fn();

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
  useParams: () => mockUseParams(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; id?: string }) => {
      const translations: Record<string, string> = {
        "vacancyRecruiter.applicants.backToVacancies": "Regresar a vacantes",
        "vacancyRecruiter.applicants.eyebrow": "Postulantes",
        "vacancyRecruiter.applicants.defaultTitle": "Vacante",
        "vacancyRecruiter.applicants.empty": "Aún no hay postulantes.",
        "vacancyRecruiter.applicants.talentWithoutName": "Talento sin nombre",
        "vacancyRecruiter.applicants.viewProfile": "Ver perfil",
        "vacancyRecruiter.applicants.reject": "Rechazar",
        "vacancyRecruiter.applicants.contact": "Contactar",
        "vacancyRecruiter.applicants.certificateFallback": `Certificado #${options?.id}`,
        "vacancyRecruiter.applicants.applicationStatusUpdated":
          "Estado de la postulación actualizado",
        "vacancyRecruiter.status.enviada": "Enviada",
        "vacancyRecruiter.status.contactado": "Contactado",
        "vacancyRecruiter.status.descartada": "Descartada",
      };

      if (
        key === "vacancyRecruiter.applicants.summary" &&
        options?.count !== undefined
      ) {
        return `${options.count} postulaciones`;
      }

      return translations[key] ?? key;
    },
  }),
}));

vi.mock("lucide-react", () => ({
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="arrow-left" {...props} />
  ),
  ExternalLink: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="external-link" {...props} />
  ),
  MessageSquare: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="message-square" {...props} />
  ),
  UserRound: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="user-round" {...props} />
  ),
  XCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="x-circle" {...props} />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/jobs/JobShell", () => ({
  JobShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="job-shell">{children}</div>
  ),
}));

vi.mock("@/components/jobs/JobPrimitives", () => ({
  JobsSkeleton: ({ count }: { count?: number }) => (
    <div data-testid="jobs-skeleton">{count}</div>
  ),
  JobsError: ({ onRetry }: { onRetry: () => void }) => (
    <div>
      <span data-testid="jobs-error">Error</span>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  ),
  SuccessMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="success-message">{children}</div>
  ),
}));

vi.mock("@/hooks/useVacancyApplications", () => ({
  useVacancyApplications: (...args: unknown[]) =>
    mockUseVacancyApplications(...args),
  useUpdateApplicationStatus: (...args: unknown[]) =>
    mockUseUpdateApplicationStatus(...args),
}));

const certificate = {
  token_id: "token-123",
  title: "React Certificate",
  issue_date: "2026-01-15",
  chain_verification_url: "https://example.com/certificate/token-123",
};

const application = {
  id: "application-1",
  vacancy: {
    id: "vacancy-1",
    slug: "frontend-developer",
    position: "Frontend Developer",
    company: "HackChain",
    status: "abierta",
  },
  vacancy_id: "vacancy-1",
  student_wallet_address: "0xstudent123",
  student_name: "Luis Soto",
  shared_certificates: [certificate],
  message: "Me interesa mucho esta oportunidad.",
  status: "enviada",
  submitted_at: "2026-08-20T15:30:00.000Z",
};

const secondApplication = {
  id: "application-2",
  vacancy_id: "vacancy-1",
  student_wallet_address: "0xstudent456",
  student_name: "Ana López",
  shared_certificates: [],
  message: null,
  status: "contactado",
  submitted_at: "2026-08-21T16:30:00.000Z",
};

const renderPage = () => {
  mockUseParams.mockReturnValue({ id: "vacancy-1" });

  mockUseUpdateApplicationStatus.mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
  });

  mockUseVacancyApplications.mockReturnValue({
    data: {
      vacancy: application.vacancy,
      applications: [application, secondApplication],
    },
    isPending: false,
    isError: false,
    refetch: mockRefetch,
  });

  return render(<VacancyApplicants />);
};

describe("VacancyApplicants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el encabezado y el contador de postulaciones", () => {
    renderPage();

    expect(
      screen.getByRole("heading", {
        name: "Frontend Developer",
        level: 1,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("2 postulaciones")).toBeInTheDocument();
    expect(screen.getByText("Postulantes")).toBeInTheDocument();
  });

  it("usa el título por defecto cuando la vacante no tiene posición", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: null,
        applications: [],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    });

    render(<VacancyApplicants />);

    expect(
      screen.getByRole("heading", {
        name: "Vacante",
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("muestra loading mientras obtiene los postulantes", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: mockRefetch,
    });

    render(<VacancyApplicants />);

    expect(screen.getByTestId("jobs-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("jobs-skeleton")).toHaveTextContent("4");
  });

  it("muestra error y permite reintentar", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<VacancyApplicants />);

    expect(screen.getByTestId("jobs-error")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reintentar",
      }),
    );

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("muestra el estado vacío cuando no existen postulaciones", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<VacancyApplicants />);

    expect(screen.getByText("Aún no hay postulantes.")).toBeInTheDocument();
  });

  it("muestra los postulantes y sus datos principales", () => {
    renderPage();

    expect(screen.getByText("Luis Soto")).toBeInTheDocument();
    expect(screen.getByText("Ana López")).toBeInTheDocument();

    expect(
      screen.getByText("Me interesa mucho esta oportunidad."),
    ).toBeInTheDocument();

    expect(screen.getByText("Enviada")).toBeInTheDocument();
    expect(screen.getByText("Contactado")).toBeInTheDocument();
  });

  it("muestra el fallback cuando un postulante no tiene nombre", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [
          {
            ...application,
            student_name: null,
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    });

    render(<VacancyApplicants />);

    expect(screen.getByText("Talento sin nombre")).toBeInTheDocument();
  });

  it("genera correctamente el enlace al perfil del talento", () => {
    renderPage();

    const profileLinks = screen.getAllByRole("link", {
      name: /Ver perfil/i,
    });

    expect(profileLinks).toHaveLength(2);
    expect(profileLinks[0]).toHaveAttribute(
      "href",
      "/recruiter/talent/0xstudent123",
    );
  });

  it("genera correctamente el enlace de regreso a vacantes", () => {
    renderPage();

    const backLink = screen.getByRole("link", {
      name: /Regresar a vacantes/i,
    });

    expect(backLink).toHaveAttribute("href", "/recruiter/vacancies");
  });

  it("muestra los certificados compartidos", () => {
    renderPage();

    expect(screen.getByText("React Certificate")).toBeInTheDocument();

    const certificateLink = screen.getByRole("link", {
      name: /React Certificate/i,
    });

    expect(certificateLink).toHaveAttribute(
      "href",
      "https://example.com/certificate/token-123",
    );

    expect(certificateLink).toHaveAttribute("target", "_blank");
    expect(certificateLink).toHaveAttribute("rel", "noreferrer");
  });

  it("usa el fallback del certificado cuando no tiene título", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [
          {
            ...application,
            shared_certificates: [
              {
                ...certificate,
                title: null,
                token_id: "token-999",
              },
            ],
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    });

    render(<VacancyApplicants />);

    expect(screen.getByText("Certificado #token-999")).toBeInTheDocument();
  });

  it("rechaza una postulación", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [application],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    });

    render(<VacancyApplicants />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Rechazar",
      }),
    );

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      id: "application-1",
      status: "descartada",
    });
  });

  it("contacta una postulación", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Contactar",
      }),
    );

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      id: "application-1",
      status: "contactado",
    });
  });

  it("no muestra Rechazar para una postulación descartada", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [
          {
            ...application,
            status: "descartada",
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    });

    render(<VacancyApplicants />);

    expect(
      screen.queryByRole("button", {
        name: "Rechazar",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Contactar",
      }),
    ).not.toBeInTheDocument();
  });

  it("no muestra Contactar cuando la postulación ya está contactada", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [
          {
            ...application,
            status: "contactado",
          },
        ],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
    });

    render(<VacancyApplicants />);

    expect(
      screen.getByRole("button", {
        name: "Rechazar",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Contactar",
      }),
    ).not.toBeInTheDocument();
  });

  it("deshabilita las acciones mientras se actualiza una postulación", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [application],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isSuccess: false,
    });

    render(<VacancyApplicants />);

    expect(
      screen.getByRole("button", {
        name: "Rechazar",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Contactar",
      }),
    ).toBeDisabled();
  });

  it("muestra el mensaje de éxito cuando la actualización termina correctamente", () => {
    mockUseParams.mockReturnValue({ id: "vacancy-1" });

    mockUseVacancyApplications.mockReturnValue({
      data: {
        vacancy: application.vacancy,
        applications: [application],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockUseUpdateApplicationStatus.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: true,
    });

    render(<VacancyApplicants />);

    expect(screen.getByTestId("success-message")).toBeInTheDocument();

    expect(
      screen.getByText("Estado de la postulación actualizado"),
    ).toBeInTheDocument();
  });
});
