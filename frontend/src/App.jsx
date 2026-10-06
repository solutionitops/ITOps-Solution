import { lazy, Suspense, useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { usePortalType } from "./hooks/usePortalType";
import { BrandLoading } from "./components/BrandLogo";

const CommandPalette = lazy(() => import("./components/CommandPalette").then(m => ({ default: m.CommandPalette })));
const Layout = lazy(() => import("./components/Layout").then(m => ({ default: m.Layout })));
const AdminLayout = lazy(() => import("./components/AdminLayout").then(m => ({ default: m.AdminLayout })));
// Route-level code splitting: a first-time mobile visitor downloads only the
// page they landed on, not the whole admin panel and customer app with it.
const Landing = lazy(() => import("./pages/Landing"));
const PlatformStory = lazy(() => import("./pages/PlatformStory"));
const Login = lazy(() => import("./pages/Login"));
const MfaChallenge = lazy(() => import("./pages/MfaChallenge"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const Monitors = lazy(() => import("./pages/Monitors"));
const AutonomousSRE = lazy(() => import("./pages/AutonomousSRE"));
const ApplicationIntelligence = lazy(() => import("./pages/ApplicationIntelligence"));
const SecurityCenter = lazy(() => import("./pages/SecurityCenter"));
const DevSecOpsPipeline = lazy(() => import("./pages/DevSecOpsPipeline"));
const CostOptimization = lazy(() => import("./pages/CostOptimization"));
const ComplianceCenter = lazy(() => import("./pages/ComplianceCenter"));
const DnsMonitoring = lazy(() => import("./pages/DnsMonitoring"));
const MonitorDetail = lazy(() => import("./pages/MonitorDetail"));
const Hosts = lazy(() => import("./pages/Hosts"));
const Infrastructure = lazy(() => import("./pages/Infrastructure"));
const _DevInfraPreview = lazy(() => import("./pages/_DevInfraPreview"));
const Incidents = lazy(() => import("./pages/Incidents"));
const Assets = lazy(() => import("./pages/Assets"));
const AlertChannels = lazy(() => import("./pages/AlertChannels"));
const Team = lazy(() => import("./pages/Team"));
const Users = lazy(() => import("./pages/Users"));
const AcademyAdmin = lazy(() => import("./pages/AcademyAdmin"));
const CyberSachetTraining = lazy(() => import("./pages/CyberSachetTraining"));
const ITOpsAcademyTraining = lazy(() => import("./pages/ITOpsAcademyTraining"));
const Profile = lazy(() => import("./pages/Profile"));
const Platform = lazy(() => import("./pages/Platform"));
// Redesigned pages. The previous versions remain in pages/ (Solutions, Pricing, Company), unrouted.
const Solutions = lazy(() => import("./pages/ProductsShowcase"));
const SolutionDetail = lazy(() => import("./pages/SolutionDetail"));
const Pricing = lazy(() => import("./pages/PricingStory"));
const Company = lazy(() => import("./pages/AboutStory"));
// Support is the redesigned "journey of a support signal"; the previous page is pages/Support.jsx.
const Support = lazy(() => import("./pages/SupportStory"));
const CyberSachet = lazy(() => import("./pages/CyberSachet"));
const Academy = lazy(() => import("./pages/Academy"));
const BecomeReseller = lazy(() => import("./pages/BecomeReseller"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const InviteAccept = lazy(() => import("./pages/InviteAccept"));
const _DevCertPreview = lazy(() => import("./pages/_DevCertPreview"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminVisibility = lazy(() => import("./pages/admin/AdminVisibility"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminResellers = lazy(() => import("./pages/admin/AdminResellers"));
const AdminMonitors = lazy(() => import("./pages/admin/AdminMonitors"));
const AdminIncidents = lazy(() => import("./pages/admin/AdminIncidents"));
const AdminAgents = lazy(() => import("./pages/admin/AdminAgents"));
const AdminSslCerts = lazy(() => import("./pages/admin/AdminSslCerts"));
const AdminCyberSachetCourses = lazy(() => import("./pages/admin/AdminCyberSachetCourses"));
const AdminAcademyDashboard = lazy(() => import("./pages/admin/AdminAcademyDashboard"));
function ProtectedRoute({
  children
}) {
  const {
    user,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <BrandLoading />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
function PlatformAdminRoute({
  children
}) {
  const {
    user,
    isPlatformAdmin,
    isPlatformInstructor,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <BrandLoading />;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  // An instructor-only account (isPlatformInstructor but not isPlatformAdmin)
  // gets past this gate too — AdminLayout's nav and AdminOverview's redirect
  // then confine them to the Academy dashboard. The real boundary is still
  // server-side: every other admin RPC stays gated to is_platform_admin()
  // alone (see migration 0083), so reaching a route here never implies the
  // underlying data actually loads for an instructor.
  if (!isPlatformAdmin && !isPlatformInstructor) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
function PublicOnlyRoute({
  children
}) {
  const {
    user,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <BrandLoading />;
  }
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
function AdminPublicOnlyRoute({
  children
}) {
  const {
    user,
    isPlatformAdmin,
    isPlatformInstructor,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <BrandLoading />;
  }
  if (user && (isPlatformAdmin || isPlatformInstructor)) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
// Employee Portal vs Organization Console (see usePortalType.js): a member
// with no operational view access anywhere lands on the curated training
// home instead of a monitoring dashboard that would show nothing relevant
// to them anyway.
function DashboardGate() {
  const { portal, isLoading } = usePortalType();
  if (isLoading) return <BrandLoading />;
  return portal === "employee" ? <EmployeeDashboard /> : <Dashboard />;
}
// FINDING-14: Dev-only preview routes must never be reachable in production builds.
function DevOnlyRoute({ children }) {
  if (!import.meta.env.DEV) return <Navigate to="/" replace />;
  return children;
}

// Defense in depth beyond the sidebar's nav filtering: an Employee Portal
// member who navigates straight to an operator route by URL gets bounced
// to their own dashboard, not a mostly-empty operator page.
function RequireConsoleAccess({ children }) {
  const { portal, isLoading } = usePortalType();
  if (isLoading) return <BrandLoading />;
  if (portal === "employee") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
// Routes wrapped in Layout/AdminLayout mount their own AppSearch, which
// already listens for Cmd+K — CommandPalette (aimed at marketing/public
// pages) must not ALSO listen there, or Cmd+K opens two stacked overlays.
// Kept next to the route definitions below so it stays in sync with them.
const APP_SHELL_PATH_RE = /^\/(dashboard|training|profile|monitors|network|dns|hosts|incidents|assets|settings|users|team)(\/|$)/;
function isAuthenticatedShellPath(pathname) {
  return APP_SHELL_PATH_RE.test(pathname) || (pathname.startsWith("/admin") && pathname !== "/admin/login");
}
export default function App() {
  const { mfaPending } = useAuth();
  const location = useLocation();
  const navigationType = useNavigationType();
  // A link to another page opens that page at its top (its hero), not at the
  // scroll position of the page you came from. Back/forward ("POP") keeps the
  // browser's own position, and links to a #section are left to scroll there.
  useEffect(() => {
    if (navigationType === "POP") return;
    if (location.hash) {
      const targetId = location.hash.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        const timer = setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
        return () => clearTimeout(timer);
      }
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const timer = setTimeout(() => {
      const hero = document.getElementById("hero") || document.getElementById("hero-mobile");
      if (hero) {
        hero.scrollIntoView({ behavior: "instant", block: "start" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname, location.hash, navigationType]);
  // Blocks every route, not just protected ones — a password/OAuth-verified
  // session that hasn't cleared its second factor isn't "logged out" (so
  // PublicOnlyRoute would wrongly show Login/Register again) but also isn't
  // "logged in" (ProtectedRoute would bounce it to /login with no way to
  // actually enter the code) without this short-circuit ahead of routing.
  if (mfaPending) {
    return <Suspense fallback={<BrandLoading />}><MfaChallenge /></Suspense>;
  }
  return <>
    <Suspense fallback={null}>
      <CommandPalette disabled={isAuthenticatedShellPath(location.pathname)} />
    </Suspense>
    <Suspense fallback={<BrandLoading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
        {/* Not PublicOnlyRoute: Supabase's recovery link establishes a logged-in
          session on this exact page, so gating on "no user" would bounce the
          visitor to /dashboard before they can set a new password. */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminPublicOnlyRoute><AdminLogin /></AdminPublicOnlyRoute>} />

        {/* Marketing pages are viewable whether logged in or out, like any real SaaS site. */}
        <Route path="/platform" element={<PlatformStory />} />
        {/* The previous card-based platform page, kept for comparison. */}
        <Route path="/platform-classic" element={<Platform />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/solutions/:slug" element={<SolutionDetail />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/company" element={<Company />} />
        <Route path="/support" element={<Support />} />
        <Route path="/cybersachet" element={<CyberSachet />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/partners" element={<BecomeReseller />} />

        {/* Public per-organization status page — no auth required. */}
        <Route path="/status/:slug" element={<StatusPage />} />

        {/* Public certificate verification — same "no auth required" pattern
          as the status page; anyone with a certificate ID or QR code can
          check it, logged in or not. */}
        <Route path="/verify" element={<VerifyCertificate />} />
        {/* Dev-only preview routes — guarded by DevOnlyRoute (FINDING-14) */}
        <Route path="/_dev-cert-preview" element={<DevOnlyRoute><_DevCertPreview /></DevOnlyRoute>} />
        <Route path="/_dev-infra-preview" element={<DevOnlyRoute><_DevInfraPreview /></DevOnlyRoute>} />
        <Route path="/_dev-cybersachet-preview" element={<DevOnlyRoute><CyberSachetTraining key="security" defaultTrack="security" /></DevOnlyRoute>} />
        <Route path="/_dev-academy-preview" element={<DevOnlyRoute><CyberSachetTraining key="academy" defaultTrack="academy" /></DevOnlyRoute>} />
        <Route path="/_dev-itops-preview" element={<DevOnlyRoute><ITOpsAcademyTraining /></DevOnlyRoute>} />
        <Route path="/verify/:certificateNo" element={<VerifyCertificate />} />

        {/* Team invite acceptance — reachable logged out (to sign up) or logged
          in (to see the "already have an organization" message); not wrapped
          in ProtectedRoute or PublicOnlyRoute for that reason. */}
        <Route path="/invite/:token" element={<InviteAccept />} />

        <Route element={<ProtectedRoute>
          <Layout />
        </ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardGate />} />
          <Route path="/training" element={<CyberSachetTraining key="security" defaultTrack="security" />} />
          <Route path="/training/academy" element={<CyberSachetTraining key="academy" defaultTrack="academy" />} />
          <Route path="/training/itops" element={<ITOpsAcademyTraining />} />
          <Route path="/profile" element={<Profile />} />
          {/* Operator-only routes — an Employee Portal member (no operational
            view access anywhere) is redirected back to /dashboard even on a
            direct URL, not just hidden from the sidebar. */}
          <Route element={<RequireConsoleAccess><Outlet /></RequireConsoleAccess>}>
            <Route path="/monitors" element={<Monitors key="web" mode="web" />} />
            <Route path="/autonomous-sre" element={<AutonomousSRE />} />
            <Route path="/app-intelligence" element={<ApplicationIntelligence />} />
            <Route path="/security-center" element={<SecurityCenter />} />
            <Route path="/pipeline" element={<DevSecOpsPipeline />} />
            <Route path="/cost-optimization" element={<CostOptimization />} />
            <Route path="/compliance" element={<ComplianceCenter />} />
            <Route path="/network" element={<Monitors key="network" mode="network" />} />
            <Route path="/dns" element={<DnsMonitoring />} />
            <Route path="/monitors/:id" element={<MonitorDetail />} />
            <Route path="/hosts" element={<Hosts />} />
            <Route path="/infrastructure" element={<Infrastructure />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/settings/alerts" element={<AlertChannels />} />
            <Route path="/users" element={<Users />} />
            <Route path="/academy-admin" element={<AcademyAdmin />} />
            <Route path="/team" element={<Team />} />
          </Route>
        </Route>

        <Route element={<PlatformAdminRoute>
          <AdminLayout />
        </PlatformAdminRoute>}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          {/* Organizations was a strict subset of Customers (same rename/archive/
            delete/plan actions, none of the provisioning or license detail) —
            consolidated into one page; redirect any old bookmarks/links. */}
          <Route path="/admin/organizations" element={<Navigate to="/admin/customers" replace />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/visibility" element={<AdminVisibility />} />
          <Route path="/admin/plans" element={<AdminPlans />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          <Route path="/admin/roles" element={<AdminRoles />} />
          <Route path="/admin/resellers" element={<AdminResellers />} />
          <Route path="/admin/monitors" element={<AdminMonitors />} />
          <Route path="/admin/incidents" element={<AdminIncidents />} />
          <Route path="/admin/agents" element={<AdminAgents />} />
          <Route path="/admin/ssl" element={<AdminSslCerts />} />
          <Route path="/admin/academy" element={<AdminAcademyDashboard />} />
          <Route path="/admin/cybersachet-courses" element={<AdminCyberSachetCourses />} />
        </Route>

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </>;
}