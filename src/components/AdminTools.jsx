import { useCallback, useEffect, useState } from 'react'
import { Search, Plus, Pencil, Archive, Upload, Download, Trash2, RefreshCw, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { EmptyState, SectionCard } from './AppShell'

const moduleOptions = [
  { id: 'career-roles', label: 'Career roles', roles: ['admin', 'super_admin', 'content_manager'] },
  { id: 'skills', label: 'Skills', roles: ['admin', 'super_admin', 'content_manager'] },
  { id: 'roadmap-templates', label: 'Roadmap templates', roles: ['admin', 'super_admin', 'content_manager'] },
  { id: 'resume-analyses', label: 'Resume analyses', roles: ['admin', 'super_admin'] },
  { id: 'quiz-attempts', label: 'Quiz attempts', roles: ['admin', 'super_admin', 'content_manager', 'instructor'] },
  { id: 'media', label: 'Media library', roles: ['admin', 'super_admin', 'content_manager'] },
  { id: 'communications', label: 'Announcements', roles: ['admin', 'super_admin'] },
  { id: 'settings', label: 'Platform settings', roles: ['admin', 'super_admin'] },
  { id: 'audit-logs', label: 'Audit log', roles: ['admin', 'super_admin'] },
  { id: 'reports', label: 'Reports', roles: ['admin', 'super_admin', 'content_manager', 'instructor'] },
]

const apiByModule = {
  'career-roles': { list: adminAPI.getCareerRoles, create: adminAPI.createCareerRole, update: adminAPI.updateCareerRole, archive: adminAPI.archiveCareerRole, label: 'Career role' },
  skills: { list: adminAPI.getSkills, create: adminAPI.createSkill, update: adminAPI.updateSkill, archive: adminAPI.archiveSkill, label: 'Skill' },
  'roadmap-templates': { list: adminAPI.getRoadmapTemplates, create: adminAPI.createRoadmapTemplate, update: adminAPI.updateRoadmapTemplate, archive: adminAPI.archiveRoadmapTemplate, label: 'Roadmap template' },
}

const emptyObject = (module) => {
  if (module === 'career-roles') return { title: '', description: '', category: '', experience_level: 'entry', required_skills: [], recommended_skills: [], learning_resources: [], status: 'draft' }
  if (module === 'skills') return { name: '', description: '', category: '', proficiency_levels: [], career_role_ids: [], status: 'draft' }
  return { title: '', target_role: '', description: '', experience_level: 'entry', stages: [{ title: '', description: '', skill_names: [], course_ids: [], prerequisite_stage_ids: [] }], status: 'draft' }
}

const AdminTools = ({ role }) => {
  const options = moduleOptions.filter((item) => item.roles.includes(role))
  const [module, setModule] = useState(options[0]?.id || '')
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editor, setEditor] = useState(null)
  const [jsonText, setJsonText] = useState('')
  const [settings, setSettings] = useState({})
  const [report, setReport] = useState(null)
  const [templates, setTemplates] = useState([])
  const [announcement, setAnnouncement] = useState({ title: '', message: '', audience: 'all', user_ids: '', template_id: '' })
  const [uploadFile, setUploadFile] = useState(null)

  const loadModule = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: 50, search }
      if (module === 'career-roles') setRows((await adminAPI.getCareerRoles(params)).data.data || [])
      else if (module === 'skills') setRows((await adminAPI.getSkills(params)).data.data || [])
      else if (module === 'roadmap-templates') setRows((await adminAPI.getRoadmapTemplates(params)).data.data || [])
      else if (module === 'resume-analyses') setRows((await adminAPI.getResumeAnalyses(params)).data.data || [])
      else if (module === 'quiz-attempts') setRows((await adminAPI.getQuizAttempts(params)).data.data || [])
      else if (module === 'media') setRows((await adminAPI.getMedia(params)).data.data || [])
      else if (module === 'audit-logs') setRows((await adminAPI.getAuditLogs(params)).data.data || [])
      else if (module === 'communications') {
        setTemplates((await adminAPI.getNotificationTemplates()).data.data || [])
        setRows([])
      } else if (module === 'settings') {
        const response = await adminAPI.getSettings()
        setSettings(Object.fromEntries((response.data.data || []).map((item) => [item.key, item.value || ''])))
        setRows([])
      } else if (module === 'reports') {
        setReport((await adminAPI.getReports()).data)
        setRows([])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to load ${module.replaceAll('-', ' ')}`)
    } finally {
      setLoading(false)
    }
  }, [module, search])

  useEffect(() => {
    loadModule()
  }, [loadModule])

  const beginEdit = (item = null) => {
    const value = item || emptyObject(module)
    setEditor(item || {})
    setJsonText(JSON.stringify(value, null, 2))
  }

  const saveRecord = async (event) => {
    event.preventDefault()
    const actions = apiByModule[module]
    try {
      const data = JSON.parse(jsonText)
      if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Enter a JSON object.')
      if (editor?._id) await actions.update(editor._id, data)
      else await actions.create(data)
      toast.success(`${actions.label} saved`)
      setEditor(null)
      await loadModule()
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || `Failed to save ${actions.label.toLowerCase()}`)
    }
  }

  const archiveRecord = async (item) => {
    const actions = apiByModule[module]
    if (!window.confirm(`Archive this ${actions.label.toLowerCase()}?`)) return
    try {
      await actions.archive(item._id)
      toast.success(`${actions.label} archived`)
      await loadModule()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to archive ${actions.label.toLowerCase()}`)
    }
  }

  const uploadMedia = async (event) => {
    event.preventDefault()
    if (!uploadFile) return
    const formElement = event.currentTarget
    const formData = new FormData()
    formData.append('file', uploadFile)
    try {
      await adminAPI.uploadMedia(formData)
      setUploadFile(null)
      formElement.reset()
      toast.success('Media uploaded privately')
      await loadModule()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload media')
    }
  }

  const downloadMedia = async (asset) => {
    try {
      const response = await adminAPI.downloadMedia(asset.id)
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = asset.original_name
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download media')
    }
  }

  const deleteMedia = async (asset) => {
    if (!window.confirm(`Delete ${asset.original_name}?`)) return
    try {
      await adminAPI.deleteMedia(asset.id)
      toast.success('Media deleted')
      await loadModule()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete media')
    }
  }

  const saveSettings = async (event) => {
    event.preventDefault()
    try {
      await adminAPI.updateSettings(settings)
      toast.success('Platform settings saved')
      await loadModule()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings')
    }
  }

  const createTemplate = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    try {
      await adminAPI.createNotificationTemplate({
        name: form.get('name'),
        title: form.get('title'),
        message: form.get('message'),
      })
      toast.success('Notification template saved')
      formElement.reset()
      await loadModule()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save template')
    }
  }

  const publishAnnouncement = async (event) => {
    event.preventDefault()
    try {
      await adminAPI.publishAnnouncement({
        ...announcement,
        user_ids: announcement.audience === 'selected'
          ? announcement.user_ids.split(',').map((id) => id.trim()).filter(Boolean)
          : [],
      })
      toast.success('Announcement published in-app')
      setAnnouncement({ title: '', message: '', audience: 'all', user_ids: '', template_id: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish announcement')
    }
  }

  const renderRows = () => {
    if (loading) return <p className="py-10 text-center text-sm text-[var(--text-muted)]">Loading module…</p>
    if (!rows.length) return <EmptyState title="No records found" description="Records will appear here as they are created." />
    if (apiByModule[module]) {
      return (
        <div className="divide-y divide-[var(--border-soft)]">
          {rows.map((item) => (
            <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-bold">{item.title || item.name || 'Untitled'}</p>
                <p className="text-sm text-[var(--text-secondary)]">{item.category || item.target_role || item.status || '—'}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={() => beginEdit(item)}><Pencil size={15} /> Edit</button>
                {item.status !== 'archived' ? <button type="button" className="btn-secondary text-red-600" onClick={() => archiveRecord(item)}><Archive size={15} /> Archive</button> : null}
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (module === 'media') {
      return <div className="divide-y divide-[var(--border-soft)]">{rows.map((asset) => (
        <div key={asset.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div><p className="font-bold">{asset.original_name}</p><p className="text-sm text-[var(--text-secondary)]">{asset.mime_type} · {Math.ceil(asset.size / 1024)} KB</p></div>
          <div className="flex gap-2"><button type="button" className="btn-secondary" onClick={() => downloadMedia(asset)}><Download size={15} /> Download</button><button type="button" className="btn-secondary text-red-600" onClick={() => deleteMedia(asset)}><Trash2 size={15} /> Delete</button></div>
        </div>
      ))}</div>
    }
    const columns = module === 'resume-analyses'
      ? ['user_name', 'user_email', 'target_role', 'status', 'has_resume', 'started_at']
      : module === 'quiz-attempts'
        ? ['user_name', 'quiz_title', 'score', 'total', 'percentage', 'passed', 'completed_at']
        : ['actor_name', 'action', 'subject_type', 'subject_id', 'created_at']
    return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-[var(--border-soft)] text-xs uppercase text-[var(--text-muted)]">{columns.map((key) => <th key={key} className="py-3 pr-4">{key.replaceAll('_', ' ')}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-[var(--border-soft)]/70">{columns.map((key) => <td key={key} className="py-3 pr-4">{typeof row[key] === 'boolean' ? (row[key] ? 'Yes' : 'No') : row[key] ? String(row[key]) : '—'}</td>)}</tr>)}</tbody></table></div>
  }

  return (
    <SectionCard>
      <div className="mb-5 flex flex-wrap gap-2">
        {options.map((item) => <button type="button" key={item.id} onClick={() => { setModule(item.id); setSearch(''); setEditor(null) }} className={`rounded-full px-4 py-2 text-sm font-bold ${module === item.id ? 'bg-[var(--brand-charcoal)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)]'}`}>{item.label}</button>)}
      </div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-2xl font-bold">{options.find((item) => item.id === module)?.label || 'Admin tools'}</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Manage platform data, communications, and operational reporting.</p></div>
        {['career-roles', 'skills', 'roadmap-templates'].includes(module) ? <button type="button" className="btn-primary" onClick={() => beginEdit()}><Plus size={16} /> New record</button> : null}
      </div>

      {['career-roles', 'skills', 'roadmap-templates', 'resume-analyses', 'quiz-attempts', 'media', 'audit-logs'].includes(module) ? (
        <div className="mb-4 flex gap-2">
          <div className="relative w-full max-w-md"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input aria-label="Search module" className="input-field w-full pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" /></div>
          <button type="button" className="btn-secondary" onClick={loadModule}><RefreshCw size={15} /> Refresh</button>
        </div>
      ) : null}

      {editor ? (
        <form onSubmit={saveRecord} className="mb-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
          <label className="block text-sm font-semibold">Record fields (JSON)
            <textarea required rows={12} className="input-field mt-2 w-full font-mono text-xs" value={jsonText} onChange={(event) => setJsonText(event.target.value)} />
          </label>
          <div className="mt-3 flex justify-end gap-2"><button type="button" className="btn-secondary" onClick={() => setEditor(null)}>Cancel</button><button type="submit" className="btn-primary">Save record</button></div>
        </form>
      ) : null}

      {module === 'media' ? <form onSubmit={uploadMedia} className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl bg-[var(--surface)] p-4"><label className="text-sm font-semibold">Upload file (PDF, DOCX, JPG, PNG, WebP; up to 10 MB)<input required type="file" accept=".pdf,.docx,.jpg,.jpeg,.png,.webp" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} className="input-field mt-2 block" /></label><button type="submit" disabled={!uploadFile} className="btn-primary disabled:opacity-50"><Upload size={16} /> Upload privately</button></form> : null}

      {module === 'settings' ? <form onSubmit={saveSettings} className="grid gap-4 sm:grid-cols-2">
        {[
          ['site_name', 'Site name'], ['support_email', 'Support email'], ['support_url', 'Support URL'], ['maintenance_notice', 'Maintenance notice'],
        ].map(([key, label]) => <label key={key} className="text-sm font-semibold">{label}{key === 'maintenance_notice' ? <textarea rows={4} className="input-field mt-1 w-full" value={settings[key] || ''} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} /> : <input className="input-field mt-1 w-full" type={key === 'support_email' ? 'email' : 'text'} value={settings[key] || ''} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} />}</label>)}
        <div className="sm:col-span-2"><button type="submit" className="btn-primary">Save settings</button></div>
      </form> : null}

      {module === 'communications' ? <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={publishAnnouncement} className="grid gap-3">
          <h3 className="text-lg font-bold">Publish in-app announcement</h3>
          <select
            className="input-field"
            value={announcement.template_id}
            onChange={(event) => {
              const template = templates.find((item) => item._id === event.target.value)
              setAnnouncement({
                ...announcement,
                template_id: event.target.value,
                ...(template ? { title: template.title, message: template.message } : {}),
              })
            }}
            aria-label="Use notification template"
          >
            <option value="">Write announcement without a template</option>
            {templates.filter((item) => item.status === 'active').map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
          </select>
          <input required maxLength={200} className="input-field" placeholder="Announcement title" value={announcement.title} onChange={(event) => setAnnouncement({ ...announcement, title: event.target.value })} />
          <textarea required maxLength={5000} rows={5} className="input-field" placeholder="Message" value={announcement.message} onChange={(event) => setAnnouncement({ ...announcement, message: event.target.value })} />
          <select className="input-field" value={announcement.audience} onChange={(event) => setAnnouncement({ ...announcement, audience: event.target.value })}><option value="all">All users</option><option value="selected">Selected user IDs</option></select>
          {announcement.audience === 'selected' ? <input required className="input-field" placeholder="Comma-separated user IDs" value={announcement.user_ids} onChange={(event) => setAnnouncement({ ...announcement, user_ids: event.target.value })} /> : null}
          <button className="btn-primary" type="submit"><Send size={16} /> Publish</button>
        </form>
        <form onSubmit={createTemplate} className="grid content-start gap-3">
          <h3 className="text-lg font-bold">Create notification template</h3>
          <input name="name" required maxLength={120} className="input-field" placeholder="Template name" />
          <input name="title" required maxLength={200} className="input-field" placeholder="Default title" />
          <textarea name="message" required maxLength={5000} rows={5} className="input-field" placeholder="Default message" />
          <button className="btn-secondary" type="submit">Save template</button>
          <div className="mt-2 divide-y divide-[var(--border-soft)]">{templates.map((item) => <div key={item._id} className="py-3"><p className="font-semibold">{item.name}</p><p className="text-sm text-[var(--text-secondary)]">{item.title}</p></div>)}</div>
        </form>
      </div> : null}

      {module === 'reports' ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {report ? Object.entries(report).filter(([key]) => key !== 'range').map(([key, value]) => <div key={key} className="rounded-2xl bg-[var(--surface)] p-4"><p className="mb-2 font-bold capitalize">{key.replaceAll('_', ' ')}</p><pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words text-xs text-[var(--text-secondary)]">{JSON.stringify(value, null, 2)}</pre></div>) : <p>Loading report…</p>}
      </div> : null}

      {!['settings', 'communications', 'reports'].includes(module) ? renderRows() : null}
    </SectionCard>
  )
}

export default AdminTools
