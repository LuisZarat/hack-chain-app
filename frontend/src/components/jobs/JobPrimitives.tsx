import type { ReactNode } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { P } from "@/components/profile/palette";
import type { Vacancy } from "@/types/vacancy";

export const LABELS: Record<string, string> = {
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
};

export function formatSalary(vacancy: Vacancy) {
  const min = Number(vacancy.salary_min).toLocaleString("es-MX");
  const max = Number(vacancy.salary_max).toLocaleString("es-MX");

  return `${vacancy.salary_currency} ${min} - ${max} / ${vacancy.salary_period}`;
}

export function VacancyRow({
  vacancy,
  mine = false,
  actions,
}: {
  vacancy: Vacancy;
  mine?: boolean;
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  const days =
    vacancy.days_to_close ??
    Math.max(
      0,
      Math.ceil(
        (new Date(`${vacancy.closing_date}T00:00:00Z`).getTime() - Date.now()) /
          86400000,
      ),
    );

  const modalityLabel =
    t(`jobTalent.labels.${vacancy.modality}`, {
      defaultValue: vacancy.modality,
    });

  const areaLabel = t(`jobTalent.labels.${vacancy.area}`, {
    defaultValue: vacancy.area,
  });

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div
        className="border-b py-5 transition-colors sm:px-3"
        style={{ borderColor: P.borderSub }}
      >
        <Link
          to={
            mine
              ? `/recruiter/vacancies/${vacancy.id}/applicants`
              : `/jobs/${vacancy.slug}`
          }
          className="group grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:flex"
                style={{
                  borderColor: P.accentBorder,
                  backgroundColor: P.accentSoft,
                  color: P.accent,
                }}
              >
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3
                  className="truncate font-title text-lg font-semibold transition-colors group-hover:text-white"
                  style={{ color: P.textPrimary }}
                >
                  {vacancy.position}
                </h3>

                <p
                  className="mt-1 flex items-center gap-2 text-sm"
                  style={{ color: P.textSecondary }}
                >
                  <Building2
                    className="h-4 w-4"
                    style={{ color: P.textMuted }}
                  />
                  {vacancy.company}
                </p>
              </div>
            </div>

            <div
              className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:pl-[52px]"
              style={{ color: P.textMuted }}
            >
              <span>{LABELS[vacancy.modality] ?? vacancy.modality}</span>

              <span>{LABELS[vacancy.area] ?? vacancy.area}</span>

              {(vacancy.city || vacancy.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[vacancy.city, vacancy.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}

              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: P.textMuted }}
              >
                <Clock3 className="h-3.5 w-3.5" />

                {vacancy.status === "cerrada"
                  ? t("jobTalent.vacancyClosed")
                  : days === 0
                    ? t("jobTalent.closesToday")
                    : t("jobTalent.daysUntilClosing", {
                        count: days,
                      })}
              </span>

              {mine && (
                <span
                  className="flex items-center gap-1"
                  style={{ color: P.textSecondary }}
                >
                  <Users className="h-3.5 w-3.5" />

                  {t("vacancyRecruiter.applications", {
                    count: vacancy.applications_count ?? 0,
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm sm:flex-col sm:items-end sm:justify-center">
            <span className="font-medium" style={{ color: P.accent }}>
              {formatSalary(vacancy)}
            </span>
          </div>
        </Link>

        {actions && (
          <div className="mt-4 flex items-center justify-end pt-4 sm:pl-[52px]">
            <div className="flex items-center gap-2">{actions}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function JobsSkeleton({ count = 5 }: { count?: number }) {
  const { t } = useTranslation();

  return (
    <div aria-label={t("jobTalent.loadingVacancies")} aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 border-b py-6"
          style={{ borderColor: P.borderSub }}
        >
          <div className="space-y-3">
            <div
              className="h-5 w-48 animate-pulse rounded-md"
              style={{ backgroundColor: P.surface }}
            />

            <div
              className="h-3 w-28 animate-pulse rounded-md"
              style={{ backgroundColor: P.surface }}
            />

            <div
              className="h-3 w-64 animate-pulse rounded-md"
              style={{ backgroundColor: P.surface }}
            />
          </div>

          <div className="hidden space-y-3 sm:block">
            <div
              className="h-4 w-28 animate-pulse rounded-md"
              style={{ backgroundColor: P.surface }}
            />

            <div
              className="h-3 w-24 animate-pulse rounded-md"
              style={{ backgroundColor: P.surface }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function JobsError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center border-y py-20 text-center"
      style={{ borderColor: P.borderSub }}
    >
      <AlertTriangle
        className="mb-3 h-9 w-9"
        style={{ color: P.amber }}
      />

      <p style={{ color: P.textPrimary }}>
        {t("jobTalent.loadError")}
      </p>

      <p
        className="mt-1 text-sm"
        style={{ color: P.textSecondary }}
      >
        {t("jobTalent.tryAgain")}
      </p>

      <Button
        variant="outline"
        className="mt-5 min-h-11 gap-2"
        onClick={onRetry}
      >
        <RefreshCw className="h-4 w-4" />
        {t("jobTalent.retry")}
      </Button>
    </div>
  );
}

export function EmptyJobs({ action }: { action?: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center border-b py-20 text-center"
      style={{ borderColor: P.borderSub }}
    >
      <BriefcaseBusiness
        className="mb-3 h-9 w-9"
        style={{ color: P.textMuted }}
      />

      <p style={{ color: P.textPrimary }}>
        {t("jobTalent.noResults")}
      </p>

      <p
        className="mt-1 text-sm"
        style={{ color: P.textSecondary }}
      >
        {t("jobTalent.tryDifferentFilters")}
      </p>

      {action}
    </div>
  );
}

export function UnverifiedNotice({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div
      className="flex gap-3 rounded-xl border p-4 text-sm"
      style={{
        borderColor: "oklch(0.78 0.14 75 / 0.3)",
        backgroundColor: P.amberSoft,
        color: P.textPrimary,
      }}
    >
      <ShieldAlert
        className="mt-0.5 h-5 w-5 shrink-0"
        style={{ color: P.amber }}
      />

      <div>
        <p className="font-semibold">
          {t("jobTalent.companyNotVerified")}
        </p>

        <p
          className="mt-1"
          style={{ color: P.textSecondary }}
        >
          {children ?? t("jobTalent.unverifiedCompanyWarning")}
        </p>
      </div>
    </div>
  );
}

export function SuccessMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2 border-b py-4 text-sm"
      style={{
        borderColor: "oklch(0.72 0.14 155 / 0.3)",
        color: P.emerald,
      }}
    >
      <CheckCircle2 className="h-4 w-4" />
      {children}
    </div>
  );
}