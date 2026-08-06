import Link from 'next/link';
import { Activity } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  rightTitle?: string;
  rightSubtitle?: string;
  rightGraphic?: React.ReactNode;
}

export function AuthLayout({ children, rightTitle, rightSubtitle, rightGraphic }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column (Form) */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[45%] xl:w-[40%] 2xl:w-[35%] lg:px-20 xl:px-24">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4B0082] text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-[#4B0082] tracking-tight">AnalyticsPro</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-[400px]">
          {children}
        </div>
      </div>

      {/* Right Column (Visuals) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] relative overflow-hidden">
        {/* Abstract background elements could go here */}
        
        <div className="w-full max-w-2xl text-center relative z-10 flex flex-col items-center">
          {rightTitle && (
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {rightTitle}
            </h2>
          )}
          {rightSubtitle && (
            <p className="text-lg text-purple-100/90 mb-12 max-w-xl">
              {rightSubtitle}
            </p>
          )}
          
          <div className="w-full flex justify-center mt-4">
            {rightGraphic}
          </div>
        </div>
      </div>
    </div>
  );
}
