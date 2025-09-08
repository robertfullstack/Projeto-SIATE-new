// src/Atendimentos.js
import './Atendimentos.css';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo01 from '../images/logo01.png';
import { FiHome, FiFileText, FiBarChart2, FiUsers, FiLogOut } from 'react-icons/fi';


import { db } from '../firebaseConfig';
import { ref, push, onValue, update, remove } from 'firebase/database';


import { useEffect } from 'react';




function Atendimentos() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const funcao = usuario?.funcao?.toLowerCase(); // 👈 ISSO precisa estar aqui no topo

    // ... outros estados

    useEffect(() => {
        const atendimentosRef = ref(db, 'atendimentos');
        onValue(atendimentosRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                let lista = Object.entries(data).map(([id, item]) => ({
                    id,
                    ...item
                }));

                if (['contábil', 'jurídico', 'diretorias', 'clínica social'].includes(funcao)) {
                    lista = lista.filter(item => item.area?.toLowerCase() === funcao);
                }

                setAtendimentos(lista.reverse());
            } else {
                setAtendimentos([]);
            }
        });
    }, [funcao]);

    const menuRestrito = ['contábil', 'jurídico', 'diretorias', 'clínica social'].includes(funcao);


    const handleExcluir = async (id) => {
        const confirm = window.confirm('Tem certeza que deseja excluir este atendimento?');
        if (!confirm) return;

        try {
            await remove(ref(db, `atendimentos/${id}`));
            alert('Atendimento excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir atendimento.');
        }
    };

    function formatarDataHora(dataHora) {
        if (!dataHora) return '';

        const dataISO = dataHora.replace(' ', 'T'); // "2025-07-04 10:30" → "2025-07-04T10:30"
        const data = new Date(dataISO);

        if (isNaN(data.getTime())) return dataHora; // se não for uma data válida, retorna o original

        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const [atendimentos, setAtendimentos] = useState([]);
    const [filtroDepartamento, setFiltroDepartamento] = useState('Todos');
    const [filtroSituacao, setFiltroSituacao] = useState('Todas');
    const [filtroDe, setFiltroDe] = useState('');
    const [filtroAte, setFiltroAte] = useState('');
    const [filtroBusca, setFiltroBusca] = useState('');
    const [atendimentoSelecionado, setAtendimentoSelecionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    const navigate = useNavigate();



    const ModalDetalhes = ({ atendimento, onClose }) => {
        const [novaSituacao, setNovaSituacao] = useState(atendimento.situacao || 'Agendado');
        const [novaObservacao, setNovaObservacao] = useState(atendimento.observacoes || '');

        const handleSalvarSituacao = async () => {
            try {
                const atendimentoRef = ref(db, `atendimentos/${atendimento.id}`);
                await update(atendimentoRef, {
                    situacao: novaSituacao,
                    observacoes: novaObservacao
                });
                alert('Alterações salvas com sucesso!');
                onClose(); // fecha modal após salvar
            } catch (error) {
                console.error('Erro ao atualizar situação ou observações:', error);
                alert('Erro ao salvar alterações.');
            }
        };

        return (
            <div className="modal-overlay">
                <div className="modal">
                    <h3>ℹ️ <strong>Detalhes do Atendimento</strong></h3>
                    <p><strong>Departamento:</strong> {atendimento.area}</p>
                    <p><strong>Diretoria:</strong> -</p>
                    <p><strong>Solicitante:</strong> {atendimento.solicitante}</p>
                    <p><strong>Atendente:</strong> Administrador</p>
                    <p><strong>Data/Hora:</strong> {formatarDataHora(atendimento.dataHora)}</p>
                    <p><strong>Assunto:</strong> {atendimento.assunto}</p>
                    <p><strong>Canal:</strong> {atendimento.canal}</p>

                    <p><strong>Situação:</strong>
                        <select
                            value={novaSituacao}
                            onChange={(e) => setNovaSituacao(e.target.value)}
                            style={{ marginLeft: '8px' }}
                        >
                            <option value="Agendado">Agendado</option>
                            <option value="Atendimento Realizado">Atendimento Realizado</option>
                            <option value="Cancelado">Cancelado</option>
                        </select>
                    </p>

                    <div className="campo">
                        <label><strong>Observações:</strong></label>
                        <textarea
                            value={novaObservacao}
                            onChange={(e) => setNovaObservacao(e.target.value)}
                            placeholder="Digite observações sobre o atendimento..."
                            rows={4}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div className="modal-botoes">
                        <button onClick={handleSalvarSituacao}>💾 Salvar Alterações</button>
                        <button onClick={() => window.print()}>🖶 Imprimir</button>
                        <button onClick={onClose}>Fechar</button>
                    </div>
                </div>
            </div>
        );
    };


    const handleEditar = (atendimento) => {
        setSolicitante(atendimento.solicitante);
        setDataHora(atendimento.dataHora);
        setHoraFim(atendimento.horaFim);
        setCanal(atendimento.canal);
        setArea(atendimento.area);
        setAssunto(atendimento.assunto);
        setObservacoes(atendimento.observacoes || '');
        setModoEdicao(true);
        setIdEdicao(atendimento.id);
    };
    const handleVisualizar = (atendimento) => {
        setAtendimentoSelecionado(atendimento);
        setMostrarModal(true);
    };
    const [usuarios, setUsuarios] = useState([]);
    useEffect(() => {
        const usuariosRef = ref(db, 'usuarios');
        onValue(usuariosRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const lista = Object.entries(data).map(([id, item]) => ({ id, ...item }));
                setUsuarios(lista);
            }
        });
    }, []);
    const obterNomeResponsavelPorArea = (area) => {
        const usuario = usuarios.find(u => u.funcao?.toLowerCase() === area?.toLowerCase());
        return usuario?.nome || '---';
    };


    const filtrarAtendimentos = atendimentos.filter(at => {
        const atendeDepartamento = filtroDepartamento === 'Todos' || at.area === filtroDepartamento;
        const atendeSituacao = filtroSituacao === 'Todas' || at.situacao === filtroSituacao;
        const atendeBusca = !filtroBusca || (at.solicitante?.toLowerCase().includes(filtroBusca.toLowerCase()));

        const dataAt = new Date(at.dataHora);
        const de = filtroDe ? new Date(filtroDe) : null;
        const ate = filtroAte ? new Date(filtroAte) : null;

        const atendePeriodo = (!de || dataAt >= de) && (!ate || dataAt <= ate);

        return atendeDepartamento && atendeSituacao && atendeBusca && atendePeriodo;
    });

    const handleSalvar = async () => {
        if (!solicitante || !dataHora || !canal || !area) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const atendimentoAtualizado = {
            solicitante,
            dataHora,
            horaFim,
            canal,
            area,
            assunto,
            observacoes,
            situacao: 'Agendado',
            atendente: usuario?.nome || 'Desconhecido' // ⬅️ aqui salvamos o atendente
        };


        try {
            if (modoEdicao && idEdicao) {
                const atendimentoRef = ref(db, `atendimentos/${idEdicao}`);
                await update(atendimentoRef, atendimentoAtualizado);
                alert('Atendimento atualizado com sucesso!');
            } else {
                await push(ref(db, 'atendimentos'), atendimentoAtualizado);
                alert('Atendimento salvo com sucesso!');
            }

            // Reset
            setSolicitante('');
            setDataHora('');
            setHoraFim('');
            setCanal('');
            setArea('');
            setAssunto('IR - Declaração');
            setObservacoes('');
            setModoEdicao(false);
            setIdEdicao(null);
        } catch (error) {
            console.error('Erro ao salvar atendimento:', error);
            alert('Erro ao salvar atendimento.');
        }
    };
    const [modoEdicao, setModoEdicao] = useState(false);
    const [idEdicao, setIdEdicao] = useState(null);

    // Estados dos campos
    const [solicitante, setSolicitante] = useState('');
    const [dataHora, setDataHora] = useState('');
    const [horaFim, setHoraFim] = useState('');
    const [canal, setCanal] = useState('');
    const [area, setArea] = useState('');
    const [assunto, setAssunto] = useState('IR - Declaração');
    const [observacoes, setObservacoes] = useState('');



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

            <main className="conteudo-principal">
                <h2>Bem-vindo(a), {usuario?.nome?.split(' ')[0] || 'Usuário'}</h2>


                {!menuRestrito && (
                    <>
                        <h3 className="titulo-secao">Gerar Atendimento</h3>

                        <div className="formulario-atendimento">
                            <div className="linha">
                                <div className="campo">
                                    <label>Solicitante</label>
                                    <input
                                        type="text"
                                        placeholder="Nome do associado"
                                        value={solicitante}
                                        onChange={(e) => setSolicitante(e.target.value)}
                                    />
                                </div>
                                <div className="campo">
                                    <label>Data e Hora</label>
                                    <input
                                        type="datetime-local"
                                        value={dataHora}
                                        onChange={(e) => setDataHora(e.target.value)}
                                    />
                                </div>
                                <div className="campo">
                                    <label>Horário Fim</label>
                                    <input
                                        type="time"
                                        placeholder="Horário Fim"
                                        value={horaFim}
                                        onChange={(e) => setHoraFim(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="linha">
                                <div className="campo">
                                    <label>Canal de Atendimento</label>
                                    <select value={canal} onChange={(e) => setCanal(e.target.value)}>
                                        <option value="">Selecione</option>
                                        <option value="Telefone">Telefone</option>
                                        <option value="E-mail">E-mail</option>
                                        <option value="Presencial">Presencial</option>
                                    </select>
                                </div>
                                <div className="campo">
                                    <label>Área de Atendimento</label>
                                    <select value={area} onChange={(e) => setArea(e.target.value)}>
                                        <option value="">Selecione</option>
                                        <option value="Administrativo">Administrativo</option>
                                        <option value="Contábil">Contábil</option>
                                        <option value="Jurídico">Jurídico</option>
                                        <option value="Diretorias">Diretorias</option>
                                        <option value="Clínica Social">Clínica Social</option>
                                    </select>
                                </div>
                            </div>

                            <div className="linha">
                                <div className="campo">
                                    <label>Assunto</label>
                                    <select value={assunto} onChange={(e) => setAssunto(e.target.value)}>
                                        <option value="IR - Declaração">IR - Declaração</option>
                                        <option value="IR - Proc. Administrativo">IR - Proc. Administrativo</option>
                                        <option value="IR - Proc. Judicial">IR - Proc. Judicial</option>
                                        <option value="Funcef">Funcef</option>
                                        <option value="Fenacef">Fenacef</option>
                                        <option value="Apcef">Apcef</option>
                                        <option value="Equacionamento">Equacionamento</option>
                                        <option value="Isenção IR – Lei doenças graves">Isenção IR – Lei doenças graves</option>
                                        <option value="Contra cheque">Contra cheque</option>
                                        <option value="INSS">INSS</option>
                                        <option value="Nutrição">Nutrição</option>
                                        <option value="Urologia">Urologia</option>
                                        <option value="Psicologia">Psicologia</option>
                                        <option value="Assistência Social">Assistência Social</option>
                                        <option value="Geriatria">Geriatria</option>
                                        <option value="Psiquiatria">Psiquiatria</option>
                                        <option value="Cardio">Cardio</option>
                                        <option value="Ginecologia">Ginecologia</option>
                                        <option value="Clínica Médica">Clínica Médica</option>
                                        <option value="Saude Caixa">Saude Caixa</option>
                                        <option value="Auxílio Alimentação">Auxílio Alimentação</option>
                                        <option value="Prova de Vida">Prova de Vida</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                            </div>


                            <div className="campo">
                                <label>Observações</label>
                                <textarea
                                    placeholder="Detalhes do atendimento..."
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="alinha-direita">
                                <button className="btn-salvar" onClick={handleSalvar}>
                                    Salvar Atendimento
                                </button>
                            </div>
                        </div>

                    </>
                )}
                <div className="filtros">
                    {!menuRestrito && (
                        <div className="campo">
                            <label>Área de Atendimento:</label>
                            <select value={filtroDepartamento} onChange={(e) => setFiltroDepartamento(e.target.value)}>
                                <option>Todos</option>
                                <option>Administrativo</option>
                                <option>Contábil</option>
                                <option>Diretorias</option>
                                <option>Jurídico</option>
                                <option>Clínica Social</option>
                            </select>
                        </div>
                    )}

                    <div className="campo">
                        <label>Situação:</label>
                        <select value={filtroSituacao} onChange={(e) => setFiltroSituacao(e.target.value)}>
                            <option>Todas</option>
                            <option>Agendado</option>
                            <option>Atendimento Realizado</option>
                            <option>Cancelado</option>
                        </select>
                    </div>

                    <div className="campo">
                        <label>De:</label>
                        <input type="date" value={filtroDe} onChange={(e) => setFiltroDe(e.target.value)} />
                    </div>

                    <div className="campo">
                        <label>Até:</label>
                        <input type="date" value={filtroAte} onChange={(e) => setFiltroAte(e.target.value)} />
                    </div>

                    <div className="campo" style={{ marginTop: '1.5rem' }}>
                        <input type="text" placeholder="🔍 Buscar por nome" value={filtroBusca} onChange={(e) => setFiltroBusca(e.target.value)} />
                    </div>
                </div>





                <table>
                    <thead>
                        <tr>
                            <th>Área de Atendimento</th>
                            <th>Solicitante</th>
                            <th>Atendente</th>
                            <th>Data/Hora</th>
                            <th>Horário Fim</th>
                            <th>Assunto</th>
                            <th>Situação</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrarAtendimentos.length === 0 ? (
                            <tr>
                                <td colSpan="9" style={{ textAlign: 'center' }}>Nenhum atendimento listado</td>
                            </tr>
                        ) : (
                            filtrarAtendimentos.map((at, index) => (
                                <tr key={at.id || index}>
                                    <td>{at.area || '-'}</td>
                                    <td>{at.solicitante || '-'}</td>
                                    <td>{obterNomeResponsavelPorArea(at.area)}</td>



                                    <td>{formatarDataHora(at.dataHora) || '-'}</td>

                                    <td>{at.horaFim || '-'}</td>
                                    <td>{at.assunto || '-'}</td>
                                    <td>{at.situacao || 'Agendado'}</td>
                                    <td>
                                        <button onClick={() => handleVisualizar(at)} title="Visualizar">👁</button>
                                        <button onClick={() => handleEditar(at)} title="Editar">✏️</button>
                                        <button onClick={() => handleExcluir(at.id)} title="Excluir" style={{ marginLeft: '5px', color: 'red' }}>🗑</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {mostrarModal && atendimentoSelecionado && (
                    <ModalDetalhes
                        atendimento={atendimentoSelecionado}
                        onClose={() => setMostrarModal(false)}
                    />
                )}
            </main>
        </div>
    );
}

export default Atendimentos;
