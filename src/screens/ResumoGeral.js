// src/ResumoGeral.js
import './ResumoGeral.css';
import { useNavigate } from 'react-router-dom';
import Logo01 from '../images/logo01.png';
import { db } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, AreaChart, Area } from 'recharts';
import { FiHome, FiFileText, FiBarChart2, FiUsers, FiLogOut } from 'react-icons/fi';
import { PieChart, Pie } from 'recharts';

function ResumoGeral() {
    const navigate = useNavigate();
    const hoje = new Date();
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const funcao = usuario?.funcao?.toLowerCase();
    const menuRestrito = funcao === 'contábil' || funcao === 'jurídico' || funcao === 'diretorias';


    const doisMesesAtras = new Date();
    doisMesesAtras.setMonth(hoje.getMonth() - 2);

    const [filtroDataInicio, setFiltroDataInicio] = useState(doisMesesAtras.toISOString().split('T')[0]);
    const [filtroDataFim, setFiltroDataFim] = useState(hoje.toISOString().split('T')[0]);

    const [total, setTotal] = useState(0);
    const [agendado, setAgendado] = useState(0);
    const [confirmado, setConfirmado] = useState(0);
    const [cancelado, setCancelado] = useState(0);

    const COLORS_TOTAL = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14'];
    const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14'];

    const handleSair = () => {
        navigate('/');
    };

    const [atendimentosPorArea, setAtendimentosPorArea] = useState([]);
    const [realizadosPorArea, setRealizadosPorArea] = useState([]);
    const [assuntosPorArea, setAssuntosPorArea] = useState([]);

    useEffect(() => {
        const atendimentosRef = ref(db, 'atendimentos');

        onValue(atendimentosRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const valores = Object.values(data);

            const inicio = filtroDataInicio ? new Date(filtroDataInicio) : null;
            const fim = filtroDataFim ? new Date(filtroDataFim + 'T23:59:59') : null;

            let filtrados = valores.filter(item => {
                const dataItem = new Date(item.dataHora);
                const depoisDoInicio = !inicio || dataItem >= inicio;
                const antesDoFim = !fim || dataItem <= fim;
                return depoisDoInicio && antesDoFim;
            });

            // Se for perfil restrito, mostrar apenas atendimentos da sua área
            if (menuRestrito || funcao === 'clínica social') {
                filtrados = filtrados.filter(item => item.area?.toLowerCase() === funcao);
            }

            // Contadores
            setTotal(filtrados.length);
            setAgendado(filtrados.filter(item => item.situacao?.toLowerCase() === 'agendado').length);
            setConfirmado(filtrados.filter(item => item.situacao?.toLowerCase() === 'atendimento realizado').length);
            setCancelado(filtrados.filter(item => item.situacao?.toLowerCase() === 'cancelado').length);

            // Agrupamento por área (total)
            const agrupadoPorArea = {};
            filtrados.forEach(item => {
                const area = item.area || 'Não informada';
                agrupadoPorArea[area] = (agrupadoPorArea[area] || 0) + 1;
            });
            const arrayAtendimentosPorArea = Object.entries(agrupadoPorArea).map(([area, qtd]) => ({ area, qtd }));
            setAtendimentosPorArea(arrayAtendimentosPorArea);

            // Atendimentos realizados
            const realizados = filtrados.filter(item => item.situacao?.toLowerCase() === 'atendimento realizado');

            // Agrupamento por área ou assunto (conforme perfil)
            const agrupamento = {};
            realizados.forEach(item => {
                const chave = (menuRestrito || funcao === 'clínica social')
                    ? item.assunto || 'Não informado'
                    : item.area || 'Não informada';

                agrupamento[chave] = (agrupamento[chave] || 0) + 1;
            });
            const arrayAgrupado = Object.entries(agrupamento).map(([nome, qtd]) => ({ nome, qtd }));
            setRealizadosPorArea(arrayAgrupado);

            // ** Agrupamento de assuntos dos atendimentos realizados de áreas específicas **
            const areasConsideradas = ['jurídico', 'contábil', 'administrativo'];

            const realizadosFiltrados = realizados.filter(item =>
                item.area && areasConsideradas.includes(item.area.toLowerCase())
            );

            const assuntosAgrupados = {};
            realizadosFiltrados.forEach(item => {
                const assunto = item.assunto || 'Não informado';
                assuntosAgrupados[assunto] = (assuntosAgrupados[assunto] || 0) + 1;
            });

            // Combinar temas de IR em um só grupo
            const assuntosAgrupadosCombinados = {};

            Object.entries(assuntosAgrupados).forEach(([assunto, qtd]) => {
                const isIR = assunto.toLowerCase().includes('ir');
                const chave = isIR ? 'IR' : assunto;
                assuntosAgrupadosCombinados[chave] = (assuntosAgrupadosCombinados[chave] || 0) + qtd;
            });

            const arrayAssuntos = Object.entries(assuntosAgrupadosCombinados).map(([assunto, qtd]) => ({
                assunto,
                qtd
            }));

            setAssuntosPorArea(arrayAssuntos);
        });
    }, [filtroDataInicio, filtroDataFim]);

    const graficoData = [
        { name: 'Total', qtd: total },
        { name: 'Agendado', qtd: agendado },
        { name: 'Atendimento Realizado', qtd: confirmado },
        { name: 'Cancelado', qtd: cancelado },
    ];

    return (
        <div className="painel-container">
            {/* Menu lateral */}
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

            {/* Conteúdo principal */}
            <main className="conteudo-principal">
                <h2>Bem-vindo(a), Administrador</h2>
                <h3 className="titulo-secao">📊 Resumo Geral de Atendimentos</h3>

                {/* Filtros */}
                <div className="filtros">
                    <div className="campo">
                        <label>De:</label>
                        <input
                            type="date"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                        />
                    </div>
                    <div className="campo">
                        <label>Até:</label>
                        <input
                            type="date"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cards de resumo */}
                <div className="cards-resumo">
                    <div className="card-resumo agendado">
                        <h4 style={{ color: '#f1b100' }}>Agendado</h4>
                        <p>{agendado}</p>
                    </div>
                    <div className="card-resumo confirmado">
                        <h4 style={{ color: '#007bff' }}>Atendimento Realizado</h4>
                        <p>{confirmado}</p>
                    </div>
                    <div className="card-resumo cancelado">
                        <h4 style={{ color: '#dc3545' }}>Cancelado</h4>
                        <p>{cancelado}</p>
                    </div>
                    <div className="card-resumo total">
                        <h4>Total</h4>
                        <p>{total}</p>
                    </div>
                </div>

                {/* Gráfico geral - barras */}
                <div className="area-grafico">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={graficoData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="qtd" name="Quantidade">
                                {graficoData.map((entry, index) => (
                                    <Cell key={`cell-bar-${index}`} fill={COLORS_TOTAL[index % COLORS_TOTAL.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <h3 className="titulo-secao">📈 Comparativo por Área</h3>
                <div className="area-grafico-dupla">

                    {/* Gráfico Atendimentos Realizados por Área ou Assunto */}
                    <div className="grafico-item">
                        <h4>
                            {menuRestrito || funcao === 'clínica social'
                                ? 'Assuntos Atendidos'
                                : 'Atendimentos Realizados por Área'}
                        </h4>

                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={realizadosPorArea}
                                    dataKey="qtd"
                                    nameKey="nome"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {realizadosPorArea.map((entry, index) => (
                                        <Cell key={`cell-realizados-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico Assuntos de atendimentos realizados nas áreas selecionadas */}
                    {/* <ResponsiveContainer width="100%" height={250}>
                        <h3 style={{ marginBottom: '-200px' }}>Gráfico por Assuntoa</h3>
                        <BarChart
                            data={assuntosPorArea}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="assunto" type="category" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="qtd" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer> */}

                    {/* Gráfico Assuntos de atendimentos realizados nas áreas selecionadas */}
                    {!(funcao === 'contábil' || funcao === 'jurídico') && (
                        <div className="grafico-item" style={{ marginTop: '0px' }}  >
                            <h3 style={{ marginBottom: '0px' }}>Gráfico por Assunto</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={assuntosPorArea}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="assunto" type="category" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="qtd" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* <h3>Gráfico por Assunto e Por Área</h3> */}
                    {/* <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={assuntosPorArea} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorQtd" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="assunto" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Area type="monotone" dataKey="qtd" stroke="#8884d8" fillOpacity={1} fill="url(#colorQtd)" />
                        </AreaChart>
                    </ResponsiveContainer> */}



                </div>
            </main>
        </div>
    );
}

export default ResumoGeral;
