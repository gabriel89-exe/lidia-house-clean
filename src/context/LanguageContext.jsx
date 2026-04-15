import { createContext, useContext, useState, useEffect } from 'react'

/* ══════════════════════════════════════════════════════════════
   TRANSLATIONS
   Centraliza todo o conteúdo textual do site em PT-BR e EN-US.
   Cada componente importa `useLanguage()` e acessa `t.<section>`.
   Para adicionar um idioma, copie um bloco e traduza os valores.
══════════════════════════════════════════════════════════════ */
export const translations = {

  /* ── PORTUGUÊS BRASILEIRO ── */
  'pt-BR': {

    // Cabeçalho fixo: links de navegação e botão de agendamento
    header: {
      nav: [
        { href: '#inicio',   label: 'Início'   },
        { href: '#servicos', label: 'Serviços' },
        { href: '#galeria',  label: 'Galeria'  },
        { href: '#contato',  label: 'Contato'  },
      ],
      cta: 'Agendar',
    },

    // Seção hero (primeira tela): título principal, descrição e CTAs
    hero: {
      badge:     'Limpeza Profissional',
      title:     'Ambientes Limpos,',
      highlight: 'Vida Mais Leve',
      desc:      'Transformamos seu espaço com qualidade, confiança e atenção a cada detalhe. Agende agora e sinta a diferença.',
      cta1:      'Solicitar Orçamento',
      cta2:      'Enviar E-mail',
      // Badges flutuantes sobre a imagem do hero
      float1:    '100% Garantido',
      float2:    '5.0 Avaliação',
      float3:    'Pontualidade Total',
      scroll:    'Ver serviços',
    },

    // Cards de serviços (Residencial, Comercial, Pós-Obra)
    services: {
      badge:    'O que oferecemos',
      title:    'Nossos Serviços',
      subtitle: 'Soluções de limpeza profissional para cada necessidade, com qualidade garantida e atenção aos detalhes.',
      cta:      'Solicitar Serviço',
      items: [
        {
          title:       'Limpeza Residencial',
          description: 'Limpeza completa de casas e apartamentos com produtos de alta qualidade, cuidado nos detalhes e total segurança para sua família.',
          features:    ['Banheiros e cozinhas', 'Quartos e salas', 'Janelas e vidros', 'Organização geral'],
        },
        {
          title:       'Limpeza Comercial',
          description: 'Mantenha seu negócio impecável. Escritórios, salas de reunião e áreas comuns sempre limpos e organizados.',
          features:    ['Escritórios e salas', 'Banheiros corporativos', 'Recepção e halls', 'Limpeza periódica'],
        },
        {
          title:       'Limpeza Pós-Obra',
          description: 'Remoção completa de resíduos, poeira e manchas após reformas. Entregamos seu espaço pronto para uso imediato.',
          features:    ['Remoção de entulho', 'Limpeza de azulejos', 'Polimento de pisos', 'Limpeza profunda'],
        },
      ],
    },

    // Galeria de trabalhos (antes/depois) + perfil profissional
    gallery: {
      badge:           'Nossos Trabalhos',
      title:           'Galeria de Serviços',
      subtitle:        'Arraste o divisor para ver a transformação real de cada ambiente.',
      before:          'Antes',
      after:           'Depois',
      empty:           'Nenhum trabalho publicado ainda. Faça login para adicionar.',
      addBtn:          'Adicionar Trabalho',
      editProfile:     'Editar Perfil',
      verified:        'Profissional Verificada',
      yearsExp:        'anos de exp.',
      rating:          'avaliação',
      profileBadge:    'A Profissional',
      profileTitle:    'Conheça a Lidia',
      profileSubtitle: 'Dedicação, cuidado e excelência em cada serviço realizado.',
      // Perfil traduzido — exibido no card público conforme idioma
      profileTagline:     'Limpeza que transforma',
      profileBio:         'Profissional de limpeza com mais de 8 anos de experiência, dedicada a transformar ambientes em espaços impecáveis com cuidado e atenção a cada detalhe.',
      profileSpecialties: ['Limpeza Residencial', 'Limpeza Comercial', 'Limpeza Pós-Obra'],
    },

    // Formulário e canais de contato
    contact: {
      badge:        'Fale Conosco',
      title:        'Agende seu Serviço',
      subtitle:     'Entre em contato agora. Respondemos rapidamente com orçamento personalizado.',
      smsLabel:     'Mensagens (SMS)',
      smsSub:       'Enviar mensagem',
      emailLabel:   'E-mail',
      hoursLabel:   'Atendimento',
      hoursSub:     'Seg – Sáb: 8h às 18h',
      formTitle:    'Solicite um Orçamento',
      formSub:      'Preencha e entraremos em contato em breve.',
      nameLabel:    'Nome completo',
      namePH:       'Seu nome',
      phoneLabel:   'Telefone',
      phonePH:      '(617) 000-0000',
      serviceLabel: 'Tipo de serviço',
      servicePH:    'Selecione um serviço',
      serviceOpts:  ['Limpeza Residencial', 'Limpeza Comercial', 'Limpeza Pós-Obra', 'Limpeza Pesada'],
      submit:       'Enviar via Mensagens',
      // Monta o corpo da mensagem SMS ao submeter o formulário
      smsMsg: (name, svc) => `Olá! Meu nome é ${name} e tenho interesse no serviço de ${svc}.`,
    },

    // Rodapé: links, contato, copyright
    footer: {
      tagline:       'Ambientes limpos, vida mais leve. Serviços de limpeza profissional com qualidade e confiança.',
      navTitle:      'Navegação',
      servicesTitle: 'Serviços',
      contactTitle:  'Contato',
      hours:         'Seg - Sáb: 8h às 18h',
      location:      'Massachusetts, USA',
      messages:      'Mensagens / SMS',
      copyright:     (y) => `© ${y} Lidia House Clean. Todos os direitos reservados.`,
      credit:        'Feito com ♥ para ambientes impecáveis',
      serviceLinks:  ['Limpeza Residencial', 'Limpeza Comercial', 'Limpeza Pós-Obra', 'Limpeza Pesada'],
      navLinks: [
        { href: '#inicio',   label: 'Início'   },
        { href: '#servicos', label: 'Serviços' },
        { href: '#galeria',  label: 'Galeria'  },
        { href: '#contato',  label: 'Contato'  },
      ],
    },

    // Botão flutuante de SMS (canto inferior direito)
    float: {
      greeting: 'Olá! Posso te ajudar?',
      sub:      'Clique para enviar uma mensagem',
      smsBody:  'Olá! Gostaria de solicitar um orçamento.',
    },
  },

  /* ── ENGLISH (US) ── */
  'en-US': {

    header: {
      nav: [
        { href: '#inicio',   label: 'Home'     },
        { href: '#servicos', label: 'Services' },
        { href: '#galeria',  label: 'Gallery'  },
        { href: '#contato',  label: 'Contact'  },
      ],
      cta: 'Book Now',
    },

    hero: {
      badge:     'Professional Cleaning',
      title:     'Clean Spaces,',
      highlight: 'Lighter Life',
      desc:      'We transform your space with quality, trust, and attention to every detail. Book now and feel the difference.',
      cta1:      'Request a Quote',
      cta2:      'Send Email',
      float1:    '100% Guaranteed',
      float2:    '5.0 Rating',
      float3:    'Always on Time',
      scroll:    'See services',
    },

    services: {
      badge:    'What We Offer',
      title:    'Our Services',
      subtitle: 'Professional cleaning solutions for every need, with guaranteed quality and attention to detail.',
      cta:      'Request Service',
      items: [
        {
          title:       'Residential Cleaning',
          description: 'Complete cleaning of houses and apartments with premium products, careful attention to detail, and full safety for your family.',
          features:    ['Bathrooms & kitchens', 'Bedrooms & living rooms', 'Windows & glass', 'General organization'],
        },
        {
          title:       'Commercial Cleaning',
          description: 'Keep your business spotless. Offices, meeting rooms and common areas always clean and organized.',
          features:    ['Offices & meeting rooms', 'Corporate bathrooms', 'Reception & lobbies', 'Periodic cleaning'],
        },
        {
          title:       'Post-Construction Cleaning',
          description: 'Complete removal of debris, dust and stains after renovations. We deliver your space ready for immediate use.',
          features:    ['Debris removal', 'Tile & grout cleaning', 'Floor polishing', 'Deep cleaning'],
        },
      ],
    },

    gallery: {
      badge:           'Our Work',
      title:           'Service Gallery',
      subtitle:        'Drag the divider to see the real transformation of each space.',
      before:          'Before',
      after:           'After',
      empty:           'No jobs published yet. Log in to add your work.',
      addBtn:          'Add Job',
      editProfile:     'Edit Profile',
      verified:        'Verified Professional',
      yearsExp:        'yrs experience',
      rating:          'rating',
      profileBadge:    'The Professional',
      profileTitle:    'Meet Lidia',
      profileSubtitle: 'Dedication, care, and excellence in every service.',
      // Translated profile — displayed on the public card based on language
      profileTagline:     'Cleaning that transforms',
      profileBio:         'Cleaning professional with over 8 years of experience, dedicated to transforming spaces into spotless environments with care and attention to every detail.',
      profileSpecialties: ['Residential Cleaning', 'Commercial Cleaning', 'Post-Construction Cleaning'],
    },

    contact: {
      badge:        'Contact Us',
      title:        'Schedule Your Service',
      subtitle:     'Get in touch now. We respond quickly with a personalized quote.',
      smsLabel:     'Messages (SMS)',
      smsSub:       'Send a message',
      emailLabel:   'Email',
      hoursLabel:   'Business Hours',
      hoursSub:     'Mon – Sat: 8am to 6pm',
      formTitle:    'Request a Quote',
      formSub:      "Fill out the form and we'll get back to you shortly.",
      nameLabel:    'Full name',
      namePH:       'Your name',
      phoneLabel:   'Phone',
      phonePH:      '(617) 000-0000',
      serviceLabel: 'Service type',
      servicePH:    'Select a service',
      serviceOpts:  ['Residential Cleaning', 'Commercial Cleaning', 'Post-Construction Cleaning', 'Deep Cleaning'],
      submit:       'Send via Messages',
      smsMsg: (name, svc) => `Hello! My name is ${name} and I'm interested in ${svc}.`,
    },

    footer: {
      tagline:       'Clean spaces, lighter life. Professional cleaning services with quality and trust.',
      navTitle:      'Navigation',
      servicesTitle: 'Services',
      contactTitle:  'Contact',
      hours:         'Mon - Sat: 8am to 6pm',
      location:      'Massachusetts, USA',
      messages:      'Messages / SMS',
      copyright:     (y) => `© ${y} Lidia House Clean. All rights reserved.`,
      credit:        'Made with ♥ for spotless spaces',
      serviceLinks:  ['Residential Cleaning', 'Commercial Cleaning', 'Post-Construction Cleaning', 'Deep Cleaning'],
      navLinks: [
        { href: '#inicio',   label: 'Home'     },
        { href: '#servicos', label: 'Services' },
        { href: '#galeria',  label: 'Gallery'  },
        { href: '#contato',  label: 'Contact'  },
      ],
    },

    float: {
      greeting: 'Hello! Can I help you?',
      sub:      'Click to send a message',
      smsBody:  "Hello! I'd like to request a quote.",
    },
  },
}

/* ══════════════════════════════════════════════════════════════
   CONTEXT & PROVIDER
   - LanguageProvider: envolve o app inteiro; persiste em localStorage
   - useLanguage(): hook de acesso → desestruture { t, lang, toggle }
══════════════════════════════════════════════════════════════ */
const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() =>
    // Respeita preferência salva; padrão PT-BR
    localStorage.getItem('lhc_lang') || 'pt-BR'
  )

  const setLanguage = (l) => setLang(l)

  useEffect(() => {
    // Atualiza o atributo lang do HTML e salva preferência
    document.documentElement.lang = lang
    localStorage.setItem('lhc_lang', lang)
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
