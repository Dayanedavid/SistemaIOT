// Variavel para verificar se há um processo em andamento
isProcessando = false;

//Função para conectar ao MQTT
function conectMQTT() {
  const mqtt = require("mqtt");

  // Credenciais e URL para acesso
  const brokerUrl = "mqtt://albatross.rmq.cloudamqp.com";
  const options = {
    port: 1883,
    clientId: "iot_front",
    username: "capkavfy:capkavfy",
    password: "Y2itZuNStXz48SNf25rdolp_d5lk8qHa",
    clean: true,
  };

  // Realiza a conexão
  const client = mqtt.connect(brokerUrl, options);
  return client;
}

// Função para desconectar do MQTT broker
function disconnectClient() {
  // Antes de desconectar, apagamos o LED
  alterarEstadoLed("LOW");

  // Se existir conexão
  if (client.connected) {
    // Encerra a conexão
    client.end(() => {
      console.log("Cliente desconectado com sucesso.");
    });
  } else {
    //Se não, não precisa, pois a conexão ainda nao existe
    console.log("Cliente já está desconectado ou nunca foi conectado.");
  }
}

// Função que altera o estado do Led
// Parametro:
// Estado: - 'HIGH' para aceso ou 'LOW' para apagado.
function alterarEstadoLed(estado) {
  // Executa o bloco de codigo e aguarda 3 segundos
  setTimeout(() => {
    // Cadastra no tópico publish "led"
    const publishTopic = "led";

    //Publica estado para o broker
    client.publish(publishTopic, estado, (err) => {
      if (err) {
        console.error(`Erro ao publicar no tópico ${publishTopic}:`, err);
      } else {
        console.log(
          `Mensagem "${estado}" enviada para o tópico ${publishTopic}`
        );
      }
    });
  }, 3000);
}

// Função que grava de acordo com a leitura de movimento
function gravaConformePIR() {
  // Conecta ao broker MQTT
  client = conectMQTT();

  client.on("connect", () => {
    console.log("Conectado ao broker MQTT!");

    // Se inscreve na subscribe "Sensor PIR"
    client.subscribe("sensorPIR", (err) => {
      if (err) {
        console.error("Erro ao se inscrever no tópico:", err);
        return;
      }
      console.log("Inscrito no tópico com sucesso");
    });
  });

  // Mensagem recebida na inscrição.
  client.on("message", (topic, message) => {
    // Verifica se é com ou sem movimento.
    // Verifica tambem se há um processo em andamento.
    if (message.toString().split(" ")[0] === "Com" && !isProcessando) {
      // Liga o LED
      alterarEstadoLed("HIGH");

      // Biblioteca que auxilia na chamada de processos filhos.
      const { spawn } = require("child_process");

      //Define processando como Falso.
      isProcessando = false;

      // Verifica estado de processando.
      if (isProcessando) {
        console.log("Processo em andamento. Ignorando nova chamada.");
      } else {
        // Chama processo de gravação com programa em Python.
        const processoPython = spawn("python", [
          "C:/Users/dayan/Documents/iot/project/backend/gravar.py",
        ]);

        // Altera estado de processando para True
        isProcessando = true;

        // Informa a saidas dos programas em Python
        processoPython.stdout.on("data", (data) => {
          console.log(`Saída (stdout): ${data}`);
        });

        // Informa erros do programa em Python
        processoPython.stderr.on("data", (data) => {
          console.error(`Erro (stderr): ${data}`);
        });

        // Entra neste bloco quando o processo do Python finalizar.
        processoPython.on("close", (code) => {
          console.log(`Processo Python finalizado com código: ${code}`);

          // Altera o estado de processamento para falso
          isProcessando = false;

          // Apaga o led
          alterarEstadoLed("LOW");
        });
      }
      // Se não tiver movimento e nao tiver processamento
    } else if (message.toString().split(" ")[0] === "Sem" && !isProcessando) {
      // Apaga o LED
      alterarEstadoLed("LOW");
    }
  });
}

// Exporta as funções
module.exports = { gravaConformePIR, disconnectClient, alterarEstadoLed };
