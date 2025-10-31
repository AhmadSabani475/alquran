import { Loader } from "lucide-react";

const LoadingState = ({ message = "Memuat data..." }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
    <Loader size={48} className="animate-spin text-emerald-500" />
    <p className="mt-4 text-lg font-medium">{message}</p>
  </div>
);
export default LoadingState;
