import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Gen Query
        </h1>
      </div>
      <LoginForm />

      <div className="grid gap-2">
        <div className="flex items-center justify-center gap-2">
          <a>
            <p>Terms of use</p>
          </a>
          <a>
            <p>Privacy Policy</p>
          </a>
        </div>
      </div>
    </div>
  );
}
