import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  // On a fresh install (no accounts yet) the page offers to create the first
  // admin instead of a sign-in form. `null` = still checking.
  const [isFreshInstall, setIsFreshInstall] = useState<boolean | null>(null);

  useEffect(() => {
    (supabase as any)
      .rpc("has_any_user")
      .then(({ data, error }: { data: boolean | null; error: any }) => {
        setIsFreshInstall(error ? false : !data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isFreshInstall) {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Admin account created — you're signed in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Logged in successfully");
      }
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/images/logo.png" alt="Inventory Manager" className="h-12 w-12 mb-3 object-contain" />
          <h1 className="text-xl font-bold text-foreground">Inventory Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isFreshInstall
              ? "Create the first admin account to get started"
              : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6">
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="h-9 mt-1"
              required
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="h-9 mt-1"
              minLength={6}
              required
            />
          </div>
          <Button type="submit" className="w-full h-9 text-sm" disabled={loading || isFreshInstall === null}>
            {isFreshInstall ? <UserPlus className="h-3.5 w-3.5 mr-1.5" /> : <LogIn className="h-3.5 w-3.5 mr-1.5" />}
            {loading
              ? (isFreshInstall ? "Creating account..." : "Signing in...")
              : (isFreshInstall ? "Create Admin Account" : "Sign In")}
          </Button>
        </form>
      </div>
    </div>
  );
}
