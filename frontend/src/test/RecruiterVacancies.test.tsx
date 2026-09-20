import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RecruiterVacancies from "@/pages/RecruiterVacancies";

const mockNavigate = vi.fn();

const mockCreate = {
  mutate: vi.fn(),
  isPending: false,
};

const mockUpdate = {
  mutate: vi.fn(),
  isPending: false,
};

const mockClose = {
  mutate: vi.fn(),
  isPending: false,
};

const mockRefetch = vi.fn();

const mockUseMyVacancies = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "vacancyRecruiter.backToDashboard": "Regresar al dashboard",
        "vacancyRecruiter.eyebrow": "Vacantes",
        "vacancyRecruiter.title": "Mis vacantes",

        "vacancyRecruiter.buttons.publish": "Publicar vacante",
        "vacancyRecruiter.buttons.publishFirst": "Publicar mi primera vacante",
        "vacancyRecruiter.buttons.edit": "Editar",
        "vacancyRecruiter.buttons.close": "Cerrar",
        "vacancyRecruiter.buttons.closing": "Cerrando...",

        "vacancyRecruiter.limit.message":
          "Has alcanzado el límite de 5 vacantes abiertas.",

        "vacancyRecruiter.sections.active": "Activas",
        "vacancyRecruiter.sections.history": "Historial",
        "vacancyRecruiter.sections.closed": "Vacantes cerradas",

        "vacancyRecruiter.empty.title": "Aún no tienes vacantes",
        "vacancyRecruiter.empty.description":
          "Publica tu primera vacante para comenzar a encontrar talento.",
      };

      return translations[key] ?? key;
    },
  }),
}));

vi.mock("lucide-react", () => ({
  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="plus-icon" {...props} />
  ),
  Users: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="users-icon" {...props} />
  ),
  Pencil: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="pencil-icon" {...props} />
  ),
  LockKeyhole: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="lock-icon" {...props} />
  ),
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="arrow-left-icon" {...props} />
  ),
  BriefcaseBusiness: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="briefcase-icon" {...props} />
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
  EmptyJobs: ({ action }: { action?: React.ReactNode }) => (
    <div data-testid="empty-jobs">
      <p>No hay vacantes.</p>
      {action}
    </div>
  ),

  JobsError: ({ onRetry }: { onRetry: () => void }) => (
    <div data-testid="jobs-error">
      <span>Error al cargar.</span>
      <button onClick={onRetry}>Reintentar</button>
    </div>
  ),

  JobsSkeleton: ({ count }: { count?: number }) => (
    <div data-testid="jobs-skeleton">Skeleton {count ?? ""}</div>
  ),

  VacancyRow: ({
    vacancy,
    actions,
  }: {
    vacancy: {
      id: number;
      position: string;
      company: string;
      status: string;
    };
    actions?: React.ReactNode;
  }) => (
    <div data-testid={`vacancy-row-${vacancy.id}`}>
      <span>{vacancy.position}</span>
      <span>{vacancy.company}</span>
      <span>{vacancy.status}</span>
      {actions}
    </div>
  ),
}));

vi.mock("@/components/jobs/VacancyForm", () => ({
  VacancyForm: ({
    vacancy,
    busy,
    onSubmit,
    onCancel,
  }: {
    vacancy?: unknown;
    busy: boolean;
    onSubmit: (payload: unknown) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="vacancy-form">
      <span>{vacancy ? "Editando vacante" : "Creando vacante"}</span>

      <span>{busy ? "Guardando..." : "Listo"}</span>

      <button
        type="button"
        onClick={() => onSubmit({ position: "Frontend Developer" })}
      >
        Guardar formulario
      </button>

      <button type="button" onClick={onCancel}>
        Cancelar formulario
      </button>
    </div>
  ),
}));

vi.mock("@/hooks/useVacancies", () => ({
  useMyVacancies: () => mockUseMyVacancies(),
}));

vi.mock("@/hooks/useCreateVacancy", () => ({
  useCreateVacancy: () => mockCreate,
  useUpdateVacancy: () => mockUpdate,
  useCloseVacancy: () => mockClose,
}));

const openVacancy = {
  id: 1,
  position: "Frontend Developer",
  company: "HackChain",
  status: "abierta",
};

const secondOpenVacancy = {
  id: 2,
  position: "Backend Developer",
  company: "Tech Company",
  status: "abierta",
};

const closedVacancy = {
  id: 3,
  position: "Full Stack Developer",
  company: "Closed Company",
  status: "cerrada",
};

const fiveOpenVacancies = [
  openVacancy,
  secondOpenVacancy,
  {
    id: 4,
    position: "React Developer",
    company: "Company 3",
    status: "abierta",
  },
  {
    id: 5,
    position: "Java Developer",
    company: "Company 4",
    status: "abierta",
  },
  {
    id: 6,
    position: "Python Developer",
    company: "Company 5",
    status: "abierta",
  },
];

function renderPage() {
  return render(<RecruiterVacancies />);
}

describe("RecruiterVacancies", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreate.isPending = false;
    mockUpdate.isPending = false;
    mockClose.isPending = false;

    mockUseMyVacancies.mockReturnValue({
      data: {
        vacancies: [openVacancy, closedVacancy],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });
  });

  it("renderiza el encabezado y el contador de vacantes abiertas", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Mis vacantes" }),
    ).toBeInTheDocument();

    const counter = screen.getByText("de 5 abiertas").parentElement;

    expect(counter).toHaveTextContent("1");
    expect(counter).toHaveTextContent("de 5 abiertas");
  });

  it("permite regresar al dashboard del recruiter", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Regresar al dashboard/i,
      }),
    );

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/recruiter");
  });

  it("muestra el estado de loading", () => {
    mockUseMyVacancies.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByTestId("jobs-skeleton")).toBeInTheDocument();
  });

  it("muestra el estado de error y permite reintentar", () => {
    mockUseMyVacancies.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByTestId("jobs-error")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("muestra el estado vacío cuando no existen vacantes", () => {
    mockUseMyVacancies.mockReturnValue({
      data: { vacancies: [] },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    expect(screen.getByText("Aún no tienes vacantes")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Publica tu primera vacante para comenzar a encontrar talento.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Publicar mi primera vacante",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Publicar mi primera vacante")).toBeInTheDocument();
  });

  it("muestra las vacantes abiertas en la sección de activas", () => {
    renderPage();

    expect(screen.getByText("Activas")).toBeInTheDocument();

    expect(screen.getByTestId("vacancy-row-1")).toBeInTheDocument();

    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("muestra las vacantes cerradas en el historial", () => {
    renderPage();

    expect(screen.getByText("Historial")).toBeInTheDocument();

    expect(screen.getByText("Vacantes cerradas")).toBeInTheDocument();

    expect(screen.getByTestId("vacancy-row-3")).toBeInTheDocument();

    expect(screen.getByText("Full Stack Developer")).toBeInTheDocument();
  });

  it("muestra el botón de publicar cuando existen vacantes", () => {
    renderPage();

    expect(
      screen.getByRole("button", {
        name: "Publicar vacante",
      }),
    ).toBeInTheDocument();
  });

  it("abre el formulario para publicar una nueva vacante", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Publicar vacante",
      }),
    );

    expect(screen.getByTestId("vacancy-form")).toBeInTheDocument();

    expect(screen.getByText("Creando vacante")).toBeInTheDocument();
  });

  it("permite cancelar el formulario", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Publicar vacante",
      }),
    );

    expect(screen.getByTestId("vacancy-form")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancelar formulario",
      }),
    );

    expect(screen.queryByTestId("vacancy-form")).not.toBeInTheDocument();
  });

  it("permite editar una vacante abierta", () => {
    renderPage();

    const editButtons = screen.getAllByRole("button", {
      name: "Editar",
    });

    expect(editButtons).toHaveLength(1);

    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId("vacancy-form")).toBeInTheDocument();

    expect(screen.getByText("Editando vacante")).toBeInTheDocument();
  });

  it("actualiza una vacante existente al guardar el formulario", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Editar",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Guardar formulario",
      }),
    );

    expect(mockUpdate.mutate).toHaveBeenCalledTimes(1);

    expect(mockUpdate.mutate).toHaveBeenCalledWith(
      {
        id: openVacancy.id,
        payload: {
          position: "Frontend Developer",
        },
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("crea una nueva vacante al guardar el formulario", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Publicar vacante",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Guardar formulario",
      }),
    );

    expect(mockCreate.mutate).toHaveBeenCalledTimes(1);

    expect(mockCreate.mutate).toHaveBeenCalledWith(
      {
        position: "Frontend Developer",
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
    );
  });

  it("permite cerrar una vacante abierta", () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cerrar",
      }),
    );

    expect(mockClose.mutate).toHaveBeenCalledTimes(1);
    expect(mockClose.mutate).toHaveBeenCalledWith(openVacancy.id);
  });

  it("muestra el estado de cierre mientras la mutación está pendiente", () => {
    mockClose.isPending = true;

    renderPage();

    expect(
      screen.getByRole("button", {
        name: "Cerrando...",
      }),
    ).toBeDisabled();
  });

  it("deshabilita publicar cuando existen 5 vacantes abiertas", () => {
    mockUseMyVacancies.mockReturnValue({
      data: {
        vacancies: fiveOpenVacancies,
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    const counter = screen.getByText("de 5 abiertas").parentElement;

    expect(counter).toHaveTextContent("5");
    expect(counter).toHaveTextContent("de 5 abiertas");

    const publishButton = screen.getByRole("button", {
      name: "Publicar vacante",
    });

    expect(publishButton).toBeDisabled();

    expect(
      screen.getByText("Has alcanzado el límite de 5 vacantes abiertas."),
    ).toBeInTheDocument();
  });

  it("mantiene habilitado publicar cuando hay menos de 5 vacantes abiertas", () => {
    mockUseMyVacancies.mockReturnValue({
      data: {
        vacancies: [openVacancy, secondOpenVacancy],
      },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    const publishButton = screen.getByRole("button", {
      name: "Publicar vacante",
    });

    expect(publishButton).not.toBeDisabled();
  });

  it("no muestra el botón principal de publicar cuando no existen vacantes", () => {
    mockUseMyVacancies.mockReturnValue({
      data: { vacancies: [] },
      isPending: false,
      isError: false,
      refetch: mockRefetch,
    });

    renderPage();

    expect(
      screen.queryByRole("button", {
        name: "Publicar vacante",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Publicar mi primera vacante",
      }),
    ).toBeInTheDocument();
  });

  it("no muestra el botón de cerrar en una vacante cerrada", () => {
    renderPage();

    const rows = screen.getAllByTestId(/vacancy-row-/);

    expect(rows).toHaveLength(2);

    expect(
      screen.getAllByRole("button", {
        name: "Cerrar",
      }),
    ).toHaveLength(1);
  });

  it("muestra el formulario ocupado cuando crear está pendiente", () => {
    mockCreate.isPending = true;

    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Publicar vacante",
      }),
    );

    expect(screen.getByText("Guardando...")).toBeInTheDocument();
  });

  it("muestra el formulario ocupado cuando actualizar está pendiente", () => {
    mockUpdate.isPending = true;

    renderPage();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Editar",
      }),
    );

    expect(screen.getByText("Guardando...")).toBeInTheDocument();
  });
});
