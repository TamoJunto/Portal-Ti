'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Search, ExternalLink, Database, ArrowLeft } from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface DashboardItem {
  id: number
  nome: string
  descricao: string
  area: string
  link: string
  tipo: string
}

export default function CatalogoPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState<DashboardItem[]>([])
  const [busca, setBusca] = useState('')
  const [filtroArea, setFiltroArea] = useState('Todas')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // Verifica usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      // Busca dados do catálogo
      const { data, error } = await supabase
        .from('catalogo_dados')
        .select('*')
        .order('nome')

      if (data) {
        setDados(data)
      }

      setLoading(false)
    }

    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Filtra os dados baseado na busca e área
  const dadosFiltrados = dados.filter(item => {
    const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       item.descricao.toLowerCase().includes(busca.toLowerCase())
    const matchArea = filtroArea === 'Todas' || item.area === filtroArea
    return matchBusca && matchArea
  })

  // Pega áreas únicas para o filtro
  const areas = ['Todas', ...new Set(dados.map(item => item.area))]

  // Cores por tipo
  const corPorTipo: Record<string, string> = {
    'Power BI': '#f2c811',
    'Google Sheets': '#0f9d58',
    'Metabase': '#509ee3',
    'Excel': '#217346',
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
        <Sidebar activePage="catalogo" onNavigate={(page) => {
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
              Catálogo de Dados
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Encontre os dashboards e fontes de dados disponíveis
            </p>
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
                placeholder="Buscar dashboard..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Filtro por área */}
            <select
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'white',
                fontSize: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              {areas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Lista de Dashboards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {dadosFiltrados.map((item) => (
              
                <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s, transform 0.2s'
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
                {/* Barra colorida */}
                <div style={{
                  height: '4px',
                  backgroundColor: corPorTipo[item.tipo] || '#0078d4'
                }} />

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
                        backgroundColor: `${corPorTipo[item.tipo] || '#0078d4'}20`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Database size={20} color={corPorTipo[item.tipo] || '#0078d4'} />
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
                          {item.tipo}
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={16} color="#666" />
                  </div>

                  {/* Descrição */}
                  <p style={{
                    margin: '0 0 12px 0',
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {item.descricao}
                  </p>

                  {/* Tag da área */}
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {item.area}
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Mensagem se não encontrar */}
          {dadosFiltrados.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#666'
            }}>
              <Database size={48} color="#ccc" style={{ marginBottom: '16px' }} />
              <p>Nenhum dashboard encontrado</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}