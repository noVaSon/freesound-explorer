// local files for offline development
export const USE_LOCAL_FONTAWESOME = false;

// search
export const DEFAULT_QUERY = 'instruments';
export const DEFAULT_MAX_RESULTS = 60;
export const DEFAULT_MIN_DURATION = 0;
export const DEFAULT_MAX_DURATION = 5;
export const DEFAULT_DESCRIPTOR = 'lowlevel.mfcc.mean';
export const PERFORM_QUERY_AT_MOUNT = false;

// backend urls
export const URLS = {
  SAVE_SESSION: '/save/',
  LOAD_SESSION: '/load/',
  AVAILABLE_SESSIONS: '/available/',
  DELETE_SESSION: '/delete/',
};

// messagesBox
export const DEFAULT_MESSAGE_DURATION = 4000;
export const MESSAGE_STATUS = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  PROGRESS: 'progress',
};

// sidebar
export const SIDEBAR_TABS = {
  HOME: 'home',
  SEARCH: 'search',
  PATHS: 'paths',
  SPACES: 'spaces',
  MIDI: 'midi',
  INFO: 'info',
};
export const DEFAULT_SIDEBAR_TAB = SIDEBAR_TABS.SEARCH;

// modal
export const MODAL_PAGES = {
  NEW_SESSION: 'newSession',
  SAVE_SESSION: 'saveSession',
  LOAD_SESSION: 'loadSession',
  ERROR: 'error',
};

// requests
export const REQUEST_POOL_SIZE = 50;

// midi
export const N_MIDI_MESSAGES_TO_KEEP = 10;
export const MIDI_MESSAGE_INDICATOR_DURATION = 1000;

// map
export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 15;
export const MAP_SCALE_FACTOR = 20;

// tsne
export const MAX_TSNE_ITERATIONS = 150;
export const TSNE_CONFIG = {
  epsilon: 10,
  perplexity: 10,
  dim: 2,
};

// string utils
export const DEFAULT_TRUNCATED_STRING_LENGTH = 40;

// metronome and syncing
export const START_METRONOME_AT_MOUNT = false;
export const DEFAULT_TEMPO = 120.0;
export const LOOKAHEAD = 25; // How often we'll call the scheduler function (in milliseconds)
export const SCHEDULEAHEADTIME = 0.2; // How far we schedule notes from lookahead call (in seconds)
export const TICKRESOLUTION = 16; // 16 for 16th note or 32 for 32th note
