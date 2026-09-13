import { useState } from "react";
import {
  Plus,
  Users,
  Pencil,
  LockKeyhole,
  ArrowLeft,
  BriefcaseBusiness,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCloseVacancy,
  useCreateVacancy,
  useUpdateVacancy,
} from "@/hooks/useCreateVacancy";
import { useMyVacancies } from "@/hooks/useVacancies";
import { JobShell } from "@/components/jobs/JobShell";
import {
  EmptyJobs,
  JobsError,
  JobsSkeleton,
  VacancyRow,
} from "@/components/jobs/JobPrimitives";
import { useNavigate } from "react-router-dom";
import { VacancyForm } from "@/components/jobs/VacancyForm";
import type { Vacancy, VacancyPayload } from "@/types/vacancy";
import { P } from "@/components/profile/palette";
import { useTranslation } from "react-i18next";

export default function RecruiterVacancies() {
  const { data, isPending, isError, refetch } = useMyVacancies();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const create = useCreateVacancy();
  const update = useUpdateVacancy();
  const close = useCloseVacancy();

  const [editing, setEditing] = useState<Vacancy | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const vacancies = data?.vacancies ?? [];

  const openVacancies = vacancies.filter(
    (vacancy) => vacancy.status === "abierta",
  );

  const closedVacancies = vacancies.filter(
    (vacancy) => vacancy.status === "cerrada",
  );

  const openCount = openVacancies.length;

  const resetFormState = () => {
    setFormError(null);
    setFormSuccess(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(undefined);
    resetFormState();
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }

    return "Ocurrió un error inesperado. Intenta nuevamente.";
  };

  const save = (payload: VacancyPayload | Partial<VacancyPayload>) => {
    resetFormState();

    if (editing) {
      update.mutate(
        {
          id: editing.id,
          payload,
        },
        {
          onSuccess: () => {
            setEditing(undefined);
            setShowForm(false);
          },
        },
      );
    } else {
      create.mutate(payload as VacancyPayload, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleStartCreate = () => {
    resetFormState();
    setEditing(undefined);
    setShowForm(true);
  };

  const handleStartEdit = (vacancy: Vacancy) => {
    resetFormState();
    setEditing(vacancy);
    setShowForm(true);
  };

  return (
    <JobShell>
      {/* Regresar */}
      <button
        type="button"
        onClick={() => navigate("/dashboard/recruiter")}
        className="
          group
          mb-7
          inline-flex
          items-center
          gap-2
          font-body
          text-sm
          font-medium
          transition-all
          duration-200
          hover:-translate-x-0.5
          hover:text-white
        "
        style={{ color: P.textMuted }}
      >
        <ArrowLeft
          className="
            h-4 w-4
            transition-transform
            duration-200
            group-hover:-translate-x-0.5
          "
        />

        {t("vacancyRecruiter.backToDashboard")}
      </button>

      {/* Encabezado */}
      <header
        className="
          mb-8
          flex
          flex-col
          gap-5
          border-b
          pb-7
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
        style={{ borderColor: P.borderSub }}
      >
        <div>
          {/* Eyebrow */}
          <p
            className="
              font-body
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
            "
            style={{ color: P.accent }}
          >
            {t("vacancyRecruiter.eyebrow")}
          </p>

          {/* Título */}
          <h1
            className="
              mt-3
              font-title
              text-2xl
              font-bold
              leading-tight
              tracking-tight
              sm:text-3xl
              md:text-4xl
            "
            style={{ color: P.textPrimary }}
          >
            <span className="text-white">
              {t("vacancyRecruiter.title")}
            </span>
          </h1>

          {/* Contador */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="h-1.5 w-20 overflow-hidden rounded-full"
              style={{ backgroundColor: P.accentSoft }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(openCount / 5) * 100}%`,
                  backgroundColor: P.accent,
                }}
              />
            </div>

            <span
              className="font-body text-sm font-medium"
              style={{ color: P.textSecondary }}
            >
              <span
                className="font-bold"
                style={{ color: P.textPrimary }}
              >
                {openCount}
              </span>{" "}
              de 5 abiertas
            </span>
          </div>
        </div>

        {/* Publicar vacante */}
        {vacancies.length > 0 && (
          <Button
            type="button"
            onClick={handleStartCreate}
            disabled={openCount >= 5 || showForm}
            className="
              min-h-11
              gap-2
              rounded-xl
              border
              border-purple-400/50
              bg-purple-500/15
              px-5
              font-body
              text-sm
              font-semibold
              text-purple-100
              shadow-[0_0_20px_rgba(168,85,247,0.10)]
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-purple-300/70
              hover:bg-purple-500/25
              hover:text-white
              hover:shadow-[0_0_24px_rgba(168,85,247,0.25)]
              active:translate-y-0
              active:scale-[0.98]
              disabled:pointer-events-none
              disabled:opacity-50
            "
          >
            <Plus className="h-4 w-4" />

            {t("vacancyRecruiter.buttons.publish")}
          </Button>
        )}
      </header>

      {/* Límite de vacantes */}
      {openCount >= 5 && (
        <p
          className="
            mb-7
            border-b
            pb-4
            font-body
            text-sm
            font-medium
          "
          style={{
            borderColor: P.borderSub,
            color: P.amber,
          }}
        >
          {t("vacancyRecruiter.limit.message")}
        </p>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="mb-9">
          <VacancyForm
            vacancy={editing}
            busy={create.isPending || update.isPending}
            onSubmit={save}
            onCancel={() => {
              setShowForm(false);
              setEditing(undefined);
            }}
          />
        </div>
      )}

      {/* Estados */}
      {isPending ? (
        <JobsSkeleton />
      ) : isError ? (
        <JobsError onRetry={() => void refetch()} />
      ) : vacancies.length === 0 ? (
        <div className="py-16 text-center">
          {/* Icono */}
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
            "
            style={{
              backgroundColor: P.accentSoft,
              borderColor: P.accentBorder,
              color: P.accent,
            }}
          >
            <BriefcaseBusiness className="h-6 w-6" />
          </div>

          {/* Título vacío */}
          <h2
            className="
              mt-5
              font-title
              text-xl
              font-bold
              tracking-tight
            "
            style={{ color: P.textPrimary }}
          >
            {t("vacancyRecruiter.empty.title")}
          </h2>

          {/* Descripción */}
          <p
            className="
              mx-auto
              mt-2
              max-w-md
              font-body
              text-sm
              leading-6
            "
            style={{ color: P.textSecondary }}
          >
            {t("vacancyRecruiter.empty.description")}
          </p>

          {/* Primera publicación */}
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            className="
              group
              mt-6
              min-h-11
              gap-2.5
              rounded-xl
              border
              px-5
              font-body
              text-sm
              font-semibold
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-purple-500/15
              hover:border-purple-400/50
              hover:text-purple-200
              hover:shadow-[0_0_20px_rgba(168,85,247,0.20)]
              active:translate-y-0
              active:scale-[0.98]
            "
            style={{
              backgroundColor: P.accentSoft,
              borderColor: P.accentBorder,
              color: P.accent,
            }}
          >
            <Plus
              className="
                h-4 w-4
                transition-transform
                duration-200
                group-hover:rotate-90
              "
            />

            {t("vacancyRecruiter.buttons.publishFirst")}
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Vacantes activas */}
          {openVacancies.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p
                    className="
                      font-body
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.22em]
                    "
                    style={{ color: P.accent }}
                  >
                    {t("vacancyRecruiter.sections.active")}
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    px-3
                    py-1
                    font-body
                    text-xs
                    font-medium
                  "
                  style={{
                    backgroundColor: P.accentSoft,
                    color: P.accent,
                  }}
                >
                  {openVacancies.length}
                </span>
              </div>

              <div>
                {openVacancies.map((vacancy) => (
                  <VacancyRow
                    key={vacancy.id}
                    vacancy={vacancy}
                    mine
                    actions={
                      <>
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleStartEdit(vacancy);
                          }}
                          className="
                            flex
                            items-center
                            gap-1.5
                            rounded-lg
                            px-3
                            py-1.5
                            font-body
                            text-xs
                            font-medium
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:shadow-[0_0_14px_rgba(168,85,247,0.35)]
                          "
                          style={{
                            backgroundColor: "rgba(168,85,247,.08)",
                            border: "1px solid rgba(168,85,247,.25)",
                            color: "#c084fc",
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />

                          {t("vacancyRecruiter.buttons.edit")}
                        </button>

                        {/* Cerrar */}
                        {vacancy.status === "abierta" && (
                          <button
                            type="button"
                            disabled={close.isPending}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              close.mutate(vacancy.id);
                            }}
                            className="
                              flex
                              items-center
                              gap-1.5
                              rounded-lg
                              px-3
                              py-1.5
                              font-body
                              text-xs
                              font-medium
                              transition-all
                              duration-200
                              hover:-translate-y-0.5
                              hover:shadow-[0_0_14px_rgba(239,68,68,0.35)]
                            "
                            style={{
                              backgroundColor: "rgba(239,68,68,.08)",
                              border: "1px solid rgba(239,68,68,.25)",
                              color: "#f87171",
                            }}
                          >
                            <LockKeyhole className="h-3.5 w-3.5" />

                            {close.isPending
                              ? t("vacancyRecruiter.buttons.closing")
                              : t("vacancyRecruiter.buttons.close")}
                          </button>
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Historial */}
          {closedVacancies.length > 0 && (
            <section
              className="border-t pt-10"
              style={{ borderColor: P.borderSub }}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p
                    className="
                      font-body
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.22em]
                    "
                    style={{ color: P.textMuted }}
                  >
                    {t("vacancyRecruiter.sections.history")}
                  </p>

                  <h2
                    className="
                      mt-1
                      font-title
                      text-2xl
                      font-bold
                      tracking-tight
                    "
                    style={{ color: P.textSecondary }}
                  >
                    {t("vacancyRecruiter.sections.closed")}
                  </h2>
                </div>

                <span
                  className="
                    rounded-full
                    border
                    px-3
                    py-1
                    font-body
                    text-xs
                    font-medium
                  "
                  style={{
                    borderColor: P.border,
                    color: P.textMuted,
                  }}
                >
                  {closedVacancies.length}
                </span>
              </div>

              <div className="opacity-80">
                {closedVacancies.map((vacancy) => (
                  <VacancyRow
                    key={vacancy.id}
                    vacancy={vacancy}
                    mine
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </JobShell>
  );
}