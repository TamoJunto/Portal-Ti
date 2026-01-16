'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Database, 
  Clock, 
  Laptop, 
  BookOpen, 
  Calculator, 
  Printer,
  Settings,
  ArrowRight,
  ExternalLink,
  Building2
} from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

const cards = [
  {
    id: 'catalogo',
    titulo: 'Catálogo de Dados',
    descricao: 'Visualize os dados disponíveis por equipe com status de acesso',
    icon: Database,
    cor: '#0078d4',
    path: '/catalogo'
  },
  {
    id: 'sharepoint',
    titulo: 'SharePoint',
    descricao: 'Acesse os sites e pastas da organização no SharePoint',
    icon: Building2,
    cor: '#038387',
    path: '/sharepoint'
  },
  {
    id: 'horas',
    titulo: 'Solicitar Horas',
    descricao: 'Faça solicitações de horas extras ou banco de horas',
    icon: Clock,
    cor: '#107c10',
    path: '/horas'
  },
  {
    id: 'equipamentos',
    titulo: 'Solicitar Equipamento',
    descricao: 'Solicite notebooks, periféricos e outros equipamentos',
    icon: Laptop,
    cor: '#5c2d91',
    path: '/equipamentos'
  },
  {
    id: 'manual',
    titulo: 'Manual de Notebooks',
    descricao: 'Dicas de conservação para aumentar a vida útil do seu equipamento',
    icon: BookOpen,
    cor: '#d83b01',
    path: '/manual'
  },
  {
    id: 'calculadora',
    titulo: 'Calculadora de Depreciação',
    descricao: 'Calcule o valor atual do seu notebook Dell',
    icon: Calculator,
    cor: '#008272',
    path: '/calculadora'
  },
  {
    id: 'impressoras',
    titulo: 'Impressoras',
    descricao: 'Instale impressoras da rede no seu computador',
    icon: Printer,
    cor: '#e81123',
    path: '/impressoras'
  }
]

const linksUteis = [
  { label: 'DeskManager', url: 'https://suporteae.desk.ms/?LoginPortal' },
  { label: 'Suporte Dell', url: 'https://www.dell.com/support' },
  { label: 'Microsoft 365', url: 'https://www.office.com' },
]

export default function PortalPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pendencias, setPendencias] = useState({ horas: 0, equipamentos: 0 })
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

      // Buscar pendências para admin
      const { data: horasPendentes } = await supabase
        .from('solicitacao_horas')
        .select('id')
        .eq('status', 'pendente')
      
      const { data: equipPendentes } = await supabase
        .from('solicitacao_equipamentos')
        .select('id')
        .eq('status', 'pendente')

      setPendencias({
        horas: horasPendentes?.length || 0,
        equipamentos: equipPendentes?.length || 0
      })

      setLoading(false)
    }

    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      router.push('/portal')
    } else {
      router.push(`/${page}`)
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

  const totalPendencias = pendencias.horas + pendencias.equipamentos

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      <Header userEmail={user?.email || ''} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
       <Sidebar activePage="home" onNavigate={(page) => {
                   if (page === 'home') router.push('/portal')
                     else router.push(`/${page}`)
                 }} />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {/* Boas vindas */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              margin: '0 0 4px 0',
              fontSize: '24px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Bem-vindo ao Portal TI
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Acesse os serviços e ferramentas do departamento de TI
            </p>
          </div>

          {/* Card Admin (se houver pendências) */}
          {totalPendencias > 0 && (
            <div
              onClick={() => router.push('/admin')}
              style={{
                backgroundColor: '#fff4ce',
                border: '1px solid #ffaa44',
                borderRadius: '8px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Settings size={24} color="#996600" />
                <div>
                  <div style={{ fontWeight: '600', color: '#996600' }}>
                    {totalPendencias} solicitação(ões) pendente(s)
                  </div>
                  <div style={{ fontSize: '13px', color: '#997700' }}>
                    {pendencias.horas > 0 && `${pendencias.horas} de horas`}
                    {pendencias.horas > 0 && pendencias.equipamentos > 0 && ' • '}
                    {pendencias.equipamentos > 0 && `${pendencias.equipamentos} de equipamentos`}
                  </div>
                </div>
              </div>
              <ArrowRight size={20} color="#996600" />
            </div>
          )}

          {/* Grid de Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {cards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  onClick={() => router.push(card.path)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    borderLeft: `4px solid ${card.cor}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: `${card.cor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={24} color={card.cor} />
                    </div>
                    <div>
                      <h3 style={{
                        margin: '0 0 6px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {card.titulo}
                      </h3>
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: '1.5'
                      }}>
                        {card.descricao}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Links Úteis */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333'
            }}>
              Links Úteis
            </h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {linksUteis.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    color: '#0078d4',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f2ff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                >
                  <ExternalLink size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#999'
          }}>
            © 2025 Aliança Empreendedora. Lab: Geovana-IA e Gabriel-Dev 2.0.
          </div>
        </main>
      </div>
    </div>
  )
}