$(document).ready(function () {
  if (!(localStorage.getItem("id") == null)) {
    $("#usuario-informacao").html(
      `<b>${localStorage.getItem("email")}</b> <br><b>${localStorage.getItem(
        "nome-completo"
      )}</b>`
    );

    //codigo para adicinar novo treino
    $("#novo_treino_formulario").on("submit", function (event) {
      event.preventDefault();

      var nome_do_treino = $("#nome_do_treino").val();
      var numero_de_series = $("#numero_de_series").val();
      var repeticao_por_serie = $("#repeticao_por_serie").val();
      var duracao = $("#duracao").val();
      var estado_treino = $("#estado_treino").val();
      var data_treino = $("#data_treino").val();
      var horario_do_treino = $("#horario_do_treino").val();
      var tipo_de_treino = $("#tipo_de_treino").val();

      // prepare os dados a ser enviado do front para o back
      var data = {
        nome: nome_do_treino,
        numero_de_series: numero_de_series,
        repeticao_por_serie: repeticao_por_serie,
        duracao: duracao,
        estado: estado_treino,
        data: data_treino,
        horario_do_treino: horario_do_treino,
        tipo: tipo_de_treino,
        usuario_id: localStorage.getItem("id"),
      };

      $.ajax({
        type: "POST",
        url: "http://localhost:3000/novo-treino",
        data: data,
        success: function (resposta) {
          alert(resposta);
          // Limpa os campos quando a tarefa for adicionada
          $("#nome_do_treino").val("");
          $("#numero_de_series").val("");
          $("#repeticao_por_serie").val("");
          $("#duracao").val("");
          $("#estado_treino").val("");
          $("#data_treino").val("");
          $("#horario_do_treino").val("");
          $("#tipo_de_treino").val("");
          listarTreinos();
          listarEstatisticas();
        },
        error: function (error) {
          alert("Erro ao adicionar tarefa");
        },
      });
    });
  }

  //codigo para atualizar tarefa
  $("#Atualizar_treino_formulario").on("submit", function (event) {
    event.preventDefault();
    var Atualizar_treinoModal = document.getElementById("updateTreinoModal");
    var fecharTreinoModal = bootstrap.Modal.getInstance(Atualizar_treinoModal);

    var novo_nome_do_treino = $("#Atualizar_nome_do_treino").val();
    var novo_numero_de_series = $("#Atualizar_numero_de_series").val();
    var novo_repeticao_por_serie = $("#Atualizar_repeticao_por_serie").val();
    var nova_duracao = $("#Atualizar_duracao").val();
    var novo_estado_treino = $("#Atualizar_estado_treino").val();
    var nova_data_treino = $("#Atualizar_data_treino").val();
    var novo_horario_do_treino = $("#Atualizar_horario_do_treino").val();
    var novo_tipo_de_treino = $("#Atualizar_tipo_de_treino").val();
    var id = $("#treino_id").val();

    var data = {
      id: id,
      novo_nome_do_treino: novo_nome_do_treino,
      novo_numero_de_series: novo_numero_de_series,
      novo_repeticao_por_serie: novo_repeticao_por_serie,
      nova_duracao: nova_duracao,
      novo_estado_treino: novo_estado_treino,
      nova_data_treino: nova_data_treino,
      novo_horario_do_treino: novo_horario_do_treino,
      novo_tipo_de_treino: novo_tipo_de_treino,
    };

    $.ajax({
      type: "PUT",
      url: "http://localhost:3000/atualizar-treino",
      data: data,
      success: function (resposta) {
        // Limpa os campos quando o treino for atualizada
        $("#Atualizar_nome_do_treino").val("");
        $("#Atualizar_numero_de_series").val("");
        $("#Atualizar_repeticao_por_serie").val("");
        $("#Atualizar_duracao").val("");
        $("#Atualizar_estado_treino").val("");
        $("#Atualizar_data_treino").val("");
        $("#Atualizar_horario_do_treino").val("");
        $("#Atualizar_tipo_de_treino").val("");
        $("#treino_id").val("");

        alert("treino atualizado");
        fecharTreinoModal.hide(); //fecha o modal
        listarTreinos(); //lista os treinos com os novos dados
        listarEstatisticas();
      },
      error: function (error) {
        alert("Erro ao atualizar treino");
      },
    });
  });
});

function listarTreinos() {
  const usuario_id = localStorage.getItem("id");
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/listar-treinos/" + usuario_id,

    success: function (treinos) {
      var $lista_treinos = $("#tabelaTreinos");
      $lista_treinos.empty();
      $.each(treinos, function (index, treino) {
        $lista_treinos.append(
          "<tr>" +
            "<td>" +
            treino.nome +
            "</td>" +
            "<td>" +
            treino.numero_de_series +
            "</td>" +
            "<td>" +
            treino.repeticao_por_serie +
            "</td>" +
            "<td>" +
            treino.duracao +
            "</td>" +
            "<td>" +
            treino.estado +
            "</td>" +
            "<td>" +
            treino.data +
            "</td>" +
            "<td>" +
            treino.horario_do_treino +
            "</td>" +
            "<td>" +
            treino.tipo +
            "</td>" +
            `<td> <button class=" btn btn-danger "onclick=deletarTreino("${treino.id}")> Remover</button></td>` +
            `<td> <button class=" btn btn-primary "onclick=abrirTreino("${treino.id}")> Editar</button></td>` +
            "</tr>"
        );
      });
    },
    error: function (error) {
      console.error("Erro ao listar tarefas:", error);
    },
  });
}

function deletarTreino(id) {
  //Lógica para deletar a treino
  console.log("Deletar treino com ID:", id);
  $.ajax({
    type: "DELETE",
    data: { id: id },
    url: "http://localhost:3000/deletar-treino",
    success: function (response) {
      alert("Treino deletado com sucesso");
      console.log("Tarefa deletada com sucesso:", response);
      listarTreinos();
      listarEstatisticas();
    },
    error: function (error) {
      console.error("Erro ao deletar treino:", error);
    },
  });
}

function abrirTreino(id) {
  var updateTreinoModal = new bootstrap.Modal(
    document.getElementById("updateTreinoModal"),
    {
      keyboard: false,
    }
  );
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/listar-treino/" + id,
    success: function (treino) {
      $("#Atualizar_nome_do_treino").val(treino[0].nome);
      $("#Atualizar_numero_de_series").val(treino[0].numero_de_series);
      $("#Atualizar_repeticao_por_serie").val(treino[0].repeticao_por_serie);
      $("#Atualizar_duracao").val(treino[0].duracao);
      $("#Atualizar_estado_treino").val(treino[0].estado);
      $("#Atualizar_data_treino").val(treino[0].data);
      $("#Atualizar_horario_do_treino").val(treino[0].horario_do_treino);
      $("#Atualizar_tipo_de_treino").val(treino[0].tipo);

      $("#treino_id").val(treino[0].id);
      updateTreinoModal.show();
    },
    error: function (error) {
      console.error("Erro ao abrir treino:", error);
    },
  });
}

function listarEstatisticas() {
  if (!(localStorage.getItem("id") == null)) {
    const usuario_id = localStorage.getItem("id");
    $.ajax({
      type: "GET",
      url: "http://localhost:3000/listar-estatisticas/" + usuario_id,

      success: function (estatisticas) {
        var total_concluido = estatisticas.total_concluido;

        $("#concluidos").html(
          `<h2 class="text-center"> Numero Total de Treinos Concluidos:: ${total_concluido}</h2>`
        );
      },
      error: function (error) {
        console.error("Erro ao listar resumo financeiro:", error);
      },
    });
  }
}

listarTreinos(); //chama a funcao para listar as tarefas ao carregar a pagina
listarEstatisticas();
