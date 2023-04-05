import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, View, Text } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Audio } from 'expo-av';
import { Colors } from "../styles/colors";
import { Direction, Coordinate, GestureEventType } from "../types/types";
import { checkEatsFood } from "../utils/checkEatsFood";
import { checkGameOver } from "../utils/checkGameOver";
import { randomFoodPosition } from "../utils/randomFoodPosition";
import Food from "./Food";
import Header from "./Header";
import Snake from "./Snake";
import Stats from "./Stats";

const SNAKE_INITIAL_POSITION = [{ x: 5, y: 5 }];
const FOOD_INITIAL_POSITION = { x: 5, y: 20 };
const GAME_BOUNDS = { xMin: 0, xMax: 30, yMin: 0, yMax: 63 }; //movement distance accross board

interface FoodScoreWeight {
  [key: string]: number,
}

var food_score_array: FoodScoreWeight[] = []
food_score_array["🍎"] = 7
food_score_array["🍊"] = 15
food_score_array["🍋"] = 18
food_score_array["🍇"] = 25
food_score_array["🍉"] = 5
food_score_array["🍓"] = 13
food_score_array["🍑"] = 2
food_score_array["🍍"] = 8

export default function Game(): JSX.Element {
  const [direction, setDirection] = useState<Direction>(Direction.Right);
  const [snake, setSnake] = useState<Coordinate[]>(SNAKE_INITIAL_POSITION);
  const [food, setFood] = useState<Coordinate>(FOOD_INITIAL_POSITION);
  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sound, setSound] = useState<any>();
  const [currentFoodEmoji, setCurrentFoodEmoji] = useState<string>('');
  const [eatCount, setEatCount] = useState<number>(0);
  const [moveInterval, setMoveInterval] = useState<number>(500);
  const [level, setLevel] = useState<number>(1);
  const [showLevelUp, setShowlevelUp] = useState<boolean>(false);

  function getRandomFruitEmoji() {
    const fruitEmojis = ["🍎", "🍊", "🍋", "🍇", "🍉", "🍓", "🍑", "🍍"];
    const randomIndex = Math.floor(Math.random() * fruitEmojis.length);
    setCurrentFoodEmoji(fruitEmojis[randomIndex]);
  }

  useEffect(() => {
    if (!isGameOver) {
      const intervalId = setInterval(() => {
        !isPaused && moveSnake();
      }, moveInterval);
      return () => clearInterval(intervalId);
    }
  }, [snake, isGameOver, isPaused]);

  const moveSnake = () => {
    const snakeHead = snake[0];
    const newHead = { ...snakeHead }; // create a new head object to avoid mutating the original head
    getRandomFruitEmoji();
    playMovementSound()
    // GAME OVER
    if (checkGameOver(snakeHead, GAME_BOUNDS)) {
      playGameOverSound()
      setIsGameOver((prev) => !prev);
      return;
    }

    switch (direction) {
      case Direction.Up:
        newHead.y -= 1;
        break;
      case Direction.Down:
        newHead.y += 1;
        break;
      case Direction.Left:
        newHead.x -= 1;
        break;
      case Direction.Right:
        newHead.x += 1;
        break;
      default:
        break;
    }

    if (checkEatsFood(newHead, food, 2)) {
      setEatCount(eatCount + 1);
      if ((eatCount % 5) === 0) {
        console.log(eatCount);
        if (moveInterval > 100) {
          setMoveInterval(moveInterval - 100);
          setShowlevelUp(true);
          setLevel(level + 1);
        }
      }

      playEatSound();
      setFood(randomFoodPosition(GAME_BOUNDS.xMax, GAME_BOUNDS.yMax));
      setSnake([newHead, ...snake]);

      setScore(score + food_score_array[currentFoodEmoji]);
    } else {
      setSnake([newHead, ...snake.slice(0, -1)]);
    }
  };

  const handleGesture = (event: GestureEventType) => {
    setShowlevelUp(false);
    const { translationX, translationY } = event.nativeEvent;
    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 0) {
        setDirection(Direction.Right);
      } else {
        setDirection(Direction.Left);
      }
    } else {
      if (translationY > 0) {
        setDirection(Direction.Down);
      } else {
        setDirection(Direction.Up);
      }
    }
  };

  const reloadGame = () => {
    playGameStartSound();
    clearInterval(setInterval(levelUpDisplay, 1000));
    setSnake(SNAKE_INITIAL_POSITION);
    setFood(FOOD_INITIAL_POSITION);
    setIsGameOver(false);
    setScore(0);
    setLevel(1);
    setEatCount(0);
    setShowlevelUp(false);
    setMoveInterval(500);
    setDirection(Direction.Right);
    setIsPaused(false);
  };

  const pauseGame = () => {
    playPausedSound();
    setIsPaused(!isPaused);
  };

  const levelUpDisplay = () => {
    // setIsPaused(!isPaused);
    setShowlevelUp(true);
  }

  async function playEatSound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/eat.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }

  async function playYaySound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/yay.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }

  async function playPausedSound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/paused.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }

  async function playGameOverSound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/gameOver.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }

  async function playGameStartSound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/gameStart.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }
  async function playMovementSound() {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/movement.mp3')
    );
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  return (
    <PanGestureHandler onGestureEvent={handleGesture}>
      <SafeAreaView style={styles.container}>
        <Header
          reloadGame={reloadGame}
          pauseGame={pauseGame}
          isPaused={isPaused}
        >
          <Stats score={score} level={level} />
        </Header>
        <View style={styles.boundaries}>
          {isGameOver &&
            <View style={styles.gameOverTextContainer} >
              <Text style={styles.gameOverText}>Game Over!!!</Text>
            </View>
          }
          {showLevelUp &&
            <View style={styles.gameOverTextContainer} >
              <Text style={styles.gameOverText}>Leveled Up!!!</Text>
            </View>
          }
          <Snake snake={snake} />
          <Food x={food.x} y={food.y} emoji={currentFoodEmoji} />
        </View>

      </SafeAreaView>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  boundaries: {
    flex: 1,
    borderColor: Colors.primary,
    borderWidth: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: Colors.background,
  },
  gameOverText: {
    color: Colors.primary,
    fontWeight: "900",
    fontSize: 30,
    textAlign: "center",

  },
  gameOverTextContainer: {
    display: "flex",
    marginTop: 300
  }
});
