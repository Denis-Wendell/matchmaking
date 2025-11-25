import React, { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../services/api'

const Contact = ({ onSubmit }) => {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // estado do form
  const [form, setForm] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: '',
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // animação on-scroll (similar ao Team)
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const contacts = [
    {
      icon: '✉️',
      title: 'E-mail',
      value: 'manaustechnojob@gmail.com',
      action: () => (window.location.href = 'mailto:manaustechnojob@gmail.com'),
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'from-blue-50 to-indigo-100',
    },
    
    {
      icon: '📍',
      title: 'Endereço',
      value: 'Manaus, AM • Brasil',
      action: null,
      gradient: 'from-purple-500 to-pink-600',
      bg: 'from-purple-50 to-pink-100',
    },
  ];

  const setField = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Informe seu nome';
    if (!form.email.trim()) e.email = 'Informe seu e-mail';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'E-mail inválido';
    if (!form.assunto.trim()) e.assunto = 'Informe um assunto';
    if (!form.mensagem.trim()) e.mensagem = 'Escreva sua mensagem';
    return e;
    };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setStatus({ type: '', msg: '' });
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSending(true);
    try {
      // 1) Se o pai passar um onSubmit, usamos ele
      if (typeof onSubmit === 'function') {
        await onSubmit(form);
      } else {
        // 2) Padrão: tenta um endpoint local. Ajuste se já tiver um backend.
        const resp = await fetch(`${API_BASE_URL}/api/contato`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!resp.ok) throw new Error(await resp.text());
      }

      setStatus({ type: 'success', msg: 'Mensagem enviada com sucesso! 🎉' });
      setForm({ nome: '', email: '', assunto: '', mensagem: '' });
    } catch (err) {
      console.error(err);
      // fallback opcional: mailto com corpo preenchido
      setStatus({
        type: 'error',
        msg:
          'Não foi possível enviar agora. Você pode tentar novamente ou clicar aqui para enviar por e-mail.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 bg-gradient-to-br from-gray-50 to-slate-100 relative overflow-hidden "
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none ">
        <div className="absolute top-0 left-16 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-8 w-72 h-72 bg-gradient-to-r from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fale <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Conosco</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Dúvidas, sugestões ou parcerias? Envie uma mensagem — responderemos o quanto antes.
          </p>
        </div>

        {/* Grid: cards de contato + formulário */}
        <div
          className={`
            grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white p-8 md:p-12 rounded-3xl shadow-xl
            transform transition-all duration-700 ease-out 
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          {/* Cards de contato */}
          <div className="space-y-6">
            {contacts.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={c.action || undefined}
                className={`
                  group relative w-full text-left bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden
                  transition-all duration-500 p-6
                `}
              >
                {/* Funda gradiente ao hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />
                {/* Borda gradiente ao hover */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${c.gradient} p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                >
                  <div className="bg-white rounded-3xl w-full h-full"></div>
                </div>

                <div className="relative z-10 flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-xl text-white shadow-md`}
                  >
                    {c.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold uppercase tracking-wider bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                      {c.title}
                    </p>
                    <p className="text-gray-800 mt-1 font-medium">{c.value}</p>
                    {c.action && (
                      <span className="text-sm text-blue-600 group-hover:text-blue-700 inline-flex items-center mt-2">
                        Abrir <span className="ml-1">↗</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="relative bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
            >
              {/* Borda animada */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 to-blue-600 p-0.5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-white rounded-3xl w-full h-full" />
              </div>

              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.nome ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'
                      }`}
                      placeholder="Seu nome"
                      value={form.nome}
                      onChange={setField('nome')}
                    />
                    {errors.nome && <p className="text-red-600 text-xs mt-1">{errors.nome}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'
                      }`}
                      placeholder="voce@email.com"
                      value={form.email}
                      onChange={setField('email')}
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.assunto ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'
                      }`}
                      placeholder="Sobre o quê é sua mensagem?"
                      value={form.assunto}
                      onChange={setField('assunto')}
                    />
                    {errors.assunto && <p className="text-red-600 text-xs mt-1">{errors.assunto}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                    <textarea
                      rows={5}
                      className={`w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.mensagem ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'
                      }`}
                      placeholder="Conte-nos como podemos ajudar"
                      value={form.mensagem}
                      onChange={setField('mensagem')}
                    />
                    {errors.mensagem && <p className="text-red-600 text-xs mt-1">{errors.mensagem}</p>}
                  </div>
                </div>

                {/* Status */}
                {status.msg && (
                  <div
                    className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                      status.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {status.msg}{' '}
                    {status.type === 'error' && (
                      <a
                        href={`mailto:contato@seudominio.com?subject=${encodeURIComponent(
                          form.assunto || 'Contato'
                        )}&body=${encodeURIComponent(
                          `Olá, meu nome é ${form.nome} (${form.email}).\n\n${form.mensagem}`
                        )}`}
                        className="underline"
                      >
                        Enviar por e-mail
                      </a>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all"
                  >
                    {sending ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
                        Enviando…
                      </>
                    ) : (
                      'Enviar mensagem'
                    )}
                  </button>

                  <span className="text-gray-500 text-sm">
                    Respondemos em até 1 dia útil ⏱️
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
