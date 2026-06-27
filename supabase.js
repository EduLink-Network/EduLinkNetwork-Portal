import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://wijqrrecsvxdrwdpbbww.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanFycmVjc3Z4ZHJ3ZHBiYnd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MjI1MTMsImV4cCI6MjA5Nzk5ODUxM30.cxi-st7EsjKIscg0Gjr84ysUhLnRoIYJ16bZy6KewKQ"

export const supabase = createClient(supabaseUrl, supabaseKey)