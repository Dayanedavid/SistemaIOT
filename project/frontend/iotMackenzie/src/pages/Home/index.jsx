//BIBLIOTECAS:
// Funções do react
import { useEffect, useState, useRef } from "react";

//Style compenents
import { SHome } from "./styles";

// Auxilios na criação de rotas e comunicação REST API
import axios from "axios";

function Home() {
  // Variaveis de useState() - Atualiza de forma dinamica.
  const [getData, setData] = useState([]);
  const [ultimoDado, setUltimoDado] = useState(null);
  const hInicioRef = useRef(null);
  const hFinalRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      // Pega os peridos da rota do back=end
      axios
        .get("http://localhost:3000/periodo")
        .then((response) => {
          setData(response.data);
          if (response.data.length > 0) {
            setUltimoDado(response.data[response.data.length - 1]); // Armazena apenas o último elemento
          }
        })
        .catch((error) => console.error("Erro ao buscar dados:", error));

      // Pega o ultimo periodo da rota do back-end
      axios
        .get("http://localhost:3000/ultimoPeriodo")
        .then((response) => {
          setUltimoDado(response.data);
        })
        .catch((error) => console.error("Erro ao buscar dados:", error));

      // Pega os videos pela rota do back-end
      axios
        .get("http://localhost:3000/videos")
        .then((response) => {
          setVideos(response.data);
        })
        .catch((error) => console.error("Erro ao buscar vídeos:", error));
    };
    fetchData();

    // Atualiza o array de videos.
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Atualiza periodo conforme entrada de dados.
  const handleSubmit = (e) => {
    e.preventDefault();

    const hInicio = hInicioRef.current.value;
    const hFinal = hFinalRef.current.value;
    const newData = {
      inicio: hInicio,
      fim: hFinal,
    };

    // Atribui dados
    setUltimoDado(newData);

    // Chama rota POST para atualizar no back-end
    axios
      .post("http://localhost:3000/periodo", newData)
      .then((response) => {
        console.log("Dados enviados com sucesso:", response.data); // Exibe a resposta
      })
      .catch((error) => {
        console.error("Erro ao enviar dados:", error); // Exibe o erro, se houver
      });
  };

  // Seleção de videos
  const handleVideoSelect = (videoName) => {
    setSelectedVideo(videoName);
  };

  // HTML de retorno
  return (
    <SHome>
      <h1>Monitoramento - Security Mackenzie</h1>
      <p> Defina o horário de monitoramento: </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="hInicio">Horário Inicio:</label>
        <input type="time" id="hInicio" ref={hInicioRef} required />
        <br />
        <br />

        <label htmlFor="hFinal">Horário Final:</label>
        <input type="time" id="hFinal" ref={hFinalRef} required />
        <br />
        <br />
        <button type="submit">Atualizar Intervalo</button>
      </form>
      <div>
        <div>
          <h1> Periodo Definido </h1>
          {ultimoDado ? (
            <p>{ultimoDado.inicio + " - " + ultimoDado.fim}</p>
          ) : (
            <p>Carregando...</p>
          )}
        </div>

        <div>
          <h1>Histórico de Horários</h1>
          <ul>
            {getData.slice(-5).map((item) => (
              <li key={item.id}>{item.inicio + " ~ " + item.fim}</li>
            ))}
          </ul>
        </div>

        <div>
          <h1>Lista de Vídeos</h1>

          {/* Exibe a lista de vídeos */}
          <ul>
            {videos.map((video, index) => (
              <li key={index}>
                <button onClick={() => handleVideoSelect(video)}>
                  {video}
                </button>
              </li>
            ))}
          </ul>

          {/* Ao selecionar um video, o mesmo é exibido na tela */}
          {selectedVideo && (
            <div>
              <h2>Assistindo: {selectedVideo}</h2>
              <video
                key={selectedVideo} // Caso outro video for selecionado, usamos a Key para mudar o video exibido.
                width="640"
                height="360"
                controls
              >
                <source
                  src={`http://localhost:3000/videos/${selectedVideo}`}
                  type="video/webm"
                />
                Seu navegador não suporta a tag de vídeo.
              </video>
            </div>
          )}
        </div>
      </div>
      <p id="resultado"></p>
    </SHome>
  );
}

export default Home;
