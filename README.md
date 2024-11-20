# SistemaIOT
## Projeto de Sistema de Monitoramento com Sensor de Presença
Sistema de câmeras com sensores de presença que ativa a gravação apenas quando o sensor PIR detecta movimento, proporcionando maior eficiência energética, economia de armazenamento e análise de dados simplificada. 
O ESP8266 se comunica com o back-end que chama uma função python para realizar a gravação.


## Código e Documentação
O código feito para o front-end e back-end deste projeto está na pasta project em Código Do Projeto.

## Hardware
- Placa ESP32-CAM: é uma placa de desenvolvimento equipada com Wi-Fi e Bluetooth, acompanhada por uma Câmera.Responsavél por realizar a captura de imagem e expor essa imagem a IP fixo local, conforme codificado.
- Atuador Led rgb: é um diodo emissor de luz que combina as três cores primárias (Vermelho - R, Verde - G e Azul - B).
- ESP8266: desenvolvimento de plataformas móveis e projetos que exigem otimização de espaço e consumo de energia.
- Sensor PIR: é um dispositivo infravermelho passivo que detecta a radiação infravermelha emitida por objetos em seu campo de visão.
- Protoboard: é um dispositivo com furos e conexões condutoras que permite a montagem e teste de circuitos eletrônicos.

## Protocolo de Comunicação
A comunicação com a placa ESP8266 é feita via protocolo MQTT. A comunicação entre o backend e o frontend é feita pelo protocolo HTTP.

## Protocolo MQTT e Comunicação TCP/IP
A comunicação do sistema é feita pela rede Wi-Fi (TCP/IP) e utiliza o protocolo MQTT

## Configuração 
1. Altere as credenciais do Wifi, tanto do ESP32-CAM e ESP8266.
   obs: Para o IP Fixo definido no ESP32-CAM, o IP Fixo deve seguir o padrão da rede conectada.
2. Entre na pasta "./project/backend" e execute o comando **yarn install** em um terminal dedicado e instale as depedências **yarn add <NomeDaDependencia>**
3. Para iniciar o servidor execute **node index.js**
4. Entre na pasta "./project/frontend/iotmackenzie" e execute o comando **yarn install** em um terminal dedicado e instale as depedências **yarn add <NomeDaDependencia>**
5. Para iniciar o frontend execute em um terminal dedicado **yarn run dev**
6. É necessário modificar os caminhos de gravação de video.

## Acesso do vídeo no Youtube
https://youtu.be/mS6VILvSGc8
