// src/Painel.js
import '../Painel.css';
import { useNavigate } from 'react-router-dom';
import Logo01 from '../images/logo01.png';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useEffect, useState } from 'react';
import { FiHome, FiFileText, FiBarChart2, FiUsers, FiLogOut } from 'react-icons/fi';


function Painel() {
    const navigate = useNavigate();
    const [notificacoes, setNotificacoes] = useState([]);
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const funcao = usuario?.funcao?.toLowerCase();
    const menuRestrito = funcao === 'contábil' || funcao === 'jurídico' || funcao === 'diretorias';

    const handleSair = () => navigate('/');

    useEffect(() => {
        const atendimentosRef = ref(db, 'atendimentos');

        const unsubscribe = onValue(atendimentosRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                setNotificacoes([]);
                return;
            }

            const listaNotificacoes = Object.values(data)
                .filter((item) => item.dataHora)
                .map((item) => {
                    const nome = item.solicitante || 'Usuário';
                    const dataValida = new Date(item.dataHora);
                    if (isNaN(dataValida)) return null;

                    const dia = dataValida.toLocaleDateString('pt-BR');
                    const hora = dataValida.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                    });

                    const status = item.situacao || 'Sem situação';

                    return `Atendimento criado para ${nome} em ${dia} às ${hora} – Situação: ${status}`;
                })
                .filter((msg) => msg !== null);

            setNotificacoes(listaNotificacoes);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="painel-container">
            <aside className="sidebar">
                <img src={Logo01} alt="Logo AEA" className="logo-sidebar" />
                <div className="sidebar-title">SIATE | AEA-DF</div>
                <div className="menu">
                    <button className="menu-item" onClick={() => navigate('/Painel')}>
                        <FiHome style={{ marginRight: '8px' }} /> Início
                    </button>
                    <button className="menu-item" onClick={() => navigate('/Atendimentos')}>
                        <FiFileText style={{ marginRight: '8px' }} /> Atendimentos
                    </button>
                    <button className="menu-item" onClick={() => navigate('/ResumoGeral')}>
                        <FiBarChart2 style={{ marginRight: '8px' }} /> Resumo Geral e Consultas
                    </button>
                    {!menuRestrito && (
                        <button className="menu-item" onClick={() => navigate('/GerenciamentoUsuarios')}>
                            <FiUsers style={{ marginRight: '8px' }} /> Gerenciar Usuários
                        </button>
                    )}
                    <button className="menu-item sair" onClick={handleSair}>
                        <FiLogOut style={{ marginRight: '8px' }} /> Sair
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <h2>Bem-vindo(a), Administrador</h2>
                </header>

                <section className="notificacoes">
                    <h3>📢 <span className="destaque">Notificações</span></h3>
                    {notificacoes.map((msg, index) => {
                        const partes = msg.split(' – Situação: ');
                        const info = partes[0];
                        const situacao = partes[1] || 'Indefinido';
                        return (
                            <div key={index} className={`card-notificacao ${situacao.toLowerCase()}`}>
                                <div className="info">{info}</div>
                                <div className="status">💬 Situação: <strong>{situacao}</strong></div>
                            </div>
                        );
                    })}
                </section>
            </main>
        </div>
    );
}

export default Painel;
