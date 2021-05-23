import { Component } from 'react';
import PropTypes from 'prop-types';
import { select, event as d3Event } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { connect } from 'react-redux';
import SpaceTitle from 'components/Spaces/SpaceTitle';
import 'polyfills/requestAnimationFrame';
import { MIN_ZOOM, MAX_ZOOM, PLAY_ON_HOVER_SHORTCUT_KEYCODE, CANCEL_KEYCODE,
  TOGGLE_SHOW_CLUSTER_TAGS_KEYCODE, TOGGLE_MULTISELECTION_KEYCODE,
  SHORTCUT_ANIMATION_KEYCODE } from 'constants';
import { displaySystemMessage } from '../MessagesBox/actions';
import { updateMapPosition } from './actions';
import { setSoundCurrentlyLearnt } from '../Midi/actions';
import { deselectAllSounds, stopAllSoundsPlaying } from '../Sounds/actions';
import { hideModal, suppressModal } from '../SoundInfo/actions';
import Space from '../Spaces/SpaceContainer';
import { getCurrentSpaceObj } from '../Spaces/utils';
import { removeSpace } from '../Spaces/actions';
import MapPath from '../Paths/MapPath';
import { setShouldPlayOnHover, toggleClusterTags,
  toggleMultiSelection, setShortcutAnimation } from '../Settings/actions';
import SoundInfoContainer from '../SoundInfo/SoundInfoContainer';

const propTypes = {
  isSearchEnabled: PropTypes.bool,
  currentSpaceObj: PropTypes.object,
  activeSearches: PropTypes.array,
  paths: PropTypes.array,
  spaces: PropTypes.array,
  map: PropTypes.shape({
    translateX: PropTypes.number,
    translateY: PropTypes.number,
    scale: PropTypes.number,
  }),
  removeSpace: PropTypes.func,
  deselectAllSounds: PropTypes.func,
  stopAllSoundsPlaying: PropTypes.func,
  setSoundCurrentlyLearnt: PropTypes.func,
  updateMapPosition: PropTypes.func,
  suppressModal: PropTypes.func,
  hideModal: PropTypes.func,
  setShouldPlayOnHover: PropTypes.func,
  toggleClusterTags: PropTypes.func,
  toggleMultiSelection: PropTypes.func,
  setShortcutAnimation: PropTypes.func,
};

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.zoomHandler = this.zoomHandler.bind(this);
    this.onClickCallback = this.onClickCallback.bind(this);
    this.onKeydownCallback = this.onKeydownCallback.bind(this);
    this.onKeyupCallback = this.onKeyupCallback.bind(this);
  }

  UNSAFE_componentWillMount() {
    document.addEventListener('keydown', this.onKeydownCallback, false);
    document.addEventListener('keyup', this.onKeyupCallback, false);
  }

  componentDidMount() {
    this.container = select(this.mapContainer);
    this.zoomBehaviour = zoom()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .on('zoom', this.zoomHandler);
    this.container.call(this.zoomBehaviour);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { translateX, translateY, forceMapUpdate } = nextProps.map;
    if (forceMapUpdate) {
      this.container.transition().duration(500)
        .call(this.zoomBehaviour.translateBy, translateX, translateY);
    }
  }

  shouldComponentUpdate(nextProps) {
    return (nextProps.map !== this.props.map ||
      nextProps.spaces !== this.props.spaces ||
      nextProps.paths !== this.props.paths);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydownCallback, false);
    document.removeEventListener('keyup', this.onKeyupCallback, false);
  }

  onClickCallback(evt) {
    if (evt.target.tagName !== 'circle') {
      // deselect all sounds when not clicking on a circle
      this.props.deselectAllSounds();
      this.props.stopAllSoundsPlaying();
      // turn off current midi learn
      this.props.setSoundCurrentlyLearnt();
      this.props.hideModal();
    }
  }

  onKeydownCallback(evt) {
    if (evt.target.tagName.toUpperCase() === 'INPUT') { return; }
    switch (evt.keyCode) {
      case PLAY_ON_HOVER_SHORTCUT_KEYCODE: {
        // Turn play sounds on hover on
        this.props.setShouldPlayOnHover(true);
        break;
      }
      case TOGGLE_MULTISELECTION_KEYCODE: {
        this.props.toggleMultiSelection(true);
        this.props.hideModal();
        this.props.suppressModal(true);
        break;
      }
      // only remove space if it is an active search
      case CANCEL_KEYCODE: {
        if (this.props.isSearchEnabled && this.props.activeSearches
              .includes(this.props.currentSpaceObj.queryID)) {
          this.props.removeSpace(this.props.currentSpaceObj);
        }
        break;
      }
      case SHORTCUT_ANIMATION_KEYCODE: {
        this.props.setShortcutAnimation(true);
        break;
      }
      default: return;
    }
  }

  onKeyupCallback(evt) {
    if (evt.target.tagName.toUpperCase() === 'INPUT') { return; }
    switch (evt.keyCode) {
      case PLAY_ON_HOVER_SHORTCUT_KEYCODE: {
        // Turn play sounds on hover off
        this.props.setShouldPlayOnHover(false);
        break;
      }
      case TOGGLE_MULTISELECTION_KEYCODE: {
        this.props.toggleMultiSelection(false);
        this.props.suppressModal(false);
        break;
      }
      case TOGGLE_SHOW_CLUSTER_TAGS_KEYCODE: {
        this.props.toggleClusterTags();
        break;
      }
      default: return;
    }
  }

  zoomHandler() {
    const translateX = d3Event.transform.x;
    const translateY = d3Event.transform.y;
    const scale = d3Event.transform.k;
    this.props.updateMapPosition({ translateX, translateY, scale });
  }

  render() {
    return (
      <div className="MapContainer" ref={(mapContainer) => { this.mapContainer = mapContainer; }}>
        {this.props.spaces.map(space =>
          <SpaceTitle
            key={space.queryID}
            query={space.query}
            queryParams={space.queryParams}
            sounds={space.sounds}
            currentPositionInMap={space.currentPositionInMap}
          />)}
        <svg className="map" onClick={this.onClickCallback}>
          {this.props.paths.map(path =>
            <MapPath key={path.id} path={path} />)}
          {this.props.spaces.map(space =>
            <Space
              key={space.queryID}
              queryID={space.queryID}
              sounds={space.sounds}
              clusters={space.clusters}
            />)}
        </svg>
        <SoundInfoContainer />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { paths } = state.paths;
  const { spaces } = state.spaces;
  const { map } = state;
  const { isSearchEnabled, activeSearches } = state.search;
  const currentSpaceObj = getCurrentSpaceObj(spaces, state.spaces.currentSpace);
  return {
    paths,
    spaces,
    map,
    currentSpaceObj,
    isSearchEnabled,
    activeSearches,
  };
};

MapContainer.propTypes = propTypes;

export default connect(mapStateToProps, {
  removeSpace,
  displaySystemMessage,
  updateMapPosition,
  deselectAllSounds,
  stopAllSoundsPlaying,
  setSoundCurrentlyLearnt,
  hideModal,
  setShouldPlayOnHover,
  toggleClusterTags,
  toggleMultiSelection,
  suppressModal,
  setShortcutAnimation,
})(MapContainer);
