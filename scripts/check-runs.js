const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRuns() {
    console.log("Checking workflow runs...");
    const { data, error } = await supabase
        .from("workflow_runs")
        .select("*")
        .order("executed_at", { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching runs:", error);
    } else {
        console.log("Recent runs:", data);
    }
}

checkRuns();
