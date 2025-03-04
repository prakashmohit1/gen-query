import LoginForm from "@/components/auth/login-form";
import Link from "next/link";
import { Database, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-black via-purple-950 to-purple-900">
      {/* Left side - Animated Description */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-12 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-800/30 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-violet-700/20 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Content */}
        <div className="relative space-y-16">
          <h2 className="text-4xl font-bold text-white">
            Powerful Database Management
            <div className="h-1 w-20 bg-purple-500 mt-4"></div>
          </h2>

          {/* Features list with animations */}
          <div className="space-y-8">
            <div
              className="flex items-start space-x-4 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Multiple Database Support
                </h3>
                <p className="text-purple-200/60 leading-relaxed">
                  Connect and manage PostgreSQL, MySQL, MongoDB, and more from a
                  single interface
                </p>
              </div>
            </div>

            <div
              className="flex items-start space-x-4 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Secure Access
                </h3>
                <p className="text-purple-200/60 leading-relaxed">
                  Enterprise-grade security with encrypted connections and
                  role-based access control
                </p>
              </div>
            </div>

            <div
              className="flex items-start space-x-4 animate-fade-in-up"
              style={{ animationDelay: "600ms" }}
            >
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Lightning Fast
                </h3>
                <p className="text-purple-200/60 leading-relaxed">
                  Optimized performance with intelligent caching and query
                  optimization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md relative">
          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-800/30 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-600/20 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-violet-700/20 rounded-full mix-blend-soft-light filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          {/* Main content */}
          <div className="relative backdrop-blur-xl bg-black/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.1)] border border-purple-500/20">
            <div className="flex flex-col items-center space-y-4 text-center mb-8">
              {/* Logo */}
              <div className="w-12 h-12 mb-2 relative animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-800 rounded-xl rotate-45 transform -translate-y-1 -translate-x-1"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl rotate-45 shadow-lg"></div>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
                  GQ
                </span>
              </div>

              {/* Title and subtitle */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight animate-fade-in bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
                  Welcome to Gen Query
                </h1>
                <div className="h-0.5 w-12 bg-gradient-to-r from-purple-500/60 to-transparent mx-auto"></div>
                <p className="text-sm text-purple-200/60 animate-fade-in animation-delay-200">
                  Sign in to continue to your account
                </p>
              </div>
            </div>

            <div className="animate-fade-in animation-delay-400">
              <LoginForm />
            </div>

            <div className="mt-8 pt-6 border-t border-purple-500/20">
              <div className="flex items-center justify-center gap-6">
                <Link
                  href="/terms-of-use"
                  className="text-sm text-purple-200/40 hover:text-purple-200 transition-colors duration-200 cursor-pointer"
                >
                  Terms of use
                </Link>
                <div className="w-1 h-1 rounded-full bg-purple-500/40"></div>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-purple-200/40 hover:text-purple-200 transition-colors duration-200 cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
