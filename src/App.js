import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home";
import { ThemeProvider } from "@mui/material";
import { makeStyles } from "@mui/styles";
import baseTheme from "./styles/theme";
import CssBaseline from "@mui/material/CssBaseline";
import Footer from "./components/Footer";
import CryptoDetail from "./components/CryptoDetails";

function App() {
  const useStyle = makeStyles(() => ({
    App: {
      backgroundColor: "#222222",
      color: "#ffffff",
      minHeight: "100vh",
    },
  }));

  const classes = useStyle();

  return (
    <ThemeProvider theme={baseTheme}>
      <CssBaseline />
      <div className={classes.App}>
        <Router>
          <Header />
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/cryptos/:id" exact element={<CryptoDetail />} />
          </Routes>
          <Footer />
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;
