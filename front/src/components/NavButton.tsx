import { Link } from "react-router-dom";
import { Button } from "@radix-ui/themes";

export function NavButton() {
  return (
    <div
      style={{ position: "fixed", top: "16px", right: "16px", zIndex: 1000 }}
    >
      <Link to="/temp">
        <Button variant="soft" size="2">
          📱 Temp UI
        </Button>
      </Link>
    </div>
  );
}
