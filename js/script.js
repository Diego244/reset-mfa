// Espera o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reset-form');
  const mfaSection = document.getElementById('mfa-section');
  const mfaInput = document.getElementById('mfa-code');
  const verifyBtn = document.getElementById('verify-btn');
  const status = document.getElementById('status');
  const emailInput = document.getElementById('email');
  const showLogsBtn = document.getElementById('show-logs');

  let generatedCode = '';
  let attempts = 3; // Limite de tentativas
  let submitBtn = form.querySelector('button[type="submit"]');

  // Geração do código MFA
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Gera um código MFA aleatório de 6 dígitos
    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Código MFA:', generatedCode); // Simulação de envio

    // Salva data da solicitação
    localStorage.setItem('lastResetRequest', new Date().toISOString());

    // Mostra a seção de validação
    mfaSection.classList.remove('hidden');
    status.textContent = '';
    status.className = 'status';

    // Desabilita botão para evitar spam e zera tentativas
    submitBtn.disabled = true;
    setTimeout(() => { submitBtn.disabled = false; }, 30000);

    // Código expira após 30 segundos
    setTimeout(() => { generatedCode = null; }, 30000);

    attempts = 3;
    verifyBtn.disabled = false;
  });

  // Validação do código MFA
  verifyBtn.addEventListener('click', () => {
    const success = mfaInput.value === generatedCode;

    // Feedback visual
    status.textContent = success
      ? '✅ Senha resetada com sucesso!'
      : `❌ Código inválido. Tentativas restantes: ${--attempts}`;
    status.className = 'status ' + (success ? 'success' : 'error');

    // Log da tentativa
    logReset(emailInput.value, success);

    // Bloqueia botão após 3 falhas
    if (!success && attempts <= 0) {
      status.textContent = '🚫 Muitas tentativas. Reinicie o processo.';
      verifyBtn.disabled = true;
    }
  });

  // Mostra logs em formato modal (simplificado)
  showLogsBtn.addEventListener('click', () => {
    const logs = JSON.parse(localStorage.getItem('resetLogs')) || [];
    const content = logs.map(log => 
      `${log.email} | ${log.date} | IP: ${log.ip} | ${log.success ? '✅' : '❌'}`
    ).join('\n');

    // Exibe como prompt com opção de exportar
    if (confirm(content + '\n\nDeseja exportar os logs?')) {
      exportLogs(logs);
    }
  });

  // Salva logs localmente
  function logReset(email, success) {
    const logs = JSON.parse(localStorage.getItem('resetLogs')) || [];
    logs.push({
      email,
      success,
      ip: '192.168.0.' + Math.floor(Math.random() * 255),
      date: new Date().toLocaleString()
    });
    localStorage.setItem('resetLogs', JSON.stringify(logs));
  }

  // Exporta os logs como JSON
  function exportLogs(logs) {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reset_logs.json";
    link.click();
  }
});
