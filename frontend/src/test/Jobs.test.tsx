import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import Jobs from "@/pages/Jobs";
import type { Vacancy } from "@/types/vacancy";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  refetch: vi.fn(),
  useVacancies: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        "jobTalent.back": "Regresar",
        "jobTalent.pageTitle": "Encuentra tu próxima oportunidad",
        "jobTalent.pageDescription":
        "Vacantes verificables por contrato, proyectos que buscan talento con criterio.",
        "jobTalent.filters.label": "Filtros de búsqueda",
        "jobTalent.filters.searchLabel": "Buscar vacantes",
        "jobTalent.filters.searchPlaceholder": "Buscar por puesto o empresa",
        "jobTalent.filters.areaLabel": "Área",
        "jobTalent.filters.allAreas": "Todas las áreas",
        "jobTalent.filters.modalityLabel": "Modalidad",
        "jobTalent.filters.allModalities": "Todas las modalidades",
        "jobTalent.filters.clear": "Limpiar filtros",
        "jobTalent.loading": "Cargando vacantes...",
        "jobTalent.open": `${options?.count ?? 0} vacantes abiertas`,
      };

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
  Search: () => <span data-testid="search-icon" />,
  SlidersHorizontal: () => <span data-testid="sliders-icon" />,
  X: () => <span data-testid="x-icon" />,
  ArrowLeft: () => <span data-testid="arrow-left-icon" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/select", () => {
  const Select = ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div data-testid="select" data-value={value}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) {
          return child;
        }

        return React.cloneElement(
          child as React.ReactElement<{
            onValueChange?: (value: string) => void;
          }>,
          {
            onValueChange,
          },
        );
      })}
    </div>
  );

  const SelectTrigger = ({
    children,
    onValueChange,
    ...props
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <button
      type="button"
      data-testid="select-trigger"
      onClick={() => onValueChange?.("frontend")}
      {...props}
    >
      {children}
    </button>
  );

  const SelectValue = ({ placeholder }: { placeholder?: string }) => (
    <span>{placeholder}</span>
  );

  const SelectContent = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );

  const SelectItem = ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange?: (value: string) => void;
  }) => (
    <button
      type="button"
      data-testid={`select-item-${value}`}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  );

  return {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  };
});

vi.mock("@/components/profile/palette", () => ({
  P: {
    textMuted: "#777",
    textPrimary: "#fff",
    textSecondary: "#aaa",
    border: "#444",
    borderSub: "#333",
    surface: "#111",
    card: "#181818",
    textPlaceholder: "#888",
  },
}));

vi.mock("@/hooks/useVacancies", () => ({
  useVacancies: mocks.useVacancies,
}));

vi.mock("@/components/jobs", () => ({
  JobShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="job-shell">{children}</div>
  ),

  JobsSkeleton: () => <div data-testid="jobs-skeleton">Loading skeleton</div>,

  JobsError: ({ onRetry }: { onRetry: () => void }) => (
    <div>
      <span data-testid="jobs-error">Error</span>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  ),

  EmptyJobs: () => <div data-testid="empty-jobs">No hay vacantes</div>,

  VacancyRow: ({ vacancy }: { vacancy: Vacancy }) => (
    <div data-testid={`vacancy-${vacancy.id}`}>{vacancy.position}</div>
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
}));

const vacancy1: Vacancy = {
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
  description: "Construir interfaces modernas.",
  requirements: ["React", "TypeScript"],
};

const vacancy2: Vacancy = {
  ...vacancy1,
  id: "2",
  slug: "backend-engineer",
  position: "Backend Engineer",
  company: "Tech Company",
  area: "backend",
};

beforeEach(() => {
  vi.clearAllMocks();

  mocks.useVacancies.mockReturnValue({
    data: {
      vacancies: [vacancy1, vacancy2],
    },
    isPending: false,
    isError: false,
    refetch: mocks.refetch,
  });
});

describe("Jobs", () => {
  it("renderiza el encabezado y los filtros", () => {
    render(<Jobs />);

    expect(
      screen.getByText("Encuentra tu próxima oportunidad"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Vacantes verificables por contrato, proyectos que buscan talento con criterio.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Buscar por puesto o empresa"),
    ).toBeInTheDocument();

    expect(screen.getAllByTestId("select")).toHaveLength(2);
  });

  it("muestra las vacantes cuando la petición es exitosa", () => {
    render(<Jobs />);

    expect(screen.getByTestId("vacancy-1")).toHaveTextContent(
      "Frontend Engineer",
    );

    expect(screen.getByTestId("vacancy-2")).toHaveTextContent(
      "Backend Engineer",
    );

    expect(screen.getByText("2 vacantes abiertas")).toBeInTheDocument();
  });

  it("envía los filtros iniciales al hook", () => {
    render(<Jobs />);

    expect(mocks.useVacancies).toHaveBeenCalledWith({
      q: "",
      area: undefined,
      modalidad: undefined,
    });
  });

  it("actualiza el filtro de búsqueda", async () => {
    render(<Jobs />);

    const input = screen.getByPlaceholderText("Buscar por puesto o empresa");

    fireEvent.change(input, {
      target: {
        value: "React",
      },
    });

    await waitFor(() => {
      expect(mocks.useVacancies).toHaveBeenLastCalledWith({
        q: "React",
        area: undefined,
        modalidad: undefined,
      });
    });
  });

  it("muestra el estado de loading", () => {
    mocks.useVacancies.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: mocks.refetch,
    });

    render(<Jobs />);

    expect(screen.getByTestId("jobs-skeleton")).toBeInTheDocument();
  });

  it("muestra el estado de error", () => {
    mocks.useVacancies.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mocks.refetch,
    });

    render(<Jobs />);

    expect(screen.getByTestId("jobs-error")).toBeInTheDocument();
  });

  it("ejecuta refetch al reintentar después de un error", () => {
    mocks.useVacancies.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mocks.refetch,
    });

    render(<Jobs />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Reintentar",
      }),
    );

    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });

  it("muestra el estado vacío cuando no existen vacantes", () => {
    mocks.useVacancies.mockReturnValue({
      data: {
        vacancies: [],
      },
      isPending: false,
      isError: false,
      refetch: mocks.refetch,
    });

    render(<Jobs />);

    expect(screen.getByTestId("empty-jobs")).toBeInTheDocument();

    expect(screen.getByText("0 vacantes abiertas")).toBeInTheDocument();
  });

  it("muestra el botón para limpiar cuando existen filtros activos", () => {
    render(<Jobs />);

    const input = screen.getByPlaceholderText("Buscar por puesto o empresa");

    fireEvent.change(input, {
      target: {
        value: "React",
      },
    });

    expect(
      screen.getByRole("button", {
        name: "Limpiar filtros",
      }),
    ).toBeInTheDocument();

    expect(screen.queryByTestId("sliders-icon")).not.toBeInTheDocument();
  });

  it("limpia todos los filtros", async () => {
    render(<Jobs />);

    const input = screen.getByPlaceholderText("Buscar por puesto o empresa");

    fireEvent.change(input, {
      target: {
        value: "React",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpiar filtros",
      }),
    );

    await waitFor(() => {
      expect(input).toHaveValue("");

      expect(mocks.useVacancies).toHaveBeenLastCalledWith({
        q: "",
        area: undefined,
        modalidad: undefined,
      });
    });
  });

  it("navega hacia atrás al pulsar Regresar", () => {
    render(<Jobs />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Regresar",
      }),
    );

    expect(mocks.navigate).toHaveBeenCalledWith(-1);
  });

  it("renderiza el icono de filtros cuando no existen filtros activos", () => {
    render(<Jobs />);

    expect(screen.getByTestId("sliders-icon")).toBeInTheDocument();
  });

  it("renderiza correctamente múltiples vacantes", () => {
    render(<Jobs />);

    expect(screen.getAllByTestId(/vacancy-/)).toHaveLength(2);
  });
});
