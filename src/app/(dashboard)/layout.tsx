import { DashboardSidebar } from '@/components/layouts/DashboardSidebar'
import { DashboardHeader } from '@/components/layouts/DashboardHeader'

export default function DashboardGlobalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-[#FDFDFE] text-slate-900 font-sans">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col ml-64">
                <DashboardHeader />
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
