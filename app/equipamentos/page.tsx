'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, CheckCircle, XCircle, Plus, Minus, ShoppingCart, Trash2, Send, Loader2, Package, Monitor, Laptop, Headphones, Cable } from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Equipamento {
  id: number
  nome: string
  categoria: string
  quantidade_total: number
  quantidade_disponivel: number
  descricao: string
  localizacao: string
}

interface ItemCarrinho {
  equipamento: Equipamento
  quantidade: number
}

interface Solicitacao {
  id: number
  created_at: string
  equipamento: string
  quantidade: number
  justificativa: string
  urgencia: string
  status: string
  observacao_resposta: string
}

export default function EquipamentosPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [estoque, setEstoque] = useState<Equipamento[]>([])
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<Solicitacao[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' })
  
  // Campos do formulário
  const [projeto, setProjeto] = useState('')
  const [dataEmprestimo, setDataEmprestimo] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await carregarEstoque()
      await carregarSolicitacoes(user.email!)
      setLoading(false)
    }

    init()
  }, [])

  async function carregarEstoque() {
    const { data } = await supabase
      .from('estoque_equipamentos')
      .select('*')
      .eq('ativo', true)
      .order('categoria')
      .order('nome')

    if (data) {
      setEstoque(data)
    }
  }

  async function carregarSolicitacoes(email: string) {
    const { data } = await supabase
      .from('solicitacao_equipamentos')
      .select('*')
      .eq('usuario_email', email)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setMinhasSolicitacoes(data)
    }
  }

  function adicionarAoCarrinho(equipamento: Equipamento) {
    const itemExistente = carrinho.find(item => item.equipamento.id === equipamento.id)
    
    if (itemExistente) {
      if (itemExistente.quantidade < equipamento.quantidade_disponivel) {
        setCarrinho(carrinho.map(item =>
          item.equipamento.id === equipamento.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        ))
      }
    } else {
      setCarrinho([...carrinho, { equipamento, quantidade: 1 }])
    }
  }

  function removerDoCarrinho(equipamentoId: number) {
    setCarrinho(carrinho.filter(item => item.equipamento.id !== equipamentoId))
  }

  function alterarQuantidade(equipamentoId: number, delta: number) {
    setCarrinho(carrinho.map(item => {
      if (item.equipamento.id === equipamentoId) {
        const novaQuantidade = item.quantidade + delta
        if (novaQuantidade <= 0) return item
        if (novaQuantidade > item.equipamento.quantidade_disponivel) return item
        return { ...item, quantidade: novaQuantidade }
      }
      return item
    }))
  }

  function limparCarrinho() {
    setCarrinho([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (carrinho.length === 0) {
      setMensagem({ tipo: 'erro', texto: 'Adicione pelo menos um item ao carrinho' })
      return
    }

    setEnviando(true)
    setMensagem({ tipo: '', texto: '' })

    // Monta a lista de equipamentos
    const listaEquipamentos = carrinho.map(item => 
      `${item.equipamento.nome} (${item.quantidade}x)`
    ).join(', ')

    const { error } = await supabase
      .from('solicitacao_equipamentos')
      .insert({
        usuario_email: user.email,
        usuario_nome: user.email.split('@')[0],
        equipamento: listaEquipamentos,
        quantidade: carrinho.reduce((acc, item) => acc + item.quantidade, 0),
        justificativa: `Projeto: ${projeto}\nData: ${dataEmprestimo}\nObs: ${observacoes}`,
        urgencia: 'normal'
      })

    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao enviar solicitação: ' + error.message })
    } else {
      setMensagem({ tipo: 'sucesso', texto: 'Solicitação enviada com sucesso!' })
      setProjeto('')
      setDataEmprestimo('')
      setObservacoes('')
      setCarrinho([])
      await carregarSolicitacoes(user.email!)
    }

    setEnviando(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getIconeCategoria = (categoria: string) => {
    switch (categoria) {
      case 'Notebook': return Laptop
      case 'Monitor': return Monitor
      case 'Headset': return Headphones
      case 'Cabo':
      case 'Adaptador': return Cable
      default: return Package
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'aprovado':
        return { backgroundColor: '#dff6dd', color: '#107c10' }
      case 'recusado':
        return { backgroundColor: '#fde7e9', color: '#d13438' }
      default:
        return { backgroundColor: '#f0f0f0', color: '#797979' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle size={14} color="#107c10" />
      case 'recusado':
        return <XCircle size={14} color="#d13438" />
      default:
        return <Clock size={14} color="#797979" />
    }
  }

  // Categorias únicas
  const categorias = ['Todas', ...new Set(estoque.map(e => e.categoria))]

  // Filtrar estoque
  const estoqueFiltrado = estoque.filter(e => 
    filtroCategoria === 'Todas' || e.categoria === filtroCategoria
  )

  // Total de itens disponíveis
  const totalDisponiveis = estoque.reduce((acc, e) => acc + e.quantidade_disponivel, 0)

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
        <Sidebar activePage="equipamentos" onNavigate={(page) => {
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

          {/* Header com contador */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '24px' 
          }}>
            <div>
              <h1 style={{
                margin: '0 0 4px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                Sistema de Empréstimo
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Solicite equipamentos para seu projeto
              </p>
            </div>
            <div style={{
              backgroundColor: '#0078d4',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Estoque Curitiba</div>
              <div style={{ fontSize: '28px', fontWeight: '700' }}>{totalDisponiveis}</div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 350px',
            gap: '24px'
          }}>
            {/* Coluna Esquerda - Estoque */}
            <div>
              {/* Filtros de Categoria */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: filtroCategoria === cat ? '#0078d4' : 'white',
                      color: filtroCategoria === cat ? 'white' : '#333',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Lista de Equipamentos */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #eee',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Itens Disponíveis
                </div>

                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {estoqueFiltrado.map((item) => {
                    const Icon = getIconeCategoria(item.categoria)
                    const noCarrinho = carrinho.find(c => c.equipamento.id === item.id)
                    
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 20px',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: noCarrinho ? '#f0f7ff' : 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon size={20} color="#666" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: '#333', fontSize: '14px' }}>
                              {item.nome}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {item.descricao && `${item.descricao} • `}
                              <span style={{ 
                                color: item.quantidade_disponivel > 0 ? '#107c10' : '#d13438',
                                fontWeight: '500'
                              }}>
                                {item.quantidade_disponivel} disponíveis
                              </span>
                            </div>
                          </div>
                        </div>

                        {item.quantidade_disponivel > 0 ? (
                          noCarrinho ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                onClick={() => alterarQuantidade(item.id, -1)}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  backgroundColor: 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Minus size={14} />
                              </button>
                              <span style={{ 
                                minWidth: '24px', 
                                textAlign: 'center',
                                fontWeight: '600'
                              }}>
                                {noCarrinho.quantidade}
                              </span>
                              <button
                                onClick={() => alterarQuantidade(item.id, 1)}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd',
                                  backgroundColor: 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => adicionarAoCarrinho(item)}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#0078d4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Plus size={14} />
                              Adicionar
                            </button>
                          )
                        ) : (
                          <span style={{ 
                            padding: '8px 16px',
                            backgroundColor: '#f0f0f0',
                            color: '#999',
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}>
                            Indisponível
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Histórico */}
              {minhasSolicitacoes.length > 0 && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  marginTop: '24px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #eee',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Minhas Solicitações
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {minhasSolicitacoes.map((sol) => (
                      <div
                        key={sol.id}
                        style={{
                          padding: '12px 20px',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                            {sol.equipamento}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(sol.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '500',
                          ...getStatusStyle(sol.status)
                        }}>
                          {getStatusIcon(sol.status)}
                          {sol.status.charAt(0).toUpperCase() + sol.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna Direita - Carrinho e Formulário */}
            <div>
              {/* Carrinho */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    <ShoppingCart size={18} />
                    Carrinho
                    {carrinho.length > 0 && (
                      <span style={{
                        backgroundColor: '#0078d4',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '2px 8px',
                        fontSize: '12px'
                      }}>
                        {carrinho.reduce((acc, item) => acc + item.quantidade, 0)}
                      </span>
                    )}
                  </div>
                  {carrinho.length > 0 && (
                    <button
                      onClick={limparCarrinho}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d13438',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                      Limpar
                    </button>
                  )}
                </div>

                <div style={{ padding: '16px 20px' }}>
                  {carrinho.length === 0 ? (
                    <p style={{ 
                      color: '#666', 
                      fontSize: '13px', 
                      textAlign: 'center',
                      margin: 0,
                      padding: '20px 0'
                    }}>
                      Carrinho vazio
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {carrinho.map((item) => (
                        <div
                          key={item.equipamento.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>
                              {item.equipamento.nome}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Qtd: {item.quantidade}
                            </div>
                          </div>
                          <button
                            onClick={() => removerDoCarrinho(item.equipamento.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#d13438',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Formulário */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                padding: '20px',
              }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  Dados do Empréstimo
                </h3>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Projeto *
                    </label>
                    <input
                      type="text"
                      value={projeto}
                      onChange={(e) => setProjeto(e.target.value)}
                      required
                      placeholder="Nome do projeto"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Data do Empréstimo *
                    </label>
                    <input
                      type="date"
                      value={dataEmprestimo}
                      onChange={(e) => setDataEmprestimo(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#666' }}>
                      Solicite com mínimo de 48h de antecedência
                    </span>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#333'
                    }}>
                      Observações
                    </label>
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Observações adicionais..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enviando || carrinho.length === 0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: '#5c2d91',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: (enviando || carrinho.length === 0) ? 'not-allowed' : 'pointer',
                      opacity: (enviando || carrinho.length === 0) ? 0.7 : 1
                    }}
                  >
                    {enviando ? (
                      <>
                        <Loader2 size={16} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Finalizar Solicitação
                      </>
                    )}
                  </button>
                </form>

                {mensagem.texto && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    backgroundColor: mensagem.tipo === 'sucesso' ? '#dff6dd' : '#fde7e9',
                    color: mensagem.tipo === 'sucesso' ? '#107c10' : '#d13438'
                  }}>
                    {mensagem.texto}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}