import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { RefreshCcw } from "lucide-react";
import { API_URL_LIST } from "./utils/api";
import AppHeader from "./components/AppHeader";
import SurahDetail from "./components/SurahDetail";
import SurahList from "./components/SurahList";
const App = () => {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 

  const audioRef = useRef(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);

  const arabicFontCss = useMemo(
    () => `
    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
    .font-arabic { font-family: 'Amiri', serif; }
  `,
    []
  );

  const fetchSurahList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL_LIST);
      if (!response.ok) {
        throw new Error(
          "Gagal mengambil daftar surah. Status: " + response.status
        );
      }
      const result = await response.json();

      if (!Array.isArray(result)) {
        throw new Error("Gagal memuat daftar surah: Format data tidak valid.");
      }

      const normalizedSurahs = result.map((s) => ({
        ...s,
        nama_latin: s.nama_latin || s.nama,
        jumlah_ayat: s.jumlah_ayat,
        tempat_turun: s.tempat_turun,
        arti: s.arti,
      }));

      setSurahs(normalizedSurahs);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal memuat data daftar surah. Silakan coba lagi.");
      setSurahs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchSurahList();
  }, [fetchSurahList]);
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);
  const filteredSurahs = useMemo(() => {
    if (!searchTerm) {
      return surahs;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return surahs.filter(
      (surah) =>
        surah.nama_latin.toLowerCase().includes(lowerCaseSearch) ||
        (surah.nama && surah.nama.toLowerCase().includes(lowerCaseSearch)) || 
        surah.arti.toLowerCase().includes(lowerCaseSearch) || 
        String(surah.nomor).includes(searchTerm.trim()) 
    );
  }, [surahs, searchTerm]);
  const handleCloseAudioError = useCallback(() => {
    setAudioError(null);
  }, []);
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      const handleEnded = () => setCurrentAudioUrl(null);
      audioEl.addEventListener("ended", handleEnded);
      return () => {
        audioEl.removeEventListener("ended", handleEnded);
      };
    }
  }, []);
  const handleSelectSurah = (surah) => {
    setSelectedSurah(surah);
    handleStopAudio();
  };
  const handleBackToList = () => {
    setSelectedSurah(null);
    handleStopAudio();
  };
  const handleStopAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudioUrl(null);
    handleCloseAudioError();
  };
  const handlePlayAudio = (audioUrl) => {
    const audioEl = audioRef.current;
    handleStopAudio();
    handleCloseAudioError();
    if (audioEl) {
      audioEl.src = audioUrl;
      audioEl.load();
      audioEl
        .play()
        .then(() => {
          setCurrentAudioUrl(audioUrl);
        })
        .catch((e) => {
          console.error("Gagal memutar audio:", e);
          if (e.name === "NotAllowedError") {
            setAudioError(
              "Browser memblokir pemutaran otomatis. Mohon coba klik lagi atau putar melalui kontrol di bawah."
            );
          } else if (e.name === "AbortError") {
          } else {
            setAudioError(
              "Terdapat kesalahan saat memutar audio. Cek koneksi internet Anda."
            );
          }
          setCurrentAudioUrl(null);
        });
    }
  };
  const pageTitle = selectedSurah
    ? `Surah ${selectedSurah.nama_latin} (${selectedSurah.nama})`
    : "Al-Qur'an Digital Indonesia";
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      <style dangerouslySetInnerHTML={{ __html: arabicFontCss }} />
      <AppHeader
        pageTitle={pageTitle}
        onBack={selectedSurah ? handleBackToList : null}
      />
      <main className="max-w-4xl mx-auto">
        {error &&
          !selectedSurah && ( 
            <div className="p-4 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-lg m-4 flex justify-between items-center">
              <p>{error}</p>
              <button
                onClick={fetchSurahList}
                className="ml-4 p-2 rounded-full hover:bg-red-200 transition-colors"
                title="Coba Lagi"
              >
                <RefreshCcw size={20} />
              </button>
            </div>
          )}
        {selectedSurah ? (
          <SurahDetail
            surah={selectedSurah}
            onBack={handleBackToList}
            onPlayAudio={handlePlayAudio}
            onStopAudio={handleStopAudio}
            currentAudioUrl={currentAudioUrl}
          />
        ) : (
          <SurahList
            surahs={filteredSurahs}
            isLoading={isLoading}
            onSelectSurah={handleSelectSurah}
            onRetry={fetchSurahList}
            searchTerm={searchTerm} 
            onSearchChange={handleSearchChange} 
          />
        )}
      </main>
      {audioError && (
        <Notification
          message={audioError}
          type="error"
          onClose={handleCloseAudioError}
        />
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-emerald-100 p-2 z-20">
        <audio
          controls
          className="w-full max-w-4xl mx-auto"
          ref={audioRef}
          src={currentAudioUrl || undefined}
        >
          Browser Anda tidak mendukung elemen audio.
        </audio>
      </div>
    </div>
  );
};

export default App;
