$(document).ready(function () {
  if (!(localStorage.getItem("id") == null)) {
    //verifica se o usuario ja fez login
    $("#usuario-informacao").html(
      `<b>${localStorage.getItem("email")}</b> <br><b>${localStorage.getItem(
        "nome-completo"
      )}</b>`
    );

    //codigo para adicinar nova transacao finaceira
    $("#nova_transacao_financeira_formulario").on("submit", function (event) {
      event.preventDefault();

      var valor = $("#valor").val();
      var transacao_financeira_descricao = $("#descricao").val();
      var transacao_financeira_data = $("#data").val();
      var transacao_financeira_categoria = $("#categoria").val();

      //envia os dados recebidos do front para o back

      var data = {
        categoria: transacao_financeira_categoria,
        valor: valor,
        data: transacao_financeira_data,
        descricao: transacao_financeira_descricao,
        usuario_id: localStorage.getItem("id"),
      };

      $.ajax({
        type: "POST",
        url: "http://localhost:3000/nova-transacao-financeira",
        data: data,
        success: function (resposta) {
          alert(resposta);
          // Limpa os campos quando a transacao  for adicionada
          $("#valor").val("");
          $("#descricao").val("");
          $("#data").val("");
          $("#categoria").val("");
          listarResumoFinaceiro(); // listar o resumo financeiro com novos dados
          listarFinancas(); //lista as financas com os novos dados
        },
        error: function (error) {
          alert("Erro ao adicionar transacao financeira");
        },
      });
    });
  }

  //codigo para atualizar transacao financeira
  $("#Atualizar_financa_formulario").on("submit", function (event) {
    event.preventDefault();
    var transacaoModal = document.getElementById("updateFinancaModal");
    var fechartransacaoModal = bootstrap.Modal.getInstance(transacaoModal);

    var novoValor = $("#Atualizar_valor").val();
    var novaDescricao = $("#Atualizar_descricao").val();
    var novaData = $("#Atualizar_data").val();
    var novaCategoria = $("#Atualizar_categoria").val();
    var id = $("#financa_id").val();

    var data = {
      id: id,

      novaDescricao: novaDescricao,
      novaCategoria: novaCategoria,
      novaData: novaData,
      novoValor: novoValor,
    };

    $.ajax({
      type: "PUT",
      url: "http://localhost:3000/atualizar-financa",
      data: data,
      success: function (resposta) {
        // Limpa os campos quando a transacao for atualizada
        $("#Atualizar_valor").val("");
        $("#Atualizar_descricao").val("");
        $("#Atualizar_data").val("");
        $("#Atualizar_categoria").val("");
        $("#tarefa_id").val("");
        alert("Transacao financeira atualizada");
        fechartransacaoModal.hide(); //fecha o modal
        listarResumoFinaceiro(); // listar o resumo financeiro com novos dados
        listarFinancas(); //lista as financas com os novos dados
      },
      error: function (error) {
        alert("Erro ao atualizar transacao financeira");
      },
    });
  });
});

function listarFinancas() {
  //se o usuario ja fez login
  if (!(localStorage.getItem("id") == null)) {
    const usuario_id = localStorage.getItem("id");
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/listar-financas/" + usuario_id,

      success: function (financas) {
        var $lista_financas = $("#tabelaFinancas");
        $lista_financas.empty();
        $.each(financas, function (index, financa) {
          //a funcao .toFixed() define quantos numeros depois de virgula sera mostrado
          $lista_financas.append(
            "<tr>" +
              "<td>" +
              financa.valor.toFixed(2) +
              "</td>" +
              "<td>" +
              financa.categoria +
              "</td>" +
              "<td>" +
              financa.descricao +
              "</td>" +
              "<td>" +
              financa.data +
              "</td>" +
              `<td> <button class=" btn btn-danger "onclick=deletarFinanca("${financa.id}")> Remover</button></td>` +
              `<td> <button class=" btn btn-primary "onclick=abrirTransacaoFinaceira("${financa.id}")> Editar</button></td>` +
              "</tr>"
          );
        });
      },
      error: function (error) {
        console.error("Erro ao listar financas:", error);
      },
    });
  }
}

function deletarFinanca(id) {
  //Lógica para deletar a transacao financeira
  console.log("Deletar transacao financeira com ID:", id);
  $.ajax({
    type: "DELETE",
    data: { id: id },
    url: "http://localhost:3000/deletar-transacao-financeira",
    success: function (response) {
      alert("transacao financeira deletada com sucesso");
      console.log("Tarefa deletada com sucesso:", response);
      listarFinancas();
      listarResumoFinaceiro();
    },
    error: function (error) {
      console.error("Erro ao deletar transacao financeira:", error);
    },
  });
}

function listarResumoFinaceiro() {
  if (!(localStorage.getItem("id") == null)) {
    const usuario_id = localStorage.getItem("id");
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/listar-resumo-financeiro/" + usuario_id,

      success: function (resumos) {
        var depositos = resumos.total_deposito;
        var gastos = resumos.total_gastos;
        var saldo_atual = depositos - gastos;
        //a funcao .toFixed() define quantos numeros depois de virgula sera mostrado
        $("#depositos").html(
          `<h2 class="text-center"> Deposito Total: ${depositos.toFixed(
            2
          )} KZ</h2>`
        );
        $("#gastos").html(
          `<h2 class="text-center"> Gastos Total: ${gastos.toFixed(2)} KZ</h2>`
        );
        $("#saldo-atual").html(
          `<h2 class="text-center"> Saldo Atual: ${saldo_atual.toFixed(
            2
          )} KZ</h2>`
        );
      },
      error: function (error) {
        console.error("Erro ao listar resumo financeiro:", error);
      },
    });
  }
}

function abrirTransacaoFinaceira(id) {
  var updateFinancaModal = new bootstrap.Modal(
    document.getElementById("updateFinancaModal"),
    {
      keyboard: false,
    }
  );
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/listar-financa/" + id,
    success: function (financa) {
      $("#Atualizar_valor").val(financa[0].valor);
      $("#Atualizar_descricao").val(financa[0].descricao);
      $("#Atualizar_data").val(financa[0].data);
      $("#Atualizar_categoria").val(financa[0].categoria);
      $("#financa_id").val(financa[0].id);
      updateFinancaModal.show();
    },
    error: function (error) {
      console.error("Erro ao abrir  transacao financeira:", error);
    },
  });
}

listarResumoFinaceiro();
listarFinancas();
