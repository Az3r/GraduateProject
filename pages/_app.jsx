import * as React from "react";
import {CssBaseline, ThemeProvider} from "@material-ui/core";
import {LightTheme, DarkTheme} from "../styles/themes";
import AuthProvider from "../hooks/auth";
import '../styles/edit.css';

function MainApp({Component, pageProps}) {
  return (
    <ThemeProvider theme={LightTheme}>
      <CssBaseline>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default MainApp;
