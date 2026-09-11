import { Link } from "react-router-dom";
import { ArrowUpRight, Clock3, ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { JobShell } from "@/components/jobs/JobShell";
import {
  EmptyJobs,
  JobsError,
  JobsSkeleton,
} from "@/components/jobs/JobPrimitives";
import { useAuth } from "@/contexts/AuthContext";
import { useMyApplications } from "@/hooks/useVacancyApplications";
import type { ApplicationStatus } from "@/types/vacancy";
import { P } from "@/components/profile/palette";

const statusLabels: Record<ApplicationStatus, string> = {
  enviada: "Enviada",
  vista: "Vista",
  contactado: "Contactado",
  descartada: "Descartada",
  cerrada_sin_respuesta: "Cerrada sin respuesta",
};
const statusColors: Record<ApplicationStatus, string> = {
  enviada: "text-cyan-200",
  vista: "text-blue-200",
  contactado: "text-emerald-200",
  descartada: "text-red-300",
  cerrada_sin_respuesta: "text-slate-400",
};
export default function MyApplications() {
  const prefersReduced = useReducedMotion();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useMyApplications();
  const applications = data?.applications ?? [];
  return (
    <JobShell>
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
        <header className="mb-8">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: P.accent }}
          >
            {t("jobTalent.applicationsPage.eyebrow")}
          </p>
          <h1
            className="
              mt-3
              font-title
              text-4xl
              font-semibold
              leading-none
              tracking-tight
              sm:text-5xl
            "
            style={{ color: P.textPrimary }}
          >
            {t("jobTalent.applicationsPage.title")}
          </h1>
          <p
            className="mt-4 max-w-xl text-base leading-7"
            style={{ color: P.textSecondary }}
          >
            {t("jobTalent.applicationsPage.description")}
          </p>
        </header>
        {isPending ? (
          <JobsSkeleton count={4} />
        ) : isError ? (
          <JobsError onRetry={() => void refetch()} />
        ) : applications.length === 0 ? (
          <EmptyJobs
            action={
              <Link
                to="/jobs"
                className="mt-5 text-sm"
                style={{ color: P.accent }}
              >
                {t("jobTalent.applicationsPage.exploreOpenVacancies")}{" "}
                <ArrowUpRight className="inline h-4 w-4" />
              </Link>
            }
          />
        ) : (
          <div>
            {applications.map(
              (application) =>
                application.vacancy && (
                  <Link
                    key={application.id}
                    to={`/jobs/${application.vacancy.slug}`}
                    className="
                      group
                      flex
                      flex-col
                      gap-3
                      border-b
                      py-5
                      transition-all
                      duration-200
                      hover:bg-white/[0.03]
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      sm:px-3
                    "
                    style={{ borderColor: P.borderSub }}
                  >
                    <div>
                      <h2
                        className="
                          font-title
                          text-lg
                          transition-colors
                          duration-200
                          group-hover:text-purple-200
  "
                        style={{ color: P.textPrimary }}
                      >
                        {application.vacancy.position}
                      </h2>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: P.textSecondary }}
                      >
                        {application.vacancy.company}
                      </p>
                      <p
                        className="mt-3 flex items-center gap-2 text-xs"
                        style={{ color: P.textMuted }}
                      >
                        <Clock3 className="h-3.5 w-3.5" />
                        {t("jobTalent.applicationsPage.submittedOn")}{" "}
                        {new Date(application.submitted_at).toLocaleDateString(
                          "es-MX",
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium ${statusColors[application.status]}`}
                    >
                      {t(
                        `jobTalent.applicationsPage.status.${application.status}`,
                      )}
                    </span>
                  </Link>
                ),
            )}
          </div>
        )}
        {user?.role !== "student" && (
          <p className="mt-8 text-sm" style={{ color: P.textMuted }}>
            {t("jobTalent.applicationsPage.talentOnlyNotice")}
          </p>
        )}
      </motion.div>
    </JobShell>
  );
}
