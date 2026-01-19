'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Laptop, CheckCircle, XCircle, Filter, ShieldX } from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface SolicitacaoHoras {
  id: number
  created_at: string
  usuario_email: string
  usuario_nome: string
  projeto: string
  horas_solicitadas: number
  descricao: string
  status: string
  respondido_por: string | null
  respondido_em: string | null
  observacao_resposta: string | null
}

interface SolicitacaoEquipamento {
  id: number
  created_at: string
  usuario_email: string
  usuario_nome: string
  equipamento: string
  quantidade: number
  justificativa: string
  urgencia: string
  status: string
  respondido_por: string | null
  respondido_em: string | null
  observacao_resposta: string | null
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'horas' | 'equipamentos'>('horas')
  const [filtroStatus, setFiltroStatus] = useState('pendente')
  
  const [solicitacoesHoras, setSolicitacoesHoras] = useState<SolicitacaoHoras[]>([])
  const [solicitacoesEquipamentos, setSolicitacoesEquipamentos] = useState<SolicitacaoEquipamento[]>([])
  
  const [modalAberto, setModalAberto] = useState(false)
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null)
  const [tipoSolicitacao, setTipoSolicitacao] = useState<'horas' | 'equipamentos'>('horas')
  const [observacao, setObservacao] = useState('')
  const [processando, setProcessando] = useState(false)

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
      
      // Verificar se é admin na tabela usuarios do Supabase
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('is_admin')
        .eq('email', user.email)
        .single()
      console.log('Email logado:', user.email)
      console.log('Dados retornados:', usuario)
      console.log('Erro:', error)
            
      if (!usuario || !usuario.is_admin) {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      
      setIsAdmin(true)
      await carregarSolicitacoes()
      setLoading(false)
    }
    init()
  }, [])

  async function carregarSolicitacoes() {
    const { data: horas } = await supabase
      .from('solicitacao_horas')
      .select('*')
      .order('created_at', { ascending: false })

    if (horas) setSolicitacoesHoras(horas)

    const { data: equipamentos } = await supabase
      .from('solicitacao_equipamentos')
      .select('*')
      .order('created_at', { ascending: false })

    if (equipamentos) setSolicitacoesEquipamentos(equipamentos)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleNavigate = (page: string) => {
    if (page === 'home') router.push('/portal')
    else router.push(`/${page}`)
  }

  const abrirModal = (solicitacao: any, tipo: 'horas' | 'equipamentos') => {
    setSolicitacaoSelecionada(solicitacao)
    setTipoSolicitacao(tipo)
    setObservacao('')
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setSolicitacaoSelecionada(null)
    setObservacao('')
  }

  const responderSolicitacao = async (aprovado: boolean) => {
    if (!solicitacaoSelecionada) return
    setProcessando(true)

    const tabela = tipoSolicitacao === 'horas' ? 'solicitacao_horas' : 'solicitacao_equipamentos'
    
    const { error } = await supabase
      .from(tabela)
      .update({
        status: aprovado ? 'aprovado' : 'recusado',
        respondido_por: user.email,
        respondido_em: new Date().toISOString(),
        observacao_resposta: observacao || null
      })
      .eq('id', solicitacaoSelecionada.id)

    if (!error) {
      await carregarSolicitacoes()
      fecharModal()
    }

    setProcessando(false)
  }

  const horasFiltradas = solicitacoesHoras.filter(s => 
    filtroStatus === 'todos' || s.status === filtroStatus
  )
  const equipamentosFiltrados = solicitacoesEquipamentos.filter(s => 
    filtroStatus === 'todos' || s.status === filtroStatus
  )

  const contadores = {
    horasPendentes: solicitacoesHoras.filter(s => s.status === 'pendente').length,
    equipamentosPendentes: solicitacoesEquipamentos.filter(s => s.status === 'pendente').length
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'aprovado':
        return { bg: '#dff6dd', color: '#107c10', label: 'Aprovado' }
      case 'recusado':
        return { bg: '#fde7e9', color: '#d13438', label: 'Recusado' }
      default:
        return { bg: '#fff4ce', color: '#797979', label: 'Pendente' }
    }
  }

  const getUrgenciaStyle = (urgencia: string) => {
    switch (urgencia) {
      case 'alta':
        return { bg: '#fde7e9', color: '#d13438' }
      case 'baixa':
        return { bg: '#e6f2ff', color: '#0078d4' }
      default:
        return { bg: '#f0f0f0', color: '#666' }
    }
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

  // Tela de acesso negado
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <Header userEmail={user?.email || ''} onLogout={handleLogout} />
        
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar activePage="admin" onNavigate={handleNavigate} />
          
          <main style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '24px'
          }}>
            <div style={{
              textAlign: 'center',
              backgroundColor: 'white',
              padding: '48px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <ShieldX size={64} color="#d13438" style={{ marginBottom: '16px' }} />
              <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#333' }}>
                Acesso Restrito
              </h1>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#666' }}>
                Você não tem permissão para acessar esta página.
              </p>
              <button
                onClick={() => router.push('/portal')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0078d4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Voltar ao Portal
              </button>
            </div>
          </main>
        </div>
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
        <Sidebar activePage="admin" onNavigate={handleNavigate} />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
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

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              margin: '0 0 4px 0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Administração de Solicitações
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Aprove ou recuse solicitações de horas e equipamentos
            </p>
          </div>

          {/* Cards de resumo */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #0078d4'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={24} color="#0078d4" />
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                    {contadores.horasPendentes}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Horas pendentes</div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #5c2d91'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Laptop size={24} color="#5c2d91" />
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                    {contadores.equipamentosPendentes}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>Equipamentos pendentes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Abas */}
          <div style={{
            display: 'flex',
            gap: '0',
            marginBottom: '16px',
            borderBottom: '2px solid #e0e0e0'
          }}>
            <button
              onClick={() => setAbaAtiva('horas')}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: abaAtiva === 'horas' ? '#0078d4' : '#666',
                borderBottom: abaAtiva === 'horas' ? '2px solid #0078d4' : '2px solid transparent',
                marginBottom: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={16} />
              Solicitações de Horas
              {contadores.horasPendentes > 0 && (
                <span style={{
                  backgroundColor: '#d13438',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '12px'
                }}>
                  {contadores.horasPendentes}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva('equipamentos')}
              style={{
                padding: '12px 24px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: abaAtiva === 'equipamentos' ? '#5c2d91' : '#666',
                borderBottom: abaAtiva === 'equipamentos' ? '2px solid #5c2d91' : '2px solid transparent',
                marginBottom: '-2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Laptop size={16} />
              Solicitações de Equipamentos
              {contadores.equipamentosPendentes > 0 && (
                <span style={{
                  backgroundColor: '#d13438',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '12px'
                }}>
                  {contadores.equipamentosPendentes}
                </span>
              )}
            </button>
          </div>

          {/* Filtro */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <Filter size={16} color="#666" />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="recusado">Recusados</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          {/* Lista de Solicitações de Horas */}
          {abaAtiva === 'horas' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              color: '#333'
            }}>
              {horasFiltradas.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  Nenhuma solicitação encontrada
                </div>
              ) : (
                horasFiltradas.map((sol) => {
                  const status = getStatusStyle(sol.status)
                  return (
                    <div
                      key={sol.id}
                      style={{
                        padding: '20px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                            {sol.projeto}
                          </h3>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: status.bg,
                            color: status.color
                          }}>
                            {status.label}
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                          <strong>{sol.horas_solicitadas}h</strong> solicitadas por <strong>{sol.usuario_nome}</strong> ({sol.usuario_email})
                        </div>

                        {sol.descricao && (
                          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                            {sol.descricao}
                          </p>
                        )}

                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {new Date(sol.created_at).toLocaleDateString('pt-BR')} às {new Date(sol.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {sol.observacao_resposta && (
                          <div style={{
                            marginTop: '12px',
                            padding: '10px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: '#666'
                          }}>
                            <strong>Resposta:</strong> {sol.observacao_resposta}
                          </div>
                        )}
                      </div>

                      {sol.status === 'pendente' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => abrirModal(sol, 'horas')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#107c10',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CheckCircle size={14} />
                            Aprovar
                          </button>
                          <button
                            onClick={() => abrirModal(sol, 'horas')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#d13438',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <XCircle size={14} />
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Lista de Solicitações de Equipamentos */}
          {abaAtiva === 'equipamentos' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              {equipamentosFiltrados.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  Nenhuma solicitação encontrada
                </div>
              ) : (
                equipamentosFiltrados.map((sol) => {
                  const status = getStatusStyle(sol.status)
                  const urgencia = getUrgenciaStyle(sol.urgencia)
                  return (
                    <div
                      key={sol.id}
                      style={{
                        padding: '20px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                            {sol.equipamento}
                          </h3>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: status.bg,
                            color: status.color
                          }}>
                            {status.label}
                          </span>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '500',
                            backgroundColor: urgencia.bg,
                            color: urgencia.color,
                            textTransform: 'capitalize'
                          }}>
                            {sol.urgencia}
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                          Qtd: <strong>{sol.quantidade}</strong> • Solicitado por <strong>{sol.usuario_nome}</strong> ({sol.usuario_email})
                        </div>

                        {sol.justificativa && (
                          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                            {sol.justificativa}
                          </p>
                        )}

                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {new Date(sol.created_at).toLocaleDateString('pt-BR')} às {new Date(sol.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {sol.observacao_resposta && (
                          <div style={{
                            marginTop: '12px',
                            padding: '10px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '4px',
                            fontSize: '13px',
                            color: '#666'
                          }}>
                            <strong>Resposta:</strong> {sol.observacao_resposta}
                          </div>
                        )}
                      </div>

                      {sol.status === 'pendente' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => abrirModal(sol, 'equipamentos')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#107c10',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <CheckCircle size={14} />
                            Aprovar
                          </button>
                          <button
                            onClick={() => abrirModal(sol, 'equipamentos')}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#d13438',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <XCircle size={14} />
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modal de Resposta */}
      {modalAberto && solicitacaoSelecionada && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
              Responder Solicitação
            </h2>

            <div style={{
              padding: '16px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              marginBottom: '20px',
              color: '#333'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                {tipoSolicitacao === 'horas' ? solicitacaoSelecionada.projeto : solicitacaoSelecionada.equipamento}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Solicitado por {solicitacaoSelecionada.usuario_nome}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Observação (opcional)
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Adicione uma observação para o solicitante..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  color: '#333'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => responderSolicitacao(true)}
                disabled={processando}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#107c10',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processando ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: processando ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle size={16} />
                Aprovar
              </button>
              <button
                onClick={() => responderSolicitacao(false)}
                disabled={processando}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#d13438',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: processando ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: processando ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <XCircle size={16} />
                Recusar
              </button>
            </div>

            <button
              onClick={fecharModal}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                backgroundColor: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

