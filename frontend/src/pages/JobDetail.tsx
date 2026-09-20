import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  MapPin,
  Send,
  ShieldAlert,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTalentCertificates } from "@/hooks/useTalentCertificates";
import { useApplyToVacancy } from "@/hooks/useApplyToVacancy";
import { useVacancyDetail } from "@/hooks/useVacancyDetail";
import { JobShell } from "@/components/jobs/JobShell";
import { useTranslation } from "react-i18next";
import {
  JobsError,
  JobsSkeleton,
  LABELS,
  SuccessMessage,
  UnverifiedNotice,
  formatSalary,
} from "@/components/jobs/JobPrimitives";
import { P } from "@/components/profile/palette";

export default function JobDetail() {
  const prefersReduced = useReducedMotion();
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { data, isPending, isError, refetch } = useVacancyDetail(slug);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const vacancy = data?.vacancy;
  const unverifiedCompanyNotice = data?.unverified_company_notice;
  const isTalent = user?.role === "student";
  const { data: certificates = [] } = useTalentCertificates(
    isTalent ? (user?.walletAddress ?? undefined) : undefined,
  );
  const apply = useApplyToVacancy(vacancy?.id ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  if (isPending)
    return (
      <JobShell>
        <JobsSkeleton count={3} />
      </JobShell>
    );
  if (isError || !vacancy)
    return (
      <JobShell>
        <JobsError onRetry={() => void refetch()} />
      </JobShell>
    );
  const closed = vacancy.status === "cerrada";
  const days =
    vacancy.days_to_close ??
    Math.max(
      0,
      Math.ceil(
        (new Date(`${vacancy.closing_date}T00:00:00Z`).getTime() - Date.now()) /
          86400000,
      ),
    );
  return (
    <JobShell>
      <motion.div
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="
                    group mb-5 inline-flex items-center gap-2
                    text-sm font-medium
                    transition-all duration-200
                    hover:-translate-x-0.5
                    hover:text-white
                  "   
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
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article>
            <div
              className="mb-8 border-b pb-8"
              style={{ borderColor: P.borderSub }}
            >
              <p
                  className="
    mb-3
    font-body
    text-[10px]
    font-bold
    uppercase
    tracking-[0.22em]
  "
  style={{ color: P.accent }}
              >
                {LABELS[vacancy.area]} / {LABELS[vacancy.modality]}
              </p>
              <h1
  className="
    font-title
    text-4xl
    font-bold
    tracking-tight
    leading-tight
    sm:text-5xl
  "
  style={{ color: P.textPrimary }}
>
  {vacancy.position}
</h1>
              <p  className="mt-2 font-body text-base font-medium"
  style={{ color: P.textSecondary }}>
                {vacancy.company}
              </p>
              <div
  className="
    mt-5
    flex
    flex-wrap
    gap-x-5
    gap-y-2
    font-body
    text-sm
    font-medium
  "
  style={{ color: P.textSecondary }}
>
                <span className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  {closed ? t("jobTalent.vacancyClosed") : t("jobTalent.daysUntilClosing", { count: days })}
                </span>
                {(vacancy.city || vacancy.country) && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {[vacancy.city, vacancy.country].filter(Boolean).join(", ")}
                  </span>
                )}
                <span style={{ color: P.accent }}>{formatSalary(vacancy)}</span>
              </div>
            </div>
            {unverifiedCompanyNotice && (
              <UnverifiedNotice>
                {unverifiedCompanyNotice}
              </UnverifiedNotice>
            )}
            <div className="mt-10">
              <h2
                className="font-title text-2xl font-bold tracking-tight"
                style={{ color: P.textPrimary }}
              >
                {t("jobTalent.aboutPosition")}
              </h2>
              <p
                className="mt-4 whitespace-pre-wrap leading-7"
                style={{ color: P.textBio }}
              >
                {vacancy.description}
              </p>
            </div>
            <div className="mt-10">
              <h2
                className="font-title text-2xl font-bold tracking-tight"
                style={{ color: P.textPrimary }}
              >
               {t("jobTalent.requirements")}
              </h2>
              <ul className="mt-4 space-y-3" style={{ color: P.textBio }}>
                {(vacancy.requirements ?? []).map((requirement) => (
                  <li key={requirement} className="flex gap-3">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0"
                      style={{ color: P.accent }}
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </article>
          <aside>
            {closed ? (
              <div
                className="border-b py-5 text-sm"
                style={{ borderColor: P.borderSub, color: P.textSecondary }}
              >
                {t("jobTalent.noLongerAccepts")}
              </div>
            ) : (
              <ApplyPanel
                isTalent={isTalent}
                isAuthenticated={isAuthenticated}
                certificates={certificates}
                selected={selected}
                setSelected={setSelected}
                message={message}
                setMessage={setMessage}
                busy={apply.isPending}
                success={apply.isSuccess}
                error={apply.error}
                onSubmit={() =>
                  apply.mutate({
                    shared_certificates: selected,
                    message: message.trim() || null,
                  })
                }
              />
            )}
          </aside>
        </div>
      </motion.div>
    </JobShell>
  );
}
export function ApplyPanel({
  isTalent,
  isAuthenticated,
  certificates,
  selected,
  setSelected,
  message,
  setMessage,
  busy,
  success,
  error,
  onSubmit,
}: {
  isTalent: boolean;
  isAuthenticated: boolean;
  certificates: { identifier: string; name?: string }[];
  selected: string[];
  setSelected: (value: string[]) => void;
  message: string;
  setMessage: (value: string) => void;
  busy: boolean;
  success: boolean;
  error: Error | null;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  if (!isAuthenticated)
    return (
      <div className="border-b py-5" style={{ borderColor: P.borderSub }}>
        <p className="text-sm" style={{ color: P.textSecondary }}>
            {t("jobTalent.apply.loginMessage")}
        </p>
        <Link to="/login" className="mt-4 inline-flex">
          <Button  className="
      min-h-11
      w-full
      gap-2
      rounded-xl
      bg-gradient-to-r
      from-fuchsia-500
      to-purple-600
      text-sm
      font-semibold
      text-white
      shadow-[0_0_20px_rgba(168,85,247,0.20)]
      transition-[transform,box-shadow,opacity]
      duration-200
      hover:from-fuchsia-600
      hover:to-purple-700
      hover:shadow-[0_0_26px_rgba(168,85,247,0.35)]
      active:scale-[0.98]
    ">{t("jobTalent.apply.login")}</Button>
        </Link>
      </div>
    );
  if (!isTalent)
    return (
      <div
        className="border-b py-5 text-sm"
        style={{ borderColor: P.borderSub, color: P.textSecondary }}
      >
        {t("jobTalent.apply.talentOnly")}
      </div>
    );
  if (success)
    return (
      <SuccessMessage> {t("jobTalent.apply.success")}</SuccessMessage>
    );
  return (
    <div className="border-b py-5" style={{ borderColor: P.borderSub }}>
      <div className="flex items-center gap-3">
  <span
    className="h-5 w-1 rounded-full"
    style={{ backgroundColor: P.accent }}
  />

  <h2
    className="font-title text-2xl font-bold tracking-tight"
    style={{ color: P.textPrimary }}
  >
    {t("jobTalent.apply.title")}
  </h2>
</div>
      <p className="mt-2 text-sm" style={{ color: P.textSecondary }}>
        {t("jobTalent.apply.description")}
      </p>
      <div className="mt-5 space-y-3">
        {certificates.length === 0 ? (
          <p className="text-sm" style={{ color: P.textMuted }}>
            {t("jobTalent.apply.noCertificates")}
          </p>
        ) : (
          certificates.map((cert) => (
            <label
              key={cert.identifier}
              className="flex min-h-11 items-center gap-3 text-sm"
              style={{ color: P.textBio }}
            >
              <input
                type="checkbox"
                checked={selected.includes(cert.identifier)}
                onChange={(e) =>
                  setSelected(
                    e.target.checked
                      ? [...selected, cert.identifier]
                      : selected.filter((id) => id !== cert.identifier),
                  )
                }
              />
              {cert.name ?? t("jobTalent.apply.certificateFallback", {
                identifier: cert.identifier,
              })}
            </label>
          ))
        )}
      </div>
      <label className="mt-5 block text-sm" style={{ color: P.textSecondary }}>
        {t("jobTalent.apply.message")}{" "}
        <span style={{ color: P.textMuted }}>
          ({t("jobTalent.apply.optional")}, {message.length}/500)
        </span>
        <textarea
          maxLength={500}
          className="mt-2 min-h-28 w-full rounded-lg border p-3 text-sm outline-none"
          style={{
            borderColor: P.border,
            backgroundColor: P.surface,
            color: P.textPrimary,
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      {error && (
        <p className="mt-3 flex gap-2 text-sm text-red-300">
          <ShieldAlert className="h-4 w-4" />
          {error.message}
        </p>
      )}
      <Button
  className="
    mt-5
    ml-auto
    inline-flex
    h-10
    w-full
    items-center
    justify-center
    gap-2
    rounded-full
    bg-primary
    px-7
    py-2
    text-sm
    font-semibold
    text-primary-foreground
    ring-offset-background
    transition-all
    hover:scale-[1.015]
    hover:bg-primary/90
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-ring
    focus-visible:ring-offset-2
    active:scale-[0.98]
    disabled:pointer-events-none
    disabled:opacity-50
    disabled:hover:scale-100
  "
  disabled={busy}
  onClick={onSubmit}
>
  <Send className="h-4 w-4" />
  {busy
    ? t("jobTalent.apply.sending")
    : t("jobTalent.apply.send")}
</Button>
    </div>
  );
}
