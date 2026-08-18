import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("home page", () => {
  it("identifies the site with its primary heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Agent 工程笔记" }),
    ).toBeInTheDocument();
  });
});
