import { FETCH_SOUNDS_SUCCESS, UPDATE_SOUNDS_POSITION, SELECT_SOUND_BY_ID,
  GET_SOUND_BUFFER, TOGGLE_HOVERING_SOUND, PLAY_AUDIO_SRC,
  STOP_AUDIO_SRC, MAP_COMPUTATION_COMPLETE, REMOVE_SOUND }
  from './actions';
import { UPDATE_MAP_POSITION } from '../Map/actions';
import { MAP_SCALE_FACTOR } from '../../constants';
import sessions from '../Sessions/reducer';

export const computeSoundGlobalPosition = (tsnePosition, spacePosition, mapPosition) => {
  const { translateX, translateY, scale } = mapPosition;
  const cx = ((tsnePosition.x + (window.innerWidth / (MAP_SCALE_FACTOR * 2))) *
    MAP_SCALE_FACTOR * scale * spacePosition.x) + translateX;
  const cy = ((tsnePosition.y + (window.innerHeight / (MAP_SCALE_FACTOR * 2))) *
    MAP_SCALE_FACTOR * scale * spacePosition.y) + translateY;
  return { cx, cy };
};

const sound = (state, action) => {
  const soundID = state.id;
  switch (action.type) {
    case UPDATE_SOUNDS_POSITION: {
      if (!action.sounds[soundID]) {
        return state;
      }
      return Object.assign({}, state, action.sounds[soundID]);
    }
    case UPDATE_MAP_POSITION: {
      const mapPosition = action.position;
      const { tsnePosition, spacePosition } = state;
      return Object.assign({}, state, {
        position: computeSoundGlobalPosition(tsnePosition, spacePosition, mapPosition),
      });
    }
    case MAP_COMPUTATION_COMPLETE: {
      if (action.queryID !== state.queryID) {
        return state;
      }
      const mapPosition = { translateX: 0, translateY: 0, scale: 0.3 };
      const spacePosition = { x: 1, y: 1 };
      const { tsnePosition } = state;
      const thumbnailPosition =
        computeSoundGlobalPosition(tsnePosition, spacePosition, mapPosition);
      return Object.assign({}, state, { thumbnailPosition });
    }
    default:
      return state;
  }
};

const byID = (state = {}, action) => {
  switch (action.type) {
    case FETCH_SOUNDS_SUCCESS: {
      return Object.assign({}, state, action.sounds);
    }
    case UPDATE_SOUNDS_POSITION:
    case MAP_COMPUTATION_COMPLETE:
    case UPDATE_MAP_POSITION: {
      const updatedSounds = Object.keys(state).reduce((curState, cursoundID) =>
        Object.assign({}, curState, { [cursoundID]: sound(state[cursoundID], action) }), {});
      return Object.assign({}, state, updatedSounds);
    }
    case GET_SOUND_BUFFER: {
      const { soundID, buffer } = action;
      const updatedSound = { [soundID]: Object.assign({}, state[soundID], { buffer }) };
      return Object.assign({}, state, updatedSound);
    }
    case TOGGLE_HOVERING_SOUND: {
      const { soundID } = action;
      const updatedSound = { [soundID]: Object.assign({}, state[soundID], {
        isHovered: !state[soundID].isHovered,
      }) };
      return Object.assign({}, state, updatedSound);
    }
    case PLAY_AUDIO_SRC:
    case STOP_AUDIO_SRC: {
      const { soundID } = action;
      const isPlaying = action.type === PLAY_AUDIO_SRC;
      const updatedSound = { [soundID]: Object.assign({}, state[soundID], {
        isPlaying,
      }) };
      return Object.assign({}, state, updatedSound);
    }
    case REMOVE_SOUND: {
      return Object.keys(state).reduce((curState, curSoundID) => {
        if (curSoundID !== action.soundID) {
          return Object.assign(curState, { [curSoundID]: state[curSoundID] });
        }
        return curState;
      }, {});
    }
    default:
      return state;
  }
};

const selectedSound = (state = 0, action) => {
  switch (action.type) {
    case SELECT_SOUND_BY_ID:
      return action.soundID || 0;
    case REMOVE_SOUND:
      return (state !== action.soundID) ? state : 0;
    default:
      return state;
  }
};

// don't use combineReducers as we want the reducer name to be 'sounds' (see sessions reducer)
const sounds = (state = {}, action) => ({
  byID: byID(state.byID, action),
  selectedSound: selectedSound(state.selectedSound, action),
});
export default sessions(sounds);
