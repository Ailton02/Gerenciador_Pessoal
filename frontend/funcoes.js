$(document).ready(function () {
  if (!(localStorage.getItem("id") == null)) {
    $("#usuario-informacao").html(
      `<b>${localStorage.getItem("email")}</b> <br><b>${localStorage.getItem(
        "nome-completo"
      )}</b>`
    );

    //codigo para adicinar tarefa
    $("#formulario").on("submit", function (event) {
      event.preventDefault();

      var nome_da_tarefa = $("#Nome_tarefa").val();
      var descricao = $("#descricao").val();
      var dataTarefa = $("#data").val();
      var estado = $("#estado").val();

      //envia os dados recebidos do front para o back
      var data = {
        nome_da_tarefa: nome_da_tarefa,
        descricao: descricao,
        dataTarefa: dataTarefa,
        estado: estado,
        usuario_id: localStorage.getItem("id"),
      };

      $.ajax({
        type: "POST",
        url: "http://localhost:3000/nova-Tarefa",
        data: data,
        success: function (resposta) {
          alert(resposta);
          // Limpa os campos quando a tarefa for adicionada
          $("#Nome_tarefa").val("");
          $("#descricao").val("");
          $("#data").val("");
          $("#estado").val("");
          listarTarefas();
        },
        error: function (error) {
          alert("Erro ao adicionar tarefa");
        },
      });
    });
  }

  //codigo para atualizar tarefa
  $("#Atualizar_tarefa_formulario").on("submit", function (event) {
    event.preventDefault();
    var oModal = document.getElementById("updateModal");
    var fecharModal = bootstrap.Modal.getInstance(oModal);
    var novoTarefa = $("#Atualizar_Nome_tarefa").val();
    var novaDescricao = $("#Atualizar_descricao").val();
    var novoEstado = $("#Atualizar_data").val();
    var novaData = $("#Atualizar_estado").val();
    var id = $("#tarefa_id").val();

    var data = {
      id: id,
      novoTarefa: novoTarefa,
      novaDescricao: novaDescricao,
      novoEstado: novoEstado,
      novaData: novaData,
    };

    $.ajax({
      type: "PUT",
      url: "http://localhost:3000/atualizar-tarefa",
      data: data,
      success: function (resposta) {
        // Limpa os campos quando a tarefa for atualizada
        $("#Atualizar_Nome_tarefa").val("");
        $("#Atualizar_descricao").val("");
        $("#Atualizar_data").val("");
        $("#Atualizar_estado").val("");
        $("#tarefa_id").val();
        alert("tarefa atualizada");
        fecharModal.hide(); //fecha o modal
        listarTarefas(); //lista as tarefas com os novos dados
      },
      error: function (error) {
        alert("Erro ao atualizar tarefa");
      },
    });
  });

  // codigo para criar nova conta de usuario
  $("#novoUsuarioFormulario").on("submit", function (event) {
    event.preventDefault();

    var nome_completo = $("#nome-completo").val();
    var email = $("#novo-email").val();
    var password = $("#senha").val();

    //envia os dados recebidos do front para o back
    var data = {
      nome_completo: nome_completo,
      email: email,
      password: password,
    };

    $.ajax({
      type: "POST",
      url: "http://localhost:3000/novo-usuario",
      data: data,
      success: function (resposta) {
        // Limpa os campos quando o usuario for adicionado
        $("#nome-completo").val();
        $("#novo-email").val();
        $("#senha").val();
        alert("nova conta criada!");
        var o_Modal = document.getElementById("novaContaModal");
        var fechar_Modal = bootstrap.Modal.getInstance(o_Modal);
        fechar_Modal.hide(); //fecha o modal
      },
      error: function (error) {
        alert("Erro ao adicionar usuario");
      },
    });
  });

  // codigo para login
  $("#loginForm").on("submit", function (event) {
    event.preventDefault();

    var email = $("#email").val();
    var password = $("#password").val();

    //envia os dados recebidos do front para o back
    var data = {
      email: email,
      password: password,
    };

    $.ajax({
      type: "POST",
      url: "http://localhost:3000/login",
      data: data,
      success: function (resposta) {
        // Limpa os campos quando o usuario for adicionado
        $("#email").val();
        $("#password").val();

        //guarda o email e id no local storage pra ser usado mais tarde
        localStorage.setItem("email", resposta.email);
        localStorage.setItem("id", resposta.id);
        localStorage.setItem("nome-completo", resposta.nome_completo);

        $(location).attr("href", "./dashboard.html");
      },
      error: function (error) {
        alert("Credencias Incorrectas");
      },
    });
  });
});

function listarTarefas() {
  const usuario_id = localStorage.getItem("id");
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/listar-tarefas/" + usuario_id,

    success: function (tarefas) {
      var $lista_tarefas = $("#tabelaTarefas");
      $lista_tarefas.empty();
      $.each(tarefas, function (index, tarefa) {
        $lista_tarefas.append(
          "<tr>" +
            "<td>" +
            tarefa.Tarefa_Nome +
            "</td>" +
            "<td>" +
            tarefa.Descricao +
            "</td>" +
            "<td>" +
            tarefa.Estado +
            "</td>" +
            "<td>" +
            tarefa.DataH +
            "</td>" +
            `<td> <button class=" btn btn-danger "onclick=deletarTarefa("${tarefa.id}")> Remover</button></td>` +
            `<td> <button class=" btn btn-primary "onclick=abrirTarefa("${tarefa.id}")> Editar</button></td>` +
            "</tr>"
        );
      });
    },
    error: function (error) {
      console.error("Erro ao listar tarefas:", error);
    },
  });
}

function deletarTarefa(id) {
  //Lógica para deletar a tarefa
  console.log("Deletar tarefa com ID:", id);
  $.ajax({
    type: "DELETE",
    data: { id: id },
    url: "http://localhost:3000/deletar-tarefa",
    success: function (response) {
      alert("Tarefa deletada com sucesso:", response);
      console.log("Tarefa deletada com sucesso:", response);
      listarTarefas();
    },
    error: function (error) {
      console.error("Erro ao deletar tarefa:", error);
    },
  });
}

function abrirTarefa(id) {
  var updateModal = new bootstrap.Modal(
    document.getElementById("updateModal"),
    {
      keyboard: false,
    }
  );
  $.ajax({
    type: "GET",
    url: "http://localhost:3000/listar-tarefa/" + id,
    success: function (tarefa) {
      $("#Atualizar_Nome_tarefa").val(tarefa[0].Tarefa_Nome);
      $("#Atualizar_descricao").val(tarefa[0].Descricao);
      $("#Atualizar_data").val(tarefa[0].DataH);
      $("#Atualizar_estado").val(tarefa[0].Estado);
      $("#tarefa_id").val(tarefa[0].id);
      updateModal.show();
    },
    error: function (error) {
      console.error("Erro ao deletar tarefa:", error);
    },
  });
}

//codigo de logout
function logout() {
  //remove as variaveis no local storage
  localStorage.removeItem("id");
  localStorage.removeItem("email");
  localStorage.removeItem("nome-completo");
  $(location).attr("href", "./index.html"); // redireciona para a pagina de login
}

listarTarefas(); //chama a funcao para listar as tarefas ao carregar a pagina
