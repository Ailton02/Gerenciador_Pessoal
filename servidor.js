const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs"); //usado para encriptar a senha do usuario por seguranca
const cors = require("cors"); //usado para definir os tipos the metodos aceites pelo servidor e origin de accesso
const app = express();

app.use(
    cors({
        origin: "*", //qualquer origin(cliente web) pode usar as rotas do servidor
        methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"], //metodos usados
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cria coneccao com a base de dados Lojap no MySQL
const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "tarefas",
    port: 3307,
});

//rota inicial
app.get("/", (req, res) => {
    res.send("Olá mundo");
});

/**
 *
 *  Rotas de Autnticacao do usuario
 */

//rota para adicionar usuario
app.post("/novo-usuario", async(req, res) => {
    const { nome_completo, email, password } = req.body; //recebe os dados do usuario enviados pelo frontend

    //encripta a senha por seguranca
    const salt = await bcrypt.genSalt(10);
    const passwordEcriptada = await bcrypt.hash(password, salt);

    connection.query(
        "SELECT * FROM usuarios WHERE email = ?", [email],
        (error, results) => {
            if (error) {
                console.log(error);
            } else {
                if (results.length > 0) {
                    res.status(400).json({
                        error: "usuario com essa esse email ja existe na base de dados",
                    });
                } else {
                    connection.query(
                        "INSERT INTO usuarios (nome_completo, email, password) VALUES (?, ?,?)", [nome_completo, email, passwordEcriptada],
                        (error, results) => {
                            if (error) {
                                console.error(error);
                                res.status(500).send("Erro criando usuario");
                            } else {
                                res.status(200).send("nova usuario adicionado");
                            }
                        }
                    );
                }
            }
        }
    );
});

//rota para login
app.post("/login", async(req, res) => {
    const { email, password } = req.body; //recebe o email e password enviados pelo frontend

    connection.query(
        "SELECT * FROM usuarios WHERE email = ?", [email],
        async(error, results) => {
            if (error) {
                console.log(error);
            } else {
                if (results.length == 0) {
                    res.status(400).json({
                        error: "usuario nao encontrado na base de dados",
                    });
                } else {
                    const check = await bcrypt.compare(password, results[0].password);
                    console.log(check);
                    if (check == true) {
                        //verifica se a senha inserida e a mesma que a salva na base de dados
                        //caso sim

                        res.status(200).json({
                            id: results[0].id,
                            email: results[0].email,
                            nome_completo: results[0].nome_completo,
                        }); //returna o email, nome e id do usuario
                    } else {
                        //caso nao
                        res.status(400).json({
                            error: "senha incorrecta",
                        });
                    }
                }
            }
        }
    );
});

///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

/**
 *
 *  Rotas do CRUD para o bloco de notas ou gerenciador de tarefas
 *
 */

//rota para adicionar tarefa
app.post("/nova-Tarefa", (req, res) => {
    const { nome_da_tarefa, descricao, dataTarefa, estado, usuario_id } =
    req.body;

    connection.query(
        "INSERT INTO Listas (Tarefa_Nome, Descricao, Estado, DataH,usuario_id) VALUES (?, ?,?,?,?)", [nome_da_tarefa, descricao, estado, dataTarefa, usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro criando tarefa");
            } else {
                res.status(200).send("nova tarefa adicionada");
            }
        }
    );
});

// rota para listar todas tarefas de um usuario
app.get("/listar-tarefas/:usuario_id", (req, res) => {
    const usuario_id = req.params.usuario_id;
    connection.query(
        "SELECT *  from Listas where usuario_id=?  ;", [usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem de tarefas");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

// rota para listar uma tarefa dado o seu id
app.get("/listar-tarefa/:id", (req, res) => {
    const id = req.params.id;

    connection.query(
        "SELECT * FROM Listas WHERE id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem da tarefa");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

// rota para atualizar tarefa dando o id
app.put("/atualizar-tarefa", (req, res) => {
    const { id, novoTarefa, novaDescricao, novoEstado, novaData } = req.body;

    connection.query(
        "UPDATE Listas SET Tarefa_Nome = ?, Descricao = ?, Estado = ?, DataH = ? WHERE id = ?", [novoTarefa, novaDescricao, novoEstado, novaData, id],

        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro atualizando tarefa");
            } else {
                res.status(200).send("tarefa atualizada");
            }
        }
    );
});

// rota para remover tarefa da base de dados
app.delete("/deletar-tarefa", (req, res) => {
    const { id } = req.body;

    connection.query(
        "DELETE FROM Listas WHERE Id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro ao apagar tarefa");
            } else {
                res
                    .status(200)
                    .send("A tarefa com id: " + id + " foi removida da base de dados");
            }
        }
    );
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 *  Rotas do CRUD para Plano de Compras
 *
 */

// rota para adionar novo produto
app.post("/novo-Produto", (req, res) => {
    const { nome_produto, quantidade, local_compra, preco, usuario_id } =
    req.body;
    const total = Number(quantidade) * Number(preco); // converte a quantidade e preco de string pra numero e depois calcula o preco total

    connection.query(
        "INSERT INTO planoproduto (nome_produto, preco, quantidade, local_compra,total, usuario_id) VALUES (?, ?,?,?,?,?)", [nome_produto, preco, quantidade, local_compra, total, usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro ao criar produto");
            } else {
                res.status(200).send("novo produto adicionado");
            }
        }
    );
});

// rota para listar todos produtos
app.get("/listar-produtos/:usuario_id", (req, res) => {
    const usuario_id = req.params.usuario_id;
    connection.query(
        "SELECT *  from planoproduto where usuario_id=?  ;", [usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem de tarefas");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

// rota para atualizar produto dado o id
app.put("/atualizar-produto", (req, res) => {
    const { id, novoProduto, novaQuantidade, novoLocal, novoPreco } = req.body;
    const novoTotal = Number(novaQuantidade) * Number(novoPreco); // converte a quantidade e preco de string pra numero e depois calcula o preco total

    connection.query(
        "UPDATE planoproduto SET nome_produto = ?, quantidade = ?, local_compra = ?, preco = ?,total=? WHERE id = ?", [novoProduto, novaQuantidade, novoLocal, novoPreco, novoTotal, id],

        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro ao atulizar produto");
            } else {
                res.status(200).send("produto atualizado");
            }
        }
    );
});

// rota para remover um produto da base de dados dado os seu id
app.delete("/deletar-produto", (req, res) => {
    const { id } = req.body;

    connection.query(
        "DELETE FROM planoproduto WHERE Id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro ao apagar produto");
            } else {
                res
                    .status(200)
                    .send("produto com id: " + id + " foi removido da base de dados");
            }
        }
    );
});

// rota para listar um produto dado o seu id
app.get("/listar-produto/:id", (req, res) => {
    const id = req.params.id;

    connection.query(
        "SELECT * FROM planoproduto WHERE id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem da produto");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

//rota para listar o total a ser gasto
app.get("/listar-total/:usuario_id", (req, res) => {
    const usuario_id = req.params.usuario_id;
    var total = 0;

    //busca o total de gastos
    connection.query(
        "SELECT SUM(total) as 'total' FROM planoproduto WHERE usuario_id=? ;", [usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem de transacoes financieras");
            } else {
                if (results.length > 0) {
                    //se existir produtos na lista
                    total = Number(results[0].total); //atualiza a variavel total_gastos com o valor ue veio da base de dados
                }
                res.status(200).json({ total }); //retorna os totais
            }
        }
    );

    // console.log({ total_deposito, total_gastos });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 *  Rotas do CRUD para Plano Financeiro
 *
 */

//rota para adicionar nova transacao financeira
app.post("/nova-transacao-financeira", (req, res) => {
    const { categoria, valor, data, descricao, usuario_id } = req.body;

    connection.query(
        "INSERT INTO financas (categoria, valor, data, descricao, usuario_id) VALUES (?, ?,?,?,?)", [categoria, valor, data, descricao, usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro criando nova transacao");
            } else {
                res.status(200).send("nova transacao financeira adicionada");
            }
        }
    );
});

// rota para atualizar transacao financeira  dando o id
app.put("/atualizar-financa", (req, res) => {
    const { id, novaDescricao, novaCategoria, novaData, novoValor } = req.body;

    connection.query(
        "UPDATE financas SET descricao = ?, categoria = ?, data = ?, valor = ? WHERE id = ?", [novaDescricao, novaCategoria, novaData, novoValor, id],

        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro atualizando transacao financeira");
            } else {
                res.status(200).send("transacao financeira atualizada");
            }
        }
    );
});

// rota para listar transacoes financieras de um usuario
app.get("/listar-financas/:usuario_id", (req, res) => {
    const usuario_id = req.params.usuario_id;
    connection.query(
        "SELECT *  from financas where usuario_id=?  ;", [usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem de transacoes financieras");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

//rota para listar o resumo finaceiro de um usuario
app.get("/listar-resumo-financeiro/:usuario_id", (req, res) => {
    const usuario_id = req.params.usuario_id;
    var total_gastos = 0;
    var total_deposito = 0;
    //busca o total de gastos
    connection.query(
        "SELECT SUM(valor) as 'total_gastos' FROM financas WHERE usuario_id=? and categoria='gastos' ;", [usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem de transacoes financieras");
            } else {
                if (results.length > 0) {
                    //se existir gatsos
                    total_gastos = Number(results[0].total_gastos); //atualiza a variavel total_gastos com o valor ue veio da base de dados
                }

                //busca o total de deposito
                connection.query(
                    "SELECT SUM(valor) as 'total_deposito' FROM financas WHERE usuario_id=? and categoria='deposito' ;", [usuario_id],
                    (error, results) => {
                        if (error) {
                            console.error(error);
                            res
                                .status(500)
                                .send("Erro na listagem de transacoes financieras");
                        } else {
                            if (results.length > 0) {
                                //se existir depositos
                                total_deposito = Number(results[0].total_deposito); //atualiza a variaval total_depoisto com o valor ue veio da base de dados
                            }

                            res.status(200).json({ total_deposito, total_gastos }); //retorna os totais
                        }
                    }
                );
            }
        }
    );

    // console.log({ total_deposito, total_gastos });
});

// rota para listar uma transacao financeira dado o seu id
app.get("/listar-financa/:id", (req, res) => {
    const id = req.params.id;

    connection.query(
        "SELECT * FROM financas WHERE id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem da transacao finaceira");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

// rota para remover transacao financeira da base de dados
app.delete("/deletar-transacao-financeira", (req, res) => {
    const { id } = req.body;

    connection.query(
        "DELETE FROM financas WHERE id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro ao apagar transacao-financeira");
            } else {
                res
                    .status(200)
                    .send(
                        "A transacao-financeira com id: " +
                        id +
                        " foi removida da base de dados"
                    );
            }
        }
    );
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 *
 *  Rotas do CRUD para Plano de Exercicios
 *
 */

//rota para adicionar novo treino no plano
app.post("/novo-treino", (req, res) => {
    const {
        nome,
        numero_de_series,
        repeticao_por_serie,
        duracao,
        estado,
        data,
        horario_do_treino,
        tipo,
        usuario_id,
    } = req.body;

    connection.query(
        "INSERT INTO planoexercicios(nome,numero_de_series,repeticao_por_serie,duracao,estado,data,horario_do_treino,tipo,usuario_id) VALUES (?, ?,?,?,?,?,?,?,?)", [
            nome,
            numero_de_series,
            repeticao_por_serie,
            duracao,
            estado,
            data,
            horario_do_treino,
            tipo,
            usuario_id,
        ],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro criando novo plano de exercicios");
            } else {
                res.status(200).send("nova plano  adicionado");
            }
        }
    );
});

// rota para atualizar treino  dando o id
app.put("/atualizar-treino", (req, res) => {
    const {
        id,
        novo_nome_do_treino,
        novo_numero_de_series,
        novo_repeticao_por_serie,
        nova_duracao,
        novo_estado_treino,
        nova_data_treino,
        novo_horario_do_treino,
        novo_tipo_de_treino,
    } = req.body;

    connection.query(
        "UPDATE planoexercicios SET nome = ?,numero_de_series = ?,repeticao_por_serie = ?,duracao = ?,estado = ?,data = ?,horario_do_treino = ?,tipo = ? WHERE id = ?", [
            novo_nome_do_treino,
            novo_numero_de_series,
            novo_repeticao_por_serie,
            nova_duracao,
            novo_estado_treino,
            nova_data_treino,
            novo_horario_do_treino,
            novo_tipo_de_treino,
            id,
        ],

        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro atualizando plano de treino");
            } else {
                res.status(200).send("plano de treino atualizado");
            }
        }
    );
});

// rota para listar treinos de um usuario
app.get("/listar-treinos/:usuario_id", (req, res) => {
    const usuario_id = req.params.usuario_id;
    connection.query(
        "SELECT *  from planoexercicios where usuario_id=?  ;", [usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem de treinos");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

// rota para listar um treino dado o seu id
app.get("/listar-treino/:id", (req, res) => {
    const id = req.params.id;

    connection.query(
        "SELECT * FROM planoexercicios WHERE id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem do treino");
            } else {
                res.status(200).json(results);
            }
        }
    );
});

// rota para remover treino da base de dados
app.delete("/deletar-treino", (req, res) => {
    const { id } = req.body;

    connection.query(
        "DELETE FROM planoexercicios WHERE id = ?", [id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro ao apagar treino");
            } else {
                res
                    .status(200)
                    .send("O treino com id: " + id + " foi removido da base de dados");
            }
        }
    );
});

//rota para listar o total a ser gasto
app.get("/listar-estatisticas/:usuario_id", (req, res) => {
    const usuario_id = req.params.usuario_id;
    var total_concluido = 0;

    //busca o total de treinos concluidos
    connection.query(
        "SELECT count(*) as 'total_concluido' FROM planoexercicios WHERE usuario_id=? and estado='concluido' ;", [usuario_id],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send("Erro na listagem de transacoes financieras");
            } else {
                if (results.length > 0) {
                    //se existir treinos concluidos na lista
                    total_concluido = Number(results[0].total_concluido); //atualiza a variavel total_concluido com o valor que veio da base de dados
                }
                res.status(200).json({ total_concluido }); //retorna os totais
            }
        }
    );

    // console.log({ total_deposito, total_gastos });
});

//Ouvir a rota
app.listen(3000, () => {
    console.log("Servidor active no link http://localhost:3000");
});