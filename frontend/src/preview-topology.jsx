import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import "./index.css";
import { InfrastructureTopology } from "./components/InfrastructureTopology";

createRoot(document.getElementById("root")).render(
  <MemoryRouter>
    <div className="bg-black text-white light:bg-slate-50 light:text-slate-900">
      <div className="h-[40vh]" />
      <InfrastructureTopology />
      <div className="h-[60vh]" />
    </div>
  </MemoryRouter>
);
