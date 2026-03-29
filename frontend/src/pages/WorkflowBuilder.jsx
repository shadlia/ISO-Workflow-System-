import { useState, useEffect } from "react";
import { api } from "@/api";
import { PlusCircle, Save, GripVertical, Trash2 } from "lucide-react";

export function WorkflowBuilder() {
  const [components, setComponents] = useState([]);
  const [workflowName, setWorkflowName] = useState("");
  const [pipeline, setPipeline] = useState([]);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    api.getComponents().then((data) => setComponents(data));
  }, []);

  const addComponentToPipeline = (comp) => {
    setPipeline([...pipeline, { component_id: comp.id, name: comp.name, custom_name: comp.name }]);
  };

  const handleCustomNameChange = (index, value) => {
    const newPipeline = [...pipeline];
    newPipeline[index].custom_name = value;
    setPipeline(newPipeline);
  };

  const removeStep = (index) => {
    const newPipeline = [...pipeline];
    newPipeline.splice(index, 1);
    setPipeline(newPipeline);
  };

  // Drag and Drop Logic
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("sourceIndex", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    const sourceIndex = parseInt(e.dataTransfer.getData("sourceIndex"));
    
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newPipeline = [...pipeline];
    const [movedItem] = newPipeline.splice(sourceIndex, 1);
    newPipeline.splice(targetIndex, 0, movedItem);
    setPipeline(newPipeline);
  };

  const saveWorkflow = async () => {
    const orgId = localStorage.getItem("selectedOrgId");
    if (!orgId) return alert("Select an organization from the top right first!");
    if (!workflowName || pipeline.length === 0) return alert("Name and at least 1 step required");

    const payload = {
      org_id: parseInt(orgId),
      name: workflowName,
      steps: pipeline.map((p, i) => ({
        component_id: p.component_id,
        step_order: i,
        custom_name: p.custom_name,
      })),
    };
    
    try {
      await api.createWorkflow(payload);
      alert("Workflow Template Created Successfully!");
      setPipeline([]);
      setWorkflowName("");
    } catch(err) {
      alert("Error saving workflow");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Builder</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Design dynamic step-by-step processes using baseline Lego block components.
          </p>
        </div>
        <button
          onClick={saveWorkflow}
          disabled={pipeline.length === 0 || !workflowName}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" /> Save Template
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Components Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/30">
              <h3 className="font-semibold leading-none tracking-tight">Lego Blocks</h3>
              <p className="text-sm text-muted-foreground">Click to add to your pipeline below.</p>
            </div>
            <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
              {components.map((c) => (
                <div
                  key={c.id}
                  onClick={() => addComponentToPipeline(c)}
                  className="flex flex-col p-4 border rounded-lg hover:border-primary hover:bg-primary/5 hover:shadow-sm cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <PlusCircle className="h-4 w-4 text-primary" /> {c.name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Panel */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 border-b bg-muted/30">
              <h3 className="font-semibold leading-none tracking-tight">Pipeline Design</h3>
              <p className="text-sm text-muted-foreground">Arrange your steps. Drag and drop the handles on the left to reorder.</p>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold leading-none text-foreground/80">Workflow Name</label>
                <input
                  type="text"
                  placeholder="e.g. ISO 27001 High Security Flow"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all hover:bg-background"
                />
              </div>

              {pipeline.length === 0 ? (
                <div className="h-48 border-2 border-dashed border-input rounded-xl flex items-center justify-center text-muted-foreground bg-muted/10">
                  Click components on the left to add them here.
                </div>
              ) : (
                <div className="space-y-3">
                  {pipeline.map((p, i) => (
                    <div 
                      key={`${p.component_id}-${i}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, i)}
                      className={`flex items-center gap-4 p-4 rounded-xl border bg-card transition-all duration-200 shadow-sm
                        ${dragOverIndex === i ? "border-primary border-dashed bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40"}
                      `}
                    >
                      <div className="cursor-grab hover:bg-muted p-2 rounded-md text-muted-foreground hover:text-primary transition-colors active:cursor-grabbing">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shadow-sm border border-primary/20">
                        {i + 1}
                      </div>
                      
                      <div className="flex-1 space-y-1.5">
                        <div className="text-[11px] font-bold text-primary uppercase tracking-wider">
                          Base Block: {p.name}
                        </div>
                        <input
                          value={p.custom_name}
                          onChange={(e) => handleCustomNameChange(i, e.target.value)}
                          className="w-full bg-transparent border-b border-dashed border-transparent hover:border-muted-foreground focus:border-primary focus:outline-none transition-colors text-sm font-medium py-1 placeholder:text-muted-foreground/50 text-foreground"
                          placeholder="Rename this customized step..."
                          title="Custom alias for this specific workflow"
                          onClick={(e) => e.stopPropagation()} // Prevent drag interrupt
                        />
                      </div>
                      
                      <button 
                        onClick={() => removeStep(i)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Remove step"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
