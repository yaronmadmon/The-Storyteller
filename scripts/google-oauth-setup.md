# Google OAuth setup – copy/paste checklist

Your Supabase project ref: **eldnwhvwgkbsipqouins**

## 1. Supabase – Redirect URLs

1. Open: **Authentication → URL Configuration**  
   https://supabase.com/dashboard/project/eldnwhvwgkbsipqouins/auth/url-configuration

2. Under **Redirect URLs**, add (one per line):
   - `http://localhost:3000/auth/callback`
   - Add your production URL when you deploy, e.g. `https://yourdomain.com/auth/callback`

3. Click **Save**.

---

## 2. Google Cloud – OAuth client

1. Open: **APIs & Services → Credentials**  
   https://console.cloud.google.com/apis/credentials

2. **Create Credentials** → **OAuth client ID**.

3. If prompted, configure the **OAuth consent screen** (External, add your app name and support email).

4. Application type: **Web application**.

5. **Authorized redirect URIs** → Add this exact URL (copy-paste):
   ```
   https://eldnwhvwgkbsipqouins.supabase.co/auth/v1/callback
   ```

6. Create → copy the **Client ID** and **Client Secret**.

---

## 3. Supabase – Enable Google provider

1. Open: **Authentication → Providers → Google**  
   https://supabase.com/dashboard/project/eldnwhvwgkbsipqouins/auth/providers

2. Turn **Google** **Enable** ON.

3. Paste **Client ID** and **Client Secret** from step 2.

4. Click **Save**.

---

After that, use **Continue with Google** on your app’s login page to test.
