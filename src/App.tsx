import { Layout } from "./shared/components/Layout";
import { ThemeProvider } from "./shared/context/ThemeContext";
import { ItemFeedbackPage } from "./features/item-feedback/ItemFeedbackPage";

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <ItemFeedbackPage />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
