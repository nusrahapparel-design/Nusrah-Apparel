import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CLIENT INITIALIZATION CONFIG
// ==========================================
const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL || 'https://fnyczmefhgmktoirtbnw.supabase.co').trim();
const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueWN6bWVmaGdta3RvaXJ0Ym53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTE5MzgsImV4cCI6MjA5NjM4NzkzOH0.29EucPbxT-5zx_5YceeEXnK1AOgCE71hN1kSueFDlLE').trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * =========================================================================
 * SUPABASE SQL SCHEMA GENERATION PROTOCOL (Run this query in Supabase SQL editor)
 * =========================================================================
 * 
 * -- 1. Profiles Database Sync
 * create table if not exists public.profiles (
 *   id uuid references auth.users on delete cascade primary key,
 *   name text not null,
 *   email text unique not null,
 *   phone text,
 *   profile_pic text,
 *   dob text,
 *   gender text,
 *   joined_date text,
 *   role text default 'student',
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable Row Level Security & Setup idempotent policies safely by dropping first
 * alter table public.profiles enable row level security;
 * drop policy if exists "Allow public read access to profiles" on public.profiles;
 * drop policy if exists "Allow individual write access to profiles" on public.profiles;
 * drop policy if exists "Allow individual update access to profiles" on public.profiles;
 * 
 * create policy "Allow public read access to profiles" on public.profiles for select using (true);
 * create policy "Allow individual write access to profiles" on public.profiles for insert with check (auth.uid() = id);
 * create policy "Allow individual update access to profiles" on public.profiles for update using (auth.uid() = id);
 * 
 * -- 2. Orders Database Sync & Management
 * create table if not exists public.orders (
 *   id bigint generated always as identity primary key,
 *   order_id text unique not null,
 *   items jsonb not null,
 *   subtotal numeric not null,
 *   shipping numeric not null,
 *   total numeric not null,
 *   currency_at_order text,
 *   date text,
 *   payment_method text,
 *   full_name text,
 *   phone text,
 *   email text,
 *   address text,
 *   delivery_address text,
 *   note text,
 *   status text default 'Pending',
 *   payment_status text default 'Unpaid',
 *   tx_id text,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable Row Level Security on Orders safely
 * alter table public.orders enable row level security;
 * drop policy if exists "Allow anonymous and authenticated read orders" on public.orders;
 * drop policy if exists "Allow anyone to insert orders" on public.orders;
 * drop policy if exists "Allow all admins to update or delete orders" on public.orders;
 * 
 * create policy "Allow anonymous and authenticated read orders" on public.orders for select using (true);
 * create policy "Allow anyone to insert orders" on public.orders for insert with check (true);
 * create policy "Allow all admins to update or delete orders" on public.orders for all using (true) with check (true);
 * 
 * -- 3. Configuration & CRM Management
 * create table if not exists public.shop_config (
 *   id text primary key,
 *   phone_en text,
 *   phone_bn text,
 *   email text,
 *   bkash_numbers jsonb,
 *   nagad_numbers jsonb,
 *   rocket_numbers jsonb,
 *   address_en text,
 *   address_bn text,
 *   footer_bio_en text,
 *   footer_bio_bn text,
 *   announcement_en text,
 *   announcement_bn text,
 *   facebook_link text,
 *   youtube_link text,
 *   instagram_link text,
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * alter table public.shop_config enable row level security;
 * drop policy if exists "Allow public read access to shop_config" on public.shop_config;
 * drop policy if exists "Allow public write access to shop_config" on public.shop_config;
 * 
 * create policy "Allow public read access to shop_config" on public.shop_config for select using (true);
 * create policy "Allow public write access to shop_config" on public.shop_config for all using (true);
 */

// ==========================================
// RESILIENT DB & AUTH LAYER (with local storage fallback)
// ==========================================

export async function dbGetOrders(): Promise<any[] | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase: orders table error or missing. Falling back to local storage.', error.message);
      return null;
    }
    
    // Map snake_case to camelCase nicely so frontend needs 0 visual modifications
    return (data || []).map(order => ({
      orderId: order.order_id,
      items: order.items,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      currencyAtOrder: order.currency_at_order,
      date: order.date,
      paymentMethod: order.payment_method,
      fullName: order.full_name,
      phone: order.phone,
      email: order.email,
      address: order.address,
      deliveryAddress: order.delivery_address,
      note: order.note,
      status: order.status,
      paymentStatus: order.payment_status,
      txId: order.tx_id,
      id: order.id
    }));
  } catch (err) {
    console.error('Supabase get orders crash:', err);
    return null;
  }
}

export async function dbInsertOrder(order: any): Promise<boolean> {
  try {
    const mappedOrder = {
      order_id: order.orderId,
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      currency_at_order: order.currencyAtOrder,
      date: order.date,
      payment_method: order.paymentMethod,
      full_name: order.fullName,
      phone: order.phone,
      email: order.email,
      address: order.address,
      delivery_address: order.deliveryAddress,
      note: order.note,
      status: order.status,
      payment_status: order.paymentStatus,
      tx_id: order.txId
    };

    const { error } = await supabase
      .from('orders')
      .insert([mappedOrder]);

    if (error) {
      console.error('Supabase order insert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase order insert crash:', err);
    return false;
  }
}

export async function dbUpdateOrderStatus(orderId: string, status: string, paymentStatus?: string): Promise<boolean> {
  try {
    const updates: any = { status };
    if (paymentStatus) {
      updates.payment_status = paymentStatus;
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_id', orderId);

    if (error) {
      console.error('Supabase update status failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update status crash:', err);
    return false;
  }
}

export async function dbDeleteOrder(orderId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', orderId);

    if (error) {
      console.error('Supabase delete status failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete status crash:', err);
    return false;
  }
}

// ==========================================
// CUSTOMER AUTH & SYNCRONIZATION
// ==========================================

export interface NusrahUser {
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  dob?: string;
  gender?: string;
  joinedDate?: string;
  role?: 'student' | 'admin';
}

export async function dbSignUp(emailStr: string, passwordStr: string, fullNameStr: string, phoneStr: string, roleStr?: 'student' | 'admin'): Promise<NusrahUser | null> {
  try {
    const resolvedRole = roleStr || 'student';
    // 1. Sign up user with user metadata role
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: emailStr,
      password: passwordStr,
      options: {
        data: {
          name: fullNameStr,
          phone: phoneStr,
          role: resolvedRole
        }
      }
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    const user = signUpData.user;
    if (!user) return null;

    const joined = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // 2. Insert into profiles table
    const profile = {
      id: user.id,
      name: fullNameStr,
      email: emailStr,
      phone: phoneStr,
      joined_date: joined,
      profile_pic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      dob: "",
      gender: ""
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profile]);

    if (profileError) {
      console.warn('Profile schema missing or not loaded. Returning localized memory profile:', profileError.message);
    }

    return {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      profilePic: profile.profile_pic,
      dob: profile.dob,
      gender: profile.gender,
      joinedDate: profile.joined_date,
      role: resolvedRole
    };
  } catch (err: any) {
    console.error('Supabase sign up failed:', err);
    throw err;
  }
}

export async function dbLogin(emailStr: string, passwordStr: string): Promise<NusrahUser | null> {
  try {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: emailStr,
      password: passwordStr
    });

    if (loginError) {
      throw new Error(loginError.message);
    }

    const user = loginData.user;
    if (!user) return null;

    // Fetch matching user profile
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError || !profileData) {
      console.warn('Profile table fetch error or empty:', fetchError?.message);
      // Construct from Auth metadata
      return {
        name: user.user_metadata?.name || emailStr.split('@')[0],
        email: emailStr,
        phone: user.user_metadata?.phone || '',
        joinedDate: "June 2026",
        profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        role: user.user_metadata?.role || 'student'
      };
    }

    return {
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone || '',
      profilePic: profileData.profile_pic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      dob: profileData.dob || '',
      gender: profileData.gender || '',
      joinedDate: profileData.joined_date || "June 2026",
      role: (profileData as any).role || user.user_metadata?.role || 'student'
    };
  } catch (err: any) {
    console.error('Supabase log in failed:', err);
    throw err;
  }
}

export async function dbUpdateProfile(emailStr: string, profileEditForm: any): Promise<boolean> {
  try {
    const sessionUser = (await supabase.auth.getUser()).data.user;
    if (!sessionUser) return false;

    const mappedProfile = {
      id: sessionUser.id,
      email: sessionUser.email || emailStr,
      name: profileEditForm.name,
      phone: profileEditForm.phone,
      dob: profileEditForm.dob,
      gender: profileEditForm.gender,
      profile_pic: profileEditForm.profilePic,
      joined_date: profileEditForm.joinedDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(mappedProfile, { onConflict: 'id' });

    if (error) {
      console.error('Supabase update profile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update profile crash:', err);
    return false;
  }
}

// ==========================================
// DYNAMIC CRM CONFIG SYNCRONIZATION
// ==========================================

export async function dbGetShopConfig(): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('shop_config')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error) {
      console.warn('Supabase shop config check error:', error.message);
      return null;
    }

    if (data) {
      return {
        phoneEn: data.phone_en,
        phoneBn: data.phone_bn,
        email: data.email,
        bkashNumbers: data.bkash_numbers,
        nagadNumbers: data.nagad_numbers,
        rocketNumbers: data.rocket_numbers,
        addressEn: data.address_en,
        addressBn: data.address_bn,
        footerBioEn: data.footer_bio_en,
        footerBioBn: data.footer_bio_bn,
        announcementEn: data.announcement_en,
        announcementBn: data.announcement_bn,
        facebookLink: data.facebook_link,
        youtubeLink: data.youtube_link,
        instagramLink: data.instagram_link,
        leadership: data.leadership || null,
      };
    }
    return null;
  } catch (err) {
    console.error('Supabase get config crash:', err);
    return null;
  }
}

export async function dbSaveShopConfig(config: any): Promise<boolean> {
  try {
    const mappedConfig: any = {
      id: 'current',
      phone_en: config.phoneEn,
      phone_bn: config.phoneBn,
      email: config.email,
      bkash_numbers: config.bkashNumbers,
      nagad_numbers: config.nagadNumbers,
      rocket_numbers: config.rocketNumbers,
      address_en: config.addressEn,
      address_bn: config.addressBn,
      footer_bio_en: config.footerBioEn,
      footer_bio_bn: config.footerBioBn,
      announcement_en: config.announcementEn,
      announcement_bn: config.announcementBn,
      facebook_link: config.facebookLink,
      youtube_link: config.youtubeLink,
      instagram_link: config.instagramLink,
    };

    const mappedConfigWithLeadership = { ...mappedConfig, leadership: config.leadership };

    const { error } = await supabase
      .from('shop_config')
      .upsert([mappedConfigWithLeadership]);

    if (error) {
      console.warn('Supabase save with leadership column failed, trying fallback without leadership:', error.message);
      const { error: fallbackError } = await supabase
        .from('shop_config')
        .upsert([mappedConfig]);
      if (fallbackError) {
        console.error('Supabase save configuration failure:', fallbackError.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('Supabase save configuration exception:', err);
    return false;
  }
}
