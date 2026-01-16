'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, ChevronRight, Truck, Battery, Sparkles, HardDrive, ExternalLink } from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface SecaoManual {
  id: string
  titulo: string
  icon: any
  topicos: {
    titulo: string
    porque: string
    riscos: string
    cuidado: string
  }[]
}

const secoesManual: SecaoManual[] = [
  {
    id: 'manuseio',
    titulo: '1. Manuseio e Transporte',
    icon: Truck,
    topicos: [
      {
        titulo: 'Transporte Seguro',
        porque: 'Transportar o notebook em bolsas próprias com acolchoamento reduz os riscos em caso de impacto ou queda.',
        riscos: 'Bolsas comuns não absorvem choques, aumentando as chances de danos ao HD, SSD, placa-mãe e tela, mesmo sem sinais imediatos. Uma queda pode trincar tela, danificar a carcaça ou até o HD/SSD.',
        cuidado: 'Use sempre bolsas apropriadas, evite balançar a mochila e nunca transporte o notebook solto ou sem proteção.'
      },
      {
        titulo: 'Evite Pressão Excessiva',
        porque: 'Objetos pesados ou pressão sobre o notebook podem danificar a tela ou os componentes internos.',
        riscos: 'Trincas na tela, teclas afundadas, carcaça entortada e até curto-circuitos. É comum quando apoiam livros, bolsas ou outros objetos em cima.',
        cuidado: 'Nunca coloque peso sobre o notebook, mesmo na mochila. Guarde sempre no topo ou em compartimento acolchoado separado.'
      },
      {
        titulo: 'Abertura Correta',
        porque: 'Ao abrir corretamente (pelos dois lados, com as duas mãos), você distribui a força, preservando as dobradiças.',
        riscos: 'Abrir por um lado só pode entortar ou quebrar a dobradiça, desalinhando a tela ou rompendo cabos internos.',
        cuidado: 'Sempre abra e feche com as duas mãos, pelas laterais da tela, e evite movimentos bruscos.'
      }
    ]
  },
  {
    id: 'energia',
    titulo: '2. Cuidados com Energia e Bateria',
    icon: Battery,
    topicos: [
      {
        titulo: 'Carregador Original',
        porque: 'O carregador original fornece energia na voltagem e amperagem corretas para o modelo do notebook.',
        riscos: 'Carregadores paralelos ou universais podem causar superaquecimento, falhas, curto-circuito ou danificar a bateria de forma irreversível.',
        cuidado: 'Use sempre o carregador fornecido pelo fabricante (ou original de reposição). Evite carregadores de procedência duvidosa ou danificados. Se você não tem mais o carregador original, abra um chamado no Desk Manager para análise da compra de um original.'
      },
      {
        titulo: 'Ciclo de Carga',
        porque: 'Manter a bateria entre 20% e 80% reduz o desgaste químico e prolonga a vida útil.',
        riscos: 'Descargas completas frequentes ou manter sempre 100% podem encurtar a vida útil da bateria, causar superaquecimento e perda de autonomia.',
        cuidado: 'Evite deixar a bateria descarregar totalmente ou ficar permanentemente conectada na tomada sem necessidade.'
      },
      {
        titulo: 'Uso Prolongado na Tomada',
        porque: 'Muitos deixam o notebook plugado continuamente, mas isso pode prejudicar a bateria pelo calor gerado.',
        riscos: 'Superaquecimento, redução da autonomia e até inchaço da bateria.',
        cuidado: 'Se o modelo permitir, retire a bateria no uso contínuo na tomada; caso contrário, evite obstruir as saídas de ar e monitore a temperatura.'
      }
    ]
  },
  {
    id: 'limpeza',
    titulo: '3. Limpeza e Manutenção',
    icon: Sparkles,
    topicos: [
      {
        titulo: 'Limpeza da Tela',
        porque: 'Manter a tela limpa facilita a leitura e evita manchas e desgaste prematuro do revestimento.',
        riscos: 'Usar produtos inadequados, como álcool ou limpa-vidros, pode danificar a superfície da tela. Panos ásperos podem causar riscos irreversíveis.',
        cuidado: 'Utilize pano de microfibra limpo e seco ou levemente umedecido em água. Nunca aplique produtos de limpeza diretamente na tela.'
      },
      {
        titulo: 'Limpeza do Teclado',
        porque: 'Poeira, migalhas e líquidos acumulam entre as teclas, prejudicando o funcionamento.',
        riscos: 'Teclas travadas, mau contato ou falha total do teclado, especialmente após derramamento de líquidos.',
        cuidado: 'Com o notebook desligado, vire-o de cabeça para baixo e use pincel macio ou ar comprimido. Evite água ou álcool diretamente nas teclas.'
      },
      {
        titulo: 'Portas e Conectores',
        porque: 'Poeira acumulada causa mau contato e dificulta transferência de dados ou carregamento.',
        riscos: 'Usar objetos metálicos para limpar pode danificar as portas, resultando em problemas de conexão.',
        cuidado: 'Use ar comprimido para limpar. Se necessário, use cotonete seco com delicadeza, nunca objetos metálicos ou pontiagudos.'
      },
      {
        titulo: 'Ventilação',
        porque: 'Uma boa ventilação evita superaquecimento. Um fluxo de ar adequado é essencial para a dissipação do calor e preservação dos componentes internos.',
        riscos: 'Cobrir as saídas de ar (usar na cama, sofá, tapetes) pode causar desligamento súbito e danos internos por calor.',
        cuidado: 'Utilize o notebook em superfícies planas e firmes e limpe as saídas de ar regularmente.'
      }
    ]
  },
  {
    id: 'armazenamento',
    titulo: '4. Armazenamento e Atualizações',
    icon: HardDrive,
    topicos: [
      {
        titulo: 'Local de Armazenamento',
        porque: 'O local onde o notebook fica guardado interfere na durabilidade dos componentes.',
        riscos: 'Locais abafados, úmidos ou quentes (carro, armário fechado, perto de janela) aceleram ferrugem, mofo, danos eletrônicos ou até estufamento da bateria.',
        cuidado: 'Sempre guarde em local seco, arejado, longe da luz solar. Evite deixar o notebook em mochilas fechadas por muito tempo ou próximo a fontes de calor/umidade.'
      },
      {
        titulo: 'Atualizações de Software',
        porque: 'Atualizações de sistema e aplicativos corrigem bugs, evitam falhas, melhoram a segurança e o desempenho.',
        riscos: 'Não atualizar o sistema ou programas deixa o notebook vulnerável a vírus, travamentos e problemas de compatibilidade.',
        cuidado: 'Windows: Vá em Iniciar → Configurações → Atualização e Segurança → Windows Update. Dell: Use o Dell SupportAssist para atualizar drivers automaticamente.'
      },
      {
        titulo: 'Backups Regulares',
        porque: 'Backups garantem que fotos, documentos e arquivos importantes não sejam perdidos.',
        riscos: 'Deixar tudo só no notebook é arriscado: falhas, vírus, queda ou roubo podem resultar em perda total.',
        cuidado: 'Use HDs/SSDs externos, OneDrive ou Google Drive. Se der pane, for roubado ou tiver dano físico, seu backup estará seguro e acessível em outro aparelho ou online.'
      }
    ]
  }
]

export default function ManualPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [secoesAbertas, setSecoesAbertas] = useState<string[]>([])
  const [topicosAbertos, setTopicosAbertos] = useState<string[]>([])
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
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const toggleSecao = (id: string) => {
    setSecoesAbertas(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const toggleTopico = (id: string) => {
    setTopicosAbertos(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
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
        <Sidebar activePage="manual" onNavigate={(page) => {
                    if (page === 'home') router.push('/portal')
                      else router.push(`/${page}`)
                  }} />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', maxWidth: '900px' }}>
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
              Manual de Conservação de Notebooks
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Orientações para aumentar a vida útil do seu equipamento e evitar falhas
            </p>
          </div>

          {/* Seções */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {secoesManual.map((secao) => {
              const Icon = secao.icon
              const isSecaoAberta = secoesAbertas.includes(secao.id)

              return (
                <div
                  key={secao.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Header da Seção */}
                  <button
                    onClick={() => toggleSecao(secao.id)}
                    style={{
                      width: '100%',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={24} color="#0078d4" />
                    <span style={{
                      flex: 1,
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {secao.titulo}
                    </span>
                    {isSecaoAberta ? (
                      <ChevronDown size={20} color="#666" />
                    ) : (
                      <ChevronRight size={20} color="#666" />
                    )}
                  </button>

                  {/* Conteúdo da Seção */}
                  {isSecaoAberta && (
                    <div style={{
                      padding: '0 20px 20px 20px',
                      borderTop: '1px solid #eee'
                    }}>
                      {secao.topicos.map((topico, idx) => {
                        const topicoId = `${secao.id}-${idx}`
                        const isTopicoAberto = topicosAbertos.includes(topicoId)

                        return (
                          <div key={idx} style={{ marginTop: '12px' }}>
                            <button
                              onClick={() => toggleTopico(topicoId)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 0',
                                color: '#0078d4',
                                fontWeight: '600',
                                fontSize: '15px'
                              }}
                            >
                              {isTopicoAberto ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                              {topico.titulo}
                            </button>

                            {isTopicoAberto && (
                              <div style={{
                                marginLeft: '24px',
                                padding: '12px 16px',
                                backgroundColor: '#f0f7ff',
                                borderLeft: '3px solid #0078d4',
                                borderRadius: '0 4px 4px 0'
                              }}>
                                <div style={{ marginBottom: '12px' }}>
                                  <strong style={{ color: '#333' }}>Por quê?</strong>
                                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                                    {topico.porque}
                                  </p>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <strong style={{ color: '#d13438' }}>Riscos</strong>
                                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                                    {topico.riscos}
                                  </p>
                                </div>
                                <div>
                                  <strong style={{ color: '#107c10' }}>Cuidado</strong>
                                  <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                                    {topico.cuidado}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Links úteis */}
          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
              Links Úteis
            </h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Manual oficial Dell', url: 'https://www.dell.com/support' },
                { label: 'Manuais Acer', url: 'https://www.acer.com/ac/pt/BR/content/support' },
                { label: 'Suporte HP', url: 'https://support.hp.com/br-pt/help/computer' },
              ].map((link) => (
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
                    fontSize: '14px',
                    fontWeight: '500',

                  }}
                >
                  <ExternalLink size={14} />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}