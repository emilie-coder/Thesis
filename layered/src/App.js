// import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// pages
import {Home, Contact, Browse, Research, SignIn} from "./pages/index";

// components
import {Header, Footer} from "./components/index";

function App() {

  return (
    <div>
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/Contact" element={<Contact/>}/>
        <Route path="/Browse" element={<Browse/>}/>
        <Route path="/SignIn" element={<SignIn/>}/>
        <Route path="/Research" element={<Research/>}/>
      </Routes>
    <Footer/>

    </BrowserRouter>
    </div>
  );
}

export default App;
