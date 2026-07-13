import SEOHead from '../components/SEOHead';
import { getTenantFromDomain } from '../lib/tenant';

const AssessorTerms = () => {
    const tenant = getTenantFromDomain();
    const isEngland = tenant === 'england';
    const isPortuguese = tenant === 'portugal';
    const certName = isEngland ? 'EPC' : isPortuguese ? 'Certificado Energético' : 'BER';
    const assessorLabel = isEngland ? 'EPC Assessor' : isPortuguese ? 'Perito Certificado' : 'BER Assessor';
    const brand = isEngland ? 'epccert.com' : isPortuguese ? 'certificadoenergia.com' : 'theberman.eu';
    const displayBrand = isEngland ? 'EPC Cert' : isPortuguese ? 'Certificado Energia' : 'The Berman';
    const body = isEngland ? 'a UK accredited body' : isPortuguese ? 'a Agência para a Energia (ADENE)' : 'the Sustainable Energy Authority of Ireland (SEAI)';
    const currency = isEngland ? '£25' : '€25';

    const title = isPortuguese ? 'Termos de Utilização para Peritos' : 'Assessor Terms of Use';
    const seoDesc = isPortuguese
        ? `Termos de utilização para ${assessorLabel}s registados na plataforma ${displayBrand}.`
        : `Terms of Use for ${assessorLabel}s registered on the ${displayBrand} platform.`;

    const paragraphs = isPortuguese ? [
        'É da sua responsabilidade manter-se atualizado relativamente a estes Termos de Utilização. Ao continuar a utilizar este website, concorda em ficar vinculado por estes termos. Se não concordar, deve deixar de utilizar a plataforma imediatamente.',
        `Para se registar como ${assessorLabel} neste website, deve ser um ${assessorLabel} qualificado e registado junto de ${body}. Ao registar-se, confirma que o seu registo está atual e válido. Concorda também em notificar ${brand} imediatamente por email caso o seu estado de registo altere ou se deixar de ser um ${assessorLabel} registado.`,
        `Embora ${brand} procure oferecer oportunidades a todos os Peritos na plataforma, não existe garantia ou compromisso de fornecer um número específico de encaminhamentos de trabalho. A aceitação de qualquer orçamento apresentado pelos Peritos é da exclusiva responsabilidade do cliente (proprietário), e ${brand} não influencia a sua decisão.`,
        `Ao utilizar ${brand}, concorda em contactar quaisquer clientes obtidos através de ${brand} no prazo de um dia útil após receber um encaminhamento de trabalho.`,
        `Ao utilizar ${brand}, concorda em realizar as Avaliações de ${certName} e emitir os respetivos Certificados de ${certName} num prazo razoável, garantindo um serviço atempado aos seus clientes.`,
        `Ao apresentar orçamentos através de ${brand}, concorda em incluir todas as taxas aplicáveis no preço total orçamentado. Isto inclui quaisquer taxas de acreditação, IVA (se aplicável) e a taxa de encaminhamento de ${brand}.`,
        `Ao utilizar ${brand}, entende e concorda que a taxa de ${brand} de ${currency} é uma taxa de encaminhamento pela disponibilização de um trabalho confirmado. Deve incorporar esta taxa em todos os orçamentos que apresentar através da plataforma ${brand}. Esta taxa não lhe é cobrada diretamente; em vez disso, é paga diretamente a ${brand} pelo cliente aquando da aceitação do orçamento.`,
        `Ao utilizar ${brand}, concorda em receber o pagamento diretamente do seu cliente no dia da visita, ou conforme acordo direto com o seu cliente.`,
        `Ao utilizar ${brand}, reconhece que, para além da taxa de encaminhamento de ${brand}, ${brand} poderá também cobrar aos utilizadores do website uma taxa administrativa adicional pela utilização da plataforma.`,
        `Ao utilizar ${brand}, entende que é o único responsável por produzir e entregar o Certificado de ${certName} e respetiva classificação ao seu cliente. Entende que ${brand} não verifica, endossa nem garante a exatidão das suas classificações ou serviços de ${certName}.`,
        `Ao utilizar ${brand}, concorda em não subcontratar a terceiros quaisquer trabalhos obtidos através de ${brand}. Todo o trabalho deve ser realizado e concluído por si, o ${assessorLabel} registado em ${brand}.`,
        `Ao utilizar ${brand}, entende e concorda que os seus orçamentos poderão ser visualizados anonimamente por outros Peritos registados na plataforma (não será identificado). Terá também acesso para visualizar os orçamentos de outros Peritos.`,
        `Concorda que não poderá intentar quaisquer reclamações ou ações judiciais contra ${brand} ou a sua equipa. ${brand} não é responsável por qualquer eventual perda de negócio ou rendimentos resultante da utilização da plataforma.`,
        `O incumprimento destes Termos de Utilização pode resultar na suspensão imediata ou remoção permanente da sua conta da plataforma ${brand}.`,
    ] : [
        'You are responsible for keeping up to date with these Terms of Use. By continuing to use this website, you agree to be bound by these terms. If you do not agree, you must stop using the platform immediately.',
        `To register as a ${assessorLabel} on this website, you must be a qualified and registered ${assessorLabel} with ${body}. By registering, you confirm that your registration is current and valid. You also agree to notify ${brand} immediately via email if your registration status changes or if you cease to be a registered ${assessorLabel}.`,
        `While ${brand} aims to offer opportunities to all Assessors on the platform, there is no guarantee or commitment to provide a specific number of job referrals. The acceptance of any quotes submitted by Assessors is solely at the discretion of the client (homeowner), and ${brand} has no influence over their decision.`,
        `By using ${brand}, you agree to contact any clients obtained through ${brand} within one business day of receiving a job referral.`,
        `By using ${brand}, you agree to complete ${certName} Assessments and issue the associated ${certName} Certificates within a reasonable timeframe, ensuring prompt service delivery to your clients.`,
        `When submitting quotes through ${brand}, you agree to include all applicable fees in your total quoted price. This includes all applicable accreditation fees, VAT (if applicable), and the ${brand} referral fee.`,
        `By using ${brand}, you understand and agree that the ${brand} fee of ${currency} is a referral fee for providing you with a confirmed job. You should incorporate this fee into all quotes you submit via the ${brand} platform. This fee is not charged to you directly; instead, it is paid directly to ${brand} by the client upon accepting a quote.`,
        `By using ${brand}, you agree to accept payment directly from your client on the day of the survey, or as you may agree directly with your client.`,
        `By using ${brand}, you acknowledge that in addition to the ${brand} referral fee, ${brand} may also charge website users an additional administration fee for using the platform.`,
        `By using ${brand}, you understand that you and you alone are responsible for producing and delivering the ${certName} Certificate and rating to your client. You understand that ${brand} does not verify, endorse, or guarantee the accuracy of your ${certName} ratings or services.`,
        `By using ${brand}, you agree not to subcontract any jobs acquired through ${brand} to third parties. All work must be performed and completed by you, the ${assessorLabel} registered with ${brand}.`,
        `By using ${brand}, you understand and agree that your quotes may be seen anonymously by other Assessors registered on the platform (you will not be identified). You will also have access to view other Assessors' quotes.`,
        `You agree that no claims or legal action can be brought against ${brand} or its team by you, the Assessor. ${brand} is not liable for any potential loss of business or earnings resulting from the use of the platform.`,
        `Failure to comply with these Terms of Use may result in immediate suspension or permanent removal of your account from the ${brand} platform.`,
    ];

    return (
        <div className="font-sans text-gray-900 bg-white min-h-screen pt-24 pb-16">
            <SEOHead
                title={title}
                description={seoDesc}
                canonical="/assessor-terms"
            />

            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-normal text-[#4CAF50] mb-8">
                    {isPortuguese ? `Termos de Utilização para ${assessorLabel}s` : `${assessorLabel}s Terms of Use`}
                </h1>

                <div className="text-gray-800 space-y-6 leading-relaxed">
                    {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
            </div>
        </div>
    );
};

export default AssessorTerms;
