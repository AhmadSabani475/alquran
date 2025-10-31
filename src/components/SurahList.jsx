import { RefreshCcw, Search } from "lucide-react";
import SurahCard from "./SurahCard";
import LoadingState from "./LoadingState";

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
export default SurahList;
