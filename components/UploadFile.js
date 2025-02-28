import { useState } from "react";
import axios from "axios";
import { Eye, RotateCcw, Upload } from "lucide-react";

const TELEGRAM_BOT_TOKEN = "7629632078:AAFwGMwD36V1-NyDvLoPhc9ZMrxr2LD96GI";

const getFilePath = async (fileId) => {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${response.data.result.file_path}`;
  } catch (error) {
    console.error("Ошибка получения пути файла:", error);
    return null;
  }
};

export default function UserFile({ fileId }) {
  const [filePath, setFilePath] = useState(null);

  const handleGetFile = async () => {
    const path = await getFilePath(fileId);
    setFilePath(path);
  };

  return (
    <div>
      {filePath ? (
        <>
          <p>
            <a href={filePath} target="_blank" rel="noopener noreferrer">
              <Upload/>
            </a>
            <RotateCcw onClick={handleGetFile}>файл обновить файл</RotateCcw>
          </p>
          {/* Изображения */}
          {filePath.match(/\.(jpeg|jpg|png|gif)$/i) && (
            <img src={filePath} alt="Uploaded File" style={{ maxWidth: "300px", marginTop: "10px" }} />
          )}

          {/* Видео */}
          {filePath.match(/\.(webm|mp4)$/i) && (
            <video controls style={{ maxWidth: "300px", marginTop: "10px" }}>
              <source src={filePath} type="video/webm" />
              Ваш браузер не поддерживает видео.
            </video>
          )}

          {/* Аудио */}
          {filePath.match(/\.(ogg|mp3|wav)$/i) && (
            <audio controls style={{ marginTop: "10px" }}>
              <source src={filePath} type="audio/ogg" />
              Ваш браузер не поддерживает аудио.
            </audio>
          )}

          {/* PDF */}
          {filePath.match(/\.pdf$/i) && (
            <iframe src={filePath} style={{ width: "100%", height: "500px", marginTop: "10px" }}></iframe>
          )}

          {/* Остальные файлы */}
          {!filePath.match(/\.(jpeg|jpg|png|gif|webm|mp4|ogg|mp3|wav|pdf)$/i) && (
            <p>Файл не поддерживается для предпросмотра.</p>
          )}
        </>
      ) : (
        <Eye onClick={handleGetFile}>🔍 Загрузить файл</Eye>
      )}
    </div>
  );
}