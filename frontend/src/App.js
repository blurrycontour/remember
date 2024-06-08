import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Category from './Category';
import Cards from './Cards';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={ <Category/> }/>
        <Route path='/:id' element={ <Cards/> }/>
      </Routes>
    </Router>
  );
}

export default App;
