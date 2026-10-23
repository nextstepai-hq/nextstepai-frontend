
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  Download,
  Eye,
  Sparkles,
  FileType,
  FileText,
  X,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import toast from 'react-hot-toast'

import useAuthStore from '../store/authStore'
import { certificateAPI, roadmapAPI } from '../services/api'
import {
  EmptyState,
  LoadingScreen,
  PageContainer,
  PageIntro,
} from '../components/AppShell'
import { useDocumentMeta } from '../hooks/useDocumentMeta'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const formatDate = (date) => {
  if (!date) return 'Date unavailable'

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return 'Date unavailable'

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const CertificatesPage = () => {
  useDocumentMeta({
    title: 'Certificates | NextStep AI',
    description:
      'Manage, preview, verify, and download certificates issued by NextStep AI.',
    robots: 'noindex, follow',
  })

  const { user } = useAuthStore()

  const [certificates, setCertificates] = useState([])
  const [roadmaps, setRoadmaps] = useState([])
  const [selectedCert, setSelectedCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState(null)
  const [downloading, setDownloading] = useState('')

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        const [certResponse, roadmapResponse] = await Promise.all([
          certificateAPI.getAll(),
          roadmapAPI.getAll(),
        ])

        const certData =
          certResponse.data?.data ?? certResponse.data ?? []

        const roadmapData =
          roadmapResponse.data?.data ?? roadmapResponse.data ?? []

        if (!active) return

        setCertificates(Array.isArray(certData) ? certData : [])
        setRoadmaps(Array.isArray(roadmapData) ? roadmapData : [])
      } catch {
        if (active) toast.error('Failed to load certificates')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  const handleGenerate = async (roadmapId) => {
    if (generatingId) return

    setGeneratingId(roadmapId)

    try {
      const response = await certificateAPI.generate(roadmapId)
      const certificate = response.data?.data ?? response.data

      setCertificates((current) => {
        const exists = current.some(
          (item) => String(item.id) === String(certificate.id)
        )

        return exists
          ? current.map((item) =>
              String(item.id) === String(certificate.id)
                ? certificate
                : item
            )
          : [...current, certificate]
      })

      toast.success('Certificate generated successfully!')
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Could not generate certificate'
      )
    } finally {
      setGeneratingId(null)
    }
  }

  const handleDownload = async (id, format = 'pdf') => {
    const downloadKey = `${id}-${format}`

    if (downloading) return

    setDownloading(downloadKey)

    try {
      const response = await certificateAPI.download(id, format)

      const disposition =
        response.headers?.['content-disposition'] || ''

      const filenameMatch = disposition.match(
        /filename\*?=(?:UTF-8''|")?([^";\n]+)/i
      )

      const fallbackName = `NextStep-Certificate.${format}`
      const filename = filenameMatch?.[1]
        ? decodeURIComponent(filenameMatch[1].replace(/"/g, ''))
        : fallbackName

      const mimeType =
        format === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

      const blob = new Blob([response.data], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to download ${format.toUpperCase()}`
      )
    } finally {
      setDownloading('')
    }
  }

  const certifiedRoadmapIds = new Set(
    certificates.map((certificate) => String(certificate.roadmap_id))
  )

  const availableRoadmaps = roadmaps.filter(
    (roadmap) => !certifiedRoadmapIds.has(String(roadmap.id))
  )

  const verificationCode =
    selectedCert?.certificate_code || selectedCert?.id || ''

  const verificationUrl = verificationCode
    ? `${window.location.origin}/certificates/verify/${encodeURIComponent(
        verificationCode
      )}`
    : window.location.origin

  const issuedDate = formatDate(selectedCert?.issued_at)

  if (loading) {
    return (
      <div className="certificate-page">
        <LoadingScreen label="Loading certificates..." />
      </div>
    )
  }

  return (
    <div className="certificate-page">
      <PageContainer>
        <PageIntro
          eyebrow="Credentials"
          title="Verified Certificates"
          description="Celebrate your progress and access your professional learning credentials."
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-12"
        >
          {/* Earned certificates */}
          <section>
            <motion.div
              variants={fadeUp}
              className="mb-6 flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-green)] to-[var(--brand-blue)] text-white shadow-lg">
                <Award size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Earned Certificates
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Your professional achievements
                </p>
              </div>
            </motion.div>

            {certificates.length === 0 ? (
              <motion.div variants={fadeUp}>
                <EmptyState
                  icon={Award}
                  title="No certificates yet"
                  description="Complete your learning roadmap to unlock your first certificate."
                />
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {certificates.map((certificate) => (
                  <motion.div
                    key={certificate.id}
                    variants={fadeUp}
                    className="group relative overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand-green)] opacity-[0.06] blur-2xl" />

                    <div className="relative flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#17365d] to-[#28578b] text-white shadow-lg">
                        <Award size={28} />
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600">
                        <ShieldCheck size={14} />
                        Issued
                      </span>
                    </div>

                    <h3 className="relative mt-6 text-xl font-bold text-[var(--text-primary)]">
                      {certificate.roadmap?.target_role ||
                        'Professional Learning Roadmap'}
                    </h3>

                    <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <CalendarDays size={15} />
                      Issued {formatDate(certificate.issued_at)}
                    </p>

                    <p className="mt-3 break-all font-mono text-xs text-[var(--text-secondary)]">
                      ID: {certificate.certificate_code}
                    </p>

                    <div className="relative mt-6 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCert(certificate)}
                        className="btn-secondary flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        Preview
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(downloading)}
                        onClick={() =>
                          handleDownload(certificate.id, 'pdf')
                        }
                        className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Download size={16} />
                        {downloading === `${certificate.id}-pdf`
                          ? 'Preparing...'
                          : 'Download PDF'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Roadmaps available for certification */}
          <section>
            <motion.div
              variants={fadeUp}
              className="mb-6 flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-blue)] to-[var(--brand-lilac)] text-white shadow-lg">
                <Sparkles size={22} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Ready to Generate
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Turn completed learning into a credential
                </p>
              </div>
            </motion.div>

            {availableRoadmaps.length === 0 ? (
              <motion.div variants={fadeUp}>
                <EmptyState
                  icon={Sparkles}
                  title="No roadmaps available"
                  description="Once a roadmap is completed and eligible, it will appear here."
                />
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {availableRoadmaps.map((roadmap) => (
                  <motion.div
                    key={roadmap.id}
                    variants={fadeUp}
                    className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-6 transition hover:border-[var(--brand-blue)]/40"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)]">
                      <Sparkles size={23} />
                    </div>

                    <h3 className="mt-5 text-xl font-bold">
                      {roadmap.target_role || 'Learning Roadmap'}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                      Generate your certificate when this roadmap is
                      completed and eligible.
                    </p>

                    <button
                      type="button"
                      disabled={Boolean(generatingId)}
                      onClick={() => handleGenerate(roadmap.id)}
                      className="btn-primary mt-6 flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Award size={17} />
                      {generatingId === roadmap.id
                        ? 'Generating...'
                        : 'Generate Certificate'}
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </motion.div>

        {/* Certificate preview */}
        <AnimatePresence>
          {selectedCert && (
            <motion.div
              key="certificate-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
              onClick={() => setSelectedCert(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(event) => event.stopPropagation()}
                className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[var(--surface-elevated)] p-3 shadow-2xl sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold sm:text-2xl">
                      Certificate Preview
                    </h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Your NextStep AI learning achievement
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Close certificate preview"
                    onClick={() => setSelectedCert(null)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="certificate-preview-scroll overflow-x-auto rounded-xl bg-slate-200 p-2 sm:p-5">
                  {/* Landscape certificate matching the downloadable 320:200 artwork. */}
                  <article className="certificate-preview relative mx-auto aspect-[8/5] w-full min-w-[700px] max-w-[1120px] overflow-hidden bg-[#fffefa] text-[#172b49] shadow-xl">
                    {/* Decorative frame */}
                    <img
                      src="/certificate/certificate-border.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-0 h-full w-full object-fill"
                    />

                    {/* Watermark */}
                    <img
                      src="/nextsteplogo.png"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[36%] w-[25%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.045]"
                    />

                    {/* Safe content area */}
                    <div className="absolute inset-[13%_12%_12%] z-10 flex flex-col">
                      {/* Three-column header */}
                      <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3">
                        <div className="flex min-w-0 items-center">
                          <img
                            src="/NextStep%20AI%20Growth%20Logo%20(1).png"
                            alt="NextStep AI"
                            className="h-10 w-28 object-contain object-left sm:h-14 sm:w-36"
                          />
                        </div>

                        {/* Dedicated award badge */}
                        <div className="flex items-center justify-center">
                          <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#c9a34a] bg-[#fffaf0] p-1 shadow-[0_3px_12px_rgba(120,80,15,0.15)] sm:h-[72px] sm:w-[72px]">
                            <div className="absolute inset-[4px] rounded-full border border-dashed border-[#c9a34a]" />
                            <img
                              src="/certificate/certificate-badge.png"
                              alt="Certificate award badge"
                              className="relative z-10 h-full w-full object-contain"
                            />
                          </div>
                        </div>

                        <div className="min-w-0 text-right text-[8px] leading-relaxed text-slate-500 sm:text-[10px]">
                          <p className="font-extrabold uppercase tracking-[0.12em] text-[#17365d]">
                            Official Learning Credential
                          </p>
                          <p>Issued {issuedDate}</p>
                          <p className="break-all">
                            ID: {selectedCert.certificate_code}
                          </p>
                        </div>
                      </header>

                      <div className="my-[1.5%] h-px shrink-0 bg-gradient-to-r from-transparent via-[#c9a34a] to-transparent" />

                      {/* Main certificate content */}
                      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-[3%] text-center">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#b87932] sm:text-xs">
                          Certificate of Completion
                        </p>

                        <h3 className="mt-2 font-serif text-[clamp(22px,3vw,40px)] font-bold leading-tight text-[#17365d]">
                          Certificate of Achievement
                        </h3>

                        <p className="mt-[1.3%] text-[10px] text-slate-500 sm:text-sm">
                          This certificate is proudly presented to
                        </p>

                        <h4 className="mt-1 max-w-full break-words font-serif text-[clamp(25px,3.5vw,46px)] font-bold leading-tight text-[#183859]">
                          {user?.name || 'Learner'}
                        </h4>

                        <div className="my-[1.2%] h-[3px] w-16 shrink-0 rounded-full bg-gradient-to-r from-[#c9a34a] via-[#e6c879] to-[#c9a34a] sm:w-24" />

                        <p className="max-w-[80%] text-[9px] leading-relaxed text-slate-600 sm:text-sm">
                          For successfully completing the professional
                          learning roadmap and demonstrating dedication
                          to continuous learning, practical skill
                          development, and professional growth.
                        </p>

                        <p className="mt-[1.2%] max-w-full break-words font-serif text-[clamp(14px,1.8vw,22px)] font-bold leading-tight text-[#b87932]">
                          {selectedCert.roadmap?.target_role ||
                            'Professional Learning Roadmap'}
                        </p>
                      </main>

                      {/* Three-column footer */}
                      <footer className="mt-[1.2%] grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3 border-t border-[#e5e0d2] px-[1%] pt-[1.3%]">
                        <div className="min-w-0 text-left">
                          <img
                            src="/certificate/Signature.png"
                            alt="Authorized signature"
                            className="mb-1 h-7 w-24 object-contain object-left sm:h-9 sm:w-32"
                          />
                          <div className="w-24 border-t border-slate-400 sm:w-32" />
                          <p className="mt-1 font-serif text-[9px] font-bold text-[#17365d] sm:text-xs">
                            NextStep AI Team
                          </p>
                          <p className="text-[6px] font-bold tracking-[0.1em] text-slate-500 sm:text-[8px]">
                            PROGRAM ADMINISTRATION
                          </p>
                        </div>

                        <div className="flex min-w-[76px] flex-col items-center text-center">
                          <p className="mb-1 text-[6px] font-extrabold uppercase tracking-[0.1em] text-emerald-700 sm:text-[8px]">
                            Verify Certificate
                          </p>
                          <div className="rounded-md border border-slate-200 bg-white p-1">
                            <QRCodeSVG
                              value={verificationUrl}
                              size={64}
                              level="M"
                              includeMargin
                              bgColor="#ffffff"
                              fgColor="#17365d"
                            />
                          </div>
                          <p className="mt-1 text-[6px] text-slate-500 sm:text-[8px]">
                            Scan to verify online
                          </p>
                        </div>

                        <div className="min-w-0 text-right">
                          <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-[8px]">
                            Certificate Reference
                          </p>
                          <p className="mt-1 break-all font-mono text-[7px] font-bold leading-relaxed text-[#17365d] sm:text-[9px]">
                            {selectedCert.certificate_code}
                          </p>
                          <p className="mt-1 text-[6px] text-slate-500 sm:text-[8px]">
                            Digitally verifiable credential
                          </p>
                        </div>
                      </footer>
                    </div>
                  </article>
                </div>

                {/* Download actions */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={Boolean(downloading)}
                    onClick={() =>
                      handleDownload(selectedCert.id, 'pdf')
                    }
                    className="btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                  >
                    <FileType size={19} />
                    {downloading === `${selectedCert.id}-pdf`
                      ? 'Preparing PDF...'
                      : 'Download PDF'}
                  </button>

                  <button
                    type="button"
                    disabled={Boolean(downloading)}
                    onClick={() =>
                      handleDownload(selectedCert.id, 'docx')
                    }
                    className="btn-secondary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                  >
                    <FileText size={19} />
                    {downloading === `${selectedCert.id}-docx`
                      ? 'Preparing DOCX...'
                      : 'Download DOCX'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageContainer>
    </div>
  )
}

export default CertificatesPage
