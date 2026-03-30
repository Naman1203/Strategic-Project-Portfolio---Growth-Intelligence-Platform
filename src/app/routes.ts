import { createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { FinancialsPage } from "./pages/FinancialsPage";
import { AIInsightsPage } from "./pages/AIInsightsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "projects", Component: ProjectsPage },
      { path: "employees", Component: EmployeesPage },
      { path: "financials", Component: FinancialsPage },
      { path: "ai-insights", Component: AIInsightsPage },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
