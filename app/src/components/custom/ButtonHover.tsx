import { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "../ui/button";
import { ReactNode } from "react";
import DivHover from "./DivHover";

type ButtonHoverProps = { 
  hoverContent?: ReactNode;
} & React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  };

export default function ButtonHover({ hoverContent, ...props}: ButtonHoverProps) {

  return (
    <DivHover hoverContent={hoverContent}>
      <Button {...props}></Button>
    </DivHover>
  )
};