'use client'

import { Search, Bell, Settings, LogOut } from 'lucide-react'

interface HeaderProps {
  userEmail: string
  onLogout: () => void
}

export default function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header style={{
      height: '48px',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '1px solid #333'
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
            src="https://aliancaempreendedora.org.br/wp-content/uploads/2024/02/logo-ae-text-white-v2024.svg"  // ou o caminho da sua imagem
            alt="Logo"
            style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            objectFit: 'contain'
            }}
        />
        <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
            Portal TI
        </span>
        </div>

      {/* Busca */}
      <div style={{
        flex: 1,
        maxWidth: '500px',
        margin: '0 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#333',
          borderRadius: '4px',
          padding: '6px 12px',
          gap: '8px'
        }}>
          <Search size={16} color="#999" />
          <input
            type="text"
            placeholder="Pesquisar no Portal"
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Ações do usuário */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          title="Notificações"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell size={18} color="#999" />
        </button>

        <button
          title="Configurações"
          style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Settings size={18} color="#999" />
        </button>

        {/* Avatar / Email */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '8px',
          paddingLeft: '8px',
          borderLeft: '1px solid #333'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#0078d4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {userEmail.substring(0, 2).toUpperCase()}
          </div>

          <button
            onClick={onLogout}
            title="Sair"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} color="#999" />
          </button>
        </div>
      </div>
    </header>
  )
}