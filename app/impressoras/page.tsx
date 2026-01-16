'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Monitor, Apple } from 'lucide-react'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface Impressora {
  id: number
  nome: string
  local: string
  ip: string
  cor: string
  scriptWindows: string
  scriptMac: string
}

const impressoras: Impressora[] = [
  { 
    id: 1, 
    nome: 'Brother DCP-L2540DW', 
    local: 'Sala TI', 
    ip: '192.168.18.50', 
    cor: '#0078d4',
    scriptWindows: `@echo off
set PRINTER_NAME=Impressora AE TI
set PRINTER_IP=192.168.18.50
set DRIVER_NAME=Brother DCP-L2540DW series

echo ==========================================
echo Adicionando a impressora %PRINTER_NAME%
echo Endereco IP: %PRINTER_IP%
echo ==========================================

:: Cria a porta TCP/IP (caso nao exista)
cscript %WINDIR%\\System32\\Printing_Admin_Scripts\\pt-BR\\prnport.vbs -a -r IP_%PRINTER_IP% -h %PRINTER_IP% -o raw -n 9100

:: Instala a impressora com driver Brother
rundll32 printui.dll,PrintUIEntry /if /b "%PRINTER_NAME%" /r "IP_%PRINTER_IP%" /m "%DRIVER_NAME%"

echo.
echo Impressora adicionada com sucesso!
echo.
pause`,
    scriptMac: `#!/bin/bash
PRINTER_NAME="Impressora AE TI"
PRINTER_IP="192.168.18.50"

echo "Adicionando impressora $PRINTER_NAME no IP $PRINTER_IP..."
lpadmin -p $PRINTER_NAME -E -v ipp://$PRINTER_IP/ipp/print -m everywhere
echo "Impressora adicionada com sucesso!"`
  },
  { 
    id: 2, 
    nome: 'Brother', 
    local: 'Sala Principal', 
    ip: '192.168.18.51', 
    cor: '#28a745',
    scriptWindows: `@echo off
set PRINTER_NAME=Impressora AE Principal
set PRINTER_IP=192.168.18.51

echo ==========================================
echo Adicionando a impressora %PRINTER_NAME%
echo Endereco IP: %PRINTER_IP%
echo ==========================================

rundll32 printui.dll,PrintUIEntry /if /b "%PRINTER_NAME%" /f %WINDIR%\\INF\\ntprint.inf /r "tcpmon:%PRINTER_IP%" /m "Microsoft PS Class Driver"

echo.
echo Impressora adicionada com sucesso!
echo.
pause`,
    scriptMac: `#!/bin/bash
PRINTER_NAME="Impressora AE Principal"
PRINTER_IP="192.168.18.51"

echo "Adicionando impressora $PRINTER_NAME no IP $PRINTER_IP..."
lpadmin -p $PRINTER_NAME -E -v ipp://$PRINTER_IP/ipp/print -m everywhere
echo "Impressora adicionada com sucesso!"`
  },
  { 
    id: 3, 
    nome: 'Epson', 
    local: 'Sala Financeiro', 
    ip: '192.168.18.52', 
    cor: '#ff5722',
    scriptWindows: `@echo off
set PRINTER_NAME=Impressora AE Financeiro
set PRINTER_IP=192.168.18.52

echo ==========================================
echo Adicionando a impressora %PRINTER_NAME%
echo Endereco IP: %PRINTER_IP%
echo ==========================================

rundll32 printui.dll,PrintUIEntry /if /b "%PRINTER_NAME%" /f %WINDIR%\\INF\\ntprint.inf /r "tcpmon:%PRINTER_IP%" /m "Microsoft PS Class Driver"

echo.
echo Impressora adicionada com sucesso!
echo.
pause`,
    scriptMac: `#!/bin/bash
PRINTER_NAME="Impressora AE Financeiro"
PRINTER_IP="192.168.18.52"

echo "Adicionando impressora $PRINTER_NAME no IP $PRINTER_IP..."
lpadmin -p $PRINTER_NAME -E -v ipp://$PRINTER_IP/ipp/print -m everywhere
echo "Impressora adicionada com sucesso!"`
  },
]

export default function ImpressorasPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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

  const handleNavigate = (page: string) => {
    if (page === 'home') router.push('/portal')
    else router.push(`/${page}`)
  }

  const downloadScript = (impressora: Impressora, tipo: 'windows' | 'mac') => {
    const script = tipo === 'windows' ? impressora.scriptWindows : impressora.scriptMac
    const extension = tipo === 'windows' ? 'bat' : 'sh'
    
    // Gerar nome do arquivo baseado no local
    const nomeLocal = impressora.local.toLowerCase().replace('sala ', '').replace(/\s+/g, '-')
    const filename = tipo === 'windows' 
      ? `${impressora.nome.toLowerCase().split(' ')[0]}-${nomeLocal}.${extension}`
      : `${impressora.nome.toLowerCase().split(' ')[0]}-${nomeLocal}.${extension}`
    
    const blob = new Blob([script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
        <Sidebar activePage="impressoras" onNavigate={(page) => {
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
              color: '#1a1a1a'
            }}>
              Impressoras da AE Curitiba
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Selecione uma impressora para instalar no seu computador
            </p>
          </div>

          {/* Grid de Impressoras */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            maxWidth: '1000px'
          }}>
            {impressoras.map((impressora) => (
              <div
                key={impressora.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s'
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
                {/* Ícone */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: `${impressora.cor}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <Printer size={32} color={impressora.cor} />
                </div>

                {/* Info */}
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {impressora.local}
                </h3>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  color: '#888'
                }}>
                  {impressora.nome}
                </p>
                <p style={{
                  margin: '0 0 20px 0',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  IP: {impressora.ip}
                </p>

                {/* Botões */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => downloadScript(impressora, 'windows')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      backgroundColor: '#0078d4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#005a9e'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0078d4'}
                  >
                    <Monitor size={18} />
                    Instalar no Windows
                  </button>

                  <button
                    onClick={() => downloadScript(impressora, 'mac')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      backgroundColor: '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
                  >
                    <Apple size={18} />
                    Instalar no Mac
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Instruções */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            maxWidth: '1000px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
              Como instalar
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Windows */}
              <div>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0078d4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Monitor size={16} />
                  Windows
                </h4>
                <ol style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#666',
                  lineHeight: '1.8'
                }}>
                  <li>Clique em "Instalar no Windows"</li>
                  <li>Salve o arquivo .bat</li>
                  <li>Clique com botão direito no arquivo</li>
                  <li>Selecione "Executar como administrador"</li>
                  <li>Aguarde a instalação concluir</li>
                </ol>
              </div>

              {/* Mac */}
              <div>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Apple size={16} />
                  Mac
                </h4>
                <ol style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#666',
                  lineHeight: '1.8'
                }}>
                  <li>Clique em "Instalar no Mac"</li>
                  <li>Salve o arquivo .sh</li>
                  <li>Abra o Terminal</li>
                  <li>Digite: <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>chmod +x ~/Downloads/nome-do-arquivo.sh</code></li>
                  <li>Digite: <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>~/Downloads/nome-do-arquivo.sh</code></li>
                </ol>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: '#fff4ce',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#666'
            }}>
              <strong>Precisa de ajuda?</strong> Abra um chamado no DeskManager ou procure a equipe de TI.
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}