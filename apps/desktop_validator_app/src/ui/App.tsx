import AppBar from './components/AppBar';
import NodeSetup from './components/NodeSetup';

function App() {
  return (
    <div className="flex flex-col w-screen h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
      <AppBar />
      <div className="flex-grow flex justify-center items-center">
        <NodeSetup />
      </div>
    </div>
  );
}

export default App;
