import { Navigate, Route, Router } from "@solidjs/router";

import { Layout } from "./layout/Layout";
import { AboutPage } from "./pages/AboutPage";
import { BlogPage } from "./pages/BlogPage";
import { ProjectsPage } from "./pages/ProjectsPage";

function HomePageRedirect() {
  return <Navigate href="/projects" />;
}

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={HomePageRedirect} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/about" component={AboutPage} />
    </Router>
  );
}
