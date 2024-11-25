import { LogBox } from 'react-native';
import React, { useEffect } from 'react';
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

const EmotionChartLine: React.FC<EmotionChartProps> = React.memo(
    ({ selectedEmotions, chartData, normalizedEmotionDataByDay }) => {
        const { width: screenWidth, height: screenHeight } = useWindowDimensions();

        // 낮은 값에 추가할 오프셋 설정
        const offset = 0.26;

        useEffect(() => {
            // 필요한 로직 추가
        }, [selectedEmotions, chartData, normalizedEmotionDataByDay]);

        return (
            <View style={styles.chartContainer}>
                <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={{ x: 20, y: 20 }}
                    padding={{ top: 50, bottom: 50, left: 30, right: 50 }}
                    width={screenWidth }
                    height={screenHeight * 0.25}
                >
                    <VictoryAxis
                        style={{
                            axis: { stroke: 'transparent' },
                            ticks: { stroke: 'transparent' },
                            tickLabels: { fill: 'transparent' }, // 레이블 숨김
                            grid: { stroke: 'transparent' },
                        }}
                        tickFormat={chartData.labels}
                    />
                    <VictoryAxis
                        dependentAxis
                        domain={[0, 1.2]}
                        tickValues={[0.2, 0.4, 0.6, 0.8, 1]}
                        tickFormat={(t) => (t === 0 ? '0' : t.toFixed(1))}
                        style={{
                            axis: { stroke: 'transparent' },
                            ticks: { stroke: 'transparent' },
                            tickLabels: { fill: 'transparent' },
                            grid: { stroke: 'transparent' },
                        }}
                    />
                    {chartData.datasets.map(
                        (dataset, index) =>
                            selectedEmotions.includes(dataset.label) && (
                                <VictoryLine
                                    key={index}
                                    data={normalizedEmotionDataByDay[dataset.label].map((y, x) => ({
                                        x: chartData.labels[x],
                                        y: y + offset,
                                    }))}
                                    style={{
                                        data: {
                                            stroke: dataset.color(),
                                            strokeWidth: 2,
                                        },
                                    }}
                                    interpolation="natural"
                                    animate={{
                                        duration: 2000, // 애니메이션 시간을 줄임
                                        onLoad: { duration: 1500 },
                                    }}
                                />
                            )
                    )}
                </VictoryChart>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    chartContainer: {},
});

export default EmotionChartLine;
