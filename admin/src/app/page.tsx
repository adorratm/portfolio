import { redirect } from 'next/navigation';

/** Kök URL → login sayfasına yönlendir */
export default function AdminIndexPage() {
  redirect('/login');
}
