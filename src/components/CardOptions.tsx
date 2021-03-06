import {
  StyleSheet,
  Animated,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  Share,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {BlurView} from '@react-native-community/blur';
import {RootState, useAppDispatch} from '../store';
import {useSelector} from 'react-redux';
import CardStyle from './CardStyle';
import {Card, closeCard} from '../store/foodSlice';
import {images} from '../assets/images';
import {config} from '../config';
import {deleteCardAction, duplicateCardAction} from '../store/foodThunk';
import {shareCardQuery} from '../queries';

export function CardOptions() {
  const card = useSelector<RootState>(s => s.food.cardSelected) as Card;
  const py = useSelector<RootState>(s => s.food.py) as number;
  const top = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const dispatch = useAppDispatch();
  const {height} = useWindowDimensions();

  useEffect(() => {
    if (py > 0) {
      Animated.timing(top, {
        toValue: py,
        useNativeDriver: false,
        duration: 0,
      }).start(() => {
        Animated.timing(top, {
          toValue: height / 4,
          useNativeDriver: false,
          duration: 500,
        }).start(() => {});
      });
      Animated.timing(scale, {
        toValue: 1,
        useNativeDriver: false,
        duration: 500,
      }).start();
    }
  }, [height, py, scale, top]);

  const close = () => {
    Animated.timing(scale, {
      toValue: 0,
      useNativeDriver: false,
      duration: 500,
    }).start();
    Animated.timing(top, {
      toValue: py,
      useNativeDriver: false,
      duration: 500,
    }).start(() => dispatch(closeCard()));
  };

  const share = async () => {
    try {
      close();
      const code = await shareCardQuery(card.id);
      Share.share({
        message: card.name,
        url: `${config.shareUrl}/${code}`,
      });
    } catch (e) {
      Alert.alert('', 'An error occurred. Please try again after some time.');
    }
  };

  const duplicate = async () => {
    close();
    try {
      await dispatch(duplicateCardAction(card.id)).unwrap();
    } catch (e) {
      Alert.alert('', 'An error occurred. Please try again after some time.');
    }
  };

  const deleteCard = async () => {
    Alert.alert(
      'Confirm delete',
      'This will delete the Food Style and all its settings.',
      [
        {
          text: 'Delete',
          onPress: async () => {
            try {
              close();
              await dispatch(deleteCardAction(card.id)).unwrap();
            } catch (e) {
              Alert.alert(
                '',
                'An error occurred. Please try again after some time.',
              );
            }
          },
        },
        {text: 'Cancel'},
      ],
    );
  };

  return card && py > 0 ? (
    <BlurView style={styles.container} blurType="light" blurAmount={20}>
      <Animated.View style={[styles.wrapCard, {top}]}>
        <CardStyle card={card} onPress={close} image={images.close} />
        <Animated.View
          style={[
            styles.wrapOptions,
            {transform: [{scaleX: scale}, {scaleY: scale}]},
          ]}>
          <TouchableOpacity style={styles.button} onPress={share}>
            <Text style={styles.text}>Share</Text>
            <Image source={images.share} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={duplicate}>
            <Text style={styles.text}>Duplicate</Text>
            <Image source={images.duplicate} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={deleteCard}>
            <Text style={styles.text}>Delete</Text>
            <Image source={images.delete} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </BlurView>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  wrapCard: {
    position: 'absolute',
    width: '100%',
  },
  wrapOptions: {
    alignItems: 'flex-end',
    paddingRight: 20,
    alignSelf: 'flex-end',
    paddingTop: 5,
  },
  text: {
    color: config.colors.green,
    fontSize: 15,
    fontFamily: config.fontRegular,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
