import { api } from "@/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity, Layers, LayoutDashboard, LogOut, Settings, User, UserCircle, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

export function DashboardLayout() {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");

  useEffect(() => {
    api.getOrgs().then((data) => {
      setOrgs(data);
      if (data.length > 0) {
        const defaultId = data[0].id.toString();
        setSelectedOrgId(defaultId);
        localStorage.setItem("selectedOrgId", defaultId);
      }
    });
  }, []);

  const setOrg = (id) => {
    setSelectedOrgId(id);
    localStorage.setItem("selectedOrgId", id);
    window.dispatchEvent(new Event("orgChanged")); // notify pages
  };

  const getSelectedOrgName = () => {
    const org = orgs.find((o) => o.id.toString() === selectedOrgId);
    return org ? org.name : "Select an Organization...";
  };

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
            <Activity className="h-6 w-6 text-primary" />
            ISO Workflow <span className="text-muted-foreground font-light">Engine</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <div className="pb-4 pt-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Management
            </p>
            <NavLink
              to="/builder"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Layers className="h-4 w-4" />
              Workflow Builder
            </NavLink>
            <NavLink
              to="/tracker"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              Applications
            </NavLink>
          </div>
          <div className="pb-4">
            <NavLink
              to="#"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`
              }
            >
            
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b bg-background flex items-center justify-end px-8 shrink-0 gap-6 shadow-sm z-10">
          <div className="flex items-center gap-3 border-r pr-6">
            <span className="text-sm text-muted-foreground font-medium">Context:</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9 w-64 items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                <span className="truncate text-foreground font-medium">{getSelectedOrgName()}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background border shadow-md z-50">
                {orgs.map((o) => (
                  <DropdownMenuItem 
                    key={o.id} 
                    onClick={() => setOrg(o.id.toString())}
                    className="cursor-pointer"
                  >
                    {o.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground hidden sm:inline-block">admin</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-background shadow-lg border">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Scrollable Page Outlet */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
