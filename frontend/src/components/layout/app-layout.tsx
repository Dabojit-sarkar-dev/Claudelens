import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19]">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
