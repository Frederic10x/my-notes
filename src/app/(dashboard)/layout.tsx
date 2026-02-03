import Sidebar from "@/app/components/ui/Sidebar";
import Header from "@/app/components/ui/Header";
import MobileNav from "@/app/components/ui/MobileNav";
import FAB from "@/app/components/ui/FAB";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      {/* Desktop: Sidebar + Main Content */}
      <Sidebar />
      <div className={styles.mainWrapper}>
        {/* Mobile: Header */}
        <Header />
        <main className={styles.main}>{children}</main>
      </div>
      {/* Mobile: Bottom Nav */}
      <MobileNav />
      {/* Floating Action Button */}
      <FAB />
    </div>
  );
}
