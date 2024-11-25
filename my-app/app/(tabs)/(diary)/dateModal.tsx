import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Modal, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import SmoothCurvedButton from '../../../components/SmoothCurvedButton'; // SmoothCurvedButton 가져오기

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export default function DatePickerModal({ modalVisible, setModalVisible, onDateChange }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const {width, height} = useWindowDimensions();
    const years = Array.from({ length: (currentYear + 10) - 2000 + 1 }, (_, i) => 2000 + i);
    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const modalWidth = width * 0.80;  // 모달 너비의 85% 설정 (필요에 따라 조정 가능)
    const buttonWidth = modalWidth * 0.5; // 버튼 너비를 모달의 40%로 설정 (필요에 따라 조정 가능)

    const yearScrollRef = useRef(null);
    const monthScrollRef = useRef(null);

    useEffect(() => {
        if (modalVisible) {
            const yearIndex = years.indexOf(currentYear);
            const monthIndex = currentMonth - 1;

            setTimeout(() => {
                yearScrollRef.current?.scrollTo({
                    y: yearIndex * ITEM_HEIGHT,
                    animated: false,
                });
                monthScrollRef.current?.scrollTo({
                    y: monthIndex * ITEM_HEIGHT,
                    animated: false,
                });
            }, 50); // 50ms의 지연 추가
        }
    }, [modalVisible]);


    const handleScroll = (event, items, setValue) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const index = Math.round(offsetY / ITEM_HEIGHT);
        const value = items[index];
        setValue(typeof value === 'string' ? index + 1 : value);
    };

    const renderPickerItems = (items, selectedValue, isMonth = false) => {
        return (
            <>
                <View style={styles.paddingView} />
                {items.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                        <Text style={[
                            styles.itemText,
                            ((isMonth ? index + 1 : item) === selectedValue) && styles.selectedText
                        ]}>
                            {item}
                        </Text>
                    </View>
                ))}
                <View style={styles.paddingView} />
            </>
        );
    };

    return (
        <Modal visible={modalVisible} transparent={true} animationType="fade">
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { width: modalWidth }]}>
                    <Text style={styles.modalTitle}>언제로 이동할까요?</Text>

                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerWrapper}>
                            <ScrollView
                                ref={yearScrollRef}
                                showsVerticalScrollIndicator={false}
                                style={styles.scrollView}
                                onScroll={(event) => handleScroll(event, years, setSelectedYear)}
                                scrollEventThrottle={16}
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                            >
                                {renderPickerItems(years.map(year => `${year}년`), selectedYear)}
                            </ScrollView>

                            <ScrollView
                                ref={monthScrollRef}
                                showsVerticalScrollIndicator={false}
                                style={styles.scrollView}
                                onScroll={(event) => handleScroll(event, months, setSelectedMonth)}
                                scrollEventThrottle={16}
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                            >
                                {renderPickerItems(months, selectedMonth, true)}
                            </ScrollView>
                        </View>

                        {/* 선택 영역 표시 */}
                        <View style={styles.selectionOverlay} pointerEvents="none">
                            <View style={styles.selectionBox} />
                        </View>
                    </View>

                     <View style={[styles.modalButtons,{gap:width*0}]}>
                      <SmoothCurvedButton
                          title="취소"
                          onPress={() => setModalVisible(false)}
                          customWidth={buttonWidth}
                          color="#F9F9F9" // 배경색을 설정
                          style={styles.cancelButton} // 스타일 적용
                      />
                      <SmoothCurvedButton
                          title="확인"
                          onPress={() => {
                              onDateChange(selectedYear, selectedMonth);
                              setModalVisible(false);
                          }}
                          customWidth={buttonWidth}
                          style={styles.confirmButton}
                      />
                  </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: 300,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 15,
        justifyContent: "space-between",
    },
    modalTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    pickerContainer: {
        position: 'relative',
        height: PICKER_HEIGHT,
        marginVertical: 10,
    },
    pickerWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        height: PICKER_HEIGHT,
        width: 100,
    },
    itemContainer: {
        height: ITEM_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
        color: '#666',
    },
    selectedText: {
        color: '#4CAF50',
        fontWeight: 'bold',
        fontSize: 18,
    },
    paddingView: {
        height: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    },
    selectionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionBox: {
        height: ITEM_HEIGHT,
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    buttonStyle: {
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
    },
    cancelButton: {
    },
    confirmButton: {
    },
    buttonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    confirmButtonText: {
        color: 'white',
    },
});