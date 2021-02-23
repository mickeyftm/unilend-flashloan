import React, { useState } from "react";
import "./theme.scss";
import "./App.scss";
import { useTypedSelector } from "hooks/useTypedSelector";
import LoadingPage from "components/View/UI/LoadingPage/LoadingPage";
import { Switch } from "react-router-dom";
import Layout from "components/Layout/Layout";

function App() {
  const [loading, setLoading] = useState<Boolean>(false);
  const { theme } = useTypedSelector((state) => state.settings);
  return (
    <div className={`App ${theme}`}>
      {loading ? (
        <LoadingPage />
      ) : (
        <Layout>
          <div className={`app-bg`}>
            <div className={`bg-vector ${theme}`}>
              <div
                className="pt-6"
                style={{ height: "100%", overflow: "auto", paddingTop: "60px" }}
              >
                <Switch></Switch>
              </div>
            </div>
          </div>
        </Layout>
      )}
    </div>
  );
}

export default App;
