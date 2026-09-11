import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMyVacancies, useVacancies } from "@/hooks/useVacancies";
import {
  useCloseVacancy,
  useCreateVacancy,
  useUpdateVacancy,
} from "@/hooks/useCreateVacancy";
import {
  useMyApplications,
  useUpdateApplicationStatus,
  useVacancyApplications,
} from "@/hooks/useVacancyApplications";
import { useApplyToVacancy } from "@/hooks/useApplyToVacancy";
import { useVacancyDetail } from "@/hooks/useVacancyDetail";
import { vacancyService } from "@/services/vacancyService";
import type { VacancyPayload } from "@/types/vacancy";

vi.mock("@/services/vacancyService", () => ({
  vacancyService: {
    list: vi.fn(),
    listMine: vi.fn(),
    getBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    close: vi.fn(),
    apply: vi.fn(),
    listMyApplications: vi.fn(),
    listApplications: vi.fn(),
    updateApplicationStatus: vi.fn(),
  },
}));

const service = vi.mocked(vacancyService);

const payload: VacancyPayload = {
  position: "Frontend Engineer",
  company: "HackChain",
  area: "frontend",
  modality: "remoto",
  country: "",
  city: "",
  salary_min: 1000,
  salary_max: 2000,
  salary_currency: "USD",
  salary_period: "mes",
  description:
    "Una descripción suficientemente larga para publicar esta vacante.",
  requirements: ["React", "TypeScript"],
  closing_date: "2026-10-01",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper, queryClient };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("vacancy query hooks", () => {
  it("lists public vacancies with area, modality and search filters", async () => {
    const response = { vacancies: [{ id: "v1" }] };
    service.list.mockResolvedValue(response as never);
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useVacancies({ area: "frontend", modalidad: "remoto", q: "React" }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(service.list).toHaveBeenCalledWith({
      area: "frontend",
      modalidad: "remoto",
      q: "React",
    });
    expect(result.current.data).toEqual(response);
  });

  it("exposes loading and error states for public vacancies", async () => {
    service.list.mockRejectedValue(new Error("network error"));
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVacancies(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    });
    expect(result.current.error).toEqual(new Error("network error"));
  });
  it("loads own vacancies", async () => {
    const response = {
      vacancies: [
        {
          id: "v1",
          position: "Frontend Engineer",
        },
      ],
    };

    service.listMine.mockResolvedValue(response as never);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMyVacancies(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(service.listMine).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(response);
  });

  it("loads a public vacancy detail", async () => {
    service.getBySlug.mockResolvedValue({
      vacancy: { slug: "frontend-hackchain" },
    } as never);

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useVacancyDetail("frontend-hackchain"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(service.getBySlug).toHaveBeenCalledWith("frontend-hackchain");
    expect(result.current.data).toEqual({
      vacancy: { slug: "frontend-hackchain" },
    });
  });

  it("exposes an error when loading own vacancies fails", async () => {
    service.listMine.mockRejectedValue(new Error("network error"));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useMyVacancies(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    });

    expect(result.current.error).toEqual(new Error("network error"));
  });

  it("lists public vacancies without filters", async () => {
    const response = { vacancies: [{ id: "v1" }] };
    service.list.mockResolvedValue(response as never);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useVacancies(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(service.list).toHaveBeenCalledWith({});
    expect(result.current.data).toEqual(response);
  });
});
describe("useVacancyDetail", () => {
  it("loads a public vacancy detail", async () => {
    const response = {
      vacancy: {
        slug: "frontend-hackchain",
        position: "Frontend Engineer",
      },
    };

    service.getBySlug.mockResolvedValue(response as never);

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useVacancyDetail("frontend-hackchain"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(service.getBySlug).toHaveBeenCalledWith("frontend-hackchain");
    expect(result.current.data).toEqual(response);
  });

  it("does not fetch vacancy detail when slug is undefined", async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useVacancyDetail(undefined), {
      wrapper,
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => {
      expect(service.getBySlug).not.toHaveBeenCalled();
    });
  });

  it("exposes an error when loading vacancy detail fails", async () => {
    service.getBySlug.mockRejectedValue(new Error("vacancy not found"));

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useVacancyDetail("frontend-hackchain"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    });

    expect(result.current.error).toEqual(new Error("vacancy not found"));
  });
});

describe("vacancy mutation hooks", () => {
  it("creates a vacancy with the exact payload and invalidates own vacancies", async () => {
    service.create.mockResolvedValue({
      id: "v1",
    } as never);

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateVacancy(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(service.create).toHaveBeenCalledWith(payload);

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["my-vacancies"],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("reports an error when creating a vacancy fails", async () => {
    service.create.mockRejectedValue(new Error("cannot create vacancy"));

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateVacancy(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(payload)).rejects.toThrow(
        "cannot create vacancy",
      );
    });

    expect(service.create).toHaveBeenCalledWith(payload);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("updates a vacancy and invalidates related queries", async () => {
    service.update.mockResolvedValue({
      id: "v1",
    } as never);

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateVacancy(), { wrapper });

    const update = {
      position: "Senior Frontend Engineer",
      requirements: ["React", "Vitest"],
    };

    await act(async () => {
      await result.current.mutateAsync({
        id: "v1",
        payload: update,
      });
    });

    expect(service.update).toHaveBeenCalledWith("v1", update);

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["my-vacancies"],
    });

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["vacancy"],
    });

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["vacancy-applications", "v1"],
    });

    expect(invalidate).toHaveBeenCalledTimes(3);
  });

  it("reports an error when updating a vacancy fails", async () => {
    service.update.mockRejectedValue(new Error("cannot update vacancy"));

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateVacancy(), { wrapper });

    const update = {
      position: "Senior Frontend Engineer",
    };

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "v1",
          payload: update,
        }),
      ).rejects.toThrow("cannot update vacancy");
    });

    expect(service.update).toHaveBeenCalledWith("v1", update);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("closes a vacancy and invalidates related queries", async () => {
    service.close.mockResolvedValue({
      id: "v1",
    } as never);

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCloseVacancy(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("v1");
    });

    expect(service.close).toHaveBeenCalledWith("v1");

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["my-vacancies"],
    });

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["vacancy"],
    });

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["vacancy-applications", "v1"],
    });

    expect(invalidate).toHaveBeenCalledTimes(3);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("reports mutation errors when closing a vacancy fails", async () => {
    service.close.mockRejectedValue(new Error("cannot close"));

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCloseVacancy(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync("v1")).rejects.toThrow(
        "cannot close",
      );
    });

    expect(service.close).toHaveBeenCalledWith("v1");
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("applies to a vacancy with selected certificates and message", async () => {
    service.apply.mockResolvedValue({
      application: {
        id: "a1",
      },
    } as never);

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useApplyToVacancy("v1"), { wrapper });

    const application = {
      shared_certificates: ["42", "43"],
      message: "Me interesa la posición.",
    };

    await act(async () => {
      await result.current.mutateAsync(application);
    });

    expect(service.apply).toHaveBeenCalledWith("v1", application);

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["my-applications"],
    });

    expect(invalidate).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("reports an error when applying to a vacancy fails", async () => {
    service.apply.mockRejectedValue(new Error("cannot apply to vacancy"));

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useApplyToVacancy("v1"), { wrapper });

    const application = {
      shared_certificates: ["42"],
      message: "Me interesa la posición.",
    };

    await act(async () => {
      await expect(result.current.mutateAsync(application)).rejects.toThrow(
        "cannot apply to vacancy",
      );
    });

    expect(service.apply).toHaveBeenCalledWith("v1", application);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidate).not.toHaveBeenCalled();
  });
});

describe("useVacancyApplications", () => {
  it("loads applicants for a vacancy", async () => {
    const response = {
      applications: [
        {
          id: "a1",
          status: "contactado",
        },
      ],
    };

    service.listApplications.mockResolvedValue(response as never);

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useVacancyApplications("v1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(service.listApplications).toHaveBeenCalledWith("v1");

    expect(result.current.data).toEqual(response);
  });

  it("does not fetch applicants when vacancyId is undefined", async () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useVacancyApplications(undefined), {
      wrapper,
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() =>
      expect(service.listApplications).not.toHaveBeenCalled(),
    );
  });

  it("exposes an error when loading vacancy applicants fails", async () => {
    service.listApplications.mockRejectedValue(
      new Error("cannot load applicants"),
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useVacancyApplications("v1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    });

    expect(result.current.error).toEqual(new Error("cannot load applicants"));
  });
});

describe("application query and mutation hooks", () => {
  it("loads my applications and vacancy applicants", async () => {
    service.listMyApplications.mockResolvedValue({ applications: [] });
    service.listApplications.mockResolvedValue({ applications: [] });
    const mine = renderHook(() => useMyApplications(), {
      wrapper: createWrapper().wrapper,
    });
    const applicants = renderHook(() => useVacancyApplications("v1"), {
      wrapper: createWrapper().wrapper,
    });

    await waitFor(() => expect(mine.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(applicants.result.current.isSuccess).toBe(true));
    expect(service.listMyApplications).toHaveBeenCalledTimes(1);
    expect(service.listApplications).toHaveBeenCalledWith("v1");
  });

  it("updates application status and invalidates both application lists", async () => {
    service.updateApplicationStatus.mockResolvedValue({
      application: { id: "a1", status: "contactado" },
    } as never);
    const { wrapper, queryClient } = createWrapper();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateApplicationStatus("v1"), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ id: "a1", status: "contactado" });
    });
    expect(service.updateApplicationStatus).toHaveBeenCalledWith(
      "a1",
      "contactado",
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ["vacancy-applications", "v1"],
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["my-applications"] });
  });
  it("exposes an error when loading my applications fails", async () => {
    service.listMyApplications.mockRejectedValue(
      new Error("cannot load my applications"),
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useMyApplications(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 3000,
    });

    expect(result.current.error).toEqual(
      new Error("cannot load my applications"),
    );
  });
  it("reports an error when updating application status fails", async () => {
    service.updateApplicationStatus.mockRejectedValue(
      new Error("cannot update application status"),
    );

    const { wrapper, queryClient } = createWrapper();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateApplicationStatus("v1"), {
      wrapper,
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          id: "a1",
          status: "contactado",
        }),
      ).rejects.toThrow("cannot update application status");
    });

    expect(service.updateApplicationStatus).toHaveBeenCalledWith(
      "a1",
      "contactado",
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(invalidate).not.toHaveBeenCalled();
  });
  it("updates an application to discarded status", async () => {
    service.updateApplicationStatus.mockResolvedValue({
      application: {
        id: "a1",
        status: "descartada",
      },
    } as never);

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateApplicationStatus("v1"), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "a1",
        status: "descartada",
      });
    });

    expect(service.updateApplicationStatus).toHaveBeenCalledWith(
      "a1",
      "descartada",
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
