import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Download, Upload, RotateCcw } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { Confirm } from '../components/Modal.jsx'
import { Field } from '../components/UI.jsx'
import { toMin, todayISO } from '../utils.js'

export default function Configuracoes() {
  const { config, setConfig, exportJSON, importJSON, resetAll } = useData()
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState(config)
  const [nome, setNome] = useState(user?.nome || '')
  const [reset, setReset] = useState(false)
  const fileRef = useRef()

  const save = () => {
    if (!form.clinica.trim()) return toast('Informe o nome da clínica', 'error')
    if (toMin(form.abertura) >= toMin(form.fechamento)) return toast('Abertura deve ser antes do fechamento', 'error')
    setConfig({ ...form, intervalo: Number(form.intervalo) })
    if (nome.trim()) updateUser({ nome: nome.trim() })
    toast('Configurações salvas!')
  }

  const doExport = () => {
    const blob = new Blob([exportJSON()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `backup-odonto-${todayISO()}.json`
    a.click()
    toast('Backup exportado')
  }

  const doImport = (e) => {
    const f = e.target.files[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      try { importJSON(r.result); toast('Backup restaurado!') }
      catch { toast('Arquivo de backup inválido', 'error') }
    }
    r.readAsText(f)
    e.target.value = ''
  }

  return (
    <div className="page">
      <div className="page-head"><div><h2>Configurações</h2><p className="muted">Clínica, horários e dados</p></div></div>

      <div className="grid-2">
        <motion.section className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-head"><h3>Clínica e funcionamento</h3></div>
          <div className="form-grid">
            <Field label="Nome da clínica" full><input value={form.clinica} onChange={(e) => setForm({ ...form, clinica: e.target.value })} /></Field>
            <Field label="Abertura"><input type="time" value={form.abertura} onChange={(e) => setForm({ ...form, abertura: e.target.value })} /></Field>
            <Field label="Fechamento"><input type="time" value={form.fechamento} onChange={(e) => setForm({ ...form, fechamento: e.target.value })} /></Field>
            <Field label="Intervalo da agenda">
              <select value={form.intervalo} onChange={(e) => setForm({ ...form, intervalo: e.target.value })}>
                {[15, 30, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </Field>
            <Field label="Atende aos sábados?">
              <label className="switch">
                <input type="checkbox" checked={form.sabado} onChange={(e) => setForm({ ...form, sabado: e.target.checked })} />
                <span className="track"><motion.span className="thumb" layout transition={{ type: 'spring', stiffness: 600, damping: 30 }} /></span>
                <b>{form.sabado ? 'Sim' : 'Não'}</b>
              </label>
            </Field>
            <Field label="Seu nome (usuário)" full><input value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
          </div>
          <div className="card-foot">
            <motion.button whileTap={{ scale: 0.96 }} className="btn primary" onClick={save}><Save size={17} /> Salvar</motion.button>
          </div>
        </motion.section>

        <motion.section className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card-head"><h3>Dados</h3></div>
          <p className="muted">Os dados ficam salvos no navegador (localStorage). Faça backup para não perder.</p>
          <div className="stack-btns">
            <button className="btn ghost" onClick={doExport}><Download size={17} /> Exportar backup (.json)</button>
            <button className="btn ghost" onClick={() => fileRef.current.click()}><Upload size={17} /> Importar backup</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={doImport} />
            <button className="btn danger-ghost" onClick={() => setReset(true)}><RotateCcw size={17} /> Restaurar dados de exemplo</button>
          </div>
        </motion.section>
      </div>

      <Confirm open={reset} onClose={() => setReset(false)} confirmLabel="Restaurar"
        text="Isso apaga todos os dados atuais e restaura os dados de exemplo. Continuar?"
        onConfirm={() => { resetAll(); setForm(JSON.parse(JSON.stringify(config))); toast('Dados restaurados', 'info'); setTimeout(() => window.location.reload(), 400) }} />
    </div>
  )
}
