import { ChevronLeft } from "lucide-react";

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
export default AppHeader;
