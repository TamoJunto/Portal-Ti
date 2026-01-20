'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  ArrowLeft,
  FileText,
  Plus,
  X,
  Users,
  Calendar,
  Type,
  AlignLeft,
  List,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileDown,
  Eye,
  Edit3
} from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Campo {
  id: string
  nome: string
  tipo: 'texto' | 'texto_longo' | 'lista' | 'data'
  obrigatorio: boolean
}

interface Template {
  id: number
  nome: string
  descricao: string
  equipe: string
  campos: Campo[]
  criado_por: string
  criado_por_nome: string
  created_at: string
}

export default function DocumentosPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEquipe, setFiltroEquipe] = useState('Todas')
  
  // Modal criar template
  const [modalCriarAberto, setModalCriarAberto] = useState(false)
  const [novoTemplate, setNovoTemplate] = useState({
    nome: '',
    descricao: '',
    equipe: '',
    campos: [] as Campo[]
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Modal usar template
  const [modalUsarAberto, setModalUsarAberto] = useState(false)
  const [templateSelecionado, setTemplateSelecionado] = useState<Template | null>(null)
  const [dadosFormulario, setDadosFormulario] = useState<Record<string, any>>({})
  const [gerandoDoc, setGerandoDoc] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const tiposCampo = [
    { id: 'texto', nome: 'Texto simples', icon: Type, descricao: 'Uma linha de texto' },
    { id: 'texto_longo', nome: 'Texto longo', icon: AlignLeft, descricao: 'Múltiplas linhas' },
    { id: 'lista', nome: 'Lista de itens', icon: List, descricao: 'Adicionar vários itens' },
    { id: 'data', nome: 'Data', icon: Calendar, descricao: 'Seletor de data' },
  ]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await carregarTemplates()
      setLoading(false)
    }
    init()
  }, [])

  async function carregarTemplates() {
    const { data, error } = await supabase
      .from('templates_documentos')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setTemplates(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Filtrar templates
  const templatesFiltrados = templates.filter(t => {
    const matchBusca = t.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       t.descricao?.toLowerCase().includes(busca.toLowerCase())
    const matchEquipe = filtroEquipe === 'Todas' || t.equipe === filtroEquipe
    return matchBusca && matchEquipe
  })

  const equipes = ['Todas', ...new Set(templates.map(t => t.equipe).filter(Boolean))]

  // Adicionar campo ao novo template
  const adicionarCampo = (tipo: string) => {
    const novoCampo: Campo = {
      id: `campo_${Date.now()}`,
      nome: '',
      tipo: tipo as Campo['tipo'],
      obrigatorio: false
    }
    setNovoTemplate({
      ...novoTemplate,
      campos: [...novoTemplate.campos, novoCampo]
    })
  }

  // Remover campo
  const removerCampo = (id: string) => {
    setNovoTemplate({
      ...novoTemplate,
      campos: novoTemplate.campos.filter(c => c.id !== id)
    })
  }

  // Atualizar campo
  const atualizarCampo = (id: string, updates: Partial<Campo>) => {
    setNovoTemplate({
      ...novoTemplate,
      campos: novoTemplate.campos.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    })
  }

  // Salvar template
  async function salvarTemplate() {
    if (!novoTemplate.nome || !novoTemplate.equipe) {
      setErro('Preencha o nome e a equipe')
      return
    }
    if (novoTemplate.campos.length === 0) {
      setErro('Adicione pelo menos um campo')
      return
    }
    if (novoTemplate.campos.some(c => !c.nome)) {
      setErro('Todos os campos precisam ter um nome')
      return
    }

    setSalvando(true)
    setErro('')

    const { error } = await supabase
      .from('templates_documentos')
      .insert({
        nome: novoTemplate.nome,
        descricao: novoTemplate.descricao,
        equipe: novoTemplate.equipe,
        campos: novoTemplate.campos,
        criado_por: user.email,
        criado_por_nome: user.email.split('@')[0]
      })

    if (error) {
      setErro('Erro ao salvar: ' + error.message)
      setSalvando(false)
      return
    }

    await carregarTemplates()
    fecharModalCriar()
    setSalvando(false)
  }

  const fecharModalCriar = () => {
    setModalCriarAberto(false)
    setNovoTemplate({ nome: '', descricao: '', equipe: '', campos: [] })
    setErro('')
  }

  // Abrir modal para usar template
  const abrirModalUsar = (template: Template) => {
    setTemplateSelecionado(template)
    // Inicializar dados do formulário
    const dados: Record<string, any> = {}
    template.campos.forEach(campo => {
      dados[campo.id] = campo.tipo === 'lista' ? [''] : ''
    })
    setDadosFormulario(dados)
    setModalUsarAberto(true)
  }

  // Atualizar dado do formulário
  const atualizarDado = (campoId: string, valor: any) => {
    setDadosFormulario({ ...dadosFormulario, [campoId]: valor })
  }

  // Adicionar item à lista
  const adicionarItemLista = (campoId: string) => {
    const lista = dadosFormulario[campoId] || []
    setDadosFormulario({ ...dadosFormulario, [campoId]: [...lista, ''] })
  }

  // Atualizar item da lista
  const atualizarItemLista = (campoId: string, index: number, valor: string) => {
    const lista = [...dadosFormulario[campoId]]
    lista[index] = valor
    setDadosFormulario({ ...dadosFormulario, [campoId]: lista })
  }

  // Remover item da lista
  const removerItemLista = (campoId: string, index: number) => {
    const lista = dadosFormulario[campoId].filter((_: any, i: number) => i !== index)
    setDadosFormulario({ ...dadosFormulario, [campoId]: lista.length ? lista : [''] })
  }

  // Gerar documento
  async function gerarDocumento(formato: 'docx' | 'pdf') {
    if (!templateSelecionado) return
    
    setGerandoDoc(true)

    try {
      const response = await fetch('/api/gerar-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: templateSelecionado,
          dados: dadosFormulario,
          formato
        })
      })

      if (!response.ok) throw new Error('Erro ao gerar documento')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${templateSelecionado.nome.replace(/\s+/g, '_')}.${formato}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao gerar documento. Tente novamente.')
    }

    setGerandoDoc(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <Header userEmail={user?.email || ''} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activePage="documentos" onNavigate={(page) => {
          if (page === 'home') router.push('/portal')
          else router.push(`/${page}`)
        }} />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* Voltar */}
          <button
            onClick={() => router.push('/portal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#0078d4',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px',
              padding: 0
            }}
          >
            <ArrowLeft size={16} />
            Voltar ao Portal
          </button>

          {/* Título */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 4px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                Gerador de Documentos
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Crie templates e gere documentos padronizados em Word ou PDF
              </p>
            </div>

            <button
              onClick={() => setModalCriarAberto(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#0078d4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              Criar Template
            </button>
          </div>

          {/* Filtros */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '4px',
              padding: '8px 12px',
              gap: '8px',
              flex: 1,
              minWidth: '250px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Search size={18} color="#666" />
              <input
                type="text"
                placeholder="Buscar template..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#333'
                }}
              />
            </div>

            <select
              value={filtroEquipe}
              onChange={(e) => setFiltroEquipe(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'white',
                fontSize: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              {equipes.map(eq => (
                <option key={eq} value={eq}>
                  {eq === 'Todas' ? 'Todas as Equipes' : eq}
                </option>
              ))}
            </select>
          </div>

          {/* Cards de estatísticas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #0078d4'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                {templates.length}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>Templates</div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #5c2d91'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                {equipes.length - 1}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>Equipes</div>
            </div>
          </div>

          {/* Lista de Templates */}
          {templatesFiltrados.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#666',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <FileText size={48} color="#ccc" style={{ marginBottom: '16px' }} />
              <p style={{ margin: '0 0 16px 0' }}>Nenhum template encontrado</p>
              <button
                onClick={() => setModalCriarAberto(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0078d4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Criar primeiro template
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px'
            }}>
              {templatesFiltrados.map((template) => (
                <div
                  key={template.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #0078d4',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '20px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        backgroundColor: '#0078d415',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <FileText size={24} color="#0078d4" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {template.nome}
                        </h3>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {template.campos?.length || 0} campos
                        </span>
                      </div>
                    </div>

                    {template.descricao && (
                      <p style={{
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.4'
                      }}>
                        {template.descricao}
                      </p>
                    )}

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Users size={14} color="#666" />
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {template.equipe}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        por {template.criado_por_nome}
                      </span>
                    </div>

                    <button
                      onClick={() => abrirModalUsar(template)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#0078d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <FileDown size={16} />
                      Usar Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Criar Template */}
      {modalCriarAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Header do modal */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                Criar Novo Template
              </h2>
              <button
                onClick={fecharModalCriar}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} color="#666" />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {erro && (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#fde7e9',
                  borderRadius: '4px',
                  color: '#d13438',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {erro}
                </div>
              )}

              {/* Informações básicas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Nome do Template *
                  </label>
                  <input
                    type="text"
                    value={novoTemplate.nome}
                    onChange={(e) => setNovoTemplate({...novoTemplate, nome: e.target.value})}
                    placeholder="Ex: Ata de Reunião, Documentação Técnica"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                      color: '#333'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Equipe *
                    </label>
                    <input
                      type="text"
                      value={novoTemplate.equipe}
                      onChange={(e) => setNovoTemplate({...novoTemplate, equipe: e.target.value})}
                      placeholder="Ex: TI, RH, Todos"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        color: '#333'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Descrição
                  </label>
                  <textarea
                    value={novoTemplate.descricao}
                    onChange={(e) => setNovoTemplate({...novoTemplate, descricao: e.target.value})}
                    placeholder="Descreva o propósito deste template..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      color: '#333'
                    }}
                  />
                </div>
              </div>

              {/* Campos do template */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Campos do Template
                  </label>
                </div>

                {/* Botões para adicionar campos */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  {tiposCampo.map(tipo => {
                    const Icon = tipo.icon
                    return (
                      <button
                        key={tipo.id}
                        onClick={() => adicionarCampo(tipo.id)}
                        title={tipo.descricao}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '13px',
                          cursor: 'pointer',
                          color: '#333'
                        }}
                      >
                        <Icon size={14} />
                        {tipo.nome}
                      </button>
                    )
                  })}
                </div>

                {/* Lista de campos adicionados */}
                {novoTemplate.campos.length === 0 ? (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '4px',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    Clique nos botões acima para adicionar campos ao template
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {novoTemplate.campos.map((campo, index) => {
                      const tipoInfo = tiposCampo.find(t => t.id === campo.tipo)
                      const Icon = tipoInfo?.icon || Type
                      return (
                        <div
                          key={campo.id}
                          style={{
                            padding: '12px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            border: '1px solid #eee'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <Icon size={16} color="#666" />
                            <input
                              type="text"
                              value={campo.nome}
                              onChange={(e) => atualizarCampo(campo.id, { nome: e.target.value })}
                              placeholder="Nome do campo"
                              style={{
                                flex: 1,
                                padding: '8px 10px',
                                fontSize: '14px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                color: '#333'
                              }}
                            />
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              color: '#666',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="checkbox"
                                checked={campo.obrigatorio}
                                onChange={(e) => atualizarCampo(campo.id, { obrigatorio: e.target.checked })}
                              />
                              Obrigatório
                            </label>
                            <button
                              onClick={() => removerCampo(campo.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <Trash2 size={16} color="#d13438" />
                            </button>
                          </div>
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: '#999'
                          }}>
                            Tipo: {tipoInfo?.nome}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer do modal */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white'
            }}>
              <button
                onClick={fecharModalCriar}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarTemplate}
                disabled={salvando}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0078d4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  opacity: salvando ? 0.7 : 1
                }}
              >
                {salvando ? 'Salvando...' : 'Salvar Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Usar Template */}
      {modalUsarAberto && templateSelecionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                  {templateSelecionado.nome}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
                  Preencha os campos e gere seu documento
                </p>
              </div>
              <button
                onClick={() => setModalUsarAberto(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} color="#666" />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Campos do formulário */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {templateSelecionado.campos?.map((campo) => (
                  <div key={campo.id}>
                    <label style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      {campo.nome} {campo.obrigatorio && <span style={{ color: '#d13438' }}>*</span>}
                    </label>

                    {campo.tipo === 'texto' && (
                      <input
                        type="text"
                        value={dadosFormulario[campo.id] || ''}
                        onChange={(e) => atualizarDado(campo.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          color: '#333'
                        }}
                      />
                    )}

                    {campo.tipo === 'texto_longo' && (
                      <textarea
                        value={dadosFormulario[campo.id] || ''}
                        onChange={(e) => atualizarDado(campo.id, e.target.value)}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                          color: '#333'
                        }}
                      />
                    )}

                    {campo.tipo === 'data' && (
                      <input
                        type="date"
                        value={dadosFormulario[campo.id] || ''}
                        onChange={(e) => atualizarDado(campo.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          fontSize: '14px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          boxSizing: 'border-box',
                          color: '#333'
                        }}
                      />
                    )}

                    {campo.tipo === 'lista' && (
                      <div>
                        {(dadosFormulario[campo.id] || ['']).map((item: string, index: number) => (
                          <div key={index} style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => atualizarItemLista(campo.id, index, e.target.value)}
                              placeholder={`Item ${index + 1}`}
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                color: '#333'
                              }}
                            />
                            <button
                              onClick={() => removerItemLista(campo.id, index)}
                              style={{
                                padding: '10px',
                                backgroundColor: '#fde7e9',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={16} color="#d13438" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => adicionarItemLista(campo.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: '#f5f5f5',
                            border: '1px dashed #ccc',
                            borderRadius: '4px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            color: '#666'
                          }}
                        >
                          <Plus size={14} />
                          Adicionar item
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer - Botões de gerar */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              position: 'sticky',
              bottom: 0,
              backgroundColor: 'white'
            }}>
              <button
                onClick={() => setModalUsarAberto(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => gerarDocumento('docx')}
                disabled={gerandoDoc}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#217346',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: gerandoDoc ? 'not-allowed' : 'pointer',
                  opacity: gerandoDoc ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileDown size={16} />
                {gerandoDoc ? 'Gerando...' : 'Gerar Word'}
              </button>
              <button
                onClick={() => gerarDocumento('pdf')}
                disabled={gerandoDoc}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d13438',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: gerandoDoc ? 'not-allowed' : 'pointer',
                  opacity: gerandoDoc ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileDown size={16} />
                {gerandoDoc ? 'Gerando...' : 'Gerar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}