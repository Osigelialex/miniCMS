import { data, Form, redirect, useNavigate, useNavigation } from "react-router";
import type { Route } from "../+types";
import { getServerClient } from "~/config/supabase.server";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "~/schema/auth.schema";
import { toast } from "sonner";
import { Button } from "~/components/ui/Button";

interface FormInputs {
  email: string;
  password: string;
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const dataFields = Object.fromEntries(formData.entries());
    const { supabase, headers } = getServerClient(request);

    const { data, error } = await supabase.auth.signUp({
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

    return { error: "Something went wrong during signup" }
  }
}

export default function Signup() {
  const {
    register,
    formState: { errors }
  } = useForm<FormInputs>({
    resolver: yupResolver(signupSchema)
  });

  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  return (
    <main className="min-h-screen grid place-items-center">
      <Form method="post" className="w-full p-3 sm:max-w-md">
        <div className="text-center space-y-3 mb-4">
          <h1 className="text-2xl font-bold">Create your account now</h1>
          <p>Enter your details below to create your account</p>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="font-bold block">Email</label>
            <input {...register("email")} type="email" name="email" className="bg-gray-200 p-2 rounded-sm w-full" />
          </div>
          <div>
            <label htmlFor="password" className="font-bold block">Password</label>
            <input {...register("password")} type="password" name="password" className="bg-gray-200 p-2 rounded-sm w-full" />
          </div>
          <Button 
            type="submit"
            isLoading={isLoading}
            className="w-full">Create Account</Button>
        </div>
        <p className="text-center mt-5 cursor-pointer">Already signed up? <a className="font-bold" onClick={() => navigate('/')}>Login</a></p>
      </Form>
    </main>
  )
}
