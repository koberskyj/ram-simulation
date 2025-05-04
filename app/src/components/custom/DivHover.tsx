
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ReactNode } from "react";

type DivHoverProps = { 
  hoverContent?: ReactNode;
} & React.ComponentProps<"div">;

export default function DivHover({ hoverContent, ...props}: DivHoverProps) {

  return (
    <TooltipProvider>
      <Tooltip delayDuration={250} disableHoverableContent={true}>
        <TooltipTrigger>
          <div {...props}></div>
        </TooltipTrigger>
        <TooltipContent>
          {hoverContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};