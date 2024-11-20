#include <ESP8266WiFi.h> 
#include <PubSubClient.h>
#include <TimeLib.h>
#include "time.h"
#include <SoftwareSerial.h>

#define TOPICO_SUBSCRIBE "led"
#define TOPICO_PUBLISH "sensorPIR"        
#define ID_MQTT  "HomeAut"
                                
//Mapeamento de portas ESP8266 (pinout)
#define D0    16
#define D1    5
#define D2    4
#define D3    0
#define D4    2
#define PIN_SENSOR 14   //D5
#define D6    12
#define D7    13
#define D8    15
#define D9    3
#define D10   1


// Conexão com o WIFI - Credenciais
const char* SSID = "DAYNIS - 2.4/5G"; 
const char* PASSWORD = "batata11.11";

// Conexão com o MQTT - Credenciais
const char* BROKER_MQTT = "albatross.rmq.cloudamqp.com"; 
const char* BROKER_MQTT_USER = "capkavfy:capkavfy";
const char* BROKER_MQTT_PASSWORD = "Y2itZuNStXz48SNf25rdolp_d5lk8qHa";
int BROKER_PORT = 1883;
 
 
//Variáveis e objetos globais
WiFiClient espClient;
PubSubClient MQTT(espClient); 

//Prototipos 
void initSerial();
void initWiFi();
void initMQTT();
void reconectWiFi(); 
void mqtt_callback(char* topic, byte* payload, unsigned int length);
void VerificaConexoesWiFIEMQTT(void);
void InitOutput(void);
void InitInput(void);

void setup() 
{
    //inicializações:
    InitOutput();
    InitInput();
    initSerial();
    initWiFi();
    initMQTT();
}

void InitOutput(void)
{
    // Define LEDs RGB em nivel baixo
    pinMode(D1, OUTPUT);
    digitalWrite(D1, LOW);

    pinMode(D2, OUTPUT);
    digitalWrite(D2, LOW);    

    pinMode(D3, OUTPUT);
    digitalWrite(D3, LOW);             
}

void InitInput(void)
{
    pinMode(D4, INPUT);       
}

void initSerial() 
{   
    //Frequencia
    Serial.begin(115200);
}
 
// Função que conecta com o Wifi
void initWiFi() 
{
    //Inicia comunicação com o Wifi
    delay(10);
    Serial.println("------Conexao WI-FI------");
    Serial.print("Conectando-se na rede: ");
    Serial.println(SSID);
    Serial.println("Aguarde");
    
    // Usa função de reconectar
    reconectWiFi();
}
  
// Função que inicializa parâmetros de conexão MQTT
void initMQTT() 
{
    // Informa qual o broker que a porta deve estar conectada
    MQTT.setServer(BROKER_MQTT, BROKER_PORT);
    // Atribui função callback para receber dados das incrições   
    MQTT.setCallback(mqtt_callback);            
}
  
// Função que recebe os dados das incrições
void mqtt_callback(char* topic, byte* payload, unsigned int length) 
{
    String msg;

    //Percorre a string recebida e atribui a variavel msg
    for(int i = 0; i < length; i++) 
    {
       char c = (char)payload[i];
       msg += c;
    }
    Serial.println(msg);
    // Se msg for 'HIGH' - Ascende o LED
    if (msg == "HIGH") {
      digitalWrite(D1, HIGH);
      digitalWrite(D2, HIGH);
      digitalWrite(D3, HIGH);
    //Se for 'LOW' apaga o led
  } else if (msg == "LOW") {
      digitalWrite(D1, LOW);
      digitalWrite(D2, LOW);
      digitalWrite(D3, LOW);
  }
}   
  
//Função que reconecta-se ao broker MQTT
void reconnectMQTT() 
{
    while (!MQTT.connected()) 
    {
        Serial.print("* Tentando se conectar ao Broker MQTT: ");
        Serial.println(BROKER_MQTT);
        if (MQTT.connect(ID_MQTT, BROKER_MQTT_USER, BROKER_MQTT_PASSWORD)) 
        {
            Serial.println("Conectado com sucesso ao broker MQTT!");
            MQTT.subscribe(TOPICO_SUBSCRIBE);
        } 
        else
        {
            Serial.println("Falha ao reconectar no broker.");
            Serial.println("Havera nova tentatica de conexao em 2s");
            delay(2000);
        }
    }
}

// Função que reconecta ao wifi   
void reconectWiFi() 
{
    //Verifica se já exixte conexção com o wifi
    if (WiFi.status() == WL_CONNECTED)
        return;
    
    // Conecta com o wifi
    WiFi.begin(SSID, PASSWORD); // Conecta na rede WI-FI
     
    while (WiFi.status() != WL_CONNECTED) 
    {
        delay(100);
        Serial.print(".");
    }
   
    Serial.println();
    Serial.print("Conectado com sucesso na rede ");
    Serial.print(SSID);
    Serial.println("IP obtido: ");
    Serial.println(WiFi.localIP());
}
 
// Verifica conexções e chama funções para reconectar
void VerificaConexoesWiFIEMQTT(void)
{
    if (!MQTT.connected()) 
        reconnectMQTT(); //se não há conexão com o Broker, a conexão é refeita
     reconectWiFi(); //se não há conexão com o WiFI, a conexão é refeita
}
 
// Função que envia o dado 'Com' e 'Sem' movimento para o MQTT
void EnviaEstadoOutputMQTT(void)
{   
    // Lê sensor PIR
    int sinal = digitalRead(D4);
    delay(700);

    // Se o sinal for alto envia a string 'Com Movimento'
    if (sinal){
      MQTT.publish(TOPICO_PUBLISH, "Com Movimento");
      Serial.print(sinal);
      Serial.print(" - Com Movimento! ");
    } else {
      // Se o sinal for baixo envia a string 'Sem Movimento'
      MQTT.publish(TOPICO_PUBLISH, "Sem Movimento");
      Serial.print(sinal);
      Serial.print(" - Sem Movimento ");
    }
    Serial.println("- Estado da saida PIR enviado ao broker!");
}

// Loop do programa principal
void loop() 
{   
    //Garante funcionamento das conexões WiFi e broker MQTT.
    VerificaConexoesWiFIEMQTT();
    //Envia leitura do sensor PIR.
    EnviaEstadoOutputMQTT();
    //Mantem o loop do mqtt ativo.
    MQTT.loop();
}