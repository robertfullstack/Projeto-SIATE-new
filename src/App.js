// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './screens/Home';
import Admin from './screens/Admin';
import Painel from './screens/Painel';
import Atendimentos from './screens/Atendimentos';
import GerenciamentoUsuarios from './screens/GerenciamentoUsuarios';
import ResumoGeral from './screens/ResumoGeral';
import PainelContabil from './screens/PainelContabil';
import PainelJuridico from './screens/PainelJuridico';
import PainelDiretorias from './screens/PainelDiretorias';
import PainelClicaSocial from './screens/PainelClicaSocial';
import AgendaEventos from './screens/AgendaEventos';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas principais */}
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/atendimentos" element={<Atendimentos />} />
        <Route path="/gerenciamentousuarios" element={<GerenciamentoUsuarios />} />
        <Route path="/resumogeral" element={<ResumoGeral />} />
        <Route path="/painelcontabil" element={<PainelContabil />} />
        <Route path="/paineljuridico" element={<PainelJuridico />} />
        <Route path="/paineldiretorias" element={<PainelDiretorias />} />
        <Route path="/painelclinicasocial" element={<PainelClicaSocial />} />

        {/* Agenda Geral (opcional, pode servir para testes ou visão unificada) */}
        <Route path="/agenda-eventos" element={<AgendaEventos />} />

        {/* Rotas de agenda específicas */}

        <Route path="/agenda-eventos-presidencia" element={<AgendaEventos tipo="Presidência" />} />
        <Route path="/agenda-eventos-saude-beneficios" element={<AgendaEventos tipo="Saude" />} />
        <Route path="/agenda-eventos-administrativa" element={<AgendaEventos tipo="Diretoria de Administração" />} />
        <Route path="/agenda-eventos-financas" element={<AgendaEventos tipo="Diretoria de Finanças" />} />
        <Route path="/agenda-eventos-esportes" element={<AgendaEventos tipo="Diretoria de Esportes" />} />
        <Route path="/agenda-eventos-saude-beneficios" element={<AgendaEventos tipo="Diretoria de Saúde e Benefícios" />} />
        <Route path="/agenda-eventos-sociais" element={<AgendaEventos tipo="Diretoria de Eventos Sociais" />} />
        <Route path="/agenda-eventos-cultura" element={<AgendaEventos tipo="Diretoria de Cultura" />} />
        <Route path="/agenda-eventos-conselho-deliberativo" element={<AgendaEventos tipo="Conselho Deliberativo" />} />
        <Route path="/agenda-eventos-conselho-fiscal" element={<AgendaEventos tipo="Conselho Fiscal" />} />
        <Route path="/agenda-eventos-diretoria-executiva" element={<AgendaEventos tipo="Diretoria Executiva" />} />


      </Routes>
    </Router>
  );
}

export default App;
