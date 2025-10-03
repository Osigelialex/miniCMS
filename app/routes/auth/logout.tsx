import { getServerClient } from "~/config/supabase.server";
import { redirect } from "react-router";

export async function action({ request }: { request: Request }) {
  try {
    const { supabase, headers } = getServerClient(request);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return redirect("/", { headers });
  } catch (error: any) {
    return { error: error.message || "Something went wrong during logout" };
  }
}
