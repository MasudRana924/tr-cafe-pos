import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import emailIcon from "@/assets/Email.svg";
import lockIcon from "@/assets/Lock.svg";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLoginMutation, useMeQuery } from "@/hooks/useAuth";
import { authStore } from "@/lib/authStore";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"admin" | "salesman">("admin");
  const login = useLoginMutation();
  useMeQuery(Boolean(authStore.get().token));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>({
    defaultValues: { email: "admin@example.com", password: "admin123" },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // keep the existing "role toggle sets email" UX
    // (password stays user-controlled)
  }, []);

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const res = await login.mutateAsync(values);
      const token = (res as any)?.data?.token ?? (res as any)?.token;
      if (!token) return toast.error("Login failed: token missing");
      const user = (res as any)?.data?.user ?? (res as any)?.user;
      if (user?.name) toast.success(`Welcome, ${user.name}`);
      else toast.success("Logged in");
      navigate({ to: user?.role === "admin" ? "/admin" : "/pos" });
    } catch (e: any) {
      toast.error(e?.message ?? "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-left text-2xl font-bold mb-4">Welcome to TR Cafe POS</h2>
          
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <img src={emailIcon} alt="Email" width="24" height="24" />
            </div>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Email"
              className="w-full h-[58px] pl-12 pr-4 rounded-[12px] border border-[#F5F5F5] bg-[#F5F5F5] focus:outline-none focus:border-[#F5F5F5]"
              style={{ width: "410px", height: "58px" }}
            />
            {errors.email?.message && <div className="text-xs text-destructive mt-1">{errors.email.message}</div>}
          </div>
          
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <img src={lockIcon} alt="Lock" width="24" height="24" />
            </div>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Password"
              className="w-full h-[58px] pl-12 pr-4 rounded-[12px] border border-[#F5F5F5] bg-[#F5F5F5] focus:outline-none focus:border-[#F5F5F5]"
              style={{ width: "410px", height: "58px" }}
            />
            {errors.password?.message && <div className="text-xs text-destructive mt-1">{errors.password.message}</div>}
          </div>

          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                checked={role === "admin"}
                onChange={() => {
                  setRole("admin");
                  setValue("email", "admin@example.com");
                  setValue("password", "admin123");
                }}
                className="w-4 h-4"
              />
              <span>Admin</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                checked={role === "salesman"}
                onChange={() => {
                  setRole("salesman");
                  setValue("email", "salesman1@example.com");
                  setValue("password", "salesman123");
                }}
                className="w-4 h-4"
              />
              <span>Salesman</span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white hover:bg-gray-800"
            style={{ width: "410px", height: "58px", borderRadius: "12px" }}
            disabled={isSubmitting || login.isPending}
          >
            {login.isPending ? "Logging in..." : "Login"}
          </Button>

          {/* <div className="text-xs text-gray-600 mt-4 p-3 bg-gray-100 rounded-lg">
            <div className="font-medium mb-1">Login Credentials:</div>
            Admin: <code>admin@canteen.com</code>
            <br />
            Salesman: <code>rahim@canteen.com</code>
            <br />
            Password: anything
          </div> */}
        </form>
      </div>
    </div>
  );
}
