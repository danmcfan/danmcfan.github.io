import { Route, Router } from "@solidjs/router";

import { Layout } from "./layout/Layout";
import { AboutPage } from "./pages/AboutPage";
import { BlogPage } from "./pages/BlogPage";
import { ProjectsPage } from "./pages/ProjectsPage";

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={BlogPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/about" component={AboutPage} />
    </Router>
  );
}
