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
} from "lucide-react";

// URL API yang akan digunakan (SantriKoding API, Tanpa Wrapper)
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
      {/* Perubahan Properti: Menggunakan nama_latin (SantriKoding) */}
      <h2 className="text-lg font-bold text-gray-800">
        {surah.nama_latin}{" "}
        <span className="text-sm font-normal text-emerald-600">
          ({surah.nama})
        </span>
      </h2>
      {/* Perubahan Properti: Menggunakan jumlah_ayat dan tempat_turun (SantriKoding) */}
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

// Component: Daftar Semua Surah (secara logis dipisahkan)
const SurahList = ({ surahs, isLoading, onSelectSurah, onRetry }) => {
  if (isLoading) {
    return <LoadingState message="Memuat daftar surah..." />;
  }

  if (surahs.length === 0) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {surahs.map((surah) => (
        <SurahCard key={surah.nomor} surah={surah} onSelect={onSelectSurah} />
      ))}
    </div>
  );
};

// Component: Detail Surah (secara logis dipisahkan)
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

  // Perubahan URL Detail: Menggunakan format SantriKoding
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

      // Perubahan Penanganan Wrapper: SantriKoding API mengembalikan objek detail langsung (tanpa data wrapper)
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
    // Perubahan Properti: Menggunakan nama_latin (SantriKoding)
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

  // Perubahan Audio: SantriKoding (lama) biasanya menyediakan URL audio langsung di properti 'audio'
  const audioFullUrl = detailData?.audio;
  const isPlaying = audioFullUrl === currentAudioUrl;

  return (
    <div className="p-4 space-y-8">
      {/* Informasi Umum Surah */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-emerald-500">
        <div className="text-center mb-4">
          {/* Perubahan Properti: Menggunakan nama_latin, jumlah_ayat, tempat_turun */}
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
            Nomor Surah: {detailData.nomor}
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
          {/* Perubahan Properti: Menggunakan properti 'keterangan' (SantriKoding) */}
          {(detailData.keterangan || "Deskripsi tidak tersedia").replace(
            /<[^>]*>?/gm,
            ""
          )}
        </p>
      </div>

      {/* Tampilkan Ayat-ayat */}
      <div className="space-y-10">
        {/* Perubahan Properti: Menggunakan properti 'ayat' (SantriKoding) */}
        {detailData.ayat.map((ayah) => (
          <AyahCard key={ayah.nomor} ayah={ayah} />
        ))}
      </div>
    </div>
  );
};

// Component: Kartu Ayat (secara logis dipisahkan)
const AyahCard = ({ ayah }) => (
  <div className="bg-white p-6 rounded-xl shadow-md transition-shadow hover:shadow-lg border-l-4 border-emerald-400">
    {/* Nomor Ayat */}
    <div className="flex justify-between items-start mb-4 border-b pb-3">
      {/* Perubahan Properti: Menggunakan properti 'nomor' (SantriKoding) */}
      <span className="text-xl font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold">
        {ayah.surah}:{ayah.nomor}
      </span>
    </div>

    {/* Teks Arab */}
    {/* Perubahan Properti: Menggunakan properti 'ar' (SantriKoding) */}
    <p
      className="text-right text-4xl leading-relaxed font-arabic text-gray-900 my-4"
      style={{ fontFamily: "Amiri, serif" }}
    >
      {ayah.ar}
    </p>

    {/* Terjemahan */}
    <div className="mt-4 pt-4 border-t border-gray-200">
      {/* Perubahan Properti: Menggunakan properti 'id' (SantriKoding) */}
      <p className="text-base text-gray-700 italic">
        <span className="font-semibold text-emerald-600">Terjemahan:</span>{" "}
        {ayah.id}
      </p>
    </div>
  </div>
);

// Komponen Utama Aplikasi
const App = () => {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioError, setAudioError] = useState(null);

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

  // Fungsi untuk mengambil daftar surah
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

      // Perubahan Penanganan Wrapper: SantriKoding API mengembalikan array langsung
      if (!Array.isArray(result)) {
        throw new Error("Gagal memuat daftar surah: Format data tidak valid.");
      }

      // Data SantriKoding menggunakan snake_case, mari kita bersihkan/normalisasi
      const normalizedSurahs = result.map((s) => ({
        ...s,
        // Normalisasi properti dari snake_case ke camelCase untuk konsistensi,
        // meskipun komponen lain sudah diubah ke snake_case untuk API ini.
        // Tapi untuk tampilan List, kita harus pastikan properti yang diakses di SurahCard ada.
        nama_latin: s.nama_latin || s.nama,
        jumlah_ayat: s.jumlah_ayat,
        tempat_turun: s.tempat_turun,
        arti: s.arti,
      }));

      setSurahs(normalizedSurahs);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal memuat data daftar surah. Silakan coba lagi.");
      setSurahs([]); // Kosongkan daftar surah saat terjadi error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurahList();
  }, [fetchSurahList]);

  // Menutup notifikasi audio
  const handleCloseAudioError = useCallback(() => {
    setAudioError(null);
  }, []);

  // Tambahkan useEffect untuk sinkronisasi audioRef dan currentAudioUrl
  useEffect(() => {
    // Setup listener untuk mengosongkan URL ketika audio selesai
    const audioEl = audioRef.current;
    if (audioEl) {
      const handleEnded = () => setCurrentAudioUrl(null);
      audioEl.addEventListener("ended", handleEnded);

      // Cleanup function
      return () => {
        audioEl.removeEventListener("ended", handleEnded);
      };
    }
  }, []); // Hanya dijalankan saat mount

  // Handler untuk memilih surah
  const handleSelectSurah = (surah) => {
    setSelectedSurah(surah);
    handleStopAudio(); // Hentikan audio yang sedang berjalan saat berpindah Surah
  };

  // Handler untuk kembali ke daftar surah
  const handleBackToList = () => {
    setSelectedSurah(null);
    handleStopAudio(); // Hentikan audio saat kembali ke daftar
  };

  // Logika Stop Audio yang baru
  const handleStopAudio = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentAudioUrl(null);
    handleCloseAudioError(); // Tutup notifikasi audio jika ada
  };

  // Logika Play Audio yang baru (tanpa alert)
  const handlePlayAudio = (audioUrl) => {
    const audioEl = audioRef.current;

    handleStopAudio(); // Hentikan audio yang sedang berjalan
    handleCloseAudioError(); // Pastikan pesan error lama tertutup

    // Set URL baru
    if (audioEl) {
      audioEl.src = audioUrl;
      audioEl.load(); // Memuat ulang sumber audio
      audioEl
        .play()
        .then(() => {
          setCurrentAudioUrl(audioUrl);
        })
        .catch((e) => {
          console.error("Gagal memutar audio:", e);
          // Menampilkan notifikasi error di UI
          if (e.name === "NotAllowedError") {
            setAudioError(
              "Browser memblokir pemutaran otomatis. Mohon coba klik lagi atau putar melalui kontrol di bawah."
            );
          } else if (e.name === "AbortError") {
            // Biasa terjadi jika audio dihentikan dengan cepat
            // Abaikan kesalahan ini
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
    ? // Perubahan Properti: Menggunakan nama_latin (SantriKoding)
      `Surah ${selectedSurah.nama_latin} (${selectedSurah.nama})`
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
      <main className="max-w-4xl mx-auto px-2">
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
            surahs={surahs}
            isLoading={isLoading}
            onSelectSurah={handleSelectSurah}
            onRetry={fetchSurahList}
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
