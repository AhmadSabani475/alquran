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
export default AyahCard;
