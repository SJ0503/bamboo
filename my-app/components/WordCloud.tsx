import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';

interface WordCloudProps {
  imageData: string | null;
}

const WordCloud: React.FC<WordCloudProps> = ({ imageData }) => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      {imageData ? (
        <Image source={{ uri: imageData }} style={[styles.image, { width: screenWidth - 40 }]} />
      ) : (
        <Text>Loading image...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20, // 양옆 여유 간격 설정
    alignItems: 'center',  // 이미지 가운데 정렬
  },
  image: {
    height: 170,
    width:100,
    resizeMode: 'contain',
    marginVertical: 8,
  },
});

export default React.memo(WordCloud);
