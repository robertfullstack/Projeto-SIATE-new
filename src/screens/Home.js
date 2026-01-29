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

        // ✅ CPF especial para acesso apenas à Agenda de Eventos (sem cadastro)
        if (cpfFormatado === "000.000.000-01") {
            localStorage.setItem("cpfLogado", cpfFormatado);
            navigate("/agenda-eventos");
            return;
        }

        try {
            const usuariosRef = ref(db, 'usuarios');
            const snapshot = await get(usuariosRef);
            const data = snapshot.val();

            if (data) {
                const lista = Object.entries(data).map(([id, item]) => ({ id, ...item }));
                const usuario = lista.find((u) => u.cpf === cpfFormatado);

                if (usuario) {
                    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
                    localStorage.setItem("cpfLogado", cpfFormatado);

                    const funcao = usuario.funcao?.trim(); // mantém exatamente como foi cadastrado no Firebase

                    // Mapeamento: função → rota
                    const rotas = {
                        "Presidência": "/agenda-eventos-presidencia",
                        "Diretoria de Administração": "/agenda-eventos-administrativa",
                        "Diretoria de Finanças": "/agenda-eventos-financas",
                        "Diretoria de Esportes": "/agenda-eventos-esportes",
                        "Diretoria de Saúde e Benefícios": "/agenda-eventos-saude-beneficios",
                        "Diretoria de Eventos Sociais": "/agenda-eventos-sociais",
                        "Diretoria de Cultura": "/agenda-eventos-cultura",
                        "Conselho Deliberativo": "/agenda-eventos-conselho-deliberativo",
                        "Conselho Fiscal": "/agenda-eventos-conselho-fiscal",
                        "Diretoria Executiva": "/agenda-eventos-diretoria-executiva",
                        "Contábil": "/painelcontabil",
                        "Jurídico": "/paineljuridico",
                        "Diretorias": "/paineldiretorias",
                        "Clínica Social": "/painelclinicasocial",
                        "Admin": "/admin"
                    };

                    // pega a rota correspondente
                    const rotaDestino = rotas[funcao] || (cpfFormatado === "000.000.000-00" ? "/admin" : "/atendimentos");

                    // redireciona
                    navigate(rotaDestino);

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
