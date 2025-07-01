import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, Flex, Heading, Button } from "@radix-ui/themes";
import PaymentApp from "./components/PaymentApp";
import TempPage from "./components/TempPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentApp />} />
        <Route path="/temp" element={<TempPageWithNavigation />} />
      </Routes>
    </Router>
  );
}

function TempPageWithNavigation() {
  return (
    <>
      {/* 상단 네비게이션 추가 */}
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
          background: "white",
          zIndex: 1000,
        }}
      >
        <Box>
          <Heading size="4" style={{ color: "var(--accent-11)" }}>
            📱 Temp UI Demo
          </Heading>
        </Box>
        <Link to="/">
          <Button variant="soft" size="2">
            dApp으로 돌아가기
          </Button>
        </Link>
      </Flex>
      <TempPage />
    </>
  );
}

export default App;
