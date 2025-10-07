//Recuperar ID localStorage
var id = parseInt(localStorage.getItem('descricao'));

var produtos = JSON.parse(localStorage.getItem('produtos'));

var item = produtos.find(produto => produto.id === id);

    if(item){
        console.log('Produto encontrado:', item);

//Popular dados de descrição
$("#imagem-descricao").attr('src', item.imagem);
$("#nome-descricao").html( item.nome);
$("#rating-descricao").html(item.rating);
$("#like-descricao").html(item.likes);
$("#reviews-descricao").html(item.reviews + ' reviews');
$("#texto-descricao").html(item.descricao);
$("#preco-descricao").html(item.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));

var tabelaDescricao = $("#tabDescricao");

item.detalhes.forEach(detalhe =>{

    var linha = `
    <tr>
        <td>${detalhe.referencia}</td>

        <td>${detalhe.detalhe}</td>
    </tr>

    `;

    tabelaDescricao.append(linha);
})

// VERIFICAR E ATUALIZAR ESTADO DO FAVORITO - CORRIGIDO
var favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
// Converter para número para comparação correta
var index = favoritos.findIndex(fav => parseInt(fav) === item.id);

if (index !== -1) {
    $("#btnFavorito")
        .text('favorite')
        .addClass('active')
        .css('color', '#19c463')
        .css('font-variation-settings', "'FILL' 1");
    console.log('Já é favorito - ícone preenchido');
} else {
    $("#btnFavorito")
        .text('favorite_border')
        .removeClass('active')
        .css('color', '#666')
        .css('font-variation-settings', "'FILL' 0");
    console.log('Não é favorito - ícone vazio');
}

// CONFIGURAR CLIQUE DO FAVORITO - CORRIGIDO COM STYLE INLINE
$(".btn-favorito").on('click', function(e) {
    e.preventDefault();
    var favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    
    // Usar findIndex com parseInt para compatibilidade
    var index = favoritos.findIndex(fav => parseInt(fav) === item.id);
    
    if (index === -1) {
        // Adicionar aos favoritos
        favoritos.push(item.id);
        $("#btnFavorito")
            .text('favorite')
            .addClass('active')
            .css('color', '#19c463')
            .css('font-variation-settings', "'FILL' 1");
        console.log('Adicionado aos favoritos');
        
        var toast = app.toast.create({
            text: item.nome + ' adicionado aos favoritos',
            position: 'center',
            closeTimeout: 1500,
        });
        toast.open();
    } else {
        // Remover dos favoritos
        favoritos.splice(index, 1);
        $("#btnFavorito")
            .text('favorite_border')
            .removeClass('active')
            .css('color', '#666')
            .css('font-variation-settings', "'FILL' 0");
        console.log('Removido dos favoritos');
        
        var toast = app.toast.create({
            text: item.nome + ' removido dos favoritos',
            position: 'center',
            closeTimeout: 1500,
        });
        toast.open();
    }
    
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    window.dispatchEvent(new CustomEvent('favoritosAtualizados'));
});

// Sincronizar quando receber eventos de outras páginas
window.addEventListener('favoritosAtualizados', function() {
    var favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
    var index = favoritos.findIndex(fav => parseInt(fav) === item.id);
    
    if (index !== -1) {
        $("#btnFavorito")
            .text('favorite')
            .addClass('active')
            .css('color', '#19c463')
            .css('font-variation-settings', "'FILL' 1");
    } else {
        $("#btnFavorito")
            .text('favorite_border')
            .removeClass('active')
            .css('color', '#666')
            .css('font-variation-settings', "'FILL' 0");
    }
});

    }else{
        console.log('Produto não encontrado');
    }

    //Função para adicionar ao carrinho
   var carrinho = JSON.parse(localStorage.getItem('carrinho')) || []

    function addCarrinho(item, quantidade){
        var itemCarrinho = carrinho.find(c => c.item.id === item.id);

        if(itemCarrinho){
            itemCarrinho.quantidade += quantidade;
            itemCarrinho.total_item = itemCarrinho.quantidade * item.preco;
        }else{
            carrinho.push({
                item: item,
                quantidade: quantidade,
                total_item: quantidade * item.preco
            })
        }

        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

    //CLICAR EM ADICIONAR A SACOLA
    $(".add-cart").on('click', function(){

    //ADICIONAR
        addCarrinho(item, 1);
       
        var toastCenter = app.toast.create({
            text: `${item.nome} adicionado a sacola`,
            position: 'center',
            closeTimeout: 2000,
          });

        toastCenter.open();
    });