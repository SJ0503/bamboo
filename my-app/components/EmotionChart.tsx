import { LogBox } from 'react-native';
import React,{useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { useWindowDimensions } from 'react-native';


interface EmotionChartProps {
    selectedEmotions: string[];
    chartData: {
        labels: string[];
        datasets: { data: number[]; color: () => string; label: string }[];
    };
    normalizedEmotionDataByDay: { [key: string]: number[] };
}
const EmotionChart: React.FC<EmotionChartProps> = React.memo(
    ({ selectedEmotions, chartData, normalizedEmotionDataByDay }) => {
        const { width: screenWidth, height: screenHeight } = useWindowDimensions();
        useEffect(() => {

        }, [selectedEmotions, chartData, normalizedEmotionDataByDay]);
        return (
            <View style={[styles.chartContainer]}>
                <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={{ x: 25, y: 10 }}
                    padding={{ top: 15, bottom: 50, left: 40, right: 30 }}
                    width={screenWidth - 40}
                    height={screenHeight * 0.26}
                >
                    <VictoryAxis
                        style={{
                            axis: { stroke: 'transparent' },
                            ticks: { stroke: 'transparent' },
                            tickLabels: {
                                fill: '#000',
                                fontSize: 12,
                                padding: 20, // 아래로 이동
                            },
                            grid: { stroke: 'transparent' }, // 점선 제거
                        }}
                        tickFormat={chartData.labels}
                    />
                    <VictoryAxis
                        dependentAxis
                        domain={[0, 1]}
                        tickValues={[0.2, 0.4, 0.6, 0.8, 1]}
                        tickFormat={(t) => (t === 0 ? '0' : t.toFixed(1))}
                        style={{
                            axis: { stroke: 'transparent' },
                            ticks: { stroke: 'transparent' },
                            tickLabels: {
                                fill: '#000',
                                fontSize: 12,
                                dy: 10,
                            },
                            grid: { stroke: 'transparent' },
                        }}
                    />
                    {/* {chartData.datasets.map(
            (dataset, index) =>
              selectedEmotions.includes(dataset.label) && (
                <VictoryLine
                  key={index}
                  data={normalizedEmotionDataByDay[dataset.label].map((y, x) => ({
                    x: chartData.labels[x],
                    y,
                  }))}
                  style={{
                    data: {
                      stroke: dataset.color(),
                      strokeWidth: 2,
                    },
                  }}
                  interpolation="natural"
                  animate={{
                    duration: 2000,
                    onLoad: { duration: 1000 },
                  }}
                />
              )
          )} */}
                </VictoryChart>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    chartContainer: {
    },
});

export default EmotionChart;
