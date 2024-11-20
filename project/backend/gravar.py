import cv2
import os
import numpy as np
from datetime import datetime
import time
import imageio

ip = '192.168.15.184'
port = '8080'
URL = 'http://{}:81/stream'.format(ip)

diretorio_videos = "C:/Users/dayan/Documents/iot/project/backend/videos"



#Cria diretório se não existir
if not os.path.exists(diretorio_videos):
    os.makedirs(diretorio_videos)

# Nome do arquivo de vídeo
agora = datetime.now().strftime("%Y_%m_%d_%H-%M-%S")
nomeVideo = os.path.join(diretorio_videos, "Video_" + agora + ".avi")



# Define o codec (Formato em que o video é criado).
codec = cv2.VideoWriter_fourcc(*'XVID')
cap = cv2.VideoCapture(URL, cv2.CAP_FFMPEG)
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;udp"

# Tenta realizar a conexção com o IP da camera 6 vezes.
for i in range(1, 6):
    if not cap.isOpened() and i == 6:
        print("Falha ao abrir o stream de vídeo.")
        exit()
    elif cap.isOpened():
        break
    else:
        time.sleep(3)
        print('Tentativa: ', i)
        cap = cv2.VideoCapture(URL, cv2.CAP_FFMPEG)
        os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;udp"

# Testa capitura de video. 
ret, frame = cap.read()
if not ret:
    print("Falha ao capturar o primeiro frame.")
    cap.release()
    exit()


#Definição de FPS (Frame per second) e tamanho da tela.
tamanhoTela = (480, 320)
fps = 20

# instansia objeto de video.
video = cv2.VideoWriter(nomeVideo, codec, fps, tamanhoTela)

#Define a duração de video em segundos.
duracao = 50

# Obtem a hora de inicio.
tempo_inicio = time.time()

# Loop de captura de frame.
while True:
    tempo_decorrido = time.time() - tempo_inicio

    #Captura frame
    ret, frame = cap.read()

    #Testa a captuara
    if not ret:
        print("Falha na captura do frame ou fim do stream.")
        break
    
    # Guarda frame
    frame = np.array(frame)

    # Atribui ao objeto de video
    video.write(frame)

    # Verifica o tempo de duração para sair do loop
    if tempo_decorrido >= duracao:
        print("Video parou de ser gravado")
        break

#CONVERSÃO

#Obtem o arquivo de video (avi)
video_avi_path = diretorio_videos + "/Video_" + agora + ".avi"

# Lê o video gravado
reader = imageio.get_reader(diretorio_videos + "/Video_" + agora + ".avi")

# Escreve para o formato .webm
writer = imageio.get_writer('C:/Users/dayan/Documents/iot/project/backend/videos/Video_' + agora + '.webm', fps=20, codec='vp8')

# Loop para ler e gravar cada frame no novo arquivo
for frame in reader:
    writer.append_data(frame)

# Fechar o gravador e o leitor
cap.release()
video.release()
writer.close()
reader.close()
cv2.destroyAllWindows()

#APAGAR VIDEO AVI
os.remove(video_avi_path)

