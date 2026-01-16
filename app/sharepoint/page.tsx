'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Star, Building2 } from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface SiteSharePoint {
  id: number
  nome: string
  sigla: string
  url: string
  cor: string
  icone?: string
}

const sitesSharePoint: SiteSharePoint[] = [
  { 
    id: 1, 
    nome: 'Aliança Empreendedora', 
    sigla: 'AG',
    url: 'https://associacaoaliancae.sharepoint.com/sites/AssembleiaGeralAE',
    cor: '#d35400'
  },
  { 
    id: 2, 
    nome: 'Dados', 
    sigla: 'BI',
    url: 'https://associacaoaliancae.sharepoint.com/sites/dados',
    cor: '#2980b9'
  },
  { 
    id: 3, 
    nome: 'EMP Boto Rosa', 
    sigla: 'BR',
    url: 'https://associacaoaliancae.sharepoint.com/sites/EMP32',
    cor: '#8e44ad'
  },
  { 
    id: 4, 
    nome: 'Tamo Junto', 
    sigla: 'TJ',
    url: 'https://associacaoaliancae.sharepoint.com/sites/TamoJunto2',
    cor: '#5d6d7e'
  },
  { 
    id: 5, 
    nome: 'Comunicação', 
    sigla: 'C',
    url: 'https://associacaoaliancae.sharepoint.com/sites/Comunicao',
    cor: '#c0392b'
  },
  { 
    id: 6, 
    nome: 'Salamandra', 
    sigla: '🦎',
    url: 'https://associacaoaliancae.sharepoint.com/sites/Salamandra',
    cor: '#e67e22',
    icone: 'img'
  },
  { 
    id: 7, 
    nome: 'Mentoria / Guru de Negócios', 
    sigla: 'GN',
    url: 'https://associacaoaliancae.sharepoint.com/sites/Mentoria',
    cor: '#16a085'
  },
  { 
    id: 8, 
    nome: 'Tecendo Sonhos', 
    sigla: 'TS',
    url: 'https://associacaoaliancae.sharepoint.com/sites/TecendoSonhos',
    cor: '#f39c12'
  },
  { 
    id: 9, 
    nome: 'Think Tank / Empreender 360', 
    sigla: 'E360',
    url: 'https://associacaoaliancae.sharepoint.com/sites/ThinkTank2018',
    cor: '#e74c3c'
  },
]

export default function SharePointPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [favoritos, setFavoritos] = useState<number[]>([])
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
      
      // Carregar favoritos do localStorage
      const savedFavoritos = localStorage.getItem('sharepoint_favoritos')
      if (savedFavoritos) {
        setFavoritos(JSON.parse(savedFavoritos))
      }
      
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleNavigate = (page: string) => {
    if (page === 'home') router.push('/portal')
    else router.push(`/${page}`)
  }

  const toggleFavorito = (id: number) => {
    const newFavoritos = favoritos.includes(id)
      ? favoritos.filter(f => f !== id)
      : [...favoritos, id]
    
    setFavoritos(newFavoritos)
    localStorage.setItem('sharepoint_favoritos', JSON.stringify(newFavoritos))
  }

  // Ordenar: favoritos primeiro
  const sitesOrdenados = [...sitesSharePoint].sort((a, b) => {
    const aFav = favoritos.includes(a.id)
    const bFav = favoritos.includes(b.id)
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    return 0
  })

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
        <Sidebar activePage="sharepoint" onNavigate={(page) => {
                    if (page === 'home') router.push('/portal')
                      else router.push(`/${page}`)
                  }} />

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
              color: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Building2 size={28} />
              Sites do SharePoint
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Acesse rapidamente os sites e pastas da organização
            </p>
          </div>

          {/* Dica */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#e6f2ff',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#0078d4',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Star size={16} />
            <span>Clique na estrela para favoritar e deixar o site no topo da lista!</span>
          </div>

          {/* Grid de Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            maxWidth: '1200px'
          }}>
            {sitesOrdenados.map((site) => {
              const isFavorito = favoritos.includes(site.id)
              
              return (
                <div
                  key={site.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  {/* Barra colorida no topo */}
                  <div style={{
                    height: '6px',
                    backgroundColor: site.cor
                  }} />

                  {/* Conteúdo */}
                  <div style={{ padding: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      {/* Ícone/Sigla */}
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: site.cor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: site.sigla.length > 2 ? '12px' : '16px',
                        flexShrink: 0
                      }}>
                        {site.sigla}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          margin: '0 0 4px 0',
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#333',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {site.nome}
                        </h3>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: '#999'
                        }}>
                          Grupo SharePoint
                        </p>
                      </div>

                      {/* Botão Favorito */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorito(site.id)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Star 
                          size={20} 
                          fill={isFavorito ? '#f39c12' : 'none'}
                          color={isFavorito ? '#f39c12' : '#ccc'}
                        />
                      </button>
                    </div>

                    {/* Botão Acessar */}
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '16px',
                        padding: '10px',
                        backgroundColor: site.cor,
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <ExternalLink size={14} />
                      Acessar Site
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Info adicional */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            maxWidth: '1200px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
              Dicas de uso
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              fontSize: '13px',
              color: '#666',
              lineHeight: '1.8'
            }}>
              <li>Faça login com sua conta Microsoft para acessar os sites</li>
              <li>Use a estrela ⭐ para favoritar os sites que você mais usa</li>
              <li>Os sites favoritados aparecem primeiro na lista</li>
              <li>Se não conseguir acessar algum site, verifique suas permissões com a TI</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}