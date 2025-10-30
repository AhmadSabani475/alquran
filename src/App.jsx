import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  RefreshCcw,
  BookOpen,
  ChevronLeft,
  Volume2,
  Loader,
  StopCircle,
  VolumeX,
  Search, // Diimpor untuk fungsi pencarian
} from "lucide-react";

const API_URL_LIST = "https://quran-api.santrikoding.com/api/surah";
const API_URL_DETAIL_BASE = "https://quran-api.santrikoding.com/api/surah";

// Component: Header utama aplikasi
const AppHeader = ({ pageTitle, onBack }) => (
  <header className="bg-emerald-700 shadow-xl fixed top-0 left-0 right-0 z-10">
    <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-full text-white hover:bg-emerald-600 transition-colors"
          aria-label="Kembali ke Daftar Surah"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <h1
        className={`text-2xl font-extrabold text-white ${
          !onBack ? "w-full text-center" : ""
        }`}
      >
        {pageTitle}
      </h1>
      {onBack && <div className="w-10"></div>} {/* Placeholder for centering */}
    </div>
  </header>
);

// Component: Loading State
const LoadingState = ({ message = "Memuat data..." }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <Loader size={48} className="animate-spin text-emerald-500" />
    <p className="mt-4 text-lg font-medium">{message}</p>
  </div>
);

// Component: Notifikasi
const Notification = ({ message, type, onClose }) => {
  const bgColor = type === "error" ? "bg-red-500" : "bg-yellow-500";
  const Icon = type === "error" ? VolumeX : Volume2;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 right-4 max-w-sm ${bgColor} text-white p-4 rounded-lg shadow-2xl flex items-start space-x-3 z-50`}
    >
      <Icon size={24} className="flex-shrink-0 mt-0.5" />
      <div className="flex-grow">
        <p className="font-semibold">
          {type === "error" ? "Gagal Memutar Audio" : "Pemberitahuan"}
        </p>
        <p className="text-sm mt-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-white opacity-70 hover:opacity-100 flex-shrink-0 ml-4"
        aria-label="Tutup notifikasi"
      >
        &times;
      </button>
    </div>
  );
};

// Component: Surah Card di halaman daftar
const SurahCard = ({ surah, onSelect }) => (
  <button
    className="w-full bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center text-left border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-300"
    onClick={() => onSelect(surah)}
  >
    {/* Nomor Surah */}
    <div className="bg-emerald-500 text-white font-bold p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 relative">
      <span className="text-sm">{surah.nomor}</span>
      <BookOpen
        size={16}
        className="absolute -top-1 -right-1 text-emerald-300"
      />
    </div>

    <div className="ml-4 flex-grow">
      <h2 className="text-lg font-bold text-gray-800">
        {surah.nama_latin}{" "}
        <span className="text-sm font-normal text-emerald-600">
          ({surah.nama})
        </span>
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Arti: {surah.arti} | {surah.jumlah_ayat} Ayat | Golongan:{" "}
        {surah.tempat_turun}
      </p>
    </div>

    {/* Nama Arab (Besar) */}
    <div className="text-2xl font-arabic text-emerald-700 ml-4 font-extrabold flex-shrink-0">
      {surah.nama}
    </div>
  </button>
);

// Component: Daftar Semua Surah (DIMODIFIKASI untuk menambahkan search)
const SurahList = ({
  surahs,
  isLoading,
  onSelectSurah,
  onRetry,
  searchTerm,
  onSearchChange,
}) => {
  if (isLoading) {
    return <LoadingState message="Memuat daftar surah..." />;
  }

  // Tampilkan notifikasi jika ada error umum (tapi App menanganinya juga)
  if (surahs.length === 0 && !searchTerm) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-100 rounded-lg m-4">
        <p className="font-bold">Tidak ada data surah yang dimuat.</p>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center mx-auto"
        >
          <RefreshCcw size={16} className="mr-2" /> Coba Lagi
        </button>
      </div>
    );
  }

  // Komponen Input Pencarian
  const SearchInput = (
    <div className="p-4 bg-gray-50 mx-2">
      <div className="relative bg-white p-4 rounded-xl shadow-lg">
        <Search
          size={20}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500"
        />
        <input
          type="text"
          placeholder="Cari Surah (nama, arti, atau nomor)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-3 pl-12 pr-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150 outline-none"
        />
      </div>
      {searchTerm && surahs.length === 0 && (
        <div className="mt-4 p-4 text-center text-orange-600 bg-orange-100 rounded-lg">
          <p className="font-medium">
            Tidak ditemukan Surah yang cocok dengan kata kunci "
            <span className="font-bold italic">{searchTerm}</span>".
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {SearchInput}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0">
        {surahs.map((surah) => (
          <SurahCard key={surah.nomor} surah={surah} onSelect={onSelectSurah} />
        ))}
      </div>
    </>
  );
};

// Component: Detail Surah (TETAP)
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
  }, [API_URL_DETAIL]);

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

// Component: Kartu Ayat (TETAP)
const AyahCard = ({ ayah }) => (
  <div className="bg-white p-6 rounded-xl shadow-md transition-shadow hover:shadow-lg border-l-4 border-emerald-400">
    {/* Nomor Ayat */}
    <div className="flex justify-between items-start mb-4 border-b pb-3">
      <span className="text-xl font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold">
        {ayah.surah}:{ayah.nomor}
      </span>
    </div>

    {/* Teks Arab */}
    <p
      className="text-right text-4xl leading-relaxed font-arabic text-gray-900 my-4"
      style={{ fontFamily: "Amiri, serif" }}
    >
      {ayah.ar}
    </p>

    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-2">
      <p className="text-base text-gray-700 italic">
        <span className="font-semibold text-emerald-600">Latin : </span>{" "}
        <span dangerouslySetInnerHTML={{ __html: ayah.tr }} />
      </p>
      <p className="text-base text-gray-700 italic">
        <span className="font-semibold text-emerald-600">Terjemahan:</span>{" "}
        {ayah.idn}
      </p>
    </div>
  </div>
);

// Komponen Utama Aplikasi (DIMODIFIKASI untuk state pencarian dan filtering)
const App = () => {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioError, setAudioError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State baru untuk pencarian

  const audioRef = useRef(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);

  // Custom font for Arabic text
  const arabicFontCss = useMemo(
    () => `
    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
    .font-arabic { font-family: 'Amiri', serif; }
  `,
    []
  );

  // Fungsi untuk mengambil daftar surah (TETAP)
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

  // Handler untuk perubahan input pencarian
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Logika Pemfilteran Surah menggunakan useMemo
  const filteredSurahs = useMemo(() => {
    if (!searchTerm) {
      return surahs;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();

    return surahs.filter(
      (surah) =>
        surah.nama_latin.toLowerCase().includes(lowerCaseSearch) || // Nama Latin
        (surah.nama && surah.nama.toLowerCase().includes(lowerCaseSearch)) || // Nama Arab
        surah.arti.toLowerCase().includes(lowerCaseSearch) || // Arti
        String(surah.nomor).includes(searchTerm.trim()) // Nomor Surah
    );
  }, [surahs, searchTerm]);

  // Menutup notifikasi audio (TETAP)
  const handleCloseAudioError = useCallback(() => {
    setAudioError(null);
  }, []);

  // Tambahkan useEffect untuk sinkronisasi audioRef dan currentAudioUrl (TETAP)
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

  // Handler untuk memilih surah (TETAP)
  const handleSelectSurah = (surah) => {
    setSelectedSurah(surah);
    handleStopAudio();
  };

  // Handler untuk kembali ke daftar surah (TETAP)
  const handleBackToList = () => {
    setSelectedSurah(null);
    handleStopAudio();
  };

  // Logika Stop Audio yang baru (TETAP)
  const handleStopAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudioUrl(null);
    handleCloseAudioError();
  };

  // Logika Play Audio yang baru (TETAP)
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
            // Abaikan
          } else {
            setAudioError(
              "Terdapat kesalahan saat memutar audio. Cek koneksi internet Anda."
            );
          }
          setCurrentAudioUrl(null);
        });
    }
  };

  // Menentukan judul halaman berdasarkan state
  const pageTitle = selectedSurah
    ? `Surah ${selectedSurah.nama_latin} (${selectedSurah.nama})`
    : "Al-Qur'an Digital Indonesia";

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-20">
      {/* Inject Arabic Font CSS */}
      <style dangerouslySetInnerHTML={{ __html: arabicFontCss }} />

      {/* Header Aplikasi */}
      <AppHeader
        pageTitle={pageTitle}
        onBack={selectedSurah ? handleBackToList : null}
      />

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto">
        {error &&
          !selectedSurah && ( // Tampilkan error hanya di halaman daftar
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
            surahs={filteredSurahs} // Menggunakan daftar yang sudah difilter
            isLoading={isLoading}
            onSelectSurah={handleSelectSurah}
            onRetry={fetchSurahList}
            searchTerm={searchTerm} // Mengirim state pencarian
            onSearchChange={handleSearchChange} // Mengirim handler pencarian
          />
        )}
      </main>

      {/* Notifikasi Audio */}
      {audioError && (
        <Notification
          message={audioError}
          type="error"
          onClose={handleCloseAudioError}
        />
      )}

      {/* Player Audio */}
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
