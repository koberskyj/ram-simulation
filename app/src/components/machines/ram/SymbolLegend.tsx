import { ArrowRight } from "lucide-react";


type SymbolLegendType = { 
  legend: Map<string, number>
} & React.ComponentProps<"div">;

export default function SymbolLegend({ legend, ...props }: SymbolLegendType) {
  const items = Array.from(legend.entries()); 

  return (
    <div {...props}>
      <h3 className="font-semibold w-fit">Legenda</h3>
      <div className="relative w-full">
        <div className="max-h-[32rem] overflow-auto pr-2 w-full">
          <table>
            <tbody>
              {items.map(([symbol, count]) => (
                <tr key={symbol.toString()} className="px-1">
                  <td>{symbol}</td>
                  <td>
                    <ArrowRight className="inline h-3" />
                    {count}
                  </td>
                </tr>
              ))}
              {items.length == 0 && 
                <tr className=""><td>Prázdná</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}