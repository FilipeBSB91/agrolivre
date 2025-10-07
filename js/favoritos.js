// Função para carregar e exibir os produtos favoritos
function carregarFavoritos() {
    // Recuperar lista de IDs dos favoritos do localStorage
    var favoritosIds = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    // Recuperar todos os produtos do localStorage
    var produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    
    // Elemento onde os favoritos serão renderizados
    var listaFavoritos = $("#listaFavoritos");
    
    // Limpar lista antes de adicionar novos itens
    listaFavoritos.empty();
    
    if (favoritosIds.length === 0) {
        // Se não há favoritos, mostrar mensagem
        listaFavoritos.html(`
            <div class="text-align-center padding-top">
                <i class="material-symbols-outlined" style="font-size: 48px; color: #ccc; margin-bottom: 16px;">favorite</i>
                <p>Nenhum produto favoritado ainda</p>
                <a href="/index/" class="button button-fill color-blue">Explorar Produtos</a>
            </div>
        `);
        return;
    }
    
    // Filtrar produtos que estão nos favoritos
    var produtosFavoritos = produtos.filter(function(produto) {
        return favoritosIds.includes(produto.id);
    });
    
    // Renderizar cada produto favorito
    produtosFavoritos.forEach(function(produto) {
        var itemFavorito = `
            <div class="item-carrinho" data-produto-id="${produto.id}">
                <div class="area-img">
                    <img src="${produto.imagem}" alt="${produto.nome}">
                </div>
                <div class="area-details">
                    <div class="sup">
                        <span class="name-prod">
                            ${produto.nome}
                        </span>
                        <a class="fav-item remover-favorito" href="#" data-id="${produto.id}">
                            <i class="material-symbols-outlined">favorite</i>
                        </a>
                    </div>
                    <div class="middle">
                        <span>${produto.categoria}</span>
                    </div>
                    <div class="preco-quantidade">
                        <span>${produto.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                    </div>
                </div>
            </div>
        `;
        
        listaFavoritos.append(itemFavorito);
    });
    
    // Configurar evento de clique para remover favoritos
    $(".remover-favorito").on('click', function(e) {
        e.preventDefault();
        var produtoId = parseInt($(this).data('id'));
        removerFavorito(produtoId);
    });
}

// ... o resto do código permanece igual ...

// Função para remover produto dos favoritos
function removerFavorito(produtoId) {
    var favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    var index = favoritos.indexOf(produtoId);
    
    if (index !== -1) {
        // Remover dos favoritos
        favoritos.splice(index, 1);
        localStorage.setItem('favoritos', JSON.stringify(favoritos));
        
        // Remover visualmente o item da lista
        $(`[data-produto-id="${produtoId}"]`).remove();
        
        // Mostrar mensagem de feedback
        var toast = app.toast.create({
            text: 'Produto removido dos favoritos',
            position: 'center',
            closeTimeout: 1500,
        });
        toast.open();
        
        // Se não há mais favoritos, mostrar mensagem
        if (favoritos.length === 0) {
            carregarFavoritos(); // Recarregar para mostrar mensagem de lista vazia
        }
    }
}

// Função para carregar produtos do backend.json (caso não estejam no localStorage)
function carregarProdutosDoBackend() {
    return new Promise(function(resolve, reject) {
        // Verificar se já existem produtos no localStorage
        var produtos = JSON.parse(localStorage.getItem('produtos'));
        
        if (produtos && produtos.length > 0) {
            resolve(produtos);
            return;
        }
        
        // Se não existir, carregar do arquivo backend.json
        $.getJSON('js/backend.json')
            .done(function(data) {
                // Salvar no localStorage para uso futuro
                localStorage.setItem('produtos', JSON.stringify(data));
                resolve(data);
            })
            .fail(function() {
                console.error('Erro ao carregar produtos do backend.json');
                reject('Erro ao carregar produtos');
            });
    });
}

// Quando a página carregar
$(document).ready(function() {
    // Primeiro carregar os produtos, depois os favoritos
    carregarProdutosDoBackend()
        .then(function() {
            carregarFavoritos();
        })
        .catch(function(error) {
            console.error(error);
            // Tentar carregar favoritos mesmo com erro (usando localStorage existente)
            carregarFavoritos();
        });
});

// Recarregar favoritos quando a página for exibida (para Framework7)
$(document).on('page:init', '.page[data-name="fav"]', function() {
    carregarFavoritos();
});