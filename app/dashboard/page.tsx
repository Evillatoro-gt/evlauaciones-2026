/*import { Suspense } from "react"
import DashboardContent from "./dashboard-content"

export default function DashboardPage() {
    return (
        <Suspense fallback={<p>Cargando dashboard...</p>}>
            <DashboardContent />
        </Suspense>
    )
}*/

import { Suspense } from "react";
import DashboardContent from "./dashboard-content";

export default function DashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center items-center min-h-screen bg-gray-50">
                    <div className="text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                    </div>
                </div>
            }
        >
            <DashboardContent />
        </Suspense>
    );
}