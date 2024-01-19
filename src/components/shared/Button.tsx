import {
  Button as MantineButton,
  ButtonProps as MantineButtonProps,
} from "@mantine/core";

interface ButtonProps extends MantineButtonProps {
  onClick: () => void;
  label: string | JSX.Element;
}

export const Button = ({ onClick, label, ...props }: ButtonProps) => {
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
            border: "1px solid white",
          },
        },
      }}
      onClick={onClick}
    >
      {label}
    </MantineButton>
  );
};
