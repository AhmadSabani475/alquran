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
export default Notification;