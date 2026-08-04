import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth-context";

// Layouts
import { AppLayout } from "./components/layout/app-layout";
import { ProtectedRoute } from "./components/layout/protected-route";

// Pages
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import ContractsPage from "./pages/contracts";
import ContractDetailPage from "./pages/contract-detail";
import FindingDetailPage from "./pages/finding-detail";
import EvaluationsPage from "./pages/evaluations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "contracts",
        element: <ContractsPage />,
      },
      {
        path: "contracts/:id",
        element: <ContractDetailPage />,
      },
      {
        path: "findings/:id",
        element: <FindingDetailPage />,
      },
      {
        path: "evaluations",
        element: <EvaluationsPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster theme="dark" position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
