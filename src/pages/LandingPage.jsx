import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Map,
  Menu,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import BrandLogo from '../components/BrandLogo'
import useAuthStore from '../store/authStore'

const phrases = [
  'Find out what to learn next.',
  'Build a roadmap for your goal.',
  'Practice skills with purpose.',
  'Make progress you can see.',
]

const faqs = [
  {
    question: 'Is NextStep AI for fresh graduates?',
    answer:
      'NextStep AI can help people starting their careers, job seekers who want more direction, and learners considering a career change.',
  },
  {
    question: 'Will it guarantee me a job?',
    answer:
      'No platform can honestly guarantee a job. NextStep AI is designed to help you identify learning priorities, practice skills, and prepare more deliberately.',
  },
  {
    question: 'What happens after I find my skill gaps?',
    answer:
      'Use the analysis to create a learning roadmap, then work through learning materials, practical tasks, and quizzes while tracking your progress.',
  },
  {
    question: 'Can I earn a certificate?',
    answer:
      'Certificates are available for eligible completed learning activity in the platform. Requirements depend on the roadmap and its configured milestones.',
  },
]

const riseIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
}

const LandingPage = () => {
  const prefersReducedMotion = useReducedMotion()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useDocumentMeta({
    title: 'NextStep AI — Make Your Next Move Count',
    description:
      'Understand your skill gaps, follow a learning roadmap made for your target role, and track your progress with NextStep AI.',
  })

  useEffect(() => {
    if (prefersReducedMotion) return undefined

    const intervalId = window.setInterval(() => {
      setPhraseIndex((currentIndex) => (currentIndex + 1) % phrases.length)
    }, 2800)

    return () => window.clearInterval(intervalId)
  }, [prefersReducedMotion])

  const closeMenu = () => setMenuOpen(false)
  const startLearning = () => {
    closeMenu()
    navigate(isAuthenticated ? '/analyze' : '/register')
  }

  return (
    <div className="conversion-landing">
      <header className="conversion-header">
        <div className="conversion-container conversion-nav">
          <Link to="/" className="conversion-brand" aria-label="NextStep AI home" onClick={closeMenu}>
            <BrandLogo className="conversion-brand__logo" alt="" />
            <span>
              NextStep <span className="conversion-brand__ai">AI</span>
            </span>
          </Link>

          <nav
            id="landing-navigation"
            className={`conversion-nav__links${menuOpen ? ' is-open' : ''}`}
            aria-label="Main navigation"
          >
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#roadmap" onClick={closeMenu}>Your roadmap</a>
            <a href="#questions" onClick={closeMenu}>FAQs</a>
            <Link to="/login" onClick={closeMenu}>Sign in</Link>
            <Link className="conversion-nav__signup" to="/register" onClick={closeMenu}>Sign up</Link>
          </nav>

          <button type="button" className="conversion-nav__cta" onClick={startLearning}>
            Get Started <ArrowRight size={15} />
          </button>

          <button
            type="button"
            className="conversion-nav__menu"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="landing-navigation"
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      <main>
        <section className="conversion-hero" id="home">
          <div className="conversion-hero__fallback" />
          <video
            className="conversion-hero__video"
            src="/Herosectionvideo.mp4"
            poster="/nextsteplogo.png"
            autoPlay={!prefersReducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          />
          <div className="conversion-hero__shade" />

          <motion.div
            className="conversion-container conversion-hero__inner"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div className="conversion-pill" variants={riseIn}>
              <span className="conversion-pill__dot" />
              A clearer path to your career goals
            </motion.div>

            <motion.h1 className="conversion-hero__title" variants={riseIn}>
              Sending CVs.
              <span className="conversion-hero__orange">Getting rejected?</span>
              <span className="conversion-hero__dynamic" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={phrases[phraseIndex]}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 13 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                  >
                    {phrases[phraseIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p className="conversion-hero__copy" variants={riseIn}>
              Stop guessing what employers want. Discover the skills your target role needs, get a
              step-by-step learning roadmap, and track your progress in one place.
            </motion.p>

            <motion.div className="conversion-hero__actions" variants={riseIn}>
              <motion.div whileHover={prefersReducedMotion ? undefined : { y: -3 }} whileTap={{ scale: 0.98 }}>
                <button type="button" onClick={startLearning} className="conversion-button conversion-button--primary">
                  Build My Career Roadmap <ArrowRight size={17} />
                </button>
              </motion.div>
              <motion.div whileHover={prefersReducedMotion ? undefined : { y: -3 }} whileTap={{ scale: 0.98 }}>
                <a href="#how-it-works" className="conversion-button conversion-button--ghost">
                  See How It Works <ArrowDown size={16} />
                </a>
              </motion.div>
            </motion.div>

            <motion.div className="conversion-hero__note" variants={riseIn}>
              <span className="conversion-hero__tick"><Check size={13} /></span>
              For fresh graduates, job seekers, and career changers.
            </motion.div>
          </motion.div>

          <a href="#problem" className="conversion-scroll-cue">
            <i aria-hidden="true" /> Scroll to see a better way
          </a>
        </section>

        <section className="conversion-section" id="problem">
          <div className="conversion-container">
            <motion.div
              className="conversion-section__head"
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-70px' }}
              variants={riseIn}
            >
              <span className="conversion-kicker">Sound familiar?</span>
              <h2>Applying more isn&apos;t always the answer.</h2>
              <p>
                When you&apos;re starting out, it&apos;s hard to know which skills matter most — or what to
                work on first.
              </p>
            </motion.div>

            <div className="conversion-problem-grid">
              <motion.article
                className="conversion-problem-card"
                initial={prefersReducedMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={riseIn}
              >
                <span className="conversion-problem-card__icon" aria-hidden="true"><Search size={21} /></span>
                <span className="conversion-card-label">Without a clear plan</span>
                <h3>You&apos;re working hard, but guessing.</h3>
                <p>
                  You want a job, but job descriptions can feel like a long list of requirements with
                  no obvious starting point.
                </p>
                <ul className="conversion-bullets">
                  <li><span className="conversion-bullet-icon">×</span> Unsure which required skills you&apos;re missing</li>
                  <li><span className="conversion-bullet-icon">×</span> Random tutorials with no learning order</li>
                  <li><span className="conversion-bullet-icon">×</span> No clear way to measure your progress</li>
                </ul>
              </motion.article>

              <motion.article
                className="conversion-problem-card conversion-problem-card--dark"
                initial={prefersReducedMotion ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.1 }}
                variants={riseIn}
              >
                <span className="conversion-problem-card__icon conversion-problem-card__icon--positive" aria-hidden="true"><Target size={21} /></span>
                <span className="conversion-card-label">A more focused approach</span>
                <h3>Know what to improve next.</h3>
                <p>NextStep AI helps turn a broad career goal into smaller, actionable learning steps.</p>
                <ul className="conversion-bullets">
                  <li><span className="conversion-bullet-icon"><Check size={13} /></span> Understand potential skill gaps against your target role</li>
                  <li><span className="conversion-bullet-icon"><Check size={13} /></span> Follow a personalized roadmap in a sensible order</li>
                  <li><span className="conversion-bullet-icon"><Check size={13} /></span> Practice, track milestones, and see your progress</li>
                </ul>
              </motion.article>
            </div>
          </div>
        </section>

        <section className="conversion-section conversion-section--white" id="roadmap">
          <div className="conversion-container conversion-solution">
            <motion.div
              className="conversion-solution__copy"
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-70px' }}
              variants={riseIn}
            >
              <span className="conversion-kicker">Start with clarity</span>
              <h2>Know where you stand before you plan your next move.</h2>
              <p>
                Use your resume and a target job role to explore the skills you may need to
                strengthen. Instead of learning everything at once, focus on the next useful step.
              </p>
              <p>
                NextStep AI is designed to help you prepare more intentionally — not promise instant
                results or guaranteed employment.
              </p>
              <button type="button" onClick={startLearning} className="conversion-button conversion-button--primary">
                Find My Skill Gaps <ArrowRight size={17} />
              </button>
            </motion.div>

            <motion.div
              className="conversion-preview-shell"
              role="group"
              aria-label="Illustrative skill gap analysis preview"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55 }}
            >
              <span className="conversion-preview__float conversion-preview__float--one" aria-hidden="true"><Check size={13} /> HTML &amp; CSS</span>
              <span className="conversion-preview__float conversion-preview__float--two" aria-hidden="true"><Sparkles size={13} /> Learn next</span>
              <div className="conversion-preview">
              <div className="conversion-preview__top">
                <span className="conversion-preview__brand">
                  NextStep AI <span>/ Skill overview</span>
                </span>
                <span className="conversion-preview__status">Example preview</span>
              </div>
              <div className="conversion-preview__body">
                <span className="conversion-preview__label">Your target role</span>
                <h3>Frontend Developer</h3>
                <div className="conversion-preview__snapshot">
                  <div className="conversion-preview__icon"><Target size={24} /></div>
                  <div>
                    <strong>A starting-point snapshot</strong>
                    <span>An illustrative view of how skill matches could be presented.</span>
                  </div>
                </div>
                <div className="conversion-skill-list">
                  <div className="conversion-skill-row"><span className="conversion-skill-row__name"><Check size={14} /> HTML &amp; CSS</span><span className="conversion-tag conversion-tag--good">Strength</span><span className="conversion-skill-row__track" aria-hidden="true"><i className="conversion-skill-row__fill conversion-skill-row__fill--strong" /></span></div>
                  <div className="conversion-skill-row"><span className="conversion-skill-row__name"><BookOpen size={14} /> JavaScript</span><span className="conversion-tag">Needs practice</span><span className="conversion-skill-row__track" aria-hidden="true"><i className="conversion-skill-row__fill conversion-skill-row__fill--practice" /></span></div>
                  <div className="conversion-skill-row"><span className="conversion-skill-row__name"><Sparkles size={14} /> React</span><span className="conversion-tag">Learn next</span><span className="conversion-skill-row__track" aria-hidden="true"><i className="conversion-skill-row__fill conversion-skill-row__fill--next" /></span></div>
                  <div className="conversion-skill-row"><span className="conversion-skill-row__name"><Target size={14} /> Testing &amp; Git</span><span className="conversion-tag">Build confidence</span><span className="conversion-skill-row__track" aria-hidden="true"><i className="conversion-skill-row__fill conversion-skill-row__fill--build" /></span></div>
                </div>
              </div>
              <div className="conversion-preview__foot">
                Illustrative UI only — this is not a real ATS score or analysis result.
              </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="conversion-section" id="how-it-works">
          <div className="conversion-container">
            <motion.div
              className="conversion-section__head"
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-70px' }}
              variants={riseIn}
            >
              <span className="conversion-kicker">One step at a time</span>
              <h2>A roadmap you can actually follow.</h2>
              <p>Turn a career goal into a practical learning journey, with clear milestones along the way.</p>
            </motion.div>

            <div className="conversion-steps">
              {[
                { icon: Search, title: 'Identify your skill gaps', text: 'Choose your target role and review the skills to focus on based on your current experience and the role’s requirements.' },
                { icon: BookOpen, title: 'Learn, practice, and test', text: 'Follow learning resources, complete practical tasks, take quizzes, and keep track of completed milestones.' },
                { icon: Award, title: 'Complete your roadmap', text: 'Review your progress and earn a certificate of completion when you meet the platform’s requirements.' },
              ].map(({ icon: Icon, title, text }, index) => (
                <motion.article
                  className="conversion-step"
                  key={title}
                  initial={prefersReducedMotion ? false : 'hidden'}
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ delay: index * 0.1 }}
                  variants={riseIn}
                >
                  <div className="conversion-step__top">
                    <span className={`conversion-step__icon conversion-step__icon--${index + 1}`}><Icon size={21} /></span>
                    <span className="conversion-step__number">0{index + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="conversion-section conversion-section--blue" id="features">
          <div className="conversion-container">
            <motion.div
              className="conversion-section__head"
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-70px' }}
              variants={riseIn}
            >
              <span className="conversion-kicker">Built around your progress</span>
              <h2>More direction. Less overwhelm.</h2>
              <p>Everything is organized to help you keep moving, one manageable task at a time.</p>
            </motion.div>

            <div className="conversion-outcomes">
              {[
                { icon: Target, title: 'Clear priorities', text: 'Know which skills to focus on first.' },
                { icon: Map, title: 'Personal roadmap', text: 'Follow an ordered plan instead of guessing.' },
                { icon: BookOpen, title: 'Practice & quizzes', text: 'Check your understanding as you learn.' },
                { icon: Award, title: 'Visible milestones', text: 'Track completion and see your progress.' },
              ].map(({ icon: Icon, title, text }, index) => (
                <motion.article
                  className="conversion-outcome"
                  key={title}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                >
                  <span className="conversion-outcome__icon"><Icon size={21} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </motion.article>
              ))}
            </div>
            <div className="conversion-features__action">
              <p>Start with your target role and make a plan that fits your next step.</p>
              <Link to={isAuthenticated ? '/analyze' : '/register'} className="conversion-button conversion-button--primary">
                Create Your Roadmap <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className="conversion-section" id="questions">
          <div className="conversion-container">
            <motion.div
              className="conversion-section__head"
              initial={prefersReducedMotion ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, margin: '-70px' }}
              variants={riseIn}
            >
              <span className="conversion-kicker">Good questions</span>
              <h2>Before you take your next step.</h2>
              <p>A few quick answers to help you decide if NextStep AI fits your learning journey.</p>
            </motion.div>

            <div className="conversion-faq-grid">
              {faqs.map(({ question, answer }, index) => {
                const isOpen = openFaq === index
                const answerId = `landing-faq-answer-${index}`

                return (
                  <motion.article
                    className={`conversion-faq${isOpen ? ' is-open' : ''}`}
                    key={question}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-35px' }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                  >
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? answerId : undefined}
                        id={`landing-faq-question-${index}`}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                      >
                        <span>{question}</span>
                        <ChevronDown size={18} aria-hidden="true" />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          id={answerId}
                          role="region"
                          aria-labelledby={`landing-faq-question-${index}`}
                          className="conversion-faq__answer"
                          initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <p>{answer}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="conversion-final">
          <div className="conversion-container">
            <motion.div
              className="conversion-final__card"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55 }}
            >
              <span className="conversion-final__glow" />
              <span className="conversion-kicker">Your next step starts here</span>
              <h2>You don&apos;t need to learn everything today.</h2>
              <p>
                You just need to know what to work on next. Start with your target role and turn
                uncertainty into a plan you can follow.
              </p>
              <button type="button" onClick={startLearning} className="conversion-button conversion-button--primary">
                Find My Next Step <ArrowRight size={17} />
              </button>
              <span className="conversion-final__note">Start with a goal. Build progress one step at a time.</span>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
