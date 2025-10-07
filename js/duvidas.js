// Função para abrir URL em nova aba/guia
function openInNewTab(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

const msgDuvida = 'https://wa.me/5561982205427?text=Olá, gostaria de tirar dúvidas!'
const btn = document.querySelector('#btnWhatsApp');

btn.addEventListener('click', () => {
  openInNewTab(msgDuvida);
});