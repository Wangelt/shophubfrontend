"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login, adminLogin } from "@/services/authservices"
import Link from "next/link"
import { useState } from "react" 
import { toast, Toaster } from "react-hot-toast";
  import { useRouter } from "next/navigation";
export function LoginForm({
  redirectTo = "/profile",
  title = "Login",
  description = "Choose account type and enter your credentials",
  useAdmin = false,
} = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  // Local toggle to select role; seed from prop for compatibility
  const [isAdmin, setIsAdmin] = useState(!!useAdmin);
 
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = isAdmin
        ? await adminLogin(email, password)
        : await login(email, password);
      if (response.success) {
        toast.success(response.data.message || "Login successful");
        // Redirect based on selected account type unless custom redirectTo is provided
        const target = redirectTo || (isAdmin ? "/admin" : "/profile");
        router.push(target);
      }
    } catch (error) {
     toast.error(
       error?.message ||
       error?.response?.data?.message ||
       error?.response?.data?.errors?.[0]?.message ||
       "Something went wrong"
     );
    } finally {
      setLoading(false);    
    }
  };
  return (
    <div>
     
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <div className="flex gap-2 rounded-md border p-1 w-full max-w-xs">
                  <button
                    type="button"
                    className={`flex-1 rounded-md px-3 py-2 text-sm ${!isAdmin ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                    onClick={() => setIsAdmin(false)}
                    aria-pressed={!isAdmin}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-md px-3 py-2 text-sm ${isAdmin ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                    onClick={() => setIsAdmin(true)}
                    aria-pressed={isAdmin}
                  >
                    Admin
                  </button>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
              <Field>
                <Button onClick={handleSubmit} type="submit">Login</Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
