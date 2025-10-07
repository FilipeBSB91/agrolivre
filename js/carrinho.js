//app.dialog.alert('teste!');
// Função para abrir URL em nova aba/guia
function openInNewTab(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

//app.dialog.alert('teste!');
var localCarrinho = localStorage.getItem('carrinho');





var localCarrinho = localStorage.getItem('carrinho');

var url = 'https://wa.me/5561982205427';
var btnPedido = document.querySelector('#btnPedido');



btnPedido.addEventListener('click', () => {
    if (carrinho && carrinho.length > 0) {
        let mensagem = "Olá, gostaria de fazer o seguinte pedido:\n\n";

        let totalCarrinho = 0;

        carrinho.forEach((itemCarrinho, index) => {
            let nome = itemCarrinho.item.nome;
            let qtd = itemCarrinho.quantidade;
            let preco = itemCarrinho.item.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
            let subtotal = itemCarrinho.total_item.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

            mensagem += `${index+1}. ${nome}  \nQtd: ${qtd} | Preço: ${preco} | Subtotal: ${subtotal}\n\n`;

            totalCarrinho += itemCarrinho.total_item;
        });

        mensagem += `\n*Total: ${totalCarrinho.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}*`;

        var url = "https://wa.me/5561982205427?text=" + encodeURIComponent(mensagem);

        openInNewTab(url);
    } else {
        alert("Seu carrinho está vazio!");
    }
});




if(localCarrinho){
    var carrinho = JSON.parse(localCarrinho);
    if(carrinho.length > 0){
        //tem itens, renderiza e soma total
        renderizarCarrinho();
        calcularTotal();
    }else{
    carrinhoVazio();
    } 
} else {
carrinhoVazio();
    }



function renderizarCarrinho(){
$("#listaCarrinho").empty();


$.each(carrinho, function(index, itemCarrinho){

    var itemDiv = `
    
                        <!--ITEM DO CARRINHO-->
                        <div class="item-carrinho">
                            <div class="area-img">
                                <img src="${itemCarrinho.item.imagem}">
                            </div>
                            <div class="area-details">
                                <div class="sup">
                                    <span class="name-prod">
                                    ${itemCarrinho.item.nome}
                                    </span>
                                    <a data-index="${index}" class="delete-item" href="#">
                                        <i class="ri-close-large-fill"></i>
                                    </a>
                                </div>
                                <div class="middle">
                                    <span>${itemCarrinho.item.categoria}</span>
                                </div>
                                <div class="preco-quantidade">
                                    <span>${itemCarrinho.item.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                                    <div class="count">
                                        <a class="minus" data-index="${index}" href="#">-</a>
                                        <input readonly class="qtd-item" type="text" value="${itemCarrinho.quantidade}">
                                        <a class="plus" data-index="${index}" href="#">+</a>
                                    </div>
                                </div>
                            </div>
                        </div>  
    `;
    $("#listaCarrinho").append(itemDiv);
});
}


function calcularTotal(){
    var totalCarrinho = 0;
    $.each(carrinho, function(index, itemCarrinho){
        totalCarrinho += itemCarrinho.total_item;
    });
    
    $("#subtotal").html(totalCarrinho.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
}



function carrinhoVazio(){
    console.log('Carrinho vazio!');
    $("#listaCarrinho").empty();

$("#toolbarTotais").addClass('display-none');
$("#toolbarCheckout").addClass('display-none');

$("#listaCarrinho").html(`
    <div class="text-align-center">
        <img src="img/vazio.jpg" style="border-radius: 50%; width: 300px; height: 300px; object-fit: cover;">
        <br><h1><span>Nenhum produto! <br> </span><h1>
    </div>`);
};


$("#esvaziar").on('click', function(){
    app.dialog.confirm('Tem certeza?', '<strong>ESVAZIAR</strong>', function(){

        //apaga carrinho no localStorage
        localStorage.removeItem('carrinho');
        app.views.main.router.refreshPage();

    });
});





$(".delete-item").on('click', function(){
    var index = $(this).data('index');
    app.dialog.confirm('Tem certeza?', 'Remover', function(){
        
        carrinho.splice(index, 1);

        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        app.views.main.router.refreshPage();

    });
});

$(".minus").on('click', function(){
    var index = $(this).data('index');
    //console.log('O indice é:', index);

    if(carrinho[index].quantidade > 1){
        carrinho[index].quantidade--;
        carrinho[index].total_item = carrinho[index].quantidade * carrinho[index].item.preco;

        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        app.views.main.router.refreshPage();
    }else{
        var itemNome = carrinho[index].item.nome;
        app.dialog.confirm(`Gostaria de remover <strong>${itemNome}</strong>?`, 'REMOVER', function(){
            carrinho.splice(index, 1);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            app.views.main.router.refreshPage();
        });
    }

    });

    $(".plus").on('click', function(){
        var index = $(this).data('index');
    
       carrinho[index].quantidade++;
       carrinho[index].total_item = carrinho[index].quantidade * carrinho[index].item.preco;
       localStorage.setItem('carrinho', JSON.stringify(carrinho));
       app.views.main.router.refreshPage();
    
        });

