'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Send, CheckCircle, XCircle, Loader2, User } from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Solicitacao {
  id: number
  created_at: string
  projeto: string
  horas_solicitadas: number
  descricao: string
  status: string
  observacao_resposta: string
}

interface ColaboradorTI {
  id: number
  nome: string
  cargo: string
  horas_mes: number
  horas_usadas: number
  email: string
}

export default function HorasPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<Solicitacao[]>([])
  const [colaboradores, setColaboradores] = useState<ColaboradorTI[]>([])
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' })
  
  // Campos do formulário
  const [projeto, setProjeto] = useState('')
  const [horas, setHoras] = useState('')
  const [descricao, setDescricao] = useState('')

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
      await carregarSolicitacoes(user.email!)
      await carregarColaboradores()
      setLoading(false)
    }

    init()
  }, [])

  async function carregarSolicitacoes(email: string) {
    const { data } = await supabase
      .from('solicitacao_horas')
      .select('*')
      .eq('usuario_email', email)
      .order('created_at', { ascending: false })

    if (data) {
      setMinhasSolicitacoes(data)
    }
  }

  async function carregarColaboradores() {
    const { data } = await supabase
      .from('colaboradores_ti')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (data) {
      setColaboradores(data)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setMensagem({ tipo: '', texto: '' })

    const { error } = await supabase
      .from('solicitacao_horas')
      .insert({
        usuario_email: user.email,
        usuario_nome: user.email.split('@')[0],
        projeto,
        horas_solicitadas: parseInt(horas),
        descricao
      })

    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao enviar solicitação: ' + error.message })
    } else {
      setMensagem({ tipo: 'sucesso', texto: 'Solicitação enviada com sucesso!' })
      setProjeto('')
      setHoras('')
      setDescricao('')
      await carregarSolicitacoes(user.email!)
    }

    setEnviando(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <CheckCircle size={16} color="#107c10" />
      case 'recusado':
        return <XCircle size={16} color="#d13438" />
      default:
        return <Clock size={16} color="#797979" />
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

  const calcularPorcentagem = (usadas: number, total: number) => {
    return Math.round((usadas / total) * 100)
  }

  const getBarraColor = (porcentagem: number) => {
    if (porcentagem >= 90) return '#d13438' // Vermelho
    if (porcentagem >= 70) return '#ffaa44' // Laranja
    return '#107c10' // Verde
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
        <Sidebar activePage="horas" onNavigate={(page) => {
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
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              margin: '0 0 4px 0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Horas da Equipe TI
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Veja a disponibilidade da equipe e solicite horas para seu projeto
            </p>
          </div>

          {/* Cards dos Colaboradores TI */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px'
            }}>
              Disponibilidade da Equipe
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {colaboradores.map((colab) => {
                const porcentagem = calcularPorcentagem(colab.horas_usadas, colab.horas_mes)
                const horasDisponiveis = colab.horas_mes - colab.horas_usadas
                const corBarra = getBarraColor(porcentagem)

                return (
                  <div
                    key={colab.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Header do card */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#0078d4',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User size={24} color="white" />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                          {colab.nome}
                        </h3>
                        <span style={{ fontSize: '13px', color: '#666' }}>
                          {colab.cargo}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        fontSize: '13px'
                      }}>
                        <span style={{ color: '#666' }}>Horas utilizadas</span>
                        <span style={{ fontWeight: '600', color: '#333' }}>
                          {colab.horas_usadas}h / {colab.horas_mes}h
                        </span>
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${porcentagem}%`,
                          backgroundColor: corBarra,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Horas disponíveis */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: horasDisponiveis > 20 ? '#dff6dd' : horasDisponiveis > 0 ? '#fff4ce' : '#fde7e9',
                      borderRadius: '4px'
                    }}>
                      <span style={{ fontSize: '13px', color: '#666' }}>Disponível</span>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: horasDisponiveis > 20 ? '#107c10' : horasDisponiveis > 0 ? '#797979' : '#d13438'
                      }}>
                        {horasDisponiveis}h
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 500px) 1fr',
            gap: '24px'
          }}>
            {/* Formulário */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '4px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              height: 'fit-content'
            }}>
              <h2 style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333'
              }}>
                Nova Solicitação
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Projeto */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    value={projeto}
                    onChange={(e) => setProjeto(e.target.value)}
                    required
                    placeholder="Ex: Dashboard de Vendas"
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

                {/* Horas */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Horas Solicitadas *
                  </label>
                  <input
                    type="number"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                    required
                    min="1"
                    placeholder="Ex: 8"
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

                {/* Descrição */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    Descrição do que precisa
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva o que você precisa que o TI faça..."
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
                </div>

                {/* Botão */}
                <button
                  type="submit"
                  disabled={enviando}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#0078d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: enviando ? 'not-allowed' : 'pointer',
                    opacity: enviando ? 0.7 : 1
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
                      Enviar Solicitação
                    </>
                  )}
                </button>
              </form>

              {/* Mensagem de feedback */}
              {mensagem.texto && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: mensagem.tipo === 'sucesso' ? '#dff6dd' : '#fde7e9',
                  color: mensagem.tipo === 'sucesso' ? '#107c10' : '#d13438'
                }}>
                  {mensagem.texto}
                </div>
              )}
            </div>

            {/* Minhas Solicitações */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '4px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{
                margin: '0 0 20px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333'
              }}>
                Minhas Solicitações
              </h2>

              {minhasSolicitacoes.length === 0 ? (
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Você ainda não fez nenhuma solicitação.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {minhasSolicitacoes.map((sol) => (
                    <div
                      key={sol.id}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        borderLeft: '4px solid',
                        borderLeftColor: sol.status === 'aprovado' ? '#107c10' : sol.status === 'recusado' ? '#d13438' : '#0078d4',
                        color: '#333',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600' }}>
                            {sol.projeto}
                          </h4>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {sol.horas_solicitadas} horas • {new Date(sol.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          ...getStatusStyle(sol.status)
                        }}>
                          {getStatusIcon(sol.status)}
                          {sol.status.charAt(0).toUpperCase() + sol.status.slice(1)}
                        </span>
                      </div>
                      {sol.descricao && (
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
                          {sol.descricao}
                        </p>
                      )}
                      {sol.observacao_resposta && (
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          fontStyle: 'italic',
                          color: '#666',
                          paddingTop: '8px',
                          borderTop: '1px solid #eee'
                        }}>
                          Resposta: {sol.observacao_resposta}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}