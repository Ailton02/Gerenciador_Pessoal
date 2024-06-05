$(document).ready(function () {
  if (!(localStorage.getItem("id") == null)) {
    $("#usuario-informacao").html(
      `<b>${localStorage.getItem("email")}</b> <br><b>${localStorage.getItem(
        "nome-completo"
      )}</b>`
    );

    //codigo para adicionar produto
    $("#formularioSuper").on("submit", function (event) {
      event.preventDefault();

      var nome_produto = $("#nome_do_produto").val();
      var preco = $("#preco").val();
      var quantidade = $("#quantidade").val();
      var local_compra = $("#local").val();

      //envia os dados recebidos do front para o back

      var data = {
        nome_produto: nome_produto,
        quantidade: quantidade,
        local_compra: local_compra,
        preco: preco,

        usuario_id: localStorage.getItem("id"),
      };

      $.ajax({
        type: "POST",
        url: "http://localhost:3000/novo-Produto",
        data: data,
        success: function (resposta) {
          alert(resposta);
          // Limpa os campos quando o produto for adicionada
          $("#nome_do_produto").val("");
          $("#preco").val("");
          $("#quantidade").val("");
          $("#local").val("");
          listarProdutos();
          listarTotal();
        },
        error: function (error) {
          alert("Erro ao adicionar produto");
        },
      });
    });
  }

  //codigo para atualizar o produto
  $("#Atualizar_prduto_formulario").on("submit", function (event) {
    event.preventDefault();
    var atualizarProdutoModal = document.getElementById("updateProdutoModal");
    var fecharAtualizarProdutoModalModal = bootstrap.Modal.getInstance(
      atualizarProdutoModal
    );
    var novoProduto = $("#Atualizar_nome_do_produto").val();
    var novoPreco = $("#Atualizar_preco").val();
    var novaQuantidade = $("#Atualizar_quantidade").val();
    var novoLocal = $("#Atualizar_local").val();
    var id = $("#produto_id").val();

    var data = {
      id: id,
      novoProduto: novoProduto,
      novaQuantidade: novaQuantidade,
      novoLocal: novoLocal,
      novoPreco: novoPreco,
    };

    $.ajax({
      type: "PUT",
      url: "http://localhost:3000/atualizar-produto",
      data: data,
      success: function (resposta) {
        // Limpa os campos quando o produto for atualizada
        $("#Atualizar_nome_do_produto").val("");
        $("#Atualizar_preco").val("");
        $("#Atualizar_quantidade").val("");
        $("#Atualizar_local").val("");
        $("#produto_id").val("");
        alert("produto atualizado");
        fecharAtualizarProdutoModalModal.hide(); //fecha o modal
        listarProdutos(); //lista os produtos com os novos dados
        listarTotal();
      },
      error: function (error) {
        alert("Erro ao atualizar produto");
      },
    });
  });
});

function listarProdutos() {
  const usuario_id = localStorage.getItem("id");
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/listar-produtos/" + usuario_id,

    success: function (produtos) {
      var $lista_produto = $("#tabelaProdutos");
      $lista_produto.empty();
      //a funcao .toFixed() define quantos numeros depois de virgula sera mostrado
      $.each(produtos, function (index, produto) {
        $lista_produto.append(
          "<tr>" +
            "<td>" +
            produto.nome_produto +
            "</td>" +
            "<td>" +
            produto.quantidade +
            "</td>" +
            "<td>" +
            produto.preco.toFixed(2) +
            "</td>" +
            "<td>" +
            produto.local_compra +
            "</td>" +
            "<td>" +
            produto.total.toFixed(2) +
            "</td>" +
            `<td> <button class=" btn btn-danger "onclick=deletarProduto("${produto.id}")> Remover</button></td>` +
            `<td> <button class=" btn btn-primary "onclick=abrirProduto("${produto.id}")> Editar</button></td>` +
            "</tr>"
        );
      });
    },
    error: function (error) {
      console.error("Erro ao listar produtos:", error);
    },
  });
}

function listarTotal() {
  if (!(localStorage.getItem("id") == null)) {
    //verifica se o usuario ja fez login
    const usuario_id = localStorage.getItem("id");
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/listar-total/" + usuario_id,

      success: function (resumos) {
        console.log(resumos);

        var total = resumos.total;

        //a funcao .toFixed() define quantos numeros depois de virgula sera mostrado
        $("#total").html(
          `<h2 class="text-center mb-3"> Total a ser gasto: ${total.toFixed(
            2
          )} KZ</h2>`
        );
      },
      error: function (error) {
        console.error("Erro ao listar total:", error);
      },
    });
  }
}

function deletarProduto(id) {
  //Lógica para deletar o produto
  console.log("Deletar produto com ID:", id);
  $.ajax({
    type: "DELETE",
    data: { id: id },
    url: "http://localhost:3000/deletar-produto",
    success: function (response) {
      alert("Produto deletado com sucesso:", response);
      console.log("Produto deletada com sucesso:", response);
      listarProdutos();
      listarTotal();
    },
    error: function (error) {
      console.error("Erro ao deletar produto:", error);
    },
  });
}

function abrirProduto(id) {
  var updateProdutoModal = new bootstrap.Modal(
    document.getElementById("updateProdutoModal"),
    {
      keyboard: false,
    }
  );
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/listar-produto/" + id,
    success: function (produto) {
      $("#Atualizar_nome_do_produto").val(produto[0].nome_produto);
      $("#Atualizar_preco").val(produto[0].preco);
      $("#Atualizar_quantidade").val(produto[0].quantidade);
      $("#Atualizar_local").val(produto[0].local_compra);
      $("#produto_id").val(produto[0].id);
      updateProdutoModal.show();
    },
    error: function (error) {
      console.error("Erro ao deletar produto:", error);
    },
  });
}

listarTotal();
listarProdutos(); //chama a funcao para listar os produtos ao carregar a pagina
