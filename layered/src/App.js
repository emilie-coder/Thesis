// import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// pages
import {Home, Contact, Browse, Research, Login, Register, Reset} from "./pages/index";

// components
import {Header, Footer} from "./components/index";

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';


function App() {

  return (
    <div className = "App">
    <BrowserRouter>
    <ToastContainer/>
    <Header/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/Contact" element={<Contact/>}/>
        <Route path="/Browse" element={<Browse/>}/>
        <Route path="/Login" element={<Login/>}/>
        <Route path="/Research" element={<Research/>}/>
        <Route path="/Register" element={<Register/>}/>
        <Route path="/Reset" element={<Reset/>}/>
        <Route path="*" element={<div> Unknown link :( </div>}/>
      </Routes>
    <Footer/>

    </BrowserRouter>
    </div>
  );
}

export default App;
