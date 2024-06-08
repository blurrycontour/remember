import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Category from './Category';
import Cards from './Cards';
import Random from './Random';


function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={ <Random/> }/>
        <Route path='/category' element={ <Category/> }/>
        <Route path='/category/:id' element={ <Cards/> }/>
      </Routes>
    </Router>
  );
}

export default App;
