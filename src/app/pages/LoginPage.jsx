import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { loginUser } from '../../services/apiService';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card';

export function LoginPage() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {

      const response = await loginUser({
        email,
        password
      });

      console.log("Login Response:", response);

      // ✅ FIXED (NO .data here)
      if (response.success) {

  // Save token
  localStorage.setItem(
    "token",
    response.token
  );

  // ✅ Save user also (VERY IMPORTANT)
  localStorage.setItem(
    "portfolio_user",
    JSON.stringify(response.user)
  );

  console.log("Token Saved");
  console.log("User Saved");

  console.log("Navigating to dashboard...");

  navigate("/");
}else {

        setError(
          response.message || "Login failed"
        );

      }

    } catch (err) {

      console.error("Login Error:", err);

      setError(
        err.message ||
        "Unable to connect to server"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">

            <LogIn className="text-white" size={32} />

          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h1>

          <p className="text-blue-200">
            AI-Driven Strategic Project Portfolio Platform
          </p>

        </div>

        <Card>

          <CardHeader>

            <CardTitle>
              Sign In
            </CardTitle>

            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>

          </CardHeader>

          <CardContent>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Email */}

              <div className="space-y-2">

                <Label htmlFor="email">
                  Email
                </Label>

                <div className="relative">

                  <Mail
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />

                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="pl-10"
                  />

                </div>

              </div>

              {/* Password */}

              <div className="space-y-2">

                <Label htmlFor="password">
                  Password
                </Label>

                <div className="relative">

                  <Lock
                    className="absolute left-3 top-3 text-gray-400"
                    size={18}
                  />

                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="pl-10"
                  />

                </div>

              </div>

              {/* Error Message */}

              {error && (

                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">

                  {error}

                </div>

              )}

              {/* Submit Button */}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >

                {loading
                  ? "Signing In..."
                  : "Sign In"
                }

              </Button>

            </form>

          </CardContent>

          <CardFooter className="flex justify-center">

            <p className="text-sm text-gray-600">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >

                Register here

              </Link>

            </p>

          </CardFooter>

        </Card>

        <div className="mt-6 text-center text-sm text-blue-200">

          <p>
            Use your registered email and password to login
          </p>

        </div>

      </div>

    </div>

  );

}