import { useState, type CSSProperties } from "react";
import { Search, SlidersHorizontal, X, ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { P } from "@/components/profile/palette";
import { useVacancies } from "@/hooks/useVacancies";
import {
  VACANCY_AREAS,
  VACANCY_MODALITIES,
  type VacancyArea,
  type VacancyModality,
} from "@/types/vacancy";
import {
  EmptyJobs,
  JobsError,
  JobsSkeleton,
  JobShell,
  LABELS,
  VacancyRow,
} from "@/components/jobs";

export default function Jobs() {
  const prefersReduced = useReducedMotion();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [area, setArea] = useState<VacancyArea | "">("");
  const [modality, setModality] = useState<VacancyModality | "">("");
  const { data, isPending, isError, refetch } = useVacancies({
    q,
    area: area || undefined,
    modalidad: modality || undefined,
  });
  const vacancies = data?.vacancies ?? [];
  return (
    <JobShell>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="
            group mb-7 inline-flex items-center gap-2
            text-sm font-medium
            transition-all duration-200
            hover:-translate-x-0.5
          "
        style={{ color: P.textMuted }}
      >
        <ArrowLeft
          className="
              h-4 w-4
              transition-transform duration-200
              group-hover:-translate-x-0.5
            "
        />
        {t("jobTalent.back")}
      </button>
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <section className="mb-9 max-w-3xl">
          <h1
            className="font-title text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ color: P.textPrimary }}
          >
            {t("jobTalent.pageTitle")}
          </h1>
          <p
            className="mt-4 max-w-xl text-base leading-7"
            style={{ color: P.textSecondary }}
          >
            {t("jobTalent.pageDescription")}
          </p>
        </section>
        <section
          aria-label={t("jobTalent.filters.label")}
          className="mb-5 grid gap-3 border-y py-4 md:grid-cols-[minmax(0,1fr)_190px_190px_auto]"
          style={{ borderColor: P.borderSub }}
        >
          <label
            className="flex min-h-11 items-center gap-3 rounded-lg border px-3"
            style={{ borderColor: P.border, backgroundColor: P.surface }}
          >
            <Search className="h-4 w-4" style={{ color: P.textMuted }} />
            <span className="sr-only">
              {t("jobTalent.filters.searchLabel")}
            </span>
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--placeholder)]"
              style={
                {
                  color: P.textPrimary,
                  "--placeholder": P.textPlaceholder,
                } as CSSProperties
              }
              placeholder={t("jobTalent.filters.searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <Select
            value={area || "all"}
            onValueChange={(value) =>
              setArea(value === "all" ? "" : (value as VacancyArea))
            }
          >
            <SelectTrigger
              aria-label={t("jobTalent.filters.areaLabel")}
              className="min-h-11 rounded-lg border text-sm"
              style={{
                borderColor: P.border,
                backgroundColor: P.surface,
                color: P.textPrimary,
              }}
            >
              <SelectValue placeholder={t("jobTalent.filters.allAreas")} />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: P.card,
                borderColor: P.border,
                color: P.textPrimary,
              }}
            >
              <SelectItem
                value="all"
                className="
                  cursor-pointer
                  rounded-md
                  transition-colors
                  focus:bg-purple-500/10
                  focus:text-purple-200
              "
              >
                {t("jobTalent.filters.allAreas")}
              </SelectItem>
              {VACANCY_AREAS.map((x) => (
                <SelectItem
                  key={x}
                  value={x}
                  className="
                    cursor-pointer
                    rounded-md
                    transition-colors
                    focus:bg-purple-500/10
                    focus:text-purple-200
                  "
                >
                  {LABELS[x]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={modality || "all"}
            onValueChange={(value) =>
              setModality(value === "all" ? "" : (value as VacancyModality))
            }
          >
            <SelectTrigger
              aria-label={t("jobTalent.filters.modalityLabel")}
              className="min-h-11 rounded-lg border text-sm"
              style={{
                borderColor: P.border,
                backgroundColor: P.surface,
                color: P.textPrimary,
              }}
            >
              <SelectValue placeholder={t("jobTalent.filters.allModalities")} />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: P.card,
                borderColor: P.border,
                color: P.textPrimary,
              }}
            >
              <SelectItem
                value="all"
                className="
                  cursor-pointer
                  rounded-md
                  transition-colors
                  focus:bg-purple-500/10
                  focus:text-purple-200"
              >
                {t("jobTalent.filters.allModalities")}
              </SelectItem>
              {VACANCY_MODALITIES.map((x) => (
                <SelectItem
                  key={x}
                  value={x}
                  className="
                    cursor-pointer
                    rounded-md
                    transition-colors
                    focus:bg-purple-500/10
                    focus:text-purple-200"
                >
                  {LABELS[x]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {q || area || modality ? (
            <Button
              variant="ghost"
              className="min-h-11 justify-start gap-2 px-2"
              style={{ color: P.textSecondary }}
              onClick={() => {
                setQ("");
                setArea("");
                setModality("");
              }}
            >
              <X className="h-4 w-4" />
              {t("jobTalent.filters.clear")}
            </Button>
          ) : (
            <SlidersHorizontal
              className="hidden h-4 w-4 self-center md:block"
              style={{ color: P.textMuted }}
            />
          )}
        </section>
        <p
          className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: P.textMuted }}
        >
          {isPending
            ? t("jobTalent.loading")
            : t("jobTalent.open", {
                count: vacancies.length,
              })}
        </p>
        {isPending ? (
          <JobsSkeleton />
        ) : isError ? (
          <JobsError onRetry={() => void refetch()} />
        ) : vacancies.length === 0 ? (
          <EmptyJobs />
        ) : (
          <div>
            {vacancies.map((vacancy) => (
              <VacancyRow key={vacancy.id} vacancy={vacancy} />
            ))}
          </div>
        )}
      </motion.div>
    </JobShell>
  );
}
