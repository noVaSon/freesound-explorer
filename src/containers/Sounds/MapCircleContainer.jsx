import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MapCircle from 'components/Sounds/MapCircle';
import { playAudio, stopAudio } from '../Audio/actions';
import { selectSound, deselectSound, deselectAllSounds,
  toggleHoveringSound } from './actions';
import { openModalForSound, hideModal } from '../SoundInfo/actions';
import { isSoundInsideScreen } from './utils';
import { makeIsSoundSelected } from './selectors';

const propTypes = {
  sound: PropTypes.object,
  isThumbnail: PropTypes.bool,
  shouldPlayOnHover: PropTypes.bool,
  isSelected: PropTypes.bool,
  shouldMultiSelect: PropTypes.bool,
  modalDisabled: PropTypes.bool,
  playAudio: PropTypes.func,
  stopAudio: PropTypes.func,
  selectSound: PropTypes.func,
  deselectSound: PropTypes.func,
  deselectAllSounds: PropTypes.func,
  toggleHoveringSound: PropTypes.func,
  openModalForSound: PropTypes.func,
  hideModal: PropTypes.func,
  soundInfoModal: PropTypes.object,
};

const isSoundVisible = (props) => {
  const position = (props.isThumbnail) ? props.sound.thumbnailPosition : props.sound.position;
  return isSoundInsideScreen(position, props.isThumbnail);
};

const isSoundStayingNotVisible = (currentProps, nextProps) =>
  (!isSoundVisible(currentProps) && !isSoundVisible(nextProps));

class MapCircleContainer extends Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.isThumbnail) {
      return this.shouldThumbnailUpdate(nextProps);
    }
    return (
      ((nextProps.sound !== this.props.sound) ||
      (nextProps.isSelected !== this.props.isSelected))
      && !isSoundStayingNotVisible(this.props, nextProps)
    );
  }

  onMouseEnter = () => {
    if (this.props.shouldPlayOnHover) {
      this.props.playAudio(this.props.sound);
    }
    this.props.toggleHoveringSound(this.props.sound.id);
  };

  onMouseLeave = () => {
    this.props.toggleHoveringSound(this.props.sound.id);
  };

  onClick = () => {
    // play and stop sound
    if (this.props.sound.isPlaying) {
      this.props.stopAudio(this.props.sound);
    } else if (!(this.props.isSelected || this.props.sound.isPlaying)) {
      this.props.playAudio(this.props.sound);
    }
    if (this.props.isSelected && !this.props.sound.isPlaying) {
      // toggle selecion
      this.props.deselectSound(this.props.sound.id);

      // hide modal only if it is the one of the last clicked sound
      if (this.props.soundInfoModal.isVisible
        && this.props.soundInfoModal.soundID === this.props.sound.id) {
        this.props.hideModal();
      }
    } else if (this.props.shouldMultiSelect) {
      this.props.selectSound(this.props.sound.id);
      this.props.openModalForSound(this.props.sound, this.props.modalDisabled);
    } else {
      // toggle selection
      this.props.deselectAllSounds();
      this.props.selectSound(this.props.sound.id);

      // open modal if sound is not yet selected
      this.props.openModalForSound(this.props.sound, this.props.modalDisabled);
    }
  };


  shouldThumbnailUpdate(nextProps) {
    const currentPosition = this.props.sound.thumbnailPosition;
    const nextPosition = nextProps.sound.thumbnailPosition;
    // update only when receiving final points positions
    return Boolean(!currentPosition && nextPosition);
  }

  render() {
    if (!isSoundVisible(this.props)) {
      return null;
    }
    return (
      <MapCircle
        sound={this.props.sound}
        isSelected={this.props.isSelected}
        isThumbnail={this.props.isThumbnail}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
      />
    );
  }
}

const makeMapStateToProps = (_, ownProps) => {
  const { soundID, isThumbnail } = ownProps;
  const isSoundSelected = makeIsSoundSelected(soundID);
  return (state) => {
    const sound = state.sounds.byID[soundID];
    const soundInfoModal = state.sounds.soundInfoModal;
    const { shouldPlayOnHover, shouldMultiSelect } = state.settings;
    const isSelected = isSoundSelected(state);
    const { modalDisabled } = state.sounds.soundInfoModal;
    return {
      sound,
      soundInfoModal,
      isThumbnail,
      shouldPlayOnHover,
      shouldMultiSelect,
      isSelected,
      modalDisabled,
    };
  };
};

MapCircleContainer.propTypes = propTypes;
export default connect(makeMapStateToProps, {
  playAudio,
  stopAudio,
  selectSound,
  deselectSound,
  deselectAllSounds,
  toggleHoveringSound,
  openModalForSound,
  hideModal,
})(MapCircleContainer);