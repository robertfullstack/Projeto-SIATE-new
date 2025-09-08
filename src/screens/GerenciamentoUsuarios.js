// src/GerenciamentoUsuarios.js
import './Atendimentos.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Logo01 from '../images/logo01.png';
import { db } from '../firebaseConfig';
import { FiHome, FiFileText, FiBarChart2, FiUsers, FiLogOut } from 'react-icons/fi';

import { ref, push, onValue, remove } from 'firebase/database';

function GerenciamentoUsuarios() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [funcao, setFuncao] = useState('administrativo');

    useEffect(() => {
        const usuariosRef = ref(db, 'usuarios');
        onValue(usuariosRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const lista = Object.entries(data).map(([id, item]) => ({ id, ...item }));
                setUsuarios(lista);
            } else {
                setUsuarios([]);
            }
        });
    }, []);

    const formatarCPF = (valor) => {
        return valor
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const handleCpfChange = (e) => {
        setCpf(formatarCPF(e.target.value));
    };

    const handleCadastrar = async () => {
        if (!nome || !cpf || !funcao) {
            alert('Preencha todos os campos.');
            return;
        }

        const cpfExistente = usuarios.find((u) => u.cpf === cpf);
        if (cpfExistente) {
            alert('CPF já cadastrado.');
            return;
        }

        try {
            await push(ref(db, 'usuarios'), { nome, cpf, funcao });
            alert('Usuário cadastrado com sucesso!');
            setNome('');
            setCpf('');
            setFuncao('administrativo');
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Erro ao cadastrar usuário.');
        }
    };

    const handleExcluirUsuario = async (id) => {
        const confirm = window.confirm('Tem certeza que deseja excluir este usuário?');
        if (!confirm) return;

        try {
            await remove(ref(db, `usuarios/${id}`));
            alert('Usuário excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário.');
        }
    };

    const handleSair = () => {
        navigate('/');
    };

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
                    <button className="menu-item" onClick={() => navigate('/GerenciamentoUsuarios')}>
                        <FiUsers style={{ marginRight: '8px' }} /> Gerenciar Usuários
                    </button>
                    <button className="menu-item sair" onClick={handleSair}>
                        <FiLogOut style={{ marginRight: '8px' }} /> Sair
                    </button>
                </div>
            </aside>


            <main className="conteudo-principal">
                <h2>Bem-vindo(a), Administrador</h2>
                <h3 className="titulo-secao">Gerenciamento de Usuários</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Função</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>Nenhum usuário cadastrado</td>
                            </tr>
                        ) : (
                            usuarios.map((u, index) => (
                                <tr key={u.id || index}>
                                    <td>{u.nome}</td>
                                    <td>{u.cpf}</td>
                                    <td>{u.funcao}</td>
                                    <td>
                                        {u.cpf !== '000.000.000-00' && (
                                            <button onClick={() => handleExcluirUsuario(u.id)} style={{ color: 'red' }}>🗑 Excluir</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <h3 className="titulo-secao">Cadastrar Novo Usuário</h3>
                <div className="formulario-atendimento">
                    <div className="linha">
                        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
                        <input type="text" placeholder="CPF" value={cpf} onChange={handleCpfChange} maxLength={14} />
                        <select value={funcao} onChange={(e) => setFuncao(e.target.value)}>
                            <option value="administrativo">administrativo</option>
                            <option value="contábil">contábil</option>
                            <option value="diretorias">diretorias</option>
                            <option value="jurídico">jurídico</option>
                            <option value="Clínica Social">Clínica Social</option>
                        </select>
                    </div>
                    <div className="alinha-direita">
                        <button className="btn-salvar" onClick={handleCadastrar}>Cadastrar</button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default GerenciamentoUsuarios;
