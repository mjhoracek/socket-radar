import { Button as MantineButton } from "@mantine/core";

interface ButtonProps {
  onClick: () => void;
  label: string;
}

export const Button = ({ onClick, label }: ButtonProps) => {
  return (
    <MantineButton
      styles={{
        root: {
          backgroundColor: "#1E1E1E",
          color: "#F5F5F5",

          border: "1px solid #F5F5F5",

          fontSize: "12px",
          fontWeight: "bold",
          lineHeight: "16px",
          letterSpacing: "0.1em",
          fontFamily: "segment, sans-serif",

          "&:hover": {
            backgroundColor: "#ffb03a38",
          },
        },
      }}
      onClick={onClick}
    >
      {label}
    </MantineButton>
  );
};
