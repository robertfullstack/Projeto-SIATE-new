// src/screens/PainelJuridico.js
import '../App.css';
import { useNavigate } from 'react-router-dom';
import Logo01 from '../images/logo01.png';

function PainelJuridico() {
    const navigate = useNavigate();

    const handleSair = () => {
        navigate('/');
    };

    return (
        <div className="container">
            <div className="card">
                <img src={Logo01} alt="Logo AEA" className="logo" />
                <h2>Atendimento - Setor  Jurídico</h2>
                <p>Atendimentos com o setor jurídico.</p>
                <button className="btn-acessar" onClick={() => navigate('/atendimentos')}>
                    Acessar
                </button>
            </div>
            {/* <button onClick={handleSair} className="btn-sair">
                ⏹ Sair
            </button> */}
        </div>
    );
}

export default PainelJuridico;
