import Home from './components/Home';
import dotenv from "dotenv";

export default function App() {
  return (
    <div style={{ backgroundColor: '#FDF8EF' }}>
      {/* <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence> */}

      <Home></Home>
    </div>
  );
}
