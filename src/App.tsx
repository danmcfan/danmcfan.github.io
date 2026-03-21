import { Navigate, Route, Router } from "@solidjs/router";

import { Layout } from "./layout/Layout";
import { AboutPage } from "./pages/AboutPage";
import { BlogPage } from "./pages/BlogPage";
import { ProjectsPage } from "./pages/ProjectsPage";

function ProjectsRedirect() {
  return <Navigate href="/projects" />;
}

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={ProjectsRedirect} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="*404" component={ProjectsRedirect} />
    </Router>
  );
}
