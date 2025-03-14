import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import brasaoLogo from '../assets/images/Brasao.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API request with a delay
    setTimeout(() => {
      if(username === 'admin' && password === 'admin') {
        navigate('/dashboard')
      } else {
        setError('Credenciais inválidas. Use admin/admin')
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Login Form */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 w-full md:w-1/2">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex flex-col items-center">
            <img 
              src={brasaoLogo} 
              alt="Brasão de Navegantes" 
              className="h-24 w-auto mb-4 drop-shadow-md" 
            />
            <h1 className="text-center text-3xl font-bold text-gray-900 mb-1">Coracao</h1>
            <h2 className="text-center text-xl font-semibold text-gray-900">Login</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sistema de Gerenciamento de Transporte
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nome de usuário
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Digite seu nome de usuário"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </button>
              </div>
            </form>
            
            <div className="mt-6 bg-gray-50 p-4 rounded border border-gray-200 text-sm">
              <p className="font-medium mb-2">Para demonstração, use:</p>
              <p><span className="text-gray-500">Usuário:</span> <strong>admin</strong></p>
              <p><span className="text-gray-500">Senha:</span> <strong>admin</strong></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Banner Image (only visible on md screens and up) */}
      <div className="hidden md:block md:w-1/2 bg-blue-600">
        <div className="h-full flex items-center justify-center p-8 text-white">
          <div className="max-w-lg">
            <div className="flex items-center mb-6">
              <img src={brasaoLogo} alt="Brasão de Navegantes" className="h-16 w-auto mr-4" />
              <h2 className="text-3xl font-bold">Sistema de Gerenciamento de Transporte Escolar</h2>
            </div>
            <p className="text-lg text-blue-100 mb-6">
              Uma plataforma completa para gerenciar ônibus, rotas e alunos com eficiência e segurança.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Gerenciamento de frota escolar</span>
              </div>
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Controle de rotas e viagens</span>
              </div>
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cadastro e acompanhamento de alunos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}