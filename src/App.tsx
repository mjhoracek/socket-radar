import "./App.css";
import { DevMain } from "./components/views/DevMain";
import MainView from "./components/views/MainView";

function App() {
  return (
    <div className="flex flex-col justify-center items-center w-screen h-screen bg-appBg relative">
      {import.meta.env.DEV ? <DevMain /> : <MainView />}
    </div>
  );
}

export default App;
