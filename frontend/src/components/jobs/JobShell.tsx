import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import { GrainOverlay } from "@/components/profile/GrainOverlay";
import { P } from "@/components/profile/palette";

const HackChainLogo = "/images/logoHackchain2.webp";

export function JobShell({
  children,
  eyebrow,
}: {
  children: ReactNode;
  eyebrow?: string;
}) {
  const { t } = useTranslation();

  const shellTitle = eyebrow ?? t("jobTalent.shellTitle");

  return (
    <Layout>
      <div
      className="relative min-h-screen font-body overflow-hidden"
      style={{
        backgroundColor: "oklch(0.11 0.012 280)",
        color: P.textPrimary,
      }}
    >
      {/* Glow superior igual al perfil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0"
        style={{
          transform: "translateX(-50%)",
          width: "900px",
          height: "500px",
          background:
            "radial-gradient(at 50% 0%, oklch(0.7 0.16 280 / 0.1) 0%, transparent 65%)",
        }}
      />
      <main
        className="
          mx-auto
          min-h-screen
          w-full
          max-w-6xl
          px-5
          pb-24
          pt-10
          font-body
          sm:px-8
          lg:px-10
        "
      >
        <header
          className="
            mb-6
            flex
            items-center
            justify-between
            border-b
            pb-5
          "
          style={{ borderColor: P.borderSub }}
        >
          <h1
            className="
              font-title
              text-base
              font-bold
              leading-none
              tracking-[0.16em]
              sm:text-lg
            "
          >
            <span
              className="
                font-title
                text-xl
                sm:text-2xl
                font-bold
                bg-gradient-to-r
                from-cyan-300
                via-blue-400
                to-purple-400
                bg-clip-text
                text-transparent
                drop-shadow-[0_0_12px_rgba(59,130,246,0.18)]
              "
            >
              {shellTitle}
            </span>
          </h1>

          <Link
            to="/jobs"
            aria-label={t("jobTalent.shellLogoLabel")}
            className="
              shrink-0
              transition-all
              duration-200
              hover:scale-105
              hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.25)]
            "
          >
            <img
              src={HackChainLogo}
              alt="HackChain"
              className="h-10 w-10 object-contain sm:h-11 sm:w-11"
            />
          </Link>
        </header>

        {children}
      </main>
      </div>
    </Layout>
  );
}