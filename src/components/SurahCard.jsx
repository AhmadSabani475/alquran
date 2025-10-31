import { BookOpen } from "lucide-react";

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
export default SurahCard;
