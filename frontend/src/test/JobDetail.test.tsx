import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import JobDetail, { ApplyPanel } from "@/pages/JobDetail";

import type { Vacancy } from "@/types/vacancy";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  refetch: vi.fn(),
  mutate: vi.fn(),
  useVacancyDetail: vi.fn(),
  useTalentCertificates: vi.fn(),
  useApplyToVacancy: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useParams: () => ({
    slug: "frontend-engineer",
  }),
  useNavigate: () => mocks.navigate,
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        "jobTalent.back": "Regresar",
        "jobTalent.vacancyClosed": "Vacante cerrada",
        "jobTalent.daysUntilClosing": `${options?.count ?? 0} días para cerrar`,
        "jobTalent.aboutPosition": "Sobre la posición",
        "jobTalent.requirements": "Requisitos",
        "jobTalent.noLongerAccepts": "Esta vacante ya no acepta postulaciones",
        "jobTalent.apply.loginMessage":
          "Inicia sesión como Talento para postularte.",
        "jobTalent.apply.login": "Iniciar sesión",
        "jobTalent.apply.talentOnly":
          "Solo los perfiles de Talento pueden postularse.",
        "jobTalent.apply.success": "Tu postulación fue enviada correctamente.",
        "jobTalent.apply.title": "Postularme",
        "jobTalent.apply.description":
          "Selecciona los certificados que deseas compartir.",
        "jobTalent.apply.noCertificates": "No tienes certificados disponibles.",
        "jobTalent.apply.certificateFallback": `Certificado ${options?.count ?? ""}`,
        "jobTalent.apply.message": "Mensaje",
        "jobTalent.apply.optional": "opcional",
        "jobTalent.apply.sending": "Enviando...",
        "jobTalent.apply.send": "Enviar postulación",
      };

      if (key === "jobTalent.apply.certificateFallback") {
        return "Certificado sin nombre";
      }

      return translations[key] ?? key;
    },
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: () => false,
}));

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon" />,
  Check: () => <span data-testid="check-icon" />,
  Clock3: () => <span data-testid="clock-icon" />,
  MapPin: () => <span data-testid="map-pin-icon" />,
  Send: () => <span data-testid="send-icon" />,
  ShieldAlert: () => <span data-testid="shield-alert-icon" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/hooks/useTalentCertificates", () => ({
  useTalentCertificates: mocks.useTalentCertificates,
}));

vi.mock("@/hooks/useApplyToVacancy", () => ({
  useApplyToVacancy: mocks.useApplyToVacancy,
}));

vi.mock("@/hooks/useVacancyDetail", () => ({
  useVacancyDetail: mocks.useVacancyDetail,
}));

vi.mock("@/components/jobs/JobShell", () => ({
  JobShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="job-shell">{children}</div>
  ),
}));

vi.mock("@/components/jobs/JobPrimitives", () => ({
  JobsError: ({ onRetry }: { onRetry: () => void }) => (
    <div>
      <span data-testid="jobs-error">Error</span>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  ),

  JobsSkeleton: ({ count }: { count?: number }) => (
    <div data-testid="jobs-skeleton">Skeleton {count}</div>
  ),

  LABELS: {
    frontend: "Frontend",
    backend: "Backend",
    fullstack: "Fullstack",
    mobile: "Mobile",
    data: "Data",
    devops: "DevOps",
    cloud: "Cloud",
    ciberseguridad: "Ciberseguridad",
    blockchain: "Blockchain",
    qa: "QA",
    diseno: "Diseño",
    producto: "Producto",
    soporte: "Soporte",
    remoto: "Remoto",
    presencial: "Presencial",
    hibrido: "Híbrido",
  },

  SuccessMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="success-message">{children}</div>
  ),

  UnverifiedNotice: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="unverified-notice">{children}</div>
  ),

  formatSalary: () => "$1,000 - $2,000 USD / mes",
}));

const vacancy: Vacancy = {
  id: "1",
  slug: "frontend-engineer",
  position: "Frontend Engineer",
  company: "HackChain",
  area: "frontend",
  modality: "remoto",
  country: "México",
  city: "Ciudad de México",
  salary_min: "1000",
  salary_max: "2000",
  salary_currency: "USD",
  salary_period: "mes",
  closing_date: "2026-10-01",
  days_to_close: 20,
  status: "abierta",
  published_at: "2026-09-01",
  description: "Construir interfaces modernas y accesibles.",
  requirements: ["React", "TypeScript"],
};

const certificates = [
  {
    identifier: "cert-1",
    name: "React Certificate",
  },
  {
    identifier: "cert-2",
    name: "TypeScript Certificate",
  },
];

beforeEach(() => {
  vi.clearAllMocks();

  mocks.useAuth.mockReturnValue({
    user: {
      role: "student",
      walletAddress: "0x123",
    },
    isAuthenticated: true,
  });

  mocks.useVacancyDetail.mockReturnValue({
    data: {
      vacancy,
      unverified_company_notice: "La empresa aún no está verificada.",
    },
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
  });

  mocks.useTalentCertificates.mockReturnValue({
    data: certificates,
  });

  mocks.useApplyToVacancy.mockReturnValue({
    mutate: mocks.mutate,
    isPending: false,
    isSuccess: false,
    error: null,
  });
});

describe("JobDetail", () => {
  it("muestra el estado de loading", () => {
    mocks.useVacancyDetail.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: mocks.refetch,
    });

    render(<JobDetail />);

    expect(screen.getByTestId("jobs-skeleton")).toBeInTheDocument();
  });

  it("muestra el estado de error", () => {
    mocks.useVacancyDetail.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mocks.refetch,
    });

    render(<JobDetail />);

    expect(screen.getByTestId("jobs-error")).toBeInTheDocument();
  });

  it("ejecuta refetch al reintentar después de un error", () => {
    mocks.useVacancyDetail.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mocks.refetch,
    });

    render(<JobDetail />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reintentar",
      }),
    );

    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });

  it("renderiza correctamente los datos de la vacante", () => {
    render(<JobDetail />);

    expect(
      screen.getByRole("heading", {
        name: "Frontend Engineer",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("HackChain")).toBeInTheDocument();

    expect(screen.getByText("Frontend / Remoto")).toBeInTheDocument();

    expect(
      screen.getByText("Construir interfaces modernas y accesibles."),
    ).toBeInTheDocument();

    expect(screen.getByText("React")).toBeInTheDocument();

    expect(screen.getByText("TypeScript")).toBeInTheDocument();

    expect(screen.getByText("Ciudad de México, México")).toBeInTheDocument();

    expect(screen.getByText("$1,000 - $2,000 USD / mes")).toBeInTheDocument();
  });

  it("muestra el aviso de empresa no verificada", () => {
    render(<JobDetail />);

    expect(screen.getByTestId("unverified-notice")).toHaveTextContent(
      "La empresa aún no está verificada.",
    );
  });

  it("muestra los días restantes para cerrar", () => {
    render(<JobDetail />);

    expect(screen.getByText("20 días para cerrar")).toBeInTheDocument();
  });

  it("navega hacia atrás al pulsar Regresar", () => {
    render(<JobDetail />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Regresar",
      }),
    );

    expect(mocks.navigate).toHaveBeenCalledWith(-1);
  });

  it("muestra el mensaje de vacante cerrada", () => {
    mocks.useVacancyDetail.mockReturnValue({
      data: {
        vacancy: {
          ...vacancy,
          status: "cerrada",
        },
        unverified_company_notice: "La empresa aún no está verificada.",
      },
      isPending: false,
      isError: false,
      refetch: mocks.refetch,
    });

    render(<JobDetail />);

    expect(screen.getByText("Vacante cerrada")).toBeInTheDocument();

    expect(
      screen.getByText("Esta vacante ya no acepta postulaciones"),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Enviar postulación",
      }),
    ).not.toBeInTheDocument();
  });

  it("muestra el panel de postulación para un Talent autenticado", () => {
    render(<JobDetail />);

    expect(
      screen.getByRole("heading", {
        name: "Postularme",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("React Certificate")).toBeInTheDocument();

    expect(screen.getByText("TypeScript Certificate")).toBeInTheDocument();
  });

  it("muestra el botón de login cuando el usuario no está autenticado", () => {
    mocks.useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    render(<JobDetail />);

    expect(
      screen.getByText("Inicia sesión como Talento para postularte."),
    ).toBeInTheDocument();

    const loginLink = screen.getByRole("link", {
      name: "Iniciar sesión",
    });

    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("muestra el mensaje correspondiente cuando el usuario no es Talent", () => {
    mocks.useAuth.mockReturnValue({
      user: {
        role: "recruiter",
        walletAddress: "0x123",
      },
      isAuthenticated: true,
    });

    render(<JobDetail />);

    expect(
      screen.getByText("Solo los perfiles de Talento pueden postularse."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Enviar postulación",
      }),
    ).not.toBeInTheDocument();
  });
});

describe("ApplyPanel", () => {
  const defaultProps = {
    isTalent: true,
    isAuthenticated: true,
    certificates,
    selected: [] as string[],
    setSelected: vi.fn(),
    message: "",
    setMessage: vi.fn(),
    busy: false,
    success: false,
    error: null,
    onSubmit: vi.fn(),
  };

  it("muestra el estado de login cuando no está autenticado", () => {
    render(<ApplyPanel {...defaultProps} isAuthenticated={false} />);

    expect(
      screen.getByText("Inicia sesión como Talento para postularte."),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Iniciar sesión",
      }),
    ).toHaveAttribute("href", "/login");
  });

  it("muestra el mensaje de solo Talent", () => {
    render(<ApplyPanel {...defaultProps} isTalent={false} />);

    expect(
      screen.getByText("Solo los perfiles de Talento pueden postularse."),
    ).toBeInTheDocument();
  });

  it("muestra el mensaje de éxito", () => {
    render(<ApplyPanel {...defaultProps} success />);

    expect(screen.getByTestId("success-message")).toHaveTextContent(
      "Tu postulación fue enviada correctamente.",
    );
  });

  it("muestra los certificados disponibles", () => {
    render(<ApplyPanel {...defaultProps} />);

    expect(screen.getByText("React Certificate")).toBeInTheDocument();

    expect(screen.getByText("TypeScript Certificate")).toBeInTheDocument();
  });

  it("muestra el estado sin certificados", () => {
    render(<ApplyPanel {...defaultProps} certificates={[]} />);

    expect(
      screen.getByText("No tienes certificados disponibles."),
    ).toBeInTheDocument();
  });

  it("selecciona y deselecciona certificados", () => {
    const setSelected = vi.fn();

    const { rerender } = render(
      <ApplyPanel {...defaultProps} setSelected={setSelected} />,
    );

    const checkbox = screen.getByLabelText(
      "React Certificate",
    ) as HTMLInputElement;

    fireEvent.click(checkbox);

    expect(setSelected).toHaveBeenCalledWith(["cert-1"]);

    rerender(
      <ApplyPanel
        {...defaultProps}
        selected={["cert-1"]}
        setSelected={setSelected}
      />,
    );

    fireEvent.click(screen.getByLabelText("React Certificate"));

    expect(setSelected).toHaveBeenLastCalledWith([]);
  });

  it("actualiza el mensaje y muestra el contador", () => {
    const setMessage = vi.fn();

    render(<ApplyPanel {...defaultProps} setMessage={setMessage} />);

    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, {
      target: {
        value: "Me interesa mucho esta oportunidad.",
      },
    });

    expect(setMessage).toHaveBeenCalledWith(
      "Me interesa mucho esta oportunidad.",
    );

    expect(screen.getByText("(opcional, 0/500)")).toBeInTheDocument();
  });

  it("muestra el contador con la longitud del mensaje", () => {
    render(<ApplyPanel {...defaultProps} message="Hola" />);

    expect(screen.getByText("(opcional, 4/500)")).toBeInTheDocument();
  });

  it("ejecuta onSubmit al enviar la postulación", () => {
    const onSubmit = vi.fn();

    render(
      <ApplyPanel
        {...defaultProps}
        selected={["cert-1"]}
        message="  Hola  "
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enviar postulación",
      }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("deshabilita el botón mientras está enviando", () => {
    render(<ApplyPanel {...defaultProps} busy />);

    const button = screen.getByRole("button", {
      name: "Enviando...",
    });

    expect(button).toBeDisabled();
  });

  it("muestra el error de postulación", () => {
    render(
      <ApplyPanel
        {...defaultProps}
        error={new Error("No se pudo enviar la postulación")}
      />,
    );

    expect(
      screen.getByText("No se pudo enviar la postulación"),
    ).toBeInTheDocument();

    expect(screen.getByTestId("shield-alert-icon")).toBeInTheDocument();
  });

  it("envía el formulario al hacer click en el botón", () => {
    const onSubmit = vi.fn();

    render(<ApplyPanel {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Enviar postulación",
      }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
