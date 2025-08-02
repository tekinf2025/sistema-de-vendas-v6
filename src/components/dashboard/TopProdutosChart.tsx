
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { Package } from 'lucide-react';

interface TopProdutosChartProps {
  data: Array<{
    nome: string;
    quantidade: number;
  }>;
}

export const TopProdutosChart: React.FC<TopProdutosChartProps> = ({ data }) => {
  console.log('TopProdutosChart renderizando com dados:', data);

  const chartConfig = {
    quantidade: {
      label: "Quantidade Vendida",
      color: "#10B981",
    },
  };

  const hasData = data && data.length > 0;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
          <Package className="text-green-400" size={20} />
          Top 10 Produtos Mais Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                layout="horizontal" 
                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="nome" 
                  stroke="#9CA3AF"
                  fontSize={11}
                  width={120}
                  tickFormatter={(value) => {
                    if (!value) return '';
                    return value.length > 15 ? `${value.substring(0, 15)}...` : value;
                  }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
                          <p className="text-white font-medium mb-1">{label}</p>
                          <p className="text-green-400">
                            Quantidade: {payload[0].value} unidades
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="quantidade" 
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Package className="mx-auto mb-3 h-16 w-16 text-gray-600" />
              <p className="text-lg font-medium mb-2">Nenhum produto vendido</p>
              <p className="text-sm text-gray-500">
                Realize algumas vendas de produtos para ver os dados aqui
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
