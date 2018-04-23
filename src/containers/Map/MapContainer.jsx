import React from 'react';
import { select, event as d3Event } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { connect } from 'react-redux';
import SpaceTitle from 'components/Spaces/SpaceTitle';
import 'polyfills/requestAnimationFrame';
import { MIN_ZOOM, MAX_ZOOM, PLAY_ON_HOVER_SHORTCUT_KEYCODE,
  TOGGLE_MULTISELECTION_KEYCODE } from 'constants';
import { displaySystemMessage } from '../MessagesBox/actions';
import { updateMapPosition } from './actions';
import { setSoundCurrentlyLearnt } from '../Midi/actions';
import { deselectAllSounds, stopAllSoundsPlaying } from '../Sounds/actions';
import { hideModal } from '../SoundInfo/actions';
import Space from '../Spaces/SpaceContainer';
import SoundInfoContainer from '../SoundInfo/SoundInfoContainer';
import MapPath from '../Paths/MapPath';
import { setShouldPlayOnHover, toggleMultiSelection } from '../Settings/actions';

const propTypes = {
  deselectAllSounds: React.PropTypes.func,
  stopAllSoundsPlaying: React.PropTypes.func,
  paths: React.PropTypes.array,
  spaces: React.PropTypes.array,
  map: React.PropTypes.shape({
    translateX: React.PropTypes.number,
    translateY: React.PropTypes.number,
    scale: React.PropTypes.number,
  }),
  setSoundCurrentlyLearnt: React.PropTypes.func,
  updateMapPosition: React.PropTypes.func,
  hideModal: React.PropTypes.func,
  setShouldPlayOnHover: React.PropTypes.func,
  toggleMultiSelection: React.PropTypes.func,
};

class MapContainer extends React.Component {
  constructor(props) {
    super(props);
    this.zoomHandler = this.zoomHandler.bind(this);
    this.onClickCallback = this.onClickCallback.bind(this);
    this.onKeydownCallback = this.onKeydownCallback.bind(this);
    this.onKeyupCallback = this.onKeyupCallback.bind(this);
  }

  componentWillMount() {
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

  componentWillReceiveProps(nextProps) {
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
    document.removeEventListener('keydown', this.onKeypressCallback, false);
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
    if (evt.keyCode === PLAY_ON_HOVER_SHORTCUT_KEYCODE) {
      // Turn play sounds on hover on
      this.props.setShouldPlayOnHover(true);
    }
    if (evt.keyCode === TOGGLE_MULTISELECTION_KEYCODE) {
      this.props.toggleMultiSelection(true);
    }
  }

  onKeyupCallback(evt) {
    if (evt.target.tagName.toUpperCase() === 'INPUT') { return; }
    if (evt.keyCode === PLAY_ON_HOVER_SHORTCUT_KEYCODE) {
      // Turn play sounds on hover off
      this.props.setShouldPlayOnHover(false);
    }
      if (evt.keyCode === TOGGLE_MULTISELECTION_KEYCODE) {
        this.props.toggleMultiSelection(false);
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
              sounds={space.sounds}
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
  return { paths, spaces, map };
};

MapContainer.propTypes = propTypes;

export default connect(mapStateToProps, {
  displaySystemMessage,
  updateMapPosition,
  deselectAllSounds,
  stopAllSoundsPlaying,
  setSoundCurrentlyLearnt,
  hideModal,
  setShouldPlayOnHover,
  toggleMultiSelection,
})(MapContainer);
