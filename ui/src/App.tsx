import Grid2 from "@mui/material/Grid2";
import ContainerGrid from "./components/ContainerGrid";
import { Header } from "./components/Header";
import AuthSetup from "./components/AuthSetup";
import ErrorBanner from "./components/ErrorBanner";
import { useNgrokContext } from "./components/NgrokContext";

export function App() {
  const { authIsSetup } = useNgrokContext();

  return (
    <>
      {authIsSetup && <Header />}
      {authIsSetup && <ErrorBanner />}
      <Grid2
        container
        direction={"column"}
        spacing={2}
        textAlign={"center"}
        justifyContent={"center"}
        sx={{ mt: authIsSetup ? 8 : 0, overflowX: 'auto' }}
      >
        {!authIsSetup ? (
          <AuthSetup />
        ) : (
          <Grid2 sx={{ mt: 2 }}>
            <ContainerGrid />
          </Grid2>
        )}
      </Grid2>
    </>
  );
}
