import { render, screen } from "@testing-library/react";
import Home from "../../app/page";

describe("home page", () => {
  it("introduces the learning story, current project and recent writing", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /真正能工作的 Agent/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Agent Evidence Lab")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "最近写下的东西" }),
    ).toBeInTheDocument();
  });
});
