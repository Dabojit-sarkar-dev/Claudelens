import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/auth-context";

// Layouts
import { AppLayout } from "./components/layout/app-layout";
import { ProtectedRoute } from "./components/layout/protected-route";

// Pages
import LandingPage from "./pages/landing";
import DocsPage from "./pages/docs";
import AboutPage from "./pages/about";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
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

function HomeRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRoute />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/docs",
    element: <DocsPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/dashboard",
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
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
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
