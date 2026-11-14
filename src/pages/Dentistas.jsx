import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Stethoscope, Phone, BadgeCheck, Power } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Modal, { Confirm } from '../components/Modal.jsx'
import { Field, Empty, listItem } from '../components/UI.jsx'
import { maskPhone, initials, todayISO } from '../utils.js'

const CORES = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1']
const ESPECIALIDADES = ['Clínico Geral', 'Ortodontia', 'Implantodontia', 'Endodontia', 'Periodontia', 'Odontopediatria', 'Prótese', 'Estética', 'Cirurgia Bucomaxilofacial']
const EMPTY = { nome: '', cro: '', especialidade: 'Clínico Geral', telefone: '', cor: CORES[0], ativo: true }

export default function Dentistas() {
  const { dentistas, agendamentos, dentistasApi, removeDentista } = useData()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [del, setDel] = useState(null)
  const hoje = todayISO()

  const set = (k, mask) => (e) => setForm((f) => ({ ...f, [k]: mask ? mask(e.target.value) : e.target.value }))

  const save = () => {
    const e = {}
    if (form.nome.trim().length < 3) e.nome = 'Informe o nome'
    if (!form.cro.trim()) e.cro = 'Informe o CRO'
    else if (dentistas.some((d) => d.cro.toLowerCase() === form.cro.toLowerCase() && d.id !== form.id)) e.cro = 'CRO já cadastrado'
    setErrors(e)
    if (Object.keys(e).length) return toast('Verifique os campos', 'error')
    if (form.id) { dentistasApi.update(form.id, form); toast('Dentista atualizado!') }
    else { dentistasApi.add(form); toast('Dentista cadastrado!') }
    setForm(null)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Dentistas</h2>
          <p className="muted">{dentistas.filter((d) => d.ativo !== false).length} ativo(s)</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="btn primary" onClick={() => { setErrors({}); setForm({ ...EMPTY, cor: CORES[dentistas.length % CORES.length] }) }}>
          <Plus size={18} /> Novo dentista
        </motion.button>
      </div>

      {dentistas.length === 0 ? (
        <div className="card"><Empty icon={Stethoscope} title="Nenhum dentista cadastrado" /></div>
      ) : (
        <div className="cards-grid">
          <AnimatePresence>
            {dentistas.map((d, i) => {
              const futuros = agendamentos.filter((a) => a.dentistaId === d.id && a.data >= hoje && a.status !== 'cancelado').length
              const concl = agendamentos.filter((a) => a.dentistaId === d.id && a.status === 'concluido').length
              return (
                <motion.div key={d.id} layout variants={listItem} initial="hidden" animate="show" exit="exit" custom={i}
                  className={`card person-card dentist ${d.ativo === false ? 'inactive' : ''}`} style={{ '--c': d.cor }} whileHover={{ y: -4 }}>
                  <div className="dentist-band" />
                  <div className="person-top">
                    <div className="avatar lg" style={{ background: d.cor }}>{initials(d.nome.replace(/^Dr[a]?\.\s*/, ''))}</div>
                    <div>
                      <strong>{d.nome}</strong>
                      <small className="muted"><BadgeCheck size={13} /> {d.cro}</small>
                    </div>
                  </div>
                  <ul className="person-meta">
                    <li><span className="tag" style={{ background: d.cor + '22', color: d.cor }}>{d.especialidade}</span></li>
                    {d.telefone && <li><Phone size={14} /> {d.telefone}</li>}
                  </ul>
                  <div className="mini-stats">
                    <div><b>{futuros}</b><small>agendados</small></div>
                    <div><b>{concl}</b><small>concluídos</small></div>
                  </div>
                  <div className="person-actions">
                    <button className={`btn ghost sm ${d.ativo === false ? '' : 'warn'}`} onClick={() => { dentistasApi.update(d.id, { ativo: d.ativo === false }); toast(d.ativo === false ? 'Dentista ativado' : 'Dentista desativado', 'info') }}>
                      <Power size={15} /> {d.ativo === false ? 'Ativar' : 'Desativar'}
                    </button>
                    <button className="icon-btn sm" title="Editar" onClick={() => { setErrors({}); setForm({ ...EMPTY, ...d }) }}><Pencil size={16} /></button>
                    <button className="icon-btn sm bad" title="Excluir" onClick={() => setDel(d)}><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Editar dentista' : 'Novo dentista'}
        footer={<><button className="btn ghost" onClick={() => setForm(null)}>Cancelar</button><button className="btn primary" onClick={save}>Salvar</button></>}>
        {form && (
          <div className="form-grid">
            <Field label="Nome *" error={errors.nome} full><input value={form.nome} onChange={set('nome')} placeholder="Dra. Maria Silva" autoFocus /></Field>
            <Field label="CRO *" error={errors.cro}><input value={form.cro} onChange={set('cro')} placeholder="CRO-SC 00000" /></Field>
            <Field label="Telefone"><input value={form.telefone} onChange={set('telefone', maskPhone)} /></Field>
            <Field label="Especialidade" full>
              <select value={form.especialidade} onChange={set('especialidade')}>{ESPECIALIDADES.map((e) => <option key={e}>{e}</option>)}</select>
            </Field>
            <Field label="Cor na agenda" full>
              <div className="colors">
                {CORES.map((c) => (
                  <motion.button type="button" key={c} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    className={`color ${form.cor === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setForm((f) => ({ ...f, cor: c }))} />
                ))}
              </div>
            </Field>
          </div>
        )}
      </Modal>

      <Confirm open={!!del} onClose={() => setDel(null)}
        text={del && `Excluir ${del.nome}? Os agendamentos dele(a) também serão removidos.`}
        onConfirm={() => { removeDentista(del.id); toast('Dentista excluído', 'info') }} />
    </div>
  )
}
