
import {DrawingProvider} from "./DrawingContext";
import {DrawingCanvas} from "./DrawingCanvas";
import { SocketContext, socket } from './SocketContext';

function App() {
  return (
      <SocketContext.Provider value={socket}>
        <DrawingProvider>
          <DrawingCanvas />
        </DrawingProvider>
      </SocketContext.Provider>
  );
}

export default App;