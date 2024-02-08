import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./components/AppRouter";


function App() {
  return (
      ReactDOM.render(
          <React.StrictMode>
            <AppRouter />
          </React.StrictMode>,
          document.getElementById('root'))
  );
}

export default App;
