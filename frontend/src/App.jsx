import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { WorkflowBuilder } from "@/pages/WorkflowBuilder";
import { ApplicationTracker } from "@/pages/ApplicationTracker";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/builder" replace />
      },
      {
        path: "builder",
        element: <WorkflowBuilder />
      },
      {
        path: "tracker",
        element: <ApplicationTracker />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
