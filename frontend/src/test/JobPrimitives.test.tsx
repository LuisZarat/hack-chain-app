import type { ReactNode } from "react";

import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  EmptyJobs,
  JobsError,
  JobsSkeleton,
  SuccessMessage,
  UnverifiedNotice,
  VacancyRow,
} from "@/components/jobs/JobPrimitives";

import type { Vacancy } from "@/types/vacancy";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      key: string,
      options?: {
        count?: number;
        defaultValue?: string;
      },
    ) => {
      const values: Record<string, string> = {
        "jobTalent.loadingVacancies": "Cargando vacantes",
        "jobTalent.loadError": "No pudimos cargar las vacantes.",
        "jobTalent.tryAgain": "Inténtalo de nuevo.",
        "jobTalent.retry": "Reintentar",
        "jobTalent.noResults": "No encontramos vacantes con esos filtros.",
        "jobTalent.tryDifferentFilters":
          "Prueba otra área, modalidad o búsqueda.",
        "jobTalent.vacancyClosed": "Vacante cerrada",
        "jobTalent.closesToday": "Cierra hoy",
        "jobTalent.daysUntilClosing": `${
          options?.count ?? 0
        } días para el cierre`,
        "jobTalent.companyNotVerified": "Empresa sin verificar",
        "jobTalent.unverifiedCompanyWarning": "No envíes dinero.",
        "vacancyRecruiter.applications": `${options?.count ?? 0} postulaciones`,
        "jobTalent.labels.remoto": "Remoto",
        "jobTalent.labels.frontend": "Frontend",
        "jobTalent.labels.presencial": "Presencial",
        "jobTalent.labels.backend": "Backend",
      };

      return values[key] ?? options?.defaultValue ?? key;
    },
  }),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("lucide-react", () => {
  const Icon = (props: Record<string, unknown>) => (
    <span aria-hidden="true" {...props} />
  );

  return {
    AlertTriangle: Icon,
    BriefcaseBusiness: Icon,
    Building2: Icon,
    CheckCircle2: Icon,
    Clock3: Icon,
    MapPin: Icon,
    RefreshCw: Icon,
    ShieldAlert: Icon,
    Users: Icon,
  };
});

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: { children: ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: () => true,
}));

const vacancy: Vacancy = {
  id: "v1",
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
  days_to_close: 21,
  status: "abierta",
  published_at: "2026-09-01",
  description: "Descripción de la vacante",
  requirements: ["React", "TypeScript"],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("VacancyRow", () => {
  it("renders a public vacancy and links to its public detail", () => {
    render(
      <VacancyRow
        vacancy={{
          ...vacancy,
          applications_count: 9,
        }}
      />,
    );

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();

    expect(screen.getByText("HackChain")).toBeInTheDocument();

    expect(screen.getByText("Remoto")).toBeInTheDocument();

    expect(screen.getByText("Frontend")).toBeInTheDocument();

    expect(screen.getByText("Ciudad de México, México")).toBeInTheDocument();

    expect(screen.getByText("21 días para el cierre")).toBeInTheDocument();

    expect(screen.getByText("USD 1,000 - 2,000 / mes")).toBeInTheDocument();

    expect(screen.queryByText("9 postulaciones")).not.toBeInTheDocument();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/jobs/frontend-engineer",
    );
  });

  it("renders recruiter information and applicant count for owned vacancies", () => {
    render(
      <VacancyRow
        vacancy={{
          ...vacancy,
          applications_count: 9,
        }}
        mine
      />,
    );

    expect(screen.getByText("9 postulaciones")).toBeInTheDocument();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/recruiter/vacancies/v1/applicants",
    );
  });

  it("renders the closed state instead of remaining days", () => {
    render(
      <VacancyRow
        vacancy={{
          ...vacancy,
          status: "cerrada",
          days_to_close: 0,
        }}
      />,
    );

    expect(screen.getByText("Vacante cerrada")).toBeInTheDocument();

    expect(screen.queryByText(/días para el cierre/)).not.toBeInTheDocument();
  });

  it("renders the closing-today state when days_to_close is zero", () => {
    render(
      <VacancyRow
        vacancy={{
          ...vacancy,
          status: "abierta",
          days_to_close: 0,
        }}
      />,
    );

    expect(screen.getByText("Cierra hoy")).toBeInTheDocument();
  });

  it("renders custom actions when they are provided", () => {
    render(
      <VacancyRow
        vacancy={vacancy}
        mine
        actions={
          <>
            <button type="button">Editar</button>
            <button type="button">Cerrar</button>
          </>
        }
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Editar",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cerrar",
      }),
    ).toBeInTheDocument();
  });

  it("falls back to the original area and modality values when translations are unavailable", () => {
    render(
      <VacancyRow
        vacancy={{
          ...vacancy,
          area: "otra-area",
          modality: "otra-modalidad",
        }}
      />,
    );

    expect(screen.getByText("otra-area")).toBeInTheDocument();

    expect(screen.getByText("otra-modalidad")).toBeInTheDocument();
  });
});

describe("JobsSkeleton", () => {
  it("renders the requested number of skeleton rows", () => {
    const { container } = render(<JobsSkeleton count={3} />);

    expect(screen.getByLabelText("Cargando vacantes")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(15);
  });

  it("uses the default number of skeleton rows", () => {
    const { container } = render(<JobsSkeleton />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(25);
  });
});

describe("JobsError", () => {
  it("renders the error state and retries when requested", () => {
    const onRetry = vi.fn();

    render(<JobsError onRetry={onRetry} />);

    expect(
      screen.getByText("No pudimos cargar las vacantes."),
    ).toBeInTheDocument();

    expect(screen.getByText("Inténtalo de nuevo.")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reintentar",
      }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("EmptyJobs", () => {
  it("renders the empty state without an action", () => {
    render(<EmptyJobs />);

    expect(
      screen.getByText("No encontramos vacantes con esos filtros."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Prueba otra área, modalidad o búsqueda."),
    ).toBeInTheDocument();
  });

  it("renders the optional action", () => {
    render(
      <EmptyJobs action={<button type="button">Limpiar filtros</button>} />,
    );

    expect(
      screen.getByRole("button", {
        name: "Limpiar filtros",
      }),
    ).toBeInTheDocument();
  });
});

describe("UnverifiedNotice", () => {
  it("renders the default warning", () => {
    render(<UnverifiedNotice />);

    expect(screen.getByText("Empresa sin verificar")).toBeInTheDocument();

    expect(screen.getByText("No envíes dinero.")).toBeInTheDocument();
  });

  it("renders custom warning content", () => {
    render(
      <UnverifiedNotice>
        Verifica la identidad de la empresa antes de continuar.
      </UnverifiedNotice>,
    );

    expect(
      screen.getByText(
        "Verifica la identidad de la empresa antes de continuar.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Empresa sin verificar")).toBeInTheDocument();

    expect(screen.queryByText("No envíes dinero.")).not.toBeInTheDocument();
  });
});

describe("SuccessMessage", () => {
  it("renders the provided success message", () => {
    render(
      <SuccessMessage>
        Tu postulación fue enviada correctamente.
      </SuccessMessage>,
    );

    expect(
      screen.getByText("Tu postulación fue enviada correctamente."),
    ).toBeInTheDocument();
  });
});
