import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/forms/login-form";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-6">
        <LoginForm />
      </div>
    </div>
  );
}
