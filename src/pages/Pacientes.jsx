import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Users, Phone, Mail, CalendarPlus, History } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Modal, { Confirm } from '../components/Modal.jsx'
import AppointmentModal from '../components/AppointmentModal.jsx'
import { Field, Empty, StatusBadge, listItem } from '../components/UI.jsx'
import { maskCPF, maskPhone, validCPF, initials, fmtDate, todayISO } from '../utils.js'

const EMPTY = { nome: '', cpf: '', telefone: '', email: '', nascimento: '', convenio: 'Particular', obs: '' }

const idade = (iso) => {
  if (!iso) return ''
  const n = new Date(iso), h = new Date()
  let a = h.getFullYear() - n.getFullYear()
  if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) a--
  return `${a} anos`
}

export default function Pacientes() {
  const { pacientes, agendamentos, pacientesApi, removePaciente, byId } = useData()
  const toast = useToast()
  const [params] = useSearchParams()
  const [busca, setBusca] = useState(params.get('q') || '')
  const [form, setForm] = useState(null) // null = fechado
  const [errors, setErrors] = useState({})
  const [del, setDel] = useState(null)
  const [hist, setHist] = useState(null)
  const [agendar, setAgendar] = useState(null)

  useEffect(() => setBusca(params.get('q') || ''), [params])

  const lista = useMemo(() => {
    const q = busca.toLowerCase().trim()
    const qn = q.replace(/\D/g, '')
    return [...pacientes]
      .filter((p) => !q || p.nome.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q) || (qn && (p.cpf.replace(/\D/g, '').includes(qn) || p.telefone.replace(/\D/g, '').includes(qn))))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [pacientes, busca])

  const set = (k, mask) => (e) => setForm((f) => ({ ...f, [k]: mask ? mask(e.target.value) : e.target.value }))

  const save = () => {
    const e = {}
    if (form.nome.trim().length < 3) e.nome = 'Informe o nome completo'
    if (!validCPF(form.cpf)) e.cpf = 'CPF inválido'
    else if (pacientes.some((p) => p.cpf === form.cpf && p.id !== form.id)) e.cpf = 'CPF já cadastrado'
    if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'E-mail inválido'
    if (form.nascimento && form.nascimento > todayISO()) e.nascimento = 'Data futura'
    setErrors(e)
    if (Object.keys(e).length) return toast('Verifique os campos', 'error')
    if (form.id) {
      pacientesApi.update(form.id, form)
      toast('Paciente atualizado!')
    } else {
      pacientesApi.add(form)
      toast('Paciente cadastrado!')
    }
    setForm(null)
  }

  const histList = hist ? agendamentos.filter((a) => a.pacienteId === hist.id).sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora)) : []

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Pacientes</h2>
          <p className="muted">{pacientes.length} cadastrado(s)</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="btn primary" onClick={() => { setErrors({}); setForm({ ...EMPTY }) }}>
          <Plus size={18} /> Novo paciente
        </motion.button>
      </div>

      <div className="filters card">
        <label className="input-icon grow">
          <Search size={16} />
          <input placeholder="Buscar por nome, CPF, telefone ou e-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
      </div>

      {lista.length === 0 ? (
        <div className="card"><Empty icon={Users} title="Nenhum paciente encontrado" /></div>
      ) : (
        <motion.div className="cards-grid" layout>
          <AnimatePresence>
            {lista.map((p, i) => {
              const total = agendamentos.filter((a) => a.pacienteId === p.id).length
              return (
                <motion.div key={p.id} layout variants={listItem} initial="hidden" animate="show" exit="exit" custom={i} className="card person-card" whileHover={{ y: -4 }}>
                  <div className="person-top">
                    <div className="avatar lg">{initials(p.nome)}</div>
                    <div>
                      <strong>{p.nome}</strong>
                      <small className="muted">{p.cpf} {p.nascimento && `· ${idade(p.nascimento)}`}</small>
                    </div>
                  </div>
                  <ul className="person-meta">
                    <li><Phone size={14} /> {p.telefone}</li>
                    {p.email && <li><Mail size={14} /> {p.email}</li>}
                    <li><span className="tag">{p.convenio || 'Particular'}</span> <span className="muted">{total} consulta(s)</span></li>
                  </ul>
                  {p.obs && <p className="obs">⚠ {p.obs}</p>}
                  <div className="person-actions">
                    <button className="btn ghost sm" onClick={() => setAgendar(p)}><CalendarPlus size={15} /> Agendar</button>
                    <button className="icon-btn sm" title="Histórico" onClick={() => setHist(p)}><History size={16} /></button>
                    <button className="icon-btn sm" title="Editar" onClick={() => { setErrors({}); setForm({ ...EMPTY, ...p }) }}><Pencil size={16} /></button>
                    <button className="icon-btn sm bad" title="Excluir" onClick={() => setDel(p)}><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? 'Editar paciente' : 'Novo paciente'}
        footer={<><button className="btn ghost" onClick={() => setForm(null)}>Cancelar</button><button className="btn primary" onClick={save}>Salvar</button></>}
      >
        {form && (
          <div className="form-grid">
            <Field label="Nome completo *" error={errors.nome} full><input value={form.nome} onChange={set('nome')} autoFocus /></Field>
            <Field label="CPF *" error={errors.cpf}><input value={form.cpf} onChange={set('cpf', maskCPF)} placeholder="000.000.000-00" /></Field>
            <Field label="Telefone *" error={errors.telefone}><input value={form.telefone} onChange={set('telefone', maskPhone)} placeholder="(47) 99999-9999" /></Field>
            <Field label="E-mail" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></Field>
            <Field label="Nascimento" error={errors.nascimento}><input type="date" value={form.nascimento} onChange={set('nascimento')} /></Field>
            <Field label="Convênio">
              <select value={form.convenio} onChange={set('convenio')}>
                {['Particular', 'OdontoPrev', 'Amil Dental', 'Bradesco Dental', 'SulAmérica Odonto', 'Uniodonto', 'Outro'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Observações / alergias" full><textarea rows={3} value={form.obs} onChange={set('obs')} /></Field>
          </div>
        )}
      </Modal>

      <Modal open={!!hist} onClose={() => setHist(null)} title={`Histórico — ${hist?.nome || ''}`}>
        {histList.length === 0 ? (
          <Empty icon={History} title="Sem consultas registradas" />
        ) : (
          <ul className="timeline">
            {histList.map((a, i) => (
              <motion.li key={a.id} variants={listItem} initial="hidden" animate="show" custom={i}>
                <span className="tl-dot" style={{ background: byId('dentistas', a.dentistaId)?.cor }} />
                <div>
                  <b>{fmtDate(a.data)} {a.hora}</b> — {byId('procedimentos', a.procedimentoId)?.nome}
                  <br /><small className="muted">{byId('dentistas', a.dentistaId)?.nome}</small>
                </div>
                <StatusBadge status={a.status} />
              </motion.li>
            ))}
          </ul>
        )}
      </Modal>

      <AppointmentModal open={!!agendar} preset={agendar ? { pacienteId: agendar.id } : null} onClose={() => setAgendar(null)} />

      <Confirm
        open={!!del}
        onClose={() => setDel(null)}
        text={del && `Excluir ${del.nome}? Todos os agendamentos deste paciente também serão removidos.`}
        onConfirm={() => { removePaciente(del.id); toast('Paciente excluído', 'info') }}
      />
    </div>
  )
}
