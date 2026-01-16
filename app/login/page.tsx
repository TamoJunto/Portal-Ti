'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const supabase = createClient()

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/portal`,
            },
        })

        if (error) {
            setMessage("Error ao enviar emial: " + error.message)
        } else {
            setMessage("link enviado! verifique seu email")
        }

        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "40px",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxWidth: "400px",
        }}>
            <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                color: '#333',
            }}>
                Portal TI
            </h1>

            <p style={{
                margin: '0 0 24px 0',
                color: '#666',
                fontSize: '14px',
            }}>
                Aliança Empreendedora
            </p>

            <form onSubmit={handleLogin}>
                <label  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    color: '#333',
                }}>
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='seu@email.com'
                    required
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        boxSizing: 'border-box',
                        color: '#333',
                        
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '16px',
                        backgroundColor: '#0078d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Enviando...' : 'Entrar com email'}
                </button>
            </form>
            {message && (
                <p style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: message.includes('enviado!') ? '#0078d4' : '#f00',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: message.includes('enviado!') ? 'white' : '#fff',
                    textAlign: 'center',
                }}>
                    {message}
                </p>
            )}
            </div>
        </div>
    )
}