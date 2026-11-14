import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Syringe, Clock } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Modal, { Confirm } from '../components/Modal.jsx'
import { Field, Empty, listItem } from '../components/UI.jsx'
import { money } from '../utils.js'

const EMPTY = { nome: '', duracao: 30, valor: '' }

export default function Procedimentos() {
  const { procedimentos, agendamentos, procedimentosApi } = useData()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [del, setDel] = useState(null)

  const save = () => {
    const e = {}
    if (!form.nome.trim()) e.nome = 'Informe o nome'
    if (!(Number(form.duracao) >= 10)) e.duracao = 'Mínimo 10 min'
    if (form.valor === '' || Number(form.valor) < 0) e.valor = 'Valor inválido'
    setErrors(e)
    if (Object.keys(e).length) return toast('Verifique os campos', 'error')
    const data = { ...form, duracao: Number(form.duracao), valor: Number(form.valor) }
    if (form.id) { procedimentosApi.update(form.id, data); toast('Procedimento atualizado!') }
    else { procedimentosApi.add(data); toast('Procedimento cadastrado!') }
    setForm(null)
  }

  const tryDelete = (p) => {
    if (agendamentos.some((a) => a.procedimentoId === p.id)) return toast('Há agendamentos usando este procedimento', 'error')
    setDel(p)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h2>Procedimentos</h2><p className="muted">Tabela de serviços e valores</p></div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} className="btn primary" onClick={() => { setErrors({}); setForm({ ...EMPTY }) }}>
          <Plus size={18} /> Novo procedimento
        </motion.button>
      </div>

      <div className="card table-card">
        {procedimentos.length === 0 ? <Empty icon={Syringe} title="Nenhum procedimento" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Procedimento</th><th>Duração</th><th>Valor</th><th>Realizados</th><th className="right">Ações</th></tr></thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {procedimentos.map((p, i) => (
                    <motion.tr key={p.id} layout variants={listItem} initial="hidden" animate="show" exit="exit" custom={i}>
                      <td><b>{p.nome}</b></td>
                      <td><span className="tag"><Clock size={12} /> {p.duracao} min</span></td>
                      <td>{money(p.valor)}</td>
                      <td>{agendamentos.filter((a) => a.procedimentoId === p.id && a.status === 'concluido').length}</td>
                      <td className="right">
                        <div className="row-actions">
                          <button className="icon-btn sm" title="Editar" onClick={() => { setErrors({}); setForm({ ...p }) }}><Pencil size={16} /></button>
                          <button className="icon-btn sm bad" title="Excluir" onClick={() => tryDelete(p)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Editar procedimento' : 'Novo procedimento'} width={480}
        footer={<><button className="btn ghost" onClick={() => setForm(null)}>Cancelar</button><button className="btn primary" onClick={save}>Salvar</button></>}>
        {form && (
          <div className="form-grid">
            <Field label="Nome *" error={errors.nome} full><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoFocus /></Field>
            <Field label="Duração (min) *" error={errors.duracao}>
              <select value={form.duracao} onChange={(e) => setForm({ ...form, duracao: e.target.value })}>
                {[15, 30, 45, 60, 75, 90, 120, 150, 180].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </Field>
            <Field label="Valor (R$) *" error={errors.valor}><input type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></Field>
          </div>
        )}
      </Modal>

      <Confirm open={!!del} onClose={() => setDel(null)} text={del && `Excluir o procedimento "${del.nome}"?`}
        onConfirm={() => { procedimentosApi.remove(del.id); toast('Procedimento excluído', 'info') }} />
    </div>
  )
}
