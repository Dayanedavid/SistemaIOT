//Bibliotecas utilizadas
// Auxilio de comunicação REST API
const express = require("express");
// Auxilio para acesso aos diretórios
const path = require("path");
// Auxilio para camada de segurança de comunicação
const cors = require("cors");
// Auxilio para expor midia em localhost
const fs = require("fs");

//Variaveis
const server = express();
const periodos = require("./src/data/periodos.json");
const comunicacaoMQTT = require("./comunicacaoMQTT.js");
const videosDir = path.join(__dirname, "videos");

// Variavel para acompanhar a comunicação mqtt
let conMQTT = false;

// Habilitando o cors para qualquer rota
server.use(cors());

// Criação de endpoint para comunicação via JSON
server.use(express.json());

// Rota get para utilização no front-end
server.get("/periodo", (req, res) => {
  return res.status(200).send(periodos);
});

// Rota para GET do ultimo periodo definido
server.get("/ultimoPeriodo", (req, res) => {
  // Pega o ultimo periodo
  const ultimoPeriodo = periodos[periodos.length - 1];

  // Variaveis de inicio, fim e agora
  const [inicioTime, fimTime, nowTime] = periodoEagora(ultimoPeriodo);

  // Verifica de o horario atual esta entre o ultimo horario definido
  if (inicioTime <= nowTime && nowTime <= fimTime) {
    // Verifica se não exite comunicação
    if (!conMQTT) {
      // Altera estado da variavel para que existe comunicação
      conMQTT = true;
      // Chama função em outro programa para gravar de acordo com o sensor PIR
      comunicacaoMQTT.gravaConformePIR();
    }
  } else {
    // Verifica se existe comunicação
    if (conMQTT) {
      //Apaga o Led
      comunicacaoMQTT.alterarEstadoLed("LOW");

      // Disconecta MQTT
      comunicacaoMQTT.disconnectClient();
    }

    // Altera comunicação para falso
    conMQTT = false;
  }

  // Retorna o ultimo periodo
  return res.status(200).send(ultimoPeriodo);
});

// Rota de POST para adicionar novos horários
server.post("/periodo", (req, res) => {
  periodos.push(req.body);
  res.status(201).send("periodo adicionado com sucesso");
});

// Rota GET para utilização no front-end
// Videos
server.get("/videos", (req, res) => {
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error("Erro ao ler a pasta de vídeos:", err);
      return res.status(500).json({ error: "Erro ao ler a pasta de vídeos" });
    }

    // Filtra videos no formato .webm
    const videoFiles = files.filter((file) => file.endsWith(".webm"));

    // Retorna lista com todos os videos gravados
    res.json(videoFiles);
  });
});

// Rota GET para utilização no front-end
// Lista de Videos
server.get("/videos/:videoName", (req, res) => {
  const videoName = req.params.videoName;
  const videoPath = path.join(__dirname, "Videos", videoName);

  // Envia o arquivo de vídeo
  res.sendFile(videoPath, (err) => {
    if (err) {
      console.error("Erro ao enviar o vídeo:", err);
      res.status(404).send("Vídeo não encontrado");
    }
  });
});
server.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

// Função que formata os periodos e obtem o horario atual.
function periodoEagora(ultimoPeriodo) {
  const [horaInicio, minutoInicio] = ultimoPeriodo.inicio.split(":"); // "18:00"
  const [horaFim, minutoFim] = ultimoPeriodo.fim.split(":"); // "06:00"

  const timeInicio = new Date().setHours(
    Number.parseInt(horaInicio),
    Number.parseInt(minutoInicio),
    0,
    0
  );

  const timeFim = new Date().setHours(
    Number.parseInt(horaFim),
    Number.parseInt(minutoFim),
    0,
    0
  );

  const nowTime = new Date().getTime();

  // Retorna horario de inicio, horario de fim e horario atual.
  return [timeInicio, timeFim, nowTime];
}
