import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";

function getRoute() {
  return window.location.hash === "#/app" ? "app" : "landing";
}

function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (route === "app") {
    return <Dashboard onExitHome={() => { window.location.hash = "#/"; }} />;
  }

  return <Landing />;
}

export default App;
