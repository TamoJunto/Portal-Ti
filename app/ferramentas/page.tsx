'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  ExternalLink, 
  ArrowLeft,
  Wrench,
  Layout,
  FolderKanban,
  MessageSquare,
  FileSpreadsheet,
  Palette,
  Video,
  Cloud,
  BookOpen,
  Settings,
  Users,
  Plus,
  X,
  ChevronDown
} from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Ferramenta {
  id: number
  nome: string
  descricao: string
  equipe: string
  categoria: string
  link: string
  icone: string
  created_at?: string
}

// Mapeamento de ícones por categoria
const iconePorCategoria: Record<string, any> = {
  'Colaboração': Layout,
  'Design': Palette,
  'Gestão de Projetos': FolderKanban,
  'Comunicação': MessageSquare,
  'Planilhas': FileSpreadsheet,
  'Videoconferência': Video,
  'Armazenamento': Cloud,
  'Documentação': BookOpen,
  'Configuração': Settings,
  'Outros': Wrench
}

// Cores por categoria
const corPorCategoria: Record<string, string> = {
  'Colaboração': '#0078d4',
  'Design': '#e81123',
  'Gestão de Projetos': '#5c2d91',
  'Comunicação': '#00a4ef',
  'Planilhas': '#217346',
  'Videoconferência': '#7b83eb',
  'Armazenamento': '#ff8c00',
  'Documentação': '#008272',
  'Configuração': '#6b6b6b',
  'Outros': '#333333'
}

export default function FerramentasPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([])
  const [busca, setBusca] = useState('')
  const [filtroEquipe, setFiltroEquipe] = useState('Todas')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  
  // Modal para adicionar ferramenta
  const [modalAberto, setModalAberto] = useState(false)
  const [novaFerramenta, setNovaFerramenta] = useState({
    nome: '',
    descricao: '',
    equipe: '',
    categoria: '',
    link: ''
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const categorias = [
    'Colaboração',
    'Design', 
    'Gestão de Projetos',
    'Comunicação',
    'Planilhas',
    'Videoconferência',
    'Armazenamento',
    'Documentação',
    'Configuração',
    'Outros'
  ]

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      await carregarFerramentas()
      setLoading(false)
    }

    init()
  }, [])

  async function carregarFerramentas() {
    const { data, error } = await supabase
      .from('catalogo_ferramentas')
      .select('*')
      .order('nome')

    if (data) {
      setFerramentas(data)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Filtra as ferramentas
  const ferramentasFiltradas = ferramentas.filter(item => {
    const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       item.descricao.toLowerCase().includes(busca.toLowerCase())
    const matchEquipe = filtroEquipe === 'Todas' || item.equipe === filtroEquipe
    const matchCategoria = filtroCategoria === 'Todas' || item.categoria === filtroCategoria
    return matchBusca && matchEquipe && matchCategoria
  })

  // Pega equipes únicas para o filtro
  const equipes = ['Todas', ...new Set(ferramentas.map(item => item.equipe).filter(Boolean))]
  const categoriasDisponiveis = ['Todas', ...new Set(ferramentas.map(item => item.categoria).filter(Boolean))]

  // Agrupa por categoria para exibição
  const ferramentasPorCategoria = ferramentasFiltradas.reduce((acc, item) => {
    const cat = item.categoria || 'Outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, Ferramenta[]>)

  // Função para adicionar nova ferramenta
  async function adicionarFerramenta() {
    if (!novaFerramenta.nome || !novaFerramenta.link || !novaFerramenta.equipe || !novaFerramenta.categoria) {
      setErro('Preencha todos os campos obrigatórios')
      return
    }

    setSalvando(true)
    setErro('')

    const { error } = await supabase
      .from('catalogo_ferramentas')
      .insert({
        nome: novaFerramenta.nome,
        descricao: novaFerramenta.descricao,
        equipe: novaFerramenta.equipe,
        categoria: novaFerramenta.categoria,
        link: novaFerramenta.link,
        icone: novaFerramenta.categoria
      })

    if (error) {
      setErro('Erro ao adicionar ferramenta')
      setSalvando(false)
      return
    }

    await carregarFerramentas()
    setModalAberto(false)
    setNovaFerramenta({ nome: '', descricao: '', equipe: '', categoria: '', link: '' })
    setSalvando(false)
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
        <Sidebar activePage="ferramentas" onNavigate={(page) => {
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

          {/* Título e botão adicionar */}
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
                Catálogo de Ferramentas
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                Encontre as ferramentas e recursos utilizados por cada equipe
              </p>
            </div>

            <button
              onClick={() => setModalAberto(true)}
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
              Adicionar Ferramenta
            </button>
          </div>

          {/* Filtros */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            {/* Busca */}
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
                placeholder="Buscar ferramenta..."
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

            {/* Filtro por equipe */}
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
              {equipes.map(equipe => (
                <option key={equipe} value={equipe}>
                  {equipe === 'Todas' ? 'Todas as Equipes' : equipe}
                </option>
              ))}
            </select>

            {/* Filtro por categoria */}
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
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
              {categoriasDisponiveis.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'Todas' ? 'Todas as Categorias' : cat}
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
                {ferramentas.length}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>Total de ferramentas</div>
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

            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #107c10'
            }}>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                {Object.keys(ferramentasPorCategoria).length}
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>Categorias</div>
            </div>
          </div>

          {/* Lista de Ferramentas agrupadas por categoria */}
          {Object.keys(ferramentasPorCategoria).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#666',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Wrench size={48} color="#ccc" style={{ marginBottom: '16px' }} />
              <p style={{ margin: '0 0 16px 0' }}>Nenhuma ferramenta encontrada</p>
              <button
                onClick={() => setModalAberto(true)}
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
                Adicionar primeira ferramenta
              </button>
            </div>
          ) : (
            Object.entries(ferramentasPorCategoria).map(([categoria, items]) => {
              const IconeCategoria = iconePorCategoria[categoria] || Wrench
              const corCategoria = corPorCategoria[categoria] || '#333'

              return (
                <div key={categoria} style={{ marginBottom: '32px' }}>
                  {/* Cabeçalho da categoria */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: `${corCategoria}15`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconeCategoria size={20} color={corCategoria} />
                    </div>
                    <h2 style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {categoria}
                    </h2>
                    <span style={{
                      padding: '4px 10px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {items.length} {items.length === 1 ? 'ferramenta' : 'ferramentas'}
                    </span>
                  </div>

                  {/* Grid de ferramentas */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '16px'
                  }}>
                    {items.map((item) => (
                      <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          textDecoration: 'none',
                          color: 'inherit',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          transition: 'box-shadow 0.2s, transform 0.2s',
                          borderLeft: `4px solid ${corCategoria}`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <div style={{ padding: '20px' }}>
                          {/* Header do card */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: `${corCategoria}15`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <IconeCategoria size={20} color={corCategoria} />
                              </div>
                              <div>
                                <h3 style={{
                                  margin: 0,
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#333'
                                }}>
                                  {item.nome}
                                </h3>
                                <span style={{
                                  fontSize: '12px',
                                  color: '#666'
                                }}>
                                  {item.categoria}
                                </span>
                              </div>
                            </div>
                            <ExternalLink size={16} color="#666" />
                          </div>

                          {/* Descrição */}
                          {item.descricao && (
                            <p style={{
                              margin: '0 0 12px 0',
                              fontSize: '14px',
                              color: '#666',
                              lineHeight: '1.4'
                            }}>
                              {item.descricao}
                            </p>
                          )}

                          {/* Tag da equipe */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <Users size={14} color="#666" />
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '4px',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              {item.equipe}
                            </span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </main>
      </div>

      {/* Modal para adicionar ferramenta */}
      {modalAberto && (
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
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                Adicionar Ferramenta
              </h2>
              <button
                onClick={() => setModalAberto(false)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Nome */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Nome da Ferramenta *
                </label>
                <input
                  type="text"
                  value={novaFerramenta.nome}
                  onChange={(e) => setNovaFerramenta({...novaFerramenta, nome: e.target.value})}
                  placeholder="Ex: Miro Diversidade"
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

              {/* Link */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Link *
                </label>
                <input
                  type="url"
                  value={novaFerramenta.link}
                  onChange={(e) => setNovaFerramenta({...novaFerramenta, link: e.target.value})}
                  placeholder="https://..."
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

              {/* Equipe */}
              <div>
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
                  value={novaFerramenta.equipe}
                  onChange={(e) => setNovaFerramenta({...novaFerramenta, equipe: e.target.value})}
                  placeholder="Ex: TI, RH, Financeiro, Todos"
                  list="equipes-list"
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
                <datalist id="equipes-list">
                  {equipes.filter(e => e !== 'Todas').map(e => (
                    <option key={e} value={e} />
                  ))}
                  <option value="Todos" />
                </datalist>
              </div>

              {/* Categoria */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Categoria *
                </label>
                <select
                  value={novaFerramenta.categoria}
                  onChange={(e) => setNovaFerramenta({...novaFerramenta, categoria: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    color: '#333',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Descrição */}
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
                  value={novaFerramenta.descricao}
                  onChange={(e) => setNovaFerramenta({...novaFerramenta, descricao: e.target.value})}
                  placeholder="Descreva brevemente a ferramenta..."
                  rows={3}
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

            {/* Botões */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  flex: 1,
                  padding: '12px',
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
                onClick={adicionarFerramenta}
                disabled={salvando}
                style={{
                  flex: 1,
                  padding: '12px',
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
                {salvando ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}