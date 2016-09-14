import { default as UUID } from 'node-uuid';
import { audioContext, playAudio, stopAudio } from '../Audio/actions';
import makeActionCreator from '../../utils/makeActionCreator';
import { elementWithId } from '../../utils/arrayUtils';
import { getRandomElement } from '../../utils/misc';

export const ADD_PATH = 'ADD_PATH';
export const REMOVE_PATH = 'REMOVE_PATH';
export const SET_PATH_SYNC = 'SET_PATH_SYNC';
export const STARTSTOP_PATH = 'STARTSTOP_PATH';
export const SET_PATH_CURRENTLY_PLAYING = 'SET_PATH_CURRENTLY_PLAYING';
export const SELECT_PATH = 'SELECT_PATH';
export const ADD_SOUND_TO_PATH = 'ADD_SOUND_TO_PATH';
export const DELETE_SOUND_FROM_PATH = 'DELETE_SOUND_FROM_PATH';
export const CLEAR_ALL_PATHS = 'CLEAR_ALL_PATHS';
export const SET_PATH_WAIT_UNTIL_FINISHED = 'SET_PATH_WAIT_UNTIL_FINISHED';
export const SET_PATH_ACTIVE = 'SET_PATH_ACTIVE';

export const setPathSync = makeActionCreator(SET_PATH_SYNC,
  'pathID', 'syncMode');

export const startStopPath = makeActionCreator(STARTSTOP_PATH,
  'pathID', 'isPlaying');

export const setPathCurrentlyPlaying = makeActionCreator(SET_PATH_CURRENTLY_PLAYING,
  'pathID', 'soundIdx', 'willFinishAt');

export const selectPath = makeActionCreator(SELECT_PATH,
  'pathID');

export const setPathActive = makeActionCreator(SET_PATH_ACTIVE,
  'pathID', 'isActive');

export const deleteSoundFromPath = makeActionCreator(DELETE_SOUND_FROM_PATH,
  'soundID', 'pathID');

export const addSoundToPath = (soundID, pathID) => (dispatch, getStore) => dispatch({
  type: ADD_SOUND_TO_PATH,
  soundID,
  pathID: pathID || getStore().paths.selectedPath,
});

export const addRandomSoundToPath = (pathID) => (dispatch, getStore) => {
  const store = getStore();
  const space = elementWithId(store.spaces.spaces, store.spaces.currentSpace, 'queryID');
  const spaceSounds = space.sounds;
  dispatch({
    type: ADD_SOUND_TO_PATH,
    soundID: getRandomElement(spaceSounds),
    pathID: pathID || getStore().paths.selectedPath,
  });
};

export const clearAllPaths = makeActionCreator(CLEAR_ALL_PATHS);

export const setPathWaitUntilFinished = makeActionCreator(SET_PATH_WAIT_UNTIL_FINISHED,
  'pathID', 'waitUntilFinished');

export const playNextSoundFromPath = (pathID, time) =>
  (dispatch, getStore) => {
    const store = getStore();
    const path = elementWithId(store.paths.paths, pathID);
    if (path) {
      if (path.isPlaying) {
        let nextSoundToPlayIdx;
        if ((path.currentlyPlaying.soundIdx === undefined) ||
          (path.currentlyPlaying.soundIdx + 1 >= path.sounds.length)) {
          nextSoundToPlayIdx = 0;
        } else {
          nextSoundToPlayIdx = path.currentlyPlaying.soundIdx + 1;
        }
        const nextSoundToPlay = store.sounds.byID[path.sounds[nextSoundToPlayIdx]];
        const nextSoundToPlayDuration = nextSoundToPlay.duration;
        const willFinishAt = (time === undefined) ?
          audioContext.currentTime + nextSoundToPlayDuration : time + nextSoundToPlayDuration;
        dispatch(setPathCurrentlyPlaying(path.id, nextSoundToPlayIdx, willFinishAt));
        if (path.syncMode === 'no') {
          dispatch(playAudio(nextSoundToPlay, undefined, undefined, () => {
            dispatch(playNextSoundFromPath(pathID));
          }));
        } else {
          // If synched to metronome, sounds will be triggered by onAudioTick events
          if (time !== undefined) {
            dispatch(playAudio(path.sounds[nextSoundToPlayIdx], { time }));
          }
        }
      }
    }
  };

export const triggerSoundHelper = (pathID, time) =>
  (dispatch, getStore) => {
    const store = getStore();
    const path = elementWithId(store.paths.paths, pathID);
    if (path.waitUntilFinished) {
      // Check if sound will be finished at time
      if ((path.currentlyPlaying.willFinishAt === undefined)
        || (path.currentlyPlaying.willFinishAt <= time)) {
        dispatch(playNextSoundFromPath(path.id, time));
      }
    } else {
      dispatch(playNextSoundFromPath(path.id, time));
    }
  };

const shouldTriggerSoundHelper = (path, tick) => (
  (path.syncMode === 'beat' && tick % 4 === 0) ||
  (path.syncMode === '2xbeat' && tick % 8 === 0) ||
  (path.syncMode === 'bar' && tick === 0)
);

export const onAudioTickPath = (pathID, bar, beat, tick, time) =>
  (dispatch, getStore) => {
    const store = getStore();
    const path = elementWithId(store.paths.paths, pathID);
    if (path && path.isPlaying) {
      if (shouldTriggerSoundHelper(path, tick)) {
        dispatch(triggerSoundHelper(pathID, time));
      }
    }
  };

const linkPathToMetronome = (pathID, tickEvt, dispatch) => {
  const { bar, beat, tick, time } = tickEvt.detail;
  dispatch(onAudioTickPath(pathID, bar, beat, tick, time));
};

export const addPath = (sounds) => (dispatch) => {
  const pathID = UUID.v4();
  dispatch({
    type: ADD_PATH,
    sounds,
    pathID,
  });
  // link new path to metronome ticks
  window.addEventListener('tick', (evt) => linkPathToMetronome(pathID, evt, dispatch), false);
};

export const removePath = (pathID) => (dispatch) => {
  // remove listener for tick events
  window.removeEventListener('tick', (evt) => linkPathToMetronome(pathID, evt, dispatch), false);
  dispatch({ type: REMOVE_PATH, pathID });
};