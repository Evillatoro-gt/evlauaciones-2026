import { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

export type SnackbarType = "success" | "warning" | "error";

interface SnackbarMessage {
  id: number;
  message: string;
  type: SnackbarType;
}

export function useSnackbar() {
  const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

  const showSnackbar = useCallback((message: string, type: SnackbarType = "success") => {
    const id = Date.now();
    setSnackbars((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setSnackbars((prev) => prev.filter((snack) => snack.id !== id));
    }, 5000);
  }, []);

  const removeSnackbar = useCallback((id: number) => {
    setSnackbars((prev) => prev.filter((snack) => snack.id !== id));
  }, []);

  const SnackbarComponent = useCallback(() => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {snackbars.map((snack) => {
        const isSuccess = snack.type === "success";
        const isWarning = snack.type === "warning";
        const isError = snack.type === "error";

        return (
          <div
            key={snack.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${isSuccess ? "bg-green-600" : isWarning ? "bg-yellow-500" : "bg-red-600"
              }`}
          >
            {isSuccess && <CheckCircle className="w-5 h-5" />}
            {isWarning && <AlertTriangle className="w-5 h-5 text-yellow-900" />}
            {isError && <XCircle className="w-5 h-5" />}

            <span className={isWarning ? "text-yellow-950" : "text-white"}>{snack.message}</span>

            <button
              onClick={() => removeSnackbar(snack.id)}
              className={`ml-2 p-1 rounded-md hover:bg-black/10 transition-colors ${isWarning ? "text-yellow-900" : "text-white"}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  ), [snackbars, removeSnackbar]);

  return { showSnackbar, SnackbarComponent };
}
