import './AgendaEventos.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Logo01 from '../images/logo01.png';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';




import { db } from '../firebaseConfig';
import { ref, push, onValue, remove, update, get } from 'firebase/database';

function AgendaEventos({ tipo }) {
    const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14'];
    const navigate = useNavigate();
    const cpfLogado = localStorage.getItem("cpfLogado");
    const isCpfEspecial = cpfLogado === "000.000.000-01";


    const [eventos, setEventos] = useState([]);
    const [novoEvento, setNovoEvento] = useState({
        diretoria: tipo || '',
        tipo: '',
        data: '',
        hora: '',
        horaFim: '',
        local: '',
        necessidades: '',
        obs: '',
        situacao: "A Realizar",   // 👈 já inicia com "A Realizar"
        assunto: ''
    });
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editandoId, setEditandoId] = useState(null);

    useEffect(() => {
        const eventosRef = ref(db, 'eventos');
        onValue(eventosRef, (snapshot) => {
            const dados = snapshot.val();
            if (dados) {
                const lista = Object.entries(dados).map(([id, evento]) => ({ id, ...evento }));
                setEventos(lista);
            } else {
                setEventos([]);
            }
        });
    }, []);


    const eventosFiltrados = tipo
        ? eventos.filter((evento) => evento.diretoria?.toLowerCase() === tipo?.toLowerCase())
        : eventos;


    const [nomeUsuario, setNomeUsuario] = useState('');
    const [cpfUsuario, setCpfUsuario] = useState('');
    const [funcaoUsuario, setFuncaoUsuario] = useState('administrativo');

    const formatarCPF = (valor) => {
        return valor
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    };

    const handleCpfChange = (e) => {
        setCpfUsuario(formatarCPF(e.target.value));
    };

    const handleCadastrarUsuario = async () => {
        if (!nomeUsuario || !cpfUsuario || !funcaoUsuario) {
            alert('Preencha todos os campos do usuário.');
            return;
        }

        try {
            const usuariosRef = ref(db, 'usuarios');
            const snapshot = await get(usuariosRef);
            const dados = snapshot.val();
            const cpfExistente = dados && Object.values(dados).find((u) => u.cpf === cpfUsuario);
            if (cpfExistente) {
                alert('CPF já cadastrado.');
                return;
            }

            await push(usuariosRef, { nome: nomeUsuario, cpf: cpfUsuario, funcao: funcaoUsuario });
            alert('Usuário cadastrado com sucesso!');
            setNomeUsuario('');
            setCpfUsuario('');
            setFuncaoUsuario('administrativo');
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Erro ao cadastrar usuário.');
        }
    };

    const handleCriarEvento = async () => {
        const { diretoria, tipo, data, hora, local } = novoEvento;

        // if (!diretoria || !tipo || !data || !hora || !local) {
        //     alert("Preencha todos os campos obrigatórios.");
        //     return;
        // }

        try {
            if (editandoId) {
                await update(ref(db, `eventos/${editandoId}`), novoEvento);
                alert("Evento atualizado com sucesso!");
            } else {
                await push(ref(db, 'eventos'), novoEvento);
                alert("Evento salvo com sucesso!");
            }

            setNovoEvento({ diretoria: tipo || '', tipo: '', data: '', hora: '', local: '', necessidades: '', obs: '', situacao: 'A realizar', assunto: '', horaFim: '' });
            setMostrarFormulario(false);
            setEditandoId(null);
        } catch (error) {
            console.error("Erro ao salvar evento:", error);
            alert("Erro ao salvar evento.");
        }
    };
    // Adicione estado para usuários
    const [usuarios, setUsuarios] = useState([]);

    // Buscar usuários do Firebase
    useEffect(() => {
        const usuariosRef = ref(db, 'usuarios');
        onValue(usuariosRef, (snapshot) => {
            const dados = snapshot.val();
            if (dados) {
                const lista = Object.entries(dados).map(([id, usuario]) => ({ id, ...usuario }));
                setUsuarios(lista);
            } else {
                setUsuarios([]);
            }
        });
    }, []);

    const handleExcluirEvento = async (id) => {
        const confirm = window.confirm("Tem certeza que deseja excluir este evento?");
        if (!confirm) return;

        try {
            await remove(ref(db, `eventos/${id}`));
            alert("Evento excluído com sucesso.");
        } catch (error) {
            console.error("Erro ao excluir evento:", error);
            alert("Erro ao excluir evento.");
        }
    };
    const [filtroDiretoria, setFiltroDiretoria] = useState('');
    const [filtroData, setFiltroData] = useState('');
    const [filtroSituacao, setFiltroSituacao] = useState('');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');

    const handleEditarEvento = (evento) => {
        setNovoEvento({
            diretoria: evento.diretoria || '',
            tipo: evento.tipo || '',
            data: evento.data || '',
            hora: evento.hora || '',
            horaFim: evento.horaFim || '',
            local: evento.local || '',
            necessidades: evento.necessidades || '',
            obs: evento.obs || '',
            situacao: evento.situacao || '',
            assunto: evento.assunto || ''
        });
        setEditandoId(evento.id);
        setMostrarFormulario(true);
    };
    const isAdminMaster = cpfLogado === "000.000.000-00";

    const [mostrarFormularioUsuario, setMostrarFormularioUsuario] = useState(false);
    const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '', tipo: '' });

    const handleCriarUsuario = async () => {
        const { nome, email, tipo } = novoUsuario;

        if (!nome || !email || !tipo) {
            alert("Preencha todos os campos do usuário.");
            return;
        }

        try {
            await push(ref(db, 'usuarios'), novoUsuario);
            alert("Usuário criado com sucesso!");
            setNovoUsuario({ nome: '', email: '', tipo: '' });
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            alert("Erro ao criar usuário.");
        }
    };
    const [abaAtiva, setAbaAtiva] = useState('eventos');
    const [telaAtiva, setTelaAtiva] = useState('eventos'); // eventos | usuarios
    // Mapeamento entre valor do filtro e valor real no evento
    const filtroMap = {
        'DE - Presidência': 'Presidência',
        'Diretoria de Administração': 'Diretoria de Administração',
        'Diretoria de Finanças': 'Diretoria de Finanças',
        'Diretoria de Saúde e Benefícios': 'Diretoria de Saúde e Benefícios',
        'Diretoria de Eventos Sociais': 'Diretoria de Eventos Sociais',
        'Diretoria de Cultura': 'Diretoria de Cultura',
        'Conselho Deliberativo': 'Conselho Deliberativo',
        'Conselho Fiscal': 'Conselho Fiscal',
        'Diretoria Executiva': 'Diretoria Executiva'
    };

    const eventosFiltradosComFiltro = eventosFiltrados
        .filter(ev => {
            const matchDiretoria = tipo
                ? ev.diretoria?.toLowerCase() === tipo?.toLowerCase()
                : (filtroDiretoria === '' || ev.diretoria?.toLowerCase() === (filtroMap[filtroDiretoria] || '').toLowerCase());

            const matchDataInicio = filtroDataInicio === '' || new Date(ev.data) >= new Date(filtroDataInicio);
            const matchDataFim = filtroDataFim === '' || new Date(ev.data) <= new Date(filtroDataFim);
            const matchSituacao = filtroSituacao === '' || ev.situacao === filtroSituacao;

            return matchDiretoria && matchDataInicio && matchDataFim && matchSituacao;
        })
        .sort((a, b) => new Date(b.data + 'T' + b.hora) - new Date(a.data + 'T' + a.hora));

    const eventosParaGrafico = eventosFiltrados.filter(ev => {
        const dataEvento = new Date(ev.data);
        const inicio = filtroDataInicio ? new Date(filtroDataInicio) : null;
        const fim = filtroDataFim ? new Date(filtroDataFim) : null;

        const depoisInicio = !inicio || dataEvento >= inicio;
        const antesFim = !fim || dataEvento <= fim;

        return depoisInicio && antesFim;
    });



    const graficoPorAssunto = useMemo(() => {
        const agrupado = {};

        eventosParaGrafico.forEach(ev => {
            const assunto = ev.assunto || 'Não informado';
            agrupado[assunto] = (agrupado[assunto] || 0) + 1;
        });

        return Object.entries(agrupado).map(([nome, qtd]) => ({
            nome,
            qtd
        }));
    }, [eventosParaGrafico]);

    const graficoPorDiretoria = useMemo(() => {
        const agrupado = {};

        eventosParaGrafico.forEach(ev => {
            const diretoria = ev.diretoria || 'Não informada';
            agrupado[diretoria] = (agrupado[diretoria] || 0) + 1;
        });

        return Object.entries(agrupado).map(([nome, qtd]) => ({
            nome,
            qtd
        }));
    }, [eventosParaGrafico]);

    return (
        <div className="agenda-container">
            <header className="agenda-header">
                <img src={Logo01} alt="Logo AEA" className="agenda-logo" />
                <div>
                    <h2>Agenda de Eventos - {tipo || 'Todas as Áreas'}</h2>
                    <p>Confira os eventos programados.</p>
                </div>
                <button onClick={() => navigate(-1)} className="btn-voltar">← Voltar</button>
            </header>
            <nav className="menu" style={{ width: '300px' }}>
                <button onClick={() => setTelaAtiva('eventos')}>📅 Eventos e Consultas</button>
                {!isCpfEspecial && (
                    <button onClick={() => setTelaAtiva('usuarios')}>👤 Usuários</button>
                )}
            </nav>




            <div className="conteudo">
                {telaAtiva === 'eventos' && (
                    <div className="tabela-eventos">
                        {!isCpfEspecial && (
                            <div className="botoes-agenda">
                                <button className="btn-criar" onClick={() => {
                                    setNovoEvento({ diretoria: tipo || '', tipo: '', data: '', hora: '', horaFim: '', local: '', necessidades: '', obs: '', situacao: 'A realizar', assunto: '' });
                                    setEditandoId(null);
                                    setMostrarFormulario(true);
                                }}>
                                    ➕ Criar Evento
                                </button>
                            </div>
                        )}

                        {mostrarFormulario && (
                            <div className="form-evento">
                                <h4>{editandoId ? 'Editar Evento' : 'Novo Evento'}</h4>

                                {/* <label>refrew</label>
                                <select value={novoEvento.diretoria} onChange={(e) => setNovoEvento({ ...novoEvento, diretoria: e.target.value })} disabled>
                                    <option>{tipo}</option>
                                </select> */}


                                <select value={novoEvento.tipo} onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value })}>
                                    <option value="" disabled>Tipo de Evento</option>
                                    <option>Palestra</option>
                                    <option>Convenção</option>
                                    <option>Reunião de negócios</option>
                                    <option>Conferência</option>
                                    <option>Treinamento</option>
                                    <option>Congresso</option>
                                    <option>Simpósio</option>
                                    <option>Confraternização</option>
                                    <option>Data comemorativa</option>
                                    <option>Turismo/Viagens</option>
                                    <option>Jogos/Competições</option>
                                    <option>Reunião de rotina</option>
                                    <option>Reunião de Diretoria</option>
                                    <option>Reunião Extraordinária</option>
                                    <option>Ponto de Controle</option>
                                    <option>Reunião de Trabalho</option>
                                    <option>Seminário</option>
                                    <option>Outros</option>
                                </select>
                                <label>Data:</label>
                                <input type="date" value={novoEvento.data} onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })} />
                                <label>Hora Início:</label>

                                <input type="time" value={novoEvento.hora} onChange={(e) => setNovoEvento({ ...novoEvento, hora: e.target.value })} />
                                <label>Hora Fim:</label>

                                <input type="time" value={novoEvento.horaFim} onChange={(e) => setNovoEvento({ ...novoEvento, horaFim: e.target.value })} />

                                <input type="text" list="locais" placeholder="Local" value={novoEvento.local} onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })} />
                                <input type="text" placeholder="Assunto" value={novoEvento.assunto} onChange={(e) => setNovoEvento({ ...novoEvento, assunto: e.target.value })} />

                                <label>Situação:</label>

                                <datalist id="locais">
                                    <option value="AEA-DF" />
                                    <option value="APCEF" />
                                    <option value="CAIXA" />
                                    <option value="FUNCEF" />
                                </datalist>

                                <select value={novoEvento.situacao} onChange={(e) => setNovoEvento({ ...novoEvento, situacao: e.target.value })}>
                                    <option >A Realizar</option>
                                    <option>Realizado</option>
                                    <option>Suspenso</option>
                                    <option>Cancelado</option>
                                </select>

                                <input type="text" placeholder="Observações" value={novoEvento.obs} onChange={(e) => setNovoEvento({ ...novoEvento, obs: e.target.value })} />

                                <button className="btn-salvar-evento" onClick={handleCriarEvento}>
                                    {editandoId ? '💾 Salvar Alterações' : '✅ Salvar Evento'}
                                </button>
                            </div>
                        )}
                        {/* FILTROS - só aparecem se NÃO houver "tipo" */}
                        <div className="filtros-eventos">
                            {/* Filtro de Diretoria só se não houver tipo */}
                            {!tipo && (
                                <select value={filtroDiretoria} onChange={(e) => setFiltroDiretoria(e.target.value)}>
                                    <option value="">Todas as Diretorias</option>
                                    <option>DE - Presidência</option>
                                    <option>Diretoria de Administração</option>
                                    <option>Diretoria de Finanças</option>
                                    <option>Diretoria de Saúde e Benefícios</option>
                                    <option>Diretoria de Eventos Sociais</option>
                                    <option>Diretoria de Cultura</option>
                                    <option>Conselho Deliberativo</option>
                                    <option>Conselho Fiscal</option>
                                    <option>Diretoria Executiva</option>
                                </select>
                            )}

                            {/* Filtro de Data - intervalo */}
                            <input
                                type="date"
                                value={filtroDataInicio}
                                onChange={(e) => setFiltroDataInicio(e.target.value)}
                                placeholder="Data Início"
                            />
                            <input
                                type="date"
                                value={filtroDataFim}
                                onChange={(e) => setFiltroDataFim(e.target.value)}
                                placeholder="Data Fim"
                            />

                            {/* Filtro de Situação - aparece para todos */}
                            <select value={filtroSituacao} onChange={(e) => setFiltroSituacao(e.target.value)}>
                                <option value="">Todas as Situações</option>
                                <option>A Realizar</option>
                                <option>Realizado</option>
                                <option>Suspenso</option>
                                <option>Cancelado</option>
                            </select>

                            {/* Botão Limpar - aparece para todos */}
                            <button onClick={() => {
                                setFiltroDiretoria('');
                                setFiltroDataInicio('');
                                setFiltroDataFim('');
                                setFiltroSituacao('');
                            }}>
                                Limpar Filtros
                            </button>
                        </div>



                        <div className="agenda-tabela">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Diretoria</th>
                                        <th>Tipo Evento</th>
                                        <th>Data</th>
                                        <th>Início</th>
                                        <th>Fim</th>
                                        <th>Local</th>
                                        <th>Assunto</th>
                                        <th>Situação</th>
                                        <th>OBS</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventosFiltradosComFiltro.length === 0 ? (
                                        <tr><td colSpan="10" style={{ textAlign: 'center' }}>Nenhum evento</td></tr>
                                    ) : (
                                        eventosFiltradosComFiltro
                                            .sort((a, b) => new Date(b.data + 'T' + b.hora) - new Date(a.data + 'T' + a.hora)) // mais recentes primeiro
                                            .map((evento) => (
                                                <tr key={evento.id}>
                                                    <td>{evento.diretoria}</td>
                                                    <td>{evento.tipo}</td>
                                                    <td>{evento.data}</td>
                                                    <td>{evento.hora}</td>
                                                    <td>{evento.horaFim}</td>
                                                    <td>{evento.local}</td>
                                                    <td>{evento.assunto}</td>
                                                    <td>{evento.situacao}</td>
                                                    <td>{evento.obs}</td>
                                                    <td>
                                                        {!isCpfEspecial && (
                                                            <>
                                                                <button onClick={() => handleEditarEvento(evento)} style={{ marginRight: 6, backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>✏️</button>
                                                                <button onClick={() => handleExcluirEvento(evento.id)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                                                            </>
                                                        )}
                                                    </td>

                                                </tr>
                                            ))
                                    )}
                                </tbody>


                            </table>
                        </div>
                    </div>
                )}

                {telaAtiva === 'usuarios' && isAdminMaster && (
                    <div className="form-usuarios">
                        <button className="btn-criar" onClick={() => setMostrarFormularioUsuario(true)}>
                            👤 Criar Usuário
                        </button>

                        {mostrarFormularioUsuario && (
                            <div className="form-usuario">
                                <h3>Cadastrar Novo Usuário</h3>
                                <input type="text" placeholder="Nome" value={nomeUsuario} onChange={(e) => setNomeUsuario(e.target.value)} />
                                <input type="text" placeholder="CPF" value={cpfUsuario} onChange={handleCpfChange} maxLength={14} />
                                <select value={funcaoUsuario} onChange={(e) => setFuncaoUsuario(e.target.value)}>
                                    {/* <option value="Diretoria de Administração">Diretoria de Administração</option> */}
                                    {/* <option value="DE-presidencia">DE - Presidência aa</option> */}
                                    {/* <option value="presidencia">DE - Presidência</option> */}
                                    <option value="presidencia12342" style={{ display: 'none' }} >Selecione</option>
                                    <option value="Presidência" selected>DE - Presidência</option>
                                    <option value="Saude" selected>Suade</option>
                                    <option value="Diretoria de Administração">Diretoria de Administração</option>
                                    <option value="Diretoria de Finanças">Diretoria de Finanças</option>
                                    <option value="Diretoria de Esportes">Diretoria de Esportes</option>
                                    <option value="Diretoria de Saúde e Benefícios">Diretoria de Saúde e Benefícios</option>
                                    <option value="Diretoria de Eventos Sociais">Diretoria de Eventos Sociais</option>
                                    <option value="Diretoria de Cultura">Diretoria de Cultura</option>
                                    <option value="Conselho Deliberativo">Conselho Deliberativo</option>
                                    <option value="Conselho Fiscal">Conselho Fiscal</option>
                                    <option value="Diretoria Executiva">Diretoria Executiva</option>

                                </select>
                                <button className="btn-salvar" onClick={handleCadastrarUsuario}>Cadastrar Usuário</button>
                            </div>
                        )}
                        {/* LISTA DE USUÁRIOS */}
                        <div className="usuarios-lista">
                            <h3>Usuários Cadastrados</h3>
                            {usuarios.length === 0 ? (
                                <p>Nenhum usuário cadastrado.</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nome</th>
                                            <th>CPF</th>
                                            <th>Função</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.nome}</td>
                                                <td>{u.cpf}</td>
                                                <td>{u.funcao}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <h3 className="titulo-secao">📊 Resumo da Agenda</h3>

            <div className="area-grafico-dupla">

                {/* Pizza por Diretoria */}
                <div className="grafico-item">
                    <h4>Eventos por Diretoria</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={graficoPorDiretoria}
                                dataKey="qtd"
                                nameKey="nome"
                                outerRadius={80}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {graficoPorDiretoria.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Pizza por Assunto */}
                <div className="grafico-item">
                    <h4>Eventos por Assunto</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={graficoPorAssunto}
                                dataKey="qtd"
                                nameKey="nome"
                                outerRadius={80}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {graficoPorAssunto.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>

        </div>
    );
}

export default AgendaEventos;
