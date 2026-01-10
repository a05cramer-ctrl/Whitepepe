import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Vite + React + TypeScript</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Räkna är {count}
          </button>
          <p>
            Redigera <code>src/App.tsx</code> och spara för att testa HMR
          </p>
        </div>
        <p className="read-the-docs">
          Klicka på Vite- och React-logotyperna för att lära dig mer
        </p>
      </div>
    </>
  )
}

export default App
