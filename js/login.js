// =============================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// =============================================

const CONFIG = {
    GOOGLE_CLIENT_ID: 'SEU_CLIENT_ID_AQUI', // Substitua pelo seu Client ID real
    AUTO_SELECT: false,
    CANCEL_ON_TAP_OUTSIDE: true
};

// =============================================
// FUNÇÕES PRINCIPAIS DO GOOGLE SIGN-IN
// =============================================

/**
 * Inicializa o Google Sign-In
 */
function initializeGoogleSignIn() {
    console.log('🚀 Inicializando Google Sign-In...');
    
    if (typeof google === 'undefined') {
        console.error('❌ Google Sign-In não disponível');
        mostrarErroGoogleSignIn();
        return;
    }
    
    try {
        google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: CONFIG.AUTO_SELECT,
            cancel_on_tap_outside: CONFIG.CANCEL_ON_TAP_OUTSIDE
        });
        
        // Renderizar botão customizado
        renderGoogleSignInButton();
        
        // Oferecer prompt automático em alguns casos
        google.accounts.id.prompt();
        
        console.log('✅ Google Sign-In inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Google Sign-In:', error);
        mostrarErroGoogleSignIn();
    }
}

/**
 * Renderiza o botão do Google Sign-In
 */
function renderGoogleSignInButton() {
    google.accounts.id.renderButton(
        document.getElementById('googleLogin'),
        {
            theme: 'filled_blue',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'pill'
        }
    );
}

/**
 * Manipula a resposta do Google Sign-In
 * @param {object} response - Resposta do Google
 */
function handleGoogleSignIn(response) {
    console.log('📨 Resposta do Google recebida');
    
    try {
        // Mostrar loading
        mostrarLoading(true);
        
        // Decodificar a resposta JWT
        const userData = decodeJWTResponse(response.credential);
        
        console.log('👤 Dados do usuário:', userData);
        
        // Validar dados do usuário
        if (!validarDadosUsuario(userData)) {
            throw new Error('Dados do usuário inválidos');
        }
        
        // Salvar dados do usuário
        salvarDadosUsuario(userData);
        
        // Mostrar sucesso e redirecionar
        mostrarSucessoLogin(userData.name);
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        mostrarErroLogin('Erro ao processar login. Tente novamente.');
    } finally {
        // Esconder loading
        mostrarLoading(false);
    }
}

// =============================================
// FUNÇÕES DE UTILIDADE
// =============================================

/**
 * Decodifica a resposta JWT do Google
 * @param {string} token - Token JWT
 * @returns {object} Dados do usuário
 */
function decodeJWTResponse(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('❌ Erro ao decodificar JWT:', error);
        throw new Error('Falha ao decodificar resposta do Google');
    }
}

/**
 * Valida os dados do usuário recebidos do Google
 * @param {object} userData - Dados do usuário
 * @returns {boolean}
 */
function validarDadosUsuario(userData) {
    const camposObrigatorios = ['name', 'email', 'sub'];
    
    for (const campo of camposObrigatorios) {
        if (!userData[campo]) {
            console.error(`❌ Campo obrigatório faltando: ${campo}`);
            return false;
        }
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        console.error('❌ Email inválido:', userData.email);
        return false;
    }
    
    return true;
}

/**
 * Salva os dados do usuário no localStorage
 * @param {object} userData - Dados do usuário
 */
function salvarDadosUsuario(userData) {
    const userSession = {
        loggedIn: true,
        provider: 'google',
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        sub: userData.sub,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(userSession));
    console.log('💾 Dados do usuário salvos no localStorage');
}

// =============================================
// FUNÇÕES DE AUTENTICAÇÃO
// =============================================

/**
 * Verifica se o usuário está logado
 * @returns {boolean}
 */
function checkLoginStatus() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        return !!(user && user.loggedIn);
    } catch (error) {
        console.error('❌ Erro ao verificar status de login:', error);
        return false;
    }
}

/**
 * Faz logout do usuário
 */
function logout() {
    try {
        // Limpar dados do localStorage
        localStorage.removeItem('user');
        
        // Se foi login com Google, fazer logout do Google também
        if (typeof google !== 'undefined') {
            google.accounts.id.disableAutoSelect();
            google.accounts.id.revoke(localStorage.getItem('email'), done => {
                console.log('🔒 Credenciais do Google revogadas');
            });
        }
        
        console.log('👋 Logout realizado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
    }
}

/**
 * Obtém informações do usuário logado
 * @returns {object}
 */
function getUserInfo() {
    try {
        return JSON.parse(localStorage.getItem('user')) || { loggedIn: false };
    } catch (error) {
        console.error('❌ Erro ao obter informações do usuário:', error);
        return { loggedIn: false };
    }
}

// =============================================
// FUNÇÕES DE UI E FEEDBACK
// =============================================

/**
 * Mostra/oculta estado de loading
 * @param {boolean} mostrar - Se deve mostrar o loading
 */
function mostrarLoading(mostrar) {
    const $botao = $('#googleLogin');
    
    if (mostrar) {
        $botao.addClass('button-loading').prop('disabled', true);
        $botao.find('.google-button-content span').text('Entrando...');
    } else {
        $botao.removeClass('button-loading').prop('disabled', false);
        $botao.find('.google-button-content span').text('Entrar com Google');
    }
}

/**
 * Mostra mensagem de sucesso no login
 * @param {string} nome - Nome do usuário
 */
function mostrarSucessoLogin(nome) {
    app.dialog.alert(
        `Bem-vindo, ${nome}! 🎉`, 
        'Login realizado com sucesso', 
        function() {
            // Redirecionar para a página inicial
            app.views.main.router.navigate('/index/');
        }
    );
}

/**
 * Mostra mensagem de erro no login
 * @param {string} mensagem - Mensagem de erro
 */
function mostrarErroLogin(mensagem) {
    app.dialog.alert(mensagem, 'Erro no Login');
}

/**
 * Mostra erro quando Google Sign-In não está disponível
 */
function mostrarErroGoogleSignIn() {
    const $botao = $('#googleLogin');
    $botao.prop('disabled', true)
          .css('opacity', '0.6')
          .find('.google-button-content span')
          .text('Google Sign-In Indisponível');
    
    app.dialog.alert(
        'O Google Sign-In não está disponível no momento. Verifique sua conexão ou tente novamente mais tarde.',
        'Serviço Indisponível'
    );
}

// =============================================
// INICIALIZAÇÃO E EVENTOS
// =============================================

/**
 * Inicializa a página de login
 */
function inicializarPaginaLogin() {
    console.log('🔐 Inicializando página de login...');
    
    // Verificar se usuário já está logado
    if (checkLoginStatus()) {
        console.log('ℹ️ Usuário já está logado, redirecionando...');
        app.views.main.router.navigate('/index/');
        return;
    }
    
    // Configurar Google Sign-In
    if (typeof google !== 'undefined') {
        // Pequeno delay para garantir que o DOM está pronto
        setTimeout(initializeGoogleSignIn, 500);
    } else {
        // Tentar carregar novamente se não estiver disponível
        setTimeout(() => {
            if (typeof google !== 'undefined') {
                initializeGoogleSignIn();
            } else {
                mostrarErroGoogleSignIn();
            }
        }, 2000);
    }
}

// =============================================
// EVENT LISTENERS
// =============================================

// Quando o documento estiver pronto
$(document).ready(function() {
    console.log('📄 DOM carregado - Login.js');
});

// Framework7 - Quando a página de login é carregada
$(document).on('page:init', '.page[data-name="login"]', function(e) {
    console.log('🎯 Página de login carregada pelo Framework7');
    inicializarPaginaLogin();
});

// Quando a página se torna visível
$(document).on('page:afterin', '.page[data-name="login"]', function() {
    console.log('👀 Página de login visível');
});

// Quando a página é deixada
$(document).on('page:beforeout', '.page[data-name="login"]', function() {
    console.log('👋 Saindo da página de login');
});

// =============================================
// EXPORTAÇÕES PARA USO EM OUTROS ARQUIVOS
// =============================================

// Para usar em outras páginas - verificar autenticação
function requireAuth() {
    if (!checkLoginStatus()) {
        app.views.main.router.navigate('/login/');
        return false;
    }
    return true;
}

// Debug: Verificar se o script está carregando
console.log('✅ login.js carregado com sucesso');

// Adicionar funções ao escopo global para debug
window.loginUtils = {
    checkLoginStatus,
    getUserInfo,
    logout,
    requireAuth
};