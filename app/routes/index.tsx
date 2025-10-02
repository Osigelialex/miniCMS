import { getServerClient } from "~/config/supabase.server";
import type { Route } from "./+types/index";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const { supabase } = getServerClient(request);
    const userResponse = await supabase.auth.getUser();

    if (!userResponse?.data?.user) {
      throw redirect("/login");
    } else {
      throw redirect("/articles");
    }
  } catch (error) {
    console.error(error);
    throw redirect("/login");
  }
}
