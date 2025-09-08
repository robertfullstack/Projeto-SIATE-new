import '../Admin.css';
import { useNavigate } from 'react-router-dom';
import Logo01 from '../images/logo01.png';

function Admin() {
    const navigate = useNavigate();

    const handleSair = () => {
        navigate('/');
    };

    const handleAcessarPainel = () => {
        navigate('/painel');
    };

    const handleAcessarAgenda = () => {
        navigate('/agenda-eventos'); // 👈 certifique-se de que essa rota existe
    };

    return (
        <div className="admin-container">
            <button className="admin-btn-sair" onClick={handleSair}>
                ⏹ Sair
            </button>

            <div className="admin-header">
                <img
                    src={Logo01}
                    alt="Logo AEA"
                    className="admin-logo"
                />
                <h2>SIATE - Sistema de Atendimento e Agendamento</h2>
                <h3>Bem-vindo, Administrador</h3>
            </div>

            <div className="admin-card">
                <h3>Painel Administrativo</h3>
                <p>Apoio Administrativo - Gestão de Atendimentos.</p>
                <button
                    className="admin-btn-acessar"
                    onClick={handleAcessarPainel}
                >
                    Acessar
                </button>
            </div>

            <div className="admin-card" style={{ marginTop: '30px' }}>
                <h3>Agenda de Eventos</h3>
                <p>Gerencie compromissos, reuniões e eventos institucionais.</p>
                <button
                    className="admin-btn-acessar"
                    onClick={handleAcessarAgenda}
                >
                    Acessar Agenda
                </button>
            </div>
        </div>
    );
}

export default Admin;
