import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aqcwibfanlyhpwmtqdgq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxY3dpYmZhbmx5aHB3bXRxZGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NjI1OTUsImV4cCI6MjA4NDUzODU5NX0.cpGVwPNOWaShEDzhyIu18QSczDo6XHhhZi0gT3uQ5dk'

export const supabase = createClient(supabaseUrl, supabaseKey)