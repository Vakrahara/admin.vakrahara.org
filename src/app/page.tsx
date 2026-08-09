import { redirect } from 'next/navigation';

export default function RootPage() {
  // Edge middleware intercepts / and redirects logged in admins/staff to /dashboard
  // Non-logged in users hitting root are redirected to /login
  redirect('/dashboard');
}
