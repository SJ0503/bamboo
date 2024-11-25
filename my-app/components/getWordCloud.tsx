import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {WCAddr} from './Config';

const useServerImage = () => {
    const [imageData, setImageData] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            const croom_idx = await AsyncStorage.getItem('croomIdx');
            try {
                const response = await axios.post(
                    WCAddr,
                    { croom_idx } // Pass croom_idx directly in the request body
                );
                console.log("image data:", response.data);

                if (response.data && response.data.wordcloud_url) {
                    setImageData(response.data.wordcloud_url);
                } else {
                    console.error("Invalid response structure:", response.data);
                }
            } catch (error) {
                console.error("Failed to fetch image:", error);
            }
        };

        fetchImage();
    }, []);

    return imageData;
};

export default useServerImage;
