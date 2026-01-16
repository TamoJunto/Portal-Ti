'use client'

import { LucideIcon } from 'lucide-react'

interface CardProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  onClick?: () => void
}

export default function Card({ title, description, icon: Icon, color, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'white',
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s, transform 0.2s'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Barra colorida no topo */}
      <div style={{
        height: '4px',
        backgroundColor: color
      }} />

      {/* Conteúdo */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: `${color}15`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={22} color={color} />
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#333'
          }}>
            {title}
          </h3>
        </div>

        <p style={{
          margin: 0,
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      </div>
    </div>
  )
}