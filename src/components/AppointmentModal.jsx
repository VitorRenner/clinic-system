import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import Modal from './Modal.jsx'
import { Field } from './UI.jsx'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { fromMin, toMin, todayISO, money, STATUS, parseISO } from '../utils.js'

const EMPTY = { pacienteId: '', dentistaId: '', procedimentoId: '', data: todayISO(), hora: '', status: 'agendado', obs: '' }

/**
 * Modal de criação/edição de agendamento.
 * props: open, onClose, editing (agendamento ou null), preset ({data, hora, dentistaId})
 */
export default function AppointmentModal({ open, onClose, editing, preset }) {
  const { pacientes, dentistas, procedimentos, agendamentos, config, agendamentosApi, findConflict, byId } = useData()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) return
    setErrors({})
    setForm(editing ? { ...EMPTY, ...editing } : { ...EMPTY, ...(preset || {}) })
  }, [open, editing, preset])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const proc = byId('procedimentos', form.procedimentoId)

  // horários disponíveis para o dentista/data
  const slots = useMemo(() => {
    const ini = toMin(config.abertura)
    const fim = toMin(config.fechamento)
    const step = Number(config.intervalo) || 30
    const dur = proc?.duracao || step
    const list = []
    for (let m = ini; m + dur <= fim; m += step) {
      const hora = fromMin(m)
      const conflict = form.dentistaId && form.data
        ? findConflict({ id: editing?.id, data: form.data, hora, dentistaId: form.dentistaId, pacienteId: form.pacienteId, procedimentoId: form.procedimentoId })
        : null
      list.push({ hora, livre: !conflict })
    }
    return list
  }, [config, proc, form.dentistaId, form.data, form.pacienteId, form.procedimentoId, findConflict, editing, agendamentos])

  const validate = () => {
    const e = {}
    if (!form.pacienteId) e.pacienteId = 'Selecione o paciente'
    if (!form.dentistaId) e.dentistaId = 'Selecione o dentista'
    if (!form.procedimentoId) e.procedimentoId = 'Selecione o procedimento'
    if (!form.data) e.data = 'Informe a data'
    if (!form.hora) e.hora = 'Selecione um horário'
    if (form.data) {
      const dow = parseISO(form.data).getDay()
      if (dow === 0) e.data = 'A clínica não abre aos domingos'
      if (dow === 6 && !config.sabado) e.data = 'A clínica não abre aos sábados'
    }
    if (!editing && form.data && form.data < todayISO()) e.data = 'Não é possível agendar no passado'
    if (form.hora && proc) {
      if (toMin(form.hora) < toMin(config.abertura) || toMin(form.hora) + proc.duracao > toMin(config.fechamento))
        e.hora = `Fora do horário de funcionamento (${config.abertura}–${config.fechamento})`
    }
    if (!e.hora && form.hora && form.dentistaId && form.procedimentoId && form.status !== 'cancelado') {
      const c = findConflict({ ...form, id: editing?.id })
      if (c) {
        const p = byId('pacientes', c.pacienteId)
        e.hora = c.dentistaId === form.dentistaId
          ? `Conflito: dentista ocupado às ${c.hora} (${p?.nome})`
          : `Conflito: paciente já tem consulta às ${c.hora}`
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = () => {
    if (!validate()) {
      toast('Verifique os campos destacados', 'error')
      return
    }
    if (editing) {
      agendamentosApi.update(editing.id, form)
      toast('Agendamento atualizado!')
    } else {
      agendamentosApi.add({ ...form, criadoEm: new Date().toISOString() })
      toast('Consulta agendada com sucesso!')
    }
    onClose()
  }

  const dentistasAtivos = dentistas.filter((d) => d.ativo !== false || d.id === form.dentistaId)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Editar agendamento' : 'Novo agendamento'}
      width={680}
      footer={
        <>
          <button className="btn ghost" onClick={onClose}>Cancelar</button>
          <motion.button whileTap={{ scale: 0.96 }} className="btn primary" onClick={save}>
            {editing ? 'Salvar alterações' : 'Agendar'}
          </motion.button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Paciente *" error={errors.pacienteId}>
          <select value={form.pacienteId} onChange={set('pacienteId')}>
            <option value="">Selecione...</option>
            {[...pacientes].sort((a, b) => a.nome.localeCompare(b.nome)).map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </Field>
        <Field label="Dentista *" error={errors.dentistaId}>
          <select value={form.dentistaId} onChange={set('dentistaId')}>
            <option value="">Selecione...</option>
            {dentistasAtivos.map((d) => (
              <option key={d.id} value={d.id}>{d.nome} — {d.especialidade}</option>
            ))}
          </select>
        </Field>
        <Field label="Procedimento *" error={errors.procedimentoId}>
          <select value={form.procedimentoId} onChange={set('procedimentoId')}>
            <option value="">Selecione...</option>
            {procedimentos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} ({p.duracao} min · {money(p.valor)})</option>
            ))}
          </select>
        </Field>
        <Field label="Data *" error={errors.data}>
          <input type="date" value={form.data} onChange={set('data')} />
        </Field>

        <Field label="Horário *" error={errors.hora} full>
          {!form.dentistaId ? (
            <div className="hint"><Clock size={14} /> Selecione um dentista para ver os horários livres</div>
          ) : (
            <div className="slots">
              {slots.map((s, i) => (
                <motion.button
                  type="button"
                  key={s.hora}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.012 }}
                  whileHover={s.livre ? { y: -2 } : undefined}
                  whileTap={s.livre ? { scale: 0.92 } : undefined}
                  disabled={!s.livre && form.hora !== s.hora}
                  className={`slot ${form.hora === s.hora ? 'sel' : ''} ${!s.livre ? 'busy' : ''}`}
                  onClick={() => setForm((f) => ({ ...f, hora: s.hora }))}
                >
                  {s.hora}
                </motion.button>
              ))}
            </div>
          )}
        </Field>

        {editing && (
          <Field label="Status">
            <select value={form.status} onChange={set('status')}>
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Observações" full>
          <textarea rows={3} value={form.obs} onChange={set('obs')} placeholder="Ex.: paciente com sensibilidade, trazer exames..." />
        </Field>

        <AnimatePresence>
          {proc && form.hora && (
            <motion.div className="summary full" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div>
                <strong>{proc.nome}</strong> das <strong>{form.hora}</strong> às <strong>{fromMin(toMin(form.hora) + proc.duracao)}</strong>
              </div>
              <div className="summary-val">{money(proc.valor)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  )
}
