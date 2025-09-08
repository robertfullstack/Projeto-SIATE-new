import '../App.css';
import { useState } from 'react';
import { db } from '../firebaseConfig';
import { ref, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import Logo01 from '../images/logo01.png';

function Home() {
    const [cpf, setCpf] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        const cpfFormatado = cpf.trim();

        try {
            const usuariosRef = ref(db, 'usuarios');
            const snapshot = await get(usuariosRef);
            const data = snapshot.val();

            if (data) {
                const lista = Object.entries(data).map(([id, item]) => ({ id, ...item }));
                const usuario = lista.find((u) => u.cpf === cpfFormatado);

                if (usuario) {
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

                    const funcao = usuario.funcao?.toLowerCase().trim();

                    // Rotas específicas para agendas/painéis
                    // if (funcao === 'fkjdsjklsd') {
                    //     navigate('/agenda-eventos-presidencia');
                    // } 
                    if (funcao === 'presidencia2') {
                        navigate('/agenda-eventos-presidencia');
                    }
                    else if (funcao === 'diretoria de administração') {
                        navigate('/agenda-eventos-administrativa');
                    } else if (funcao === 'diretoria de finanças') {
                        navigate('/agenda-eventos-financas');
                    } else if (funcao === 'diretoria de esportes') {
                        navigate('/agenda-eventos-esportes');
                    } else if (funcao === 'diretoria de saúde e benefícios') {
                        navigate('/agenda-eventos-saude-beneficios');
                    } else if (funcao === 'diretoria de eventos sociais') {
                        navigate('/agenda-eventos-sociais');
                    } else if (funcao === 'diretoria de cultura') {
                        navigate('/agenda-eventos-cultura');
                    } else if (funcao === 'conselho deliberativo') {
                        navigate('/agenda-eventos-conselho-deliberativo');
                    } else if (funcao === 'conselho fiscal') {
                        navigate('/agenda-eventos-conselho-fiscal');
                    }
                    else if (funcao === 'presidencia2') {
                        navigate('/agenda-eventos-presidencia');
                    }

                    else if (funcao === 'diretoria executiva') {
                        navigate('/agenda-eventos-executiva');
                    } else if (funcao === 'contábil') {
                        navigate('/painelcontabil');
                    } else if (funcao === 'jurídico') {
                        navigate('/paineljuridico');
                    } else if (funcao === 'diretorias') {
                        navigate('/painelDiretorias');
                    } else if (funcao === 'clínica social') {
                        navigate('/painelclinicasocial');
                    } else if (funcao === 'admin' || cpfFormatado === '000.000.000-00') {
                        navigate('/admin');
                    } else {
                        navigate('/atendimentos'); // fallback padrão
                    }
                } else {
                    setErro('CPF não encontrado.');
                }
            } else {
                setErro('Nenhum usuário cadastrado.');
            }
        } catch (error) {
            console.error('Erro ao verificar CPF:', error);
            setErro('Erro ao acessar banco de dados.');
        }
    };

    return (
        <div className="container">
            <div className="card">
                <img src={Logo01} alt="Logo AEA" className="logo" />
                <h2>Siate - Sistema de Atendimento</h2>
                <p>Digite seu CPF para continuar</p>
                <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => {
                        let valor = e.target.value.replace(/\D/g, '');
                        if (valor.length > 11) valor = valor.slice(0, 11);
                        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
                        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
                        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                        setCpf(valor);
                    }}
                    className="input-cpf"
                />
                <small>Seu CPF é usado apenas para identificação segura</small>
                {erro && <p style={{ color: 'red' }}>{erro}</p>}
                <button className="btn-acessar" onClick={handleLogin}>
                    Acessar
                </button>
            </div>
        </div>
    );
}

export default Home;
