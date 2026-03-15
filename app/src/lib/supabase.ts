import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqtuoxbrliepgzxmlmol.supabase.co';
const supabaseAnonKey = 'sb_publishable_NrcHPuIk_4VvAaUIV-ZaTQ_MIiRmzRz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
