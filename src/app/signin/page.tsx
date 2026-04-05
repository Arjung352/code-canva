"use client";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { userCreateSchema } from "@/schemaValidation/authSchemaValidation";

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    try {
      const result = userCreateSchema.parse({ username, email, password });
      if (!result.success) {
        console.error("Validation error:", result.error);
        return;
      }
      await signUp.create({
        emailAddress: email,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      router.push("/verify-email");
    } catch (err) {
      console.error("Sign up error:", err);
    }
  };

  const handleGoogleSignUp = () => {
    if (!isLoaded) return;
    console.log("clicked"); // 👈 add this
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create your account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john_doe"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-300 dark:bg-zinc-700"></div>
          <span className="text-sm text-gray-500">OR</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-zinc-700"></div>
        </div>

        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full border py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a
            href="/signin"
            className="text-black dark:text-white font-medium hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
