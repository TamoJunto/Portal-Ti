'use client'

import { 
  Home, 
  Database, 
  Clock, 
  Laptop, 
  BookOpen, 
  Calculator, 
  Printer,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Wrench
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const menuItems = [
  { id: 'home', label: 'Início', icon: Home, path: '/portal' },
  { id: 'catalogo', label: 'Catálogo de Dados', icon: Database, path: '/catalogo' },
  { id: 'ferramentas', label: 'Ferramentas', icon: Wrench, path: '/ferramentas' },
  { id: 'sharepoint', label: 'SharePoint', icon: Building2, path: '/sharepoint' },
  { id: 'horas', label: 'Solicitar Horas', icon: Clock, path: '/horas' },
  { id: 'equipamentos', label: 'Solicitar Equipamento', icon: Laptop, path: '/equipamentos' },
  { id: 'manual', label: 'Manual de Notebooks', icon: BookOpen, path: '/manual' },
  { id: 'calculadora', label: 'Calculadora Depreciação', icon: Calculator, path: '/calculadora' },
  { id: 'impressoras', label: 'Impressoras', icon: Printer, path: '/impressoras' },
  { id: 'admin', label: 'Administração', icon: Settings, path: '/admin' },
]

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside style={{
      width: collapsed ? '60px' : '240px',
      backgroundColor: '#1a1a1a',
      borderRight: '1px solid #333',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          borderBottom: '1px solid #333',
          color: 'white'
        }}
      >
        {collapsed ? <ChevronRight size={20} color="white" /> : <ChevronLeft size={20} color="white" />}
      </button>

      {/* Menu Items */}
      <nav style={{ flex: 1, padding: '8px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          const isAdmin = item.id === 'admin'

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px' : '12px 16px',
                marginBottom: '4px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#333' : 'transparent',
                color: isActive ? '#0078d4' : 'white',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                textAlign: 'left',
                transition: 'background-color 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderTop: isAdmin ? '1px solid #333' : 'none',
                marginTop: isAdmin ? '8px' : '0',
                paddingTop: isAdmin ? '16px' : '12px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#333'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #333',
          fontSize: '11px',
          color: '#999',
          textAlign: 'center'
        }}>
          Portal TI v1.0
        </div>
      )}
    </aside>
  )
}