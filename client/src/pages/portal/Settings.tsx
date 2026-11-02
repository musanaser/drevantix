import { Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { PageBody } from '../../components/portal/PortalLayout'
import { Button, Card, CardHeader, ErrorText, Field, Input, Modal, PageHeader, Select } from '../../components/ui'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useFleet } from '../../lib/fleet'
import { fmtDate } from '../../lib/format'
import type { User } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export default function Settings() {
  const { user } = useAuth()
  const { companyId, scopeKey } = useFleet()
  const canManage = user?.role === 'manager' || (user?.role === 'admin' && !!companyId)
  const users = useApi<(User & { created_at: number })[]>(canManage ? '/users' : null, undefined, [scopeKey])
  const [pw, setPw] = useState({ current: '', next: '' })
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [adding, setAdding] = useState(false)

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    try {
      await api('/auth/password', { method: 'PUT', body: pw })
      setPw({ current: '', next: '' })
      setPwMsg({ ok: true, text: 'Password updated.' })
    } catch (err) {
      setPwMsg({ ok: false, text: (err as Error).message })
    }
  }
  async function removeUser(u: User) {
    if (!confirm(`Remove ${u.name}?`)) return
    await api(`/users/${u.id}`, { method: 'DELETE' })
    users.reload()
  }

  return (
    <PageBody>
      <PageHeader title="Settings" subtitle="Your account and team" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <dl className="divide-y divide-slate-100 text-sm">
            {[
              ['Name', user?.name],
              ['Email', user?.email],
              ['Role', user?.role],
              ['Company', user?.company?.name ?? 'Drevantix'],
              ['Plan', user?.company?.plan ?? '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between px-5 py-3"><dt className="text-slate-500">{l}</dt><dd className="font-medium text-navy-900 capitalize">{v}</dd></div>
            ))}
          </dl>
        </Card>
        <Card>
          <CardHeader title="Change password" />
          <form onSubmit={changePassword} className="space-y-4 p-5">
            <Field label="Current password"><Input type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <Field label="New password" hint="At least 6 characters"><Input type="password" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            {pwMsg && <p className={`text-sm ${pwMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{pwMsg.text}</p>}
            <Button type="submit">Update password</Button>
          </form>
        </Card>
      </div>
      {canManage && (
        <Card className="mt-6">
          <CardHeader title="Team members" subtitle="People who can access this portal" action={<Button size="sm" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Invite user</Button>} />
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Added</th><th /></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.data?.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium text-navy-900">{u.name}</td>
                  <td className="px-5 py-3 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3 text-slate-600 capitalize">{u.role}</td>
                  <td className="px-5 py-3 text-slate-500">{fmtDate(u.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    {u.id !== user?.id && <button onClick={() => removeUser(u)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {adding && <AddUser onClose={() => setAdding(false)} onSaved={() => { setAdding(false); users.reload() }} />}
    </PageBody>
  )
}

function AddUser({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' })
  const [error, setError] = useState<string | null>(null)
  async function submit(e: FormEvent) {
    e.preventDefault()
    try {
      await api('/users', { method: 'POST', body: form })
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    }
  }
  return (
    <Modal open onClose={onClose} title="Invite user">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Temporary password"><Input required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="Role">
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="viewer">Viewer (read-only)</option>
            <option value="manager">Manager (full access)</option>
          </Select>
        </Field>
        <ErrorText error={error} />
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Create user</Button></div>
      </form>
    </Modal>
  )
}
