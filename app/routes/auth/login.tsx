import { Form, redirect, useNavigate, useActionData } from "react-router";
import { useForm } from "react-hook-form"
import type { Route } from "./+types/login";
import { getServerClient } from "~/config/supabase.server";
import { loginSchema } from "~/schema/auth.schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { Button } from "~/components/ui/Button";
import { useNavigation } from "react-router";
import { useEffect } from "react";

interface FormInputs {
  email: string;
  password: string;
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const dataFields = Object.fromEntries(formData.entries());
    const { supabase, headers } = getServerClient(request);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: dataFields.email as string,
      password: dataFields.password as string,
    });

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      return redirect("/articles", { headers });
    }

    return { user: data.user }
  } catch (error: any) {
    if (error instanceof Error) {
      return { error: error.message }
    }

    return { error: "Something went wrong during login" }
  }
}

export default function Login() {
  const {
    register,
    formState: { errors }
  } = useForm<FormInputs>({
    resolver: yupResolver(loginSchema)
  });

  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string }>();
  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <main className="min-h-screen grid place-items-center">
      <Form method="post" className="w-full p-3 sm:max-w-md">
        <div className="text-center space-y-3 mb-4">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p>Enter your details below to proceed</p>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="font-bold block">Email</label>
            <input {...register("email")} type="email" name="email" className="bg-gray-200 p-2 rounded-sm w-full mb-1" />
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="font-bold block">Password</label>
            <input {...register("password")} type="password" name="password" className="bg-gray-200 p-2 rounded-sm w-full mb-1" />
            {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
          >
            Log in
          </Button>
        </div>
        <p className="text-center mt-5 cursor-pointer">No account? <a className="font-bold" onClick={() => navigate('/signup')}>Signup</a></p>
      </Form>
    </main>
  )
}
