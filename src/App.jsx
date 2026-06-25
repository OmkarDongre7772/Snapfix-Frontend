import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RouteGuard, ROLE_HOME } from "./auth/RouteGuard";
import { useAuth } from "./auth/useAuth";
import { ThemeProvider } from "./contexts/ThemeContext";

import Nav from "./components/Nav";
import Spinner from "./components/Spinner";

// Public pages
import Login        from "./pages/Login";
import Register     from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

// Citizen pages
import CitizenHome from "./pages/CitizenHome";
import CitizenReports from "./pages/citizen/CitizenReports";
import CitizenMyReports from "./pages/citizen/CitizenMyReports";
import CitizenNotifications from "./pages/citizen/CitizenNotifications";
import CitizenProfile from "./pages/citizen/CitizenProfile";
import CreateReport from "./pages/citizen/CreateReport";
import ReportDetail from "./pages/citizen/ReportDetail";

// Worker pages
import WorkerHome from "./pages/WorkerHome";
import WorkerSetup from "./pages/worker/WorkerSetup";
import NearbyReports from "./pages/worker/NearbyReports";
import WorkerReportDetail from "./pages/worker/WorkerReportDetail";
import WorkerBids from "./pages/worker/WorkerBids";
import WorkerTasks from "./pages/worker/WorkerTasks";
import WorkerTaskDetail from "./pages/worker/WorkerTaskDetail";
import WorkerWallet from "./pages/worker/WorkerWallet";

// Admin pages
import AdminHome from "./pages/AdminHome";
import AdminReports from "./pages/admin/AdminReports";
import AdminReportDetail from "./pages/admin/AdminReportDetail";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminTaskDetail from "./pages/admin/AdminTaskDetail";
import AdminPayments from "./pages/admin/AdminPayments";

// ── Root redirect ────────────────────────────────────────────────────────────
function RootRedirect() {
  const { user, accessToken, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <Spinner size="lg" />
    </div>
  );
  if (!accessToken) return <Navigate to="/login" replace />;
  const home = ROLE_HOME[user?.role];
  return home ? <Navigate to={home} replace /> : <Navigate to="/login" replace />;
}

// ── App shell — Nav + page ───────────────────────────────────────────────────
function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Nav />
      {children}
    </div>
  );
}

// ── Coming soon stub ─────────────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 animate-fade-in">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold text-text mb-2">{label}</h2>
        <p className="text-text-muted text-sm">This section is coming in a future phase.</p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public ──────────────────────────────────────────── */}
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── CITIZEN ─────────────────────────────────────────── */}
          <Route path="/citizen" element={<RouteGuard allowedRoles={["CITIZEN"]} />}>
            <Route path="home" element={<AppShell><CitizenHome /></AppShell>} />
            <Route path="profile" element={<AppShell><CitizenProfile /></AppShell>} />
            <Route path="reports/new" element={<AppShell><CreateReport /></AppShell>} />
            <Route path="reports/me" element={<AppShell><CitizenMyReports /></AppShell>} />
            <Route path="reports/:id" element={<AppShell><ReportDetail /></AppShell>} />
            <Route path="reports" element={<AppShell><CitizenReports /></AppShell>} />
            <Route path="notifications" element={<AppShell><CitizenNotifications /></AppShell>} />
          </Route>

          {/* ── WORKER ──────────────────────────────────────────── */}
          <Route path="/worker" element={<RouteGuard allowedRoles={["WORKER"]} />}>
            <Route path="home" element={<AppShell><WorkerHome /></AppShell>} />
            <Route path="setup" element={<WorkerSetup />} />
            <Route path="reports/:id" element={<AppShell><WorkerReportDetail /></AppShell>} />
            <Route path="reports" element={<AppShell><NearbyReports /></AppShell>} />
            <Route path="bids" element={<AppShell><WorkerBids /></AppShell>} />
            <Route path="tasks/:id" element={<AppShell><WorkerTaskDetail /></AppShell>} />
            <Route path="tasks" element={<AppShell><WorkerTasks /></AppShell>} />
            <Route path="wallet" element={<AppShell><WorkerWallet /></AppShell>} />
          </Route>

          {/* ── ADMIN ───────────────────────────────────────────── */}
          {/* ── ADMIN ───────────────────────────────────────────── */}
          <Route path="/admin" element={<RouteGuard allowedRoles={["ADMIN"]} />}>
            <Route path="home" element={<AppShell><AdminHome /></AppShell>} />
            <Route path="reports/:id" element={<AppShell><AdminReportDetail /></AppShell>} />
            <Route path="reports" element={<AppShell><AdminReports /></AppShell>} />
            <Route path="tasks/:id" element={<AppShell><AdminTaskDetail /></AppShell>} />
            <Route path="tasks" element={<AppShell><AdminTasks /></AppShell>} />
            <Route path="payments" element={<AppShell><AdminPayments /></AppShell>} />
          </Route>

          {/* ── Root & catch-all ────────────────────────────────── */}
          <Route path="/"  element={<RootRedirect />} />
          <Route path="*"  element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}
