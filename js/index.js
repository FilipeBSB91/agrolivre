// Função para renderizar os produtos
function renderizarProdutos(produtos) {
    $("#produtos").empty();

    produtos.forEach(produto => {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        const isFavorito = favoritos.includes(produto.id);
        const iconFavorito = isFavorito ? 'favorite' : 'favorite_border';

        $("#produtos").append(`
            <div class="item-card">
                <a data-id="${produto.id}" href="/descricao/" class="item">
                    <div class="img-container">
                        <img src="${produto.imagem}" alt="${produto.nome}">
                    </div>
                    <div class="name-rating">
                        <h2 class="product-title">${produto.nome}</h2>
                        <h3 class="product-price">
                            ${produto.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                        </h3>
                    </div>
                </a>
                <button class="btn-favorito-card ${isFavorito ? 'active' : ''}" data-id="${produto.id}">
                    <i class="material-symbols-outlined">${iconFavorito}</i>
                </button>
            </div>
        `);
    });

    configurarEventos();
}

// Configura todos os eventos
function configurarEventos() {
    $(document)
        .off('click', '.item')
        .on('click', '.item', function(e){
            localStorage.setItem('descricao', $(this).data('id'));
            app.views.main.router.navigate('/descricao/');
        })
        .off('click', '.btn-favorito-card')
        .on('click', '.btn-favorito-card', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const produto = JSON.parse(localStorage.getItem('produtos')).find(p => p.id == $(this).data('id'));
            produto && toggleFavorito(produto, $(this));
            return false;
        });
}

// Alternar favorito
function toggleFavorito(produto, btnElement) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    const index = favoritos.indexOf(produto.id);
    
    if (index === -1) {
        favoritos.push(produto.id);
        btnElement.addClass('active').find('i').text('favorite');
        mostrarToast(produto.nome + ' adicionado aos favoritos');
    } else {
        favoritos.splice(index, 1);
        btnElement.removeClass('active').find('i').text('favorite_border');
        mostrarToast(produto.nome + ' removido dos favoritos');
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    $(document).trigger('favoritosAtualizados');
}

// Mostrar toast
function mostrarToast(mensagem) {
    app?.toast?.create({
        text: mensagem,
        position: 'center',
        closeTimeout: 1500,
    }).open();
}

// Inicializar Swipers
function inicializarSwipers() {
    new Swiper('.mySwiper', {
        spaceBetween: 30,
        centeredSlides: true,
        autoplay: { delay: 2500, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
    });

    new Swiper('.categorias', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        freeMode: true,
    });
}

// Configurar filtros
function configurarFiltros() {
    // Remove eventos anteriores para evitar duplicação
    $(".filter-btn").off('click');
    
    // Adiciona novos eventos
    $(".filter-btn").on('click', function(){
        $(".filter-btn").removeClass('active');
        $(this).addClass('active');
        filtrarPorCategoria($(this).text());
    });
}

// Função para debug - verificar categorias dos produtos
function verificarCategorias() {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const categoriasUnicas = [...new Set(produtos.map(p => p.categoria))];
    
    console.log('Categorias disponíveis nos produtos:', categoriasUnicas);
    console.log('Total de produtos:', produtos.length);
    
    // Mostrar no console cada produto e sua categoria
    produtos.forEach(produto => {
        console.log(`Produto: ${produto.nome} | Categoria: ${produto.categoria}`);
    });
}

// Filtrar por categoria - CORRIGIDA com mapeamento correto
function filtrarPorCategoria(categoria) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    console.log('Categoria selecionada:', categoria);
    
    // Limpa a busca quando filtrar por categoria
    $("#search").val('');
    
    if (categoria === 'Tudo') {
        renderizarProdutos(produtos);
    } else {
        // Mapeamento correto das categorias
        const mapeamentoCategorias = {
            'Tudo': 'Tudo',
            'Frutas': 'Frutas',
            'Grãos': 'Grãos',
            'Legumes': 'Legumes',
            'Temperos': 'Temperos',
            'Verduras': 'Verduras',
            'Castanhas': 'Castanhas' // Adicionando a categoria que existe nos produtos
        };
        
        const categoriaFiltro = mapeamentoCategorias[categoria];
        
        if (!categoriaFiltro) {
            console.log('Categoria não mapeada:', categoria);
            $("#produtos").html(`
                <div class="text-align-center padding-top">
                    <img src="img/vazio.jpg" style="border-radius: 50%; width: 200px; height: 200px; object-fit: cover; margin-bottom: 20px;">
                    <p>Categoria "${categoria}" não encontrada</p>
                </div>
            `);
            return;
        }
        
        const filtrados = produtos.filter(p => p.categoria === categoriaFiltro);
        
        console.log(`Produtos na categoria "${categoriaFiltro}":`, filtrados);
        
        if (filtrados.length === 0) {
            $("#produtos").html(`
                <div class="text-align-center padding-top">
                    <img src="img/vazio.jpg" style="border-radius: 50%; width: 200px; height: 200px; object-fit: cover; margin-bottom: 20px;">
                    <p>Nenhum produto encontrado na categoria "${categoria}"</p>
                    <p><small>Tente outra categoria ou verifique se há produtos cadastrados.</small></p>
                </div>
            `);
        } else {
            renderizarProdutos(filtrados);
        }
    }
}

// Configurar busca
function configurarBusca() {
    $("#search").off('input').on('input', function(){
        const termo = $(this).val().toLowerCase();
        
        if (!termo) {
            // Quando limpa a busca, volta para a categoria ativa
            const categoriaAtiva = $(".filter-btn.active").text();
            filtrarPorCategoria(categoriaAtiva);
            return;
        }
        
        const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
        
        // Busca flexível - remove acentos
        const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const termoNormalizado = normalizar(termo);
        
        const resultados = produtos.filter(p => 
            normalizar(p.nome).includes(termoNormalizado) || 
            normalizar(p.categoria).includes(termoNormalizado)
        );
        
        if (resultados.length === 0) {
            $("#produtos").html(`
                <div class="text-align-center padding-top">
                    <p>Nenhum produto encontrado para "${termo}"</p>
                </div>
            `);
        } else {
            renderizarProdutos(resultados);
        }
    });
}

// Atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const count = carrinho.reduce((total, item) => total + item.quantidade, 0);
    $('.btn-cart').attr('data-count', count);
}

// Carregar produtos
function carregarProdutos() {
    const produtosExistentes = JSON.parse(localStorage.getItem('produtos'));
    
    // DEBUG: Verificar categorias
    verificarCategorias();
    
    if (produtosExistentes?.length) {
        inicializarSwipers();
        
        setTimeout(() => {
            configurarFiltros();
            configurarBusca();
            renderizarProdutos(produtosExistentes);
        }, 100);
    } else {
        fetch('js/backend.json')
            .then(r => r.json())
            .then(data => {
                localStorage.setItem('produtos', JSON.stringify(data));
                
                // DEBUG: Verificar categorias após carregar
                verificarCategorias();
                
                inicializarSwipers();
                
                setTimeout(() => {
                    configurarFiltros();
                    configurarBusca();
                    renderizarProdutos(data);
                }, 100);
            })
            .catch(error => {
                console.error('Erro ao carregar produtos:', error);
                $("#produtos").html(`
                    <div class="text-align-center padding-top">
                        <p>Erro ao carregar produtos. Verifique o arquivo backend.json</p>
                    </div>
                `);
            });
    }
    
    setTimeout(atualizarContadorCarrinho, 300);
}

// Sincronizar favoritos
function sincronizarFavoritos() {
    $(".btn-favorito-card").each(function() {
        const isFavorito = (JSON.parse(localStorage.getItem('favoritos')) || [])
            .some(fav => fav == $(this).data('id'));
        
        $(this).toggleClass('active', isFavorito)
               .find('i').text(isFavorito ? 'favorite' : 'favorite_border');
    });
}

// Função para abrir URL em nova aba/guia
function openInNewTab(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Inicialização
$(document)
    .on('page:init', '.page[data-name="index"]', function() {
        setTimeout(carregarProdutos, 300);
    })
    .on('page:afterin', '.page[data-name="index"]', function() {
        atualizarContadorCarrinho();
        $(document).trigger('favoritosAtualizados');
        
        // Reconfigura os filtros quando a página é carregada
        setTimeout(configurarFiltros, 200);
    })
    .on('favoritosAtualizados', sincronizarFavoritos)
    .ready(function() {
        setTimeout(function() {
            if (!window.f7Initialized) {
                carregarProdutos();
            }
        }, 500);
    });