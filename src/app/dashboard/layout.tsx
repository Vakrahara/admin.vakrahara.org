'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { useInstitutions } from '@/hooks/useInstitutions';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Building2,
  LogOut, 
  ShieldAlert, 
  Menu, 
  X, 
  Loader2,
  ChevronRight,
  Package,
  Bell
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Administrator');
  const [adminRole, setAdminRole] = useState('Admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { pendingCount } = useInstitutions();

  useEffect(() => {
    const verifyAuth = () => {
      if (!pb.authStore.isValid) {
        router.push(`/login?redirect=${pathname}`);
        return;
      }
      
      const record = pb.authStore.record;
      if (record) {
        setAdminName(record.name || record.username || 'Co-ordinator');
        const email = record.email?.toLowerCase();
        setAdminRole(email === 'vkarms.vk@gmail.com' ? 'Super Admin' : 'Staff Admin');
      }
      setLoading(false);
    };

    verifyAuth();
    const unsub = pb.authStore.onChange(() => verifyAuth());
    return () => unsub();
  }, [router, pathname]);

  const handleSignOut = () => {
    pb.authStore.clear();
    document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
    router.refresh();
  };

  const menuItems: SidebarItem[] = [
    { name: 'Analytics Summary', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/dashboard/users', icon: Users },
    { name: 'Institution Requests', href: '/dashboard/institutions', icon: Building2, badge: pendingCount },
    { name: 'Curriculum CMS', href: '/dashboard/content', icon: BookOpen },
    { name: 'App Releases', href: '/dashboard/releases', icon: Package },
    { name: 'Push Notifications', href: '/dashboard/push', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mx-auto" />
          <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
            Decrypting Control Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-gray-100 flex flex-col md:flex-row relative">
      {/* Background radial accent glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#800020]/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Mobile Header Bar */}
      <header className="md:hidden w-full bg-[#08080c] border-b border-white/10 px-6 py-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#b8860b] to-[#d4af37] rounded-lg flex items-center justify-center shadow-lg shadow-[#d4af37]/15">
            <ShieldAlert className="w-4 h-4 text-[#050508]" />
          </div>
          <span className="font-bold tracking-wide text-white text-sm">Vakrahara Console</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-[#08080c] border-r border-white/10 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo Header */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#b8860b] to-[#d4af37] rounded-xl flex items-center justify-center shadow-lg shadow-[#d4af37]/20 border border-[#d4af37]/30">
              <ShieldAlert className="w-5 h-5 text-[#050508]" />
            </div>
            <div>
              <span className="font-bold tracking-wide text-white text-base block">Vakrahara</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Console</span>
            </div>
          </div>

          {/* User Account Info */}
          <div className="p-4 bg-[#0d0d15] border border-white/10 rounded-2xl flex items-center gap-3 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-[#d4af37] flex items-center justify-center font-bold text-sm text-[#050508] shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{adminName}</div>
              <div className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider mt-0.5">{adminRole}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group relative
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/5 border-l-2 border-[#d4af37] text-white shadow-[0_0_15px_rgba(212,175,55,0.05)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#d4af37]' : 'text-gray-400 group-hover:text-white'}`} />
                    {item.name}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-[#050508] text-[10px] font-bold shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ${isActive ? 'text-[#d4af37] opacity-80' : 'text-gray-500'}`} />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Node
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 z-10 relative overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Overlay background when mobile sidebar is open */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 md:hidden"
        />
      )}
    </div>
  );
}
