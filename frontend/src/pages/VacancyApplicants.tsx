import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  UserRound,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { P } from "@/components/profile/palette";
import { useTranslation } from "react-i18next";
import { JobShell } from "@/components/jobs/JobShell";
import {
  JobsError,
  JobsSkeleton,
  SuccessMessage,
} from "@/components/jobs/JobPrimitives";
import {
  useVacancyApplications,
  useUpdateApplicationStatus,
} from "@/hooks/useVacancyApplications";
import type { SharedCertificate } from "@/types/vacancy";

export default function VacancyApplicants() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { data, isPending, isError, refetch } = useVacancyApplications(id);
  const update = useUpdateApplicationStatus(id);
  if (isPending)
    return (
      <JobShell>
        <JobsSkeleton count={4} />
      </JobShell>
    );
  if (isError || !data)
    return (
      <JobShell>
        <JobsError onRetry={() => void refetch()} />
      </JobShell>
    );
  return (
    <JobShell>
      <Link
        to="/recruiter/vacancies"
        className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("vacancyRecruiter.applicants.backToVacancies")}
      </Link>
      <header className="mb-8">
        <p className="text-xs tracking-[0.24em] text-cyan-300">
          {t("vacancyRecruiter.applicants.eyebrow")}
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
          {data.vacancy?.position ??
            t("vacancyRecruiter.applicants.defaultTitle")}
        </h1>
        <p className="mt-3 text-slate-400">
          {t("vacancyRecruiter.applicants.summary", {
            count: data.applications.length,
          })}
        </p>
      </header>
      {data.applications.length === 0 ? (
        <div className="border-b border-white/10 py-16 text-slate-400">
          {t("vacancyRecruiter.applicants.empty")}
        </div>
      ) : (
        <div>
          {data.applications.map((application) => (
            <article
              key={application.id}
              className="border-b border-white/10 py-7"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 font-title text-xl text-white">
                    <UserRound className="h-5 w-5 text-cyan-300" />
                    {application.student_name ??
                      t("vacancyRecruiter.applicants.talentWithoutName")}
                  </h2>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(application.submitted_at).toLocaleString("es-MX")}{" "}
                    ·{" "}
                    <span className="text-cyan-200">
                      {t(`vacancyRecruiter.status.${application.status}`)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/recruiter/talent/${application.student_wallet_address}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="
                        h-9
                        gap-1.5
                        rounded-lg
                        border
                        px-3.5
                        text-xs
                        font-medium
                        transition-all
                        duration-200
                        hover:-translate-y-0.5
                        hover:bg-purple-500/10
                        hover:text-purple-200
                        hover:shadow-[0_0_14px_rgba(168,85,247,0.15)]
                      "
                      style={{
                        borderColor: P.border,
                        color: P.textSecondary,
                      }}
                    >
                      <UserRound className="h-3.5 w-3.5" />
                      {t("vacancyRecruiter.applicants.viewProfile")}
                    </Button>
                  </Link>
                  {application.status !== "descartada" && (
                    <Button
                      size="sm"
                      className="
                        h-9
                        gap-1.5
                        rounded-lg
                        border
                        border-red-400/25
                        bg-transparent
                        px-3.5
                        text-xs
                        font-medium
                        text-red-300
                        transition-all
                        duration-200
                        hover:border-red-400/45
                        hover:bg-red-500/5
                        hover:text-red-200
                        active:scale-[0.98]
                      "
                      disabled={update.isPending}
                      onClick={() =>
                        update.mutate({
                          id: application.id,
                          status: "descartada",
                        })
                      }
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {t("vacancyRecruiter.applicants.reject")}
                    </Button>
                  )}
                  {application.status !== "contactado" &&
                    application.status !== "descartada" && (
                      <Button
                        size="sm"
                        className="
                          h-9
                          gap-1.5
                          rounded-lg
                          border
                          border-purple-400/25
                          bg-transparent
                          px-3.5
                          text-xs
                          font-medium
                          text-purple-300
                          transition-all
                          duration-200
                          hover:border-purple-400/45
                          hover:bg-purple-500/10
                          hover:text-purple-200
                          active:scale-[0.98]
                        "
                        disabled={update.isPending}
                        onClick={() =>
                          update.mutate({
                            id: application.id,
                            status: "contactado",
                          })
                        }
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t("vacancyRecruiter.applicants.contact")}
                      </Button>
                    )}
                </div>
              </div>
              {application.message && (
                <p className="mt-5 border-l-2 border-cyan-300/30 pl-4 text-sm italic text-slate-300">
                  {application.message}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {(application.shared_certificates as SharedCertificate[]).map(
                  (certificate) => (
                    <a
                      key={certificate.token_id}
                      href={certificate.chain_verification_url ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs text-cyan-100 hover:border-cyan-300/50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {certificate.title ??
                        t("vacancyRecruiter.applicants.certificateFallback", {
                          id: certificate.token_id,
                        })}
                    </a>
                  ),
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {update.isSuccess && (
        <SuccessMessage>
          {t("vacancyRecruiter.applicants.applicationStatusUpdated")}
        </SuccessMessage>
      )}
    </JobShell>
  );
}
