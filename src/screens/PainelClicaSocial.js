import '../App.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo01 from '../images/logo01.png';

function PainelClinicaSocial() {
    const location = useLocation();
    const navigate = useNavigate();
    const nome = location.state?.nome;

    const handleSair = () => {
        navigate('/');
    };

    const acessarPainel = () => {
        navigate('/atendimentos');
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
                <h3 style={{ color: '#007bff' }}>Bem-vindo {nome}</h3>
            </div>

            <div className="admin-card">
                <h3>Painel Clínica Social</h3>
                <p>Atendimentos da área de Clínica Social.</p>
                <button className="btn-acessar" onClick={acessarPainel}>
                    Acessar
                </button>
            </div>
        </div>
    );
}

export default PainelClinicaSocial;
