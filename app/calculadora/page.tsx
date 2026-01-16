'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calculator, AlertTriangle, CheckCircle, XCircle, RotateCcw, Cpu, HardDrive, Monitor, DollarSign, Calendar, CircleDot } from 'lucide-react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Text, Float, Environment } from '@react-three/drei'
import * as THREE from 'three'

import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'

interface ResultadoCalculo {
  valorAtual: number
  depreciacaoTotal: number
  percentualDepreciado: number
  idadeAnos: number
  recomendacao: 'manter' | 'avaliar' | 'substituir'
  mensagemRecomendacao: string
  fatores: { nome: string; impacto: number }[]
}

// ==================== COMPONENTES 3D ====================

// Componente CPU 3D
function CPUChip({ visible, color }: { visible: boolean; color: string }) {
  const ref = useRef<THREE.Group>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    setScale(visible ? 1 : 0)
  }, [visible])

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, scale, 0.1))
      if (visible) {
        ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      }
    }
  })

  return (
    <group ref={ref} position={[0, 0.15, 0]}>
      {/* Base do chip */}
      <RoundedBox args={[0.4, 0.05, 0.4]} radius={0.02}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </RoundedBox>
      {/* Die do processador */}
      <RoundedBox args={[0.25, 0.03, 0.25]} radius={0.01} position={[0, 0.04, 0]}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.3} />
      </RoundedBox>
      {/* Pins */}
      {[-0.15, -0.05, 0.05, 0.15].map((x, i) =>
        [-0.22, 0.22].map((z, j) => (
          <mesh key={`pin-${i}-${j}`} position={[x, -0.01, z]}>
            <boxGeometry args={[0.03, 0.02, 0.02]} />
            <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.3} />
          </mesh>
        ))
      )}
    </group>
  )
}

// Componente RAM 3D
function RAMStick({ visible, position, color }: { visible: boolean; position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    setScale(visible ? 1 : 0)
  }, [visible])

  useFrame(() => {
    if (ref.current) {
      ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, scale, 0.1))
    }
  })

  return (
    <group ref={ref} position={position} rotation={[0, 0, 0]}>
      {/* PCB da RAM */}
      <RoundedBox args={[0.6, 0.03, 0.15]} radius={0.005}>
        <meshStandardMaterial color="#0d3320" metalness={0.3} roughness={0.7} />
      </RoundedBox>
      {/* Chips de memória */}
      {[-0.2, -0.07, 0.07, 0.2].map((x, i) => (
        <RoundedBox key={i} args={[0.08, 0.02, 0.1]} radius={0.005} position={[x, 0.025, 0]}>
          <meshStandardMaterial color="#111" metalness={0.5} roughness={0.5} />
        </RoundedBox>
      ))}
      {/* Contatos dourados */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.55, 0.01, 0.02]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  )
}

// Componente SSD/Storage 3D
function StorageDevice({ visible, type, color }: { visible: boolean; type: string; color: string }) {
  const ref = useRef<THREE.Group>(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    setScale(visible ? 1 : 0)
  }, [visible])

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, scale, 0.1))
    }
  })

  const isNVMe = type === 'nvme'
  const isSSD = type === 'sata-ssd'

  return (
    <group ref={ref} position={[0, 0.15, -0.5]}>
      {isNVMe ? (
        // NVMe M.2
        <>
          <RoundedBox args={[0.8, 0.02, 0.22]} radius={0.005}>
            <meshStandardMaterial color="#1a1a2e" metalness={0.4} roughness={0.6} />
          </RoundedBox>
          {/* Controller */}
          <RoundedBox args={[0.15, 0.015, 0.12]} radius={0.005} position={[-0.25, 0.015, 0]}>
            <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
          </RoundedBox>
          {/* NAND chips */}
          {[0, 0.2].map((x, i) => (
            <RoundedBox key={i} args={[0.12, 0.015, 0.12]} radius={0.005} position={[x, 0.015, 0]}>
              <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
            </RoundedBox>
          ))}
          {/* Conector */}
          <mesh position={[0.38, 0, 0]}>
            <boxGeometry args={[0.04, 0.015, 0.18]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
          </mesh>
        </>
      ) : isSSD ? (
        // SSD 2.5"
        <>
          <RoundedBox args={[0.7, 0.07, 0.5]} radius={0.02}>
            <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
          </RoundedBox>
          {/* Label */}
          <RoundedBox args={[0.5, 0.001, 0.35]} radius={0.01} position={[0, 0.036, 0]}>
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </RoundedBox>
        </>
      ) : (
        // HDD
        <>
          <RoundedBox args={[0.7, 0.1, 0.5]} radius={0.02}>
            <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
          </RoundedBox>
          {/* Label metálico */}
          <RoundedBox args={[0.55, 0.001, 0.4]} radius={0.01} position={[0, 0.051, 0]}>
            <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
          </RoundedBox>
        </>
      )}
    </group>
  )
}

// Notebook 3D Principal
function Notebook3D({ 
  linha, 
  temProcessador, 
  temRam, 
  temArmazenamento,
  armazenamento 
}: { 
  linha: string
  temProcessador: boolean
  temRam: boolean
  temArmazenamento: boolean
  armazenamento: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const screenRef = useRef<THREE.Group>(null)
  
  // Cor baseada na linha
  const getColor = () => {
    switch(linha) {
      case 'inspiron': return '#0078d4'
      case 'xps': return '#c4a000'
      case 'latitude': return '#107c10'
      case 'precision': return '#5c2d91'
      default: return '#666666'
    }
  }
  
  const color = getColor()
  const hasLinha = linha !== ''

  useFrame((state) => {
    if (groupRef.current) {
      // Rotação suave automática
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Base do Notebook (Teclado) */}
      <group position={[0, 0, 0]}>
        {/* Corpo principal */}
        <RoundedBox args={[2.4, 0.08, 1.6]} radius={0.04} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={hasLinha ? color : '#888'} 
            metalness={0.8} 
            roughness={0.2}
          />
        </RoundedBox>
        
        {/* Área do teclado (rebaixada) */}
        <RoundedBox args={[2.2, 0.02, 1.0]} radius={0.02} position={[0, 0.05, -0.2]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.8} />
        </RoundedBox>
        
        {/* Teclas (simplificado) */}
        {[...Array(5)].map((_, row) => (
          [...Array(12)].map((_, col) => (
            <RoundedBox 
              key={`key-${row}-${col}`}
              args={[0.12, 0.015, 0.12]} 
              radius={0.01}
              position={[-1.0 + col * 0.17, 0.065, -0.55 + row * 0.17]}
            >
              <meshStandardMaterial color="#2a2a2a" metalness={0.3} roughness={0.8} />
            </RoundedBox>
          ))
        ))}
        
        {/* Touchpad */}
        <RoundedBox args={[0.6, 0.01, 0.4]} radius={0.02} position={[0, 0.05, 0.5]}>
          <meshStandardMaterial 
            color={hasLinha ? `${color}` : '#666'} 
            metalness={0.6} 
            roughness={0.4}
            opacity={0.8}
            transparent
          />
        </RoundedBox>

        {/* Componentes internos (visíveis quando selecionados) */}
        <CPUChip visible={temProcessador} color={color} />
        <RAMStick visible={temRam} position={[-0.7, 0.15, 0.3]} color={color} />
        <RAMStick visible={temRam} position={[0.7, 0.15, 0.3]} color={color} />
        <StorageDevice visible={temArmazenamento} type={armazenamento} color={color} />
      </group>

      {/* Tela do Notebook */}
      <group ref={screenRef} position={[0, 0.8, -0.75]} rotation={[-0.3, 0, 0]}>
        {/* Moldura da tela */}
        <RoundedBox args={[2.4, 1.5, 0.05]} radius={0.03}>
          <meshStandardMaterial 
            color={hasLinha ? color : '#888'} 
            metalness={0.8} 
            roughness={0.2}
          />
        </RoundedBox>
        
        {/* Tela (display) */}
        <RoundedBox args={[2.2, 1.35, 0.01]} radius={0.01} position={[0, -0.02, 0.03]}>
          <meshStandardMaterial 
            color="#0a0a15" 
            metalness={0.1} 
            roughness={0.1}
            emissive={hasLinha ? color : '#333'}
            emissiveIntensity={hasLinha ? 0.1 : 0.05}
          />
        </RoundedBox>
        
        {/* Webcam */}
        <mesh position={[0, 0.68, 0.03]}>
          <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
          <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Logo na tela */}
        {hasLinha && (
          <Text
            position={[0, 0, 0.04]}
            fontSize={0.2}
            color={color}
            anchorX="center"
            anchorY="middle"
            font="/fonts/inter-bold.woff"
          >
            {linha.toUpperCase()}
          </Text>
        )}
      </group>

      {/* Luz pontual que segue a cor */}
      <pointLight 
        position={[0, 2, 1]} 
        intensity={hasLinha ? 0.5 : 0.2} 
        color={hasLinha ? color : '#ffffff'} 
      />
    </group>
  )
}

// Container do Canvas 3D
function Notebook3DScene({ linha, processador, ram, armazenamento, valorCompra, dataCompra }: {
  linha: string
  processador: string
  ram: string
  armazenamento: string
  valorCompra: string
  dataCompra: string
}) {
  const temLinha = linha !== ''
  const temProcessador = processador !== ''
  const temRam = ram !== ''
  const temArmazenamento = armazenamento !== ''
  const temValor = valorCompra !== ''
  const temData = dataCompra !== ''
  
  const progresso = [temLinha, temProcessador, temRam, temArmazenamento, temValor, temData].filter(Boolean).length
  const percentual = (progresso / 6) * 100

  const getColor = () => {
    switch(linha) {
      case 'inspiron': return '#0078d4'
      case 'xps': return '#c4a000'
      case 'latitude': return '#107c10'
      case 'precision': return '#5c2d91'
      default: return '#666666'
    }
  }
  
  const cor = getColor()

  return (
    <div style={{
      position: 'sticky',
      top: '24px',
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'hidden'
    }}>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        textAlign: 'center'
      }}>
        Montando seu notebook...
      </h3>
      
      {/* Barra de progresso */}
      <div style={{
        height: '4px',
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        marginBottom: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percentual}%`,
          backgroundColor: cor,
          borderRadius: '2px',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>

      {/* Canvas 3D */}
      <div style={{ 
        width: '100%', 
        height: '280px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <Canvas
          camera={{ position: [3, 2, 3], fov: 45 }}
          shadows
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
            <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#4a6fa5" />
            
            <Notebook3D 
              linha={linha}
              temProcessador={temProcessador}
              temRam={temRam}
              temArmazenamento={temArmazenamento}
              armazenamento={armazenamento}
            />
            
            <OrbitControls 
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
              autoRotate={false}
            />
            
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {/* Info de valor/data */}
      {(temValor || temData) && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          backgroundColor: `${cor}15`,
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '13px',
          color: cor,
          fontWeight: '500'
        }}>
          {temValor && <span>R$ {parseFloat(valorCompra).toLocaleString('pt-BR')}</span>}
          {temValor && temData && <span>•</span>}
          {temData && <span>{new Date(dataCompra).toLocaleDateString('pt-BR')}</span>}
        </div>
      )}

      {/* Legenda dos componentes */}
      <div style={{
        marginTop: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      }}>
        {[
          { label: 'Linha', done: temLinha, icon: Monitor },
          { label: 'Processador', done: temProcessador, icon: Cpu },
          { label: 'Memória RAM', done: temRam, icon: CircleDot },
          { label: 'Armazenamento', done: temArmazenamento, icon: HardDrive },
          { label: 'Valor', done: temValor, icon: DollarSign },
          { label: 'Data', done: temData, icon: Calendar },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                backgroundColor: item.done ? `${cor}15` : '#f5f5f5',
                borderRadius: '6px',
                fontSize: '12px',
                color: item.done ? cor : '#999',
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={14} />
              <span style={{ fontWeight: item.done ? '600' : '400', flex: 1 }}>{item.label}</span>
              {item.done && <CheckCircle size={12} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== PÁGINA PRINCIPAL ====================

export default function CalculadoraPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null)

  const [linha, setLinha] = useState('')
  const [valorCompra, setValorCompra] = useState('')
  const [dataCompra, setDataCompra] = useState('')
  const [processador, setProcessador] = useState('')
  const [ram, setRam] = useState('')
  const [armazenamento, setArmazenamento] = useState('')
  const [intensidadeUso, setIntensidadeUso] = useState('')
  const [custoManutencao, setCustoManutencao] = useState('')

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

  const calcularDepreciacao = (e: React.FormEvent) => {
    e.preventDefault()

    const valor = parseFloat(valorCompra)
    const dataAquisicao = new Date(dataCompra)
    const hoje = new Date()
    const idadeMs = hoje.getTime() - dataAquisicao.getTime()
    const idadeAnos = idadeMs / (1000 * 60 * 60 * 24 * 365)

    const taxasLinha: Record<string, number> = {
      'inspiron': 0.25, 'xps': 0.20, 'latitude': 0.22, 'precision': 0.18,
    }

    const fatoresProcessador: Record<string, number> = {
      'intel-13-14': 1.0, 'intel-12': 1.05, 'intel-11': 1.10, 'intel-10': 1.15,
      'intel-9': 1.25, 'intel-8': 1.35, 'intel-older': 1.50,
      'amd-7000': 1.0, 'amd-6000': 1.05, 'amd-5000': 1.10, 'amd-4000': 1.15,
      'amd-3000': 1.25, 'amd-older': 1.50,
    }

    const fatoresRam: Record<string, number> = { '4': 1.20, '8': 1.05, '16': 1.0, '32+': 0.95 }
    const fatoresArmazenamento: Record<string, number> = { 'hdd': 1.25, 'sata-ssd': 1.05, 'nvme': 1.0 }
    const fatoresUso: Record<string, number> = { 'light': 0.90, 'medium': 1.0, 'heavy': 1.15 }

    const taxaBase = taxasLinha[linha] || 0.25
    const fatorProc = fatoresProcessador[processador] || 1.0
    const fatorRamVal = fatoresRam[ram] || 1.0
    const fatorArm = fatoresArmazenamento[armazenamento] || 1.0
    const fatorUso = fatoresUso[intensidadeUso] || 1.0

    const taxaFinal = taxaBase * fatorProc * fatorRamVal * fatorArm * fatorUso

    let depreciacaoAcumulada = 0
    for (let i = 0; i < Math.floor(idadeAnos); i++) {
      depreciacaoAcumulada += (valor - depreciacaoAcumulada) * taxaFinal
    }
    const fracaoAno = idadeAnos - Math.floor(idadeAnos)
    depreciacaoAcumulada += (valor - depreciacaoAcumulada) * taxaFinal * fracaoAno

    const manutencao = parseFloat(custoManutencao) || 0
    depreciacaoAcumulada += manutencao * 0.5
    depreciacaoAcumulada = Math.min(depreciacaoAcumulada, valor * 0.95)

    const valorAtual = valor - depreciacaoAcumulada
    const percentualDepreciado = (depreciacaoAcumulada / valor) * 100

    let recomendacao: 'manter' | 'avaliar' | 'substituir'
    let mensagemRecomendacao: string

    if (percentualDepreciado < 50 && idadeAnos < 3) {
      recomendacao = 'manter'
      mensagemRecomendacao = 'O equipamento ainda possui bom valor residual. Recomenda-se manter o uso.'
    } else if (percentualDepreciado < 75 && idadeAnos < 5) {
      recomendacao = 'avaliar'
      mensagemRecomendacao = 'Avalie a necessidade de atualização nos próximos 12-18 meses.'
    } else {
      recomendacao = 'substituir'
      mensagemRecomendacao = 'Considere a substituição para evitar custos elevados de manutenção.'
    }

    const fatores = [
      { nome: 'Linha do Produto', impacto: Math.round((taxaBase / 0.25 - 1) * 100) },
      { nome: 'Geração do Processador', impacto: Math.round((fatorProc - 1) * 100) },
      { nome: 'Quantidade de RAM', impacto: Math.round((fatorRamVal - 1) * 100) },
      { nome: 'Tipo de Armazenamento', impacto: Math.round((fatorArm - 1) * 100) },
      { nome: 'Intensidade de Uso', impacto: Math.round((fatorUso - 1) * 100) },
    ]

    setResultado({ valorAtual, depreciacaoTotal: depreciacaoAcumulada, percentualDepreciado, idadeAnos, recomendacao, mensagemRecomendacao, fatores })
  }

  const limparFormulario = () => {
    setLinha(''); setValorCompra(''); setDataCompra(''); setProcessador('')
    setRam(''); setArmazenamento(''); setIntensidadeUso(''); setCustoManutencao('')
    setResultado(null)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        Carregando...
      </div>
    )
  }

  const selectStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s'
  }

  const inputStyle = {
    ...selectStyle,
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Header userEmail={user?.email || ''} onLogout={handleLogout} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activePage="calculadora" onNavigate={(page) => {
            if (page === 'home') router.push('/portal')
              else router.push(`/${page}`)
          }} />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          <button
            onClick={() => router.push('/portal')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#0078d4', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: 0 }}
          >
            <ArrowLeft size={16} /> Voltar ao Portal
          </button>

          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: '#1a1a1a' }}>
              Calculadora de Depreciação
            </h1>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Monte seu notebook em 3D e descubra o valor atual
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: resultado ? '1fr 1fr' : '1fr 380px',
            gap: '24px',
            maxWidth: '1200px',
            alignItems: 'start'
          }}>
            {/* Formulário */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>Dados do Equipamento</h2>

              <form onSubmit={calcularDepreciacao}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Linha do Produto *</label>
                  <select value={linha} onChange={(e) => setLinha(e.target.value)} required style={{ ...selectStyle, color: '#333' }}>
                    <option  value="">Selecione a linha</option>
                    <option value="inspiron">Inspiron (Consumidor)</option>
                    <option value="xps">XPS (Premium)</option>
                    <option value="latitude">Latitude (Empresarial)</option>
                    <option value="precision">Precision (Workstation)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Processador *</label>
                  <select value={processador} onChange={(e) => setProcessador(e.target.value)} required style={{ ...selectStyle, color: '#333' }}>
                    <option value="">Selecione o processador</option>
                    <optgroup label="Intel">
                      <option value="intel-13-14">Intel Core 13ª/14ª Geração (atual)</option>
                      <option value="intel-12">Intel Core 12ª Geração</option>
                      <option value="intel-11">Intel Core 11ª Geração</option>
                      <option value="intel-10">Intel Core 10ª Geração</option>
                      <option value="intel-9">Intel Core 9ª Geração</option>
                      <option value="intel-8">Intel Core 8ª Geração</option>
                      <option value="intel-older">Intel Core 7ª ou anterior</option>
                    </optgroup>
                    <optgroup label="AMD">
                      <option value="amd-7000">AMD Ryzen 7000 Series</option>
                      <option value="amd-6000">AMD Ryzen 6000 Series</option>
                      <option value="amd-5000">AMD Ryzen 5000 Series</option>
                      <option value="amd-4000">AMD Ryzen 4000 Series</option>
                      <option value="amd-3000">AMD Ryzen 3000 Series</option>
                      <option value="amd-older">AMD Ryzen 2000 ou anterior</option>
                    </optgroup>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500',color: '#333' }}>Memória RAM *</label>
                  <select value={ram} onChange={(e) => setRam(e.target.value)} required style={{ ...selectStyle, color: '#333' }}>
                    <option value="">Selecione a RAM</option>
                    <option value="4">4GB ou menos</option>
                    <option value="8">8GB</option>
                    <option value="16">16GB</option>
                    <option value="32+">32GB ou mais</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Armazenamento *</label>
                  <select value={armazenamento} onChange={(e) => setArmazenamento(e.target.value)} required style={{ ...selectStyle, color: '#333' }}>
                    <option value="">Selecione o tipo</option>
                    <option value="hdd">HDD (Disco Rígido)</option>
                    <option value="sata-ssd">SSD SATA</option>
                    <option value="nvme">SSD NVMe</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Valor de Compra (R$) *</label>
                  <input type="number" value={valorCompra} onChange={(e) => setValorCompra(e.target.value)} required min="0" step="0.01" placeholder="Ex: 5000.00" style={{...inputStyle, color: '#333' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Data de Aquisição *</label>
                  <input type="date" value={dataCompra} onChange={(e) => setDataCompra(e.target.value)} required style={{ ...selectStyle, color: '#333' }} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Intensidade de Uso *</label>
                  <select value={intensidadeUso} onChange={(e) => setIntensidadeUso(e.target.value)} required style={{ ...selectStyle, color: '#333' }}>
                    <option value="">Selecione</option>
                    <option value="light">Leve (menos de 4h/dia)</option>
                    <option value="medium">Médio (4-8h/dia)</option>
                    <option value="heavy">Intenso (mais de 8h/dia)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#333' }}>Custos de Manutenção (R$)</label>
                  <input type="number" value={custoManutencao} onChange={(e) => setCustoManutencao(e.target.value)} min="0" step="0.01" placeholder="Último ano" style={inputStyle} />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '14px', fontWeight: '600', backgroundColor: '#0078d4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    <Calculator size={18} /> Calcular
                  </button>
                  <button type="button" onClick={limparFormulario} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', fontSize: '14px', fontWeight: '500', backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    <RotateCcw size={16} /> Limpar
                  </button>
                </div>
              </form>
            </div>

            {/* 3D ou Resultado */}
            {!resultado ? (
              <Notebook3DScene
                linha={linha}
                processador={processador}
                ram={ram}
                armazenamento={armazenamento}
                valorCompra={valorCompra}
                dataCompra={dataCompra}
              />
            ) : (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600' }}>Resultado</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Valor Original</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>
                      R$ {parseFloat(valorCompra).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div style={{ padding: '20px', backgroundColor: '#e6f4ea', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Valor Atual</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#107c10' }}>
                      R$ {resultado.valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Depreciação</span>
                    <span style={{ fontWeight: '600' }}>{resultado.percentualDepreciado.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: '12px', backgroundColor: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${resultado.percentualDepreciado}%`,
                      backgroundColor: resultado.percentualDepreciado > 75 ? '#d13438' : resultado.percentualDepreciado > 50 ? '#ffaa44' : '#107c10',
                      borderRadius: '6px'
                    }} />
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: resultado.recomendacao === 'manter' ? '#e6f4ea' : resultado.recomendacao === 'avaliar' ? '#fff4ce' : '#fde7e9',
                  border: `2px solid ${resultado.recomendacao === 'manter' ? '#107c10' : resultado.recomendacao === 'avaliar' ? '#ffaa44' : '#d13438'}`,
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    {resultado.recomendacao === 'manter' && <CheckCircle size={24} color="#107c10" />}
                    {resultado.recomendacao === 'avaliar' && <AlertTriangle size={24} color="#ffaa44" />}
                    {resultado.recomendacao === 'substituir' && <XCircle size={24} color="#d13438" />}
                    <span style={{ fontWeight: '700', fontSize: '16px', color: resultado.recomendacao === 'manter' ? '#107c10' : resultado.recomendacao === 'avaliar' ? '#996600' : '#d13438' }}>
                      {resultado.recomendacao === 'manter' && 'Manter equipamento'}
                      {resultado.recomendacao === 'avaliar' && 'Avaliar substituição'}
                      {resultado.recomendacao === 'substituir' && 'Substituir equipamento'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{resultado.mensagemRecomendacao}</p>
                </div>

                <button onClick={() => setResultado(null)} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#0078d4', border: '2px solid #0078d4', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  ← Voltar para visualização 3D
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}