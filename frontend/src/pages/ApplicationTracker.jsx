import { useState, useEffect } from "react";
import { api } from "@/api";
import { PlayCircle, CheckCircle2, ArrowRightCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ApplicationTracker() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const handleOrgChange = () => loadTrackerData();
    window.addEventListener("orgChanged", handleOrgChange);
    
    // Initial load
    if (localStorage.getItem("selectedOrgId")) {
      loadTrackerData();
    }
    
    return () => window.removeEventListener("orgChanged", handleOrgChange);
  }, []);

  const loadTrackerData = () => {
    const orgId = localStorage.getItem("selectedOrgId");
    if (!orgId) return;

    api.getWorkflows(orgId).then((data) => setWorkflows(data));
    api.getApps(orgId).then((data) => {
      Promise.all(data.map((app) => api.getAppDetails(app.id))).then((detailedApps) => {
        setApplications(detailedApps.sort((a,b) => b.id - a.id)); // Newest first
      });
    });
  };

  const startApplication = async () => {
    const orgId = localStorage.getItem("selectedOrgId");
    if (!orgId) return alert("Select an Org from the header");
    if (!selectedWorkflowId) return alert("Select a workflow from the dropdown");
    await api.createApp(orgId, selectedWorkflowId);
    loadTrackerData();
  };

  const advanceApp = async (appId) => {
    await api.advanceApp(appId);
    loadTrackerData();
  };

  const getSelectedWorkflowName = () => {
    if (!selectedWorkflowId) return "-- Choose Template --";
    const w = workflows.find((w) => w.id.toString() === selectedWorkflowId.toString());
    return w ? w.name : "-- Choose Template --";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Applications</h1>
          <p className="text-muted-foreground mt-2">
            Track and advance ISO applications through their custom dynamic flows.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border rounded-lg p-2 shadow-sm">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-64 items-center justify-between rounded-md border-0 bg-transparent hover:bg-muted/50 px-3 text-sm focus:outline-none transition-colors">
              <span className="truncate">{getSelectedWorkflowName()}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-background border shadow-md z-50">
              {workflows.map((w) => (
                <DropdownMenuItem 
                  key={w.id} 
                  onClick={() => setSelectedWorkflowId(w.id.toString())}
                  className="cursor-pointer"
                >
                  {w.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            onClick={startApplication}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
          >
            <PlayCircle className="mr-2 h-4 w-4" /> Start Application
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground shadow-sm">
            <ActivityIcon className="mx-auto h-12 w-12 opacity-20 mb-4" />
            No active applications found for this Organization. <br/>Start one from above!
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="flex items-center justify-between p-6 border-b bg-muted/10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/20 text-primary font-bold flex items-center justify-center rounded-lg">
                    #{app.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{app.workflow_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                        app.status === "completed" 
                        ? "border-emerald-500 text-emerald-600 bg-emerald-50" 
                        : "border-blue-500 text-blue-600 bg-blue-50"
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => advanceApp(app.id)}
                  disabled={app.status === "completed"}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 disabled:opacity-50"
                >
                  {app.status === "completed" ? (
                    <><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Finished</>
                  ) : (
                    <>Approve step <ArrowRightCircle className="ml-2 h-4 w-4 text-blue-500" /></>
                  )}
                </button>
              </div>
              
              <div className="p-6 overflow-x-auto">
                <div className="flex items-center space-x-2">
                  {app.all_steps.map((s, i) => {
                    const isDone = app.status === "completed" || i < app.current_step_order;
                    const isCurrent = i === app.current_step_order && app.status !== "completed";
                    const isPending = i > app.current_step_order && app.status !== "completed";

                    return (
                      <div key={i} className="flex items-center shrink-0">
                        {/* the step pill */}
                        <div className={`
                          flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-300
                          ${isDone ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : ""}
                          ${isCurrent ? "bg-primary border-primary text-white shadow-md scale-105" : ""}
                          ${isPending ? "bg-muted text-muted-foreground border-transparent border-dashed border-2 bg-transparent border-border" : ""}
                        `}>
                          <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                            {i+1}
                          </span>
                          {s.name}
                        </div>
                        
                        {/* connecting line, don't show after last step */}
                        {i < app.all_steps.length - 1 && (
                          <div className={`w-8 h-1 mx-2 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-muted'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActivityIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
