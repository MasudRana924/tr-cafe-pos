import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@canteen.com");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<"admin" | "salesman">("admin");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password");
    
    const u = store.login(email, role);
    if (!u) return toast.error("Invalid credentials. Try the demo accounts shown below.");
    toast.success(`Welcome, ${u.name}`);
    navigate({ to: u.role === "admin" ? "/admin" : "/pos" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm p-6">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-left text-2xl font-bold mb-4">Welcome to TR Cafe POS</h2>
          
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <img src="/src/assets/Email.svg" alt="Email" width="24" height="24" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full h-[58px] pl-12 pr-4 rounded-[12px] border border-[#F5F5F5] bg-[#F5F5F5] focus:outline-none focus:border-[#F5F5F5]"
              style={{ width: "410px", height: "58px" }}
            />
          </div>
          
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <img src="/src/assets/Lock.svg" alt="Lock" width="24" height="24" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-[58px] pl-12 pr-4 rounded-[12px] border border-[#F5F5F5] bg-[#F5F5F5] focus:outline-none focus:border-[#F5F5F5]"
              style={{ width: "410px", height: "58px" }}
            />
          </div>

          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="role"
                checked={role === "admin"}
                onChange={() => {
                  setRole("admin");
                  setEmail("admin@canteen.com");
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
                  setEmail("rahim@canteen.com");
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
          >
            Login
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
