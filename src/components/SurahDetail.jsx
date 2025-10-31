import { StopCircle, Volume2 } from "lucide-react";
import { API_URL_DETAIL_BASE } from "../utils/api";
import LoadingState from "./LoadingState";
import AyahCard from "./AyahCard";
import { useCallback, useEffect, useState } from "react";

const SurahDetail = ({
  surah,
  onBack,
  onPlayAudio,
  onStopAudio,
  currentAudioUrl,
}) => {
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL_DETAIL = `${API_URL_DETAIL_BASE}/${surah.nomor}`;

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL_DETAIL);
      if (!response.ok) {
        throw new Error(
          "Gagal mengambil detail surah. Status: " + response.status
        );
      }
      const data = await response.json();

      if (!data || !data.ayat || !Array.isArray(data.ayat)) {
        throw new Error("Gagal memuat detail surah: Format data tidak valid.");
      }

      setDetailData(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal memuat ayat. Coba periksa koneksi atau ulangi.");
    } finally {
      setIsLoading(false);
    }
  }, [API_URL_DETAIL_BASE]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return <LoadingState message={`Memuat Surah ${surah.nama_latin}...`} />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-100 rounded-lg m-4">
        <p className="font-bold">{error}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  const audioFullUrl = detailData?.audio;
  const isPlaying = audioFullUrl === currentAudioUrl;

  return (
    <div className="p-4 space-y-8">
      {/* Informasi Umum Surah */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-emerald-500">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-extrabold text-emerald-800">
            {detailData.nama_latin} ({detailData.nama})
          </h2>
          <p className="text-xl font-arabic text-gray-700 mt-2">
            {detailData.nama}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {detailData.jumlah_ayat} Ayat | Diturunkan di{" "}
            {detailData.tempat_turun}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Surat Ke - {detailData.nomor}
          </p>
        </div>

        {/* Tombol Play Audio */}
        {audioFullUrl && (
          <div className="flex justify-center mt-4 space-x-4">
            {isPlaying ? (
              <button
                onClick={onStopAudio}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-lg hover:bg-red-700 transition-colors transform hover:scale-105"
              >
                <StopCircle size={20} />
                <span>Hentikan Murottal</span>
              </button>
            ) : (
              <button
                onClick={() => onPlayAudio(audioFullUrl)}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-colors transform hover:scale-105"
              >
                <Volume2 size={20} />
                <span>Putar Murottal Surah Penuh</span>
              </button>
            )}
          </div>
        )}

        {/* Deskripsi/Tafsir Singkat */}
        <p className="mt-6 text-sm italic text-gray-500 border-t pt-4">
          {(detailData.deskripsi || "Deskripsi tidak tersedia").replace(
            /<[^>]*>?/gm,
            ""
          )}
        </p>
      </div>

      {/* Tampilkan Ayat-ayat */}
      <div className="space-y-10">
        {detailData.ayat.map((ayah) => (
          <AyahCard key={ayah.nomor} ayah={ayah} />
        ))}
      </div>
    </div>
  );
};
export default SurahDetail;
