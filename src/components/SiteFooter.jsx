import { ArrowUpRight, Mail } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo'

const SiteFooter = () => {
  const { pathname } = useLocation()
  const isLandingPage = pathname === '/'

  return (
    <footer className={`border-t border-[var(--border-soft)] bg-[var(--surface)]${isLandingPage ? ' conversion-footer' : ''}`}>
      <div className="page-shell px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/50" aria-label="NextStep AI home">
              <BrandLogo className="h-12 w-auto object-contain sm:h-14" alt="NextStep AI logo" />
              <span className="font-[var(--font-heading)] text-lg font-extrabold tracking-tight">
                <span className="text-[#0878e8]">NextStep</span>{' '}
                <span className="text-[#ff7a2f]">AI</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              Learn with focus, build practical skills, and make your next career step with confidence.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Explore</h2>
            <nav aria-label="Footer explore links" className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
              <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/">Home</Link>
              {isLandingPage ? (
                <>
                  <a className="transition-colors hover:text-[var(--brand-blue)]" href="#how-it-works">How it works</a>
                  <a className="transition-colors hover:text-[var(--brand-blue)]" href="#roadmap">Your roadmap</a>
                  <a className="transition-colors hover:text-[var(--brand-blue)]" href="#questions">FAQs</a>
                </>
              ) : null}
              <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/roadmaps">Roadmaps</Link>
              <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/courses">Courses</Link>
              <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/register">Create an account</Link>
              {isLandingPage ? <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/login">Sign in</Link> : null}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--text-primary)]">Resources</h2>
            <nav aria-label="Footer resource links" className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
              <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/contact">Contact</Link>
              <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/privacy">Privacy policy</Link>
              <Link className="transition-colors hover:text-[var(--brand-blue)]" to="/terms">Terms of use</Link>
              <a className="inline-flex items-center gap-2 transition-colors hover:text-[var(--brand-blue)]" href="mailto:support@nextstepai.app">
                <Mail size={15} /> Email support <ArrowUpRight size={14} />
              </a>
            </nav>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-[var(--border-soft)] pt-5 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NextStep AI. All rights reserved.</p>
          <p>Learn · Build · Grow</p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
