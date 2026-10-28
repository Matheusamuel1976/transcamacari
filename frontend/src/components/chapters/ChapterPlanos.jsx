import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { TransitionLink } from '../../motion/TransitionLink';

const plans = [
  {
    name: 'Rastreamento Básico',
    description:
      'Acompanhamento essencial para empresas que precisam visualizar seus veículos com clareza.',
    features: 'Localização em tempo real, rotas percorridas, velocidade e cercas virtuais básicas.',
    monthly: 'R$ 60–100',
    annual: 'R$ 600–1.000',
  },
  {
    name: 'Telemetria Avançada e Gestão de Passageiros',
    description: 'Recursos robustos para operações profissionais de transporte.',
    features:
      'Consumo de combustível, comportamento do motorista, identificação RFID, botão de pânico e previsão de chegada.',
    monthly: 'R$ 120–200+',
    annual: 'R$ 1.200–2.000+',
  },
];

export function ChapterPlanos() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <section id="planos" className="pricing" aria-labelledby="pricing-title">
      <div className="pricing__intro">
        <h2 id="pricing-title">
          Tecnologia para uma operação <em>mais previsível.</em>
        </h2>
        <div className="pricing__cycle" aria-label="Período de cobrança">
          <button
            type="button"
            aria-pressed={billingCycle === 'monthly'}
            onClick={() => setBillingCycle('monthly')}
          >
            Mensal
          </button>
          <button
            type="button"
            aria-pressed={billingCycle === 'annual'}
            onClick={() => setBillingCycle('annual')}
          >
            Anual <span>2 meses grátis</span>
          </button>
        </div>
      </div>
      <div className="pricing__list">
        {plans.map((plan) => (
          <article className="pricing__row" key={plan.name}>
            <div>
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
            </div>
            <p className="pricing__features">{plan.features}</p>
            <div className="pricing__offer">
              <strong>{plan[billingCycle]}</strong>
              <span>{billingCycle === 'monthly' ? 'por mês' : 'por ano'}</span>
              <TransitionLink to="/register?tipo=empresa" variant="auth">
                Cadastrar empresa <ArrowUpRight size={18} />
              </TransitionLink>
            </div>
          </article>
        ))}
      </div>
      <p className="pricing__note">
        Valores em faixas. Recursos e integrações dependem da contratação e
        configuração da operação.
      </p>
    </section>
  );
}
