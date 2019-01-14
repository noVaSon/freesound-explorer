import React from 'react';
import PropTypes from 'prop-types';
import { midiNoteNumberToMidiNoteLabel } from 'containers/Midi/utils';
import './SoundInfo.scss';
import Waveform from '../Waveform';

const propTypes = {
  notesMapped: PropTypes.object,
  position: PropTypes.object,
  sound: PropTypes.object,
  isMidiSupported: PropTypes.bool,
  isUserLoggedIn: PropTypes.bool,
  isVisible: PropTypes.bool,
  direction: PropTypes.string,
  selectedPath: PropTypes.string,
  soundCurrentlyLearnt: PropTypes.string,
  addSoundToPath: PropTypes.func,
  bookmarkSound: PropTypes.func,
  downloadSound: PropTypes.func,
  setSoundCurrentlyLearnt: PropTypes.func,
};

const DEFAULT_CLASSNAME = 'sound-info-modal';

class SoundInfo extends React.Component {

  getClassName() {
    if (!this.props.isVisible) {
      return DEFAULT_CLASSNAME;
    }
    let className = `${DEFAULT_CLASSNAME} active`;
    if (this.props.direction === 'down') {
      className += '-down';
    }
    return className;
  }

  getPosition() {
    const style = {
      top: this.props.position.top,
      left: this.props.position.left,
    };
    return style;
  }

  getCurrentlyAssignedMidiNoteLabel() {
    return Object.keys(this.props.notesMapped).reduce((curNoteLabel, curNote) => {
      if (this.props.notesMapped[curNote] === this.props.sound.id) {
        return midiNoteNumberToMidiNoteLabel(curNote);
      }
      return curNoteLabel;
    }, '');
  }

  getFreesoundButtons() {
    let bookmarkSoundIcon = null;
    let downloadSoundIcon = null;
    if (this.props.isUserLoggedIn) {
      bookmarkSoundIcon = (this.props.sound.isBookmarked) ? (
        <button>
          <i className="fa fa-star fa-lg" aria-hidden />
        </button>
      ) : (
        <button onClick={() => this.props.bookmarkSound(this.props.sound)}>
          <i className="fa fa-star-o fa-lg" aria-hidden />
        </button>
      );
      downloadSoundIcon = (
        <button>
          <a rel="noopener noreferrer" href={`${this.props.sound.url}download/`} >
            <i className="fa fa-download fa-lg" aria-hidden="true" />
          </a>
        </button>
      );
    }
    return { bookmarkSoundIcon, downloadSoundIcon };
  }

  getMidiLearnButton() {
    return (
      <button
        className={(this.props.soundCurrentlyLearnt === this.props.sound.id) ? 'learning' : ''}
        onClick={() => this.props.setSoundCurrentlyLearnt(this.props.sound.id)}
      >
        MIDI: {(this.props.soundCurrentlyLearnt === this.props.sound.id) ? 'learning' :
          this.getCurrentlyAssignedMidiNoteLabel()}
      </button>
    );
  }

  getAddToPathButton() {
    return (this.props.selectedPath) ? (
      <button
        onClick={() => this.props.addSoundToPath(
          this.props.sound.id, this.props.selectedPath)}
      >Add to path</button>
    ) : null;
  }

  getUserButtons() {
    const { bookmarkSoundIcon, downloadSoundIcon } = this.getFreesoundButtons();
    const midiLearnButton = (this.props.isMidiSupported) ? this.getMidiLearnButton() : null;
    const addToPathButton = this.getAddToPathButton();
    return (
      <div className="sound-info-buttons-container">
        {addToPathButton}
        {midiLearnButton}
        {bookmarkSoundIcon}
        {downloadSoundIcon}
      </div>
    );
  }

  render() {
    debugger
    const userButtons = this.getUserButtons();
    return (
      <div className={this.getClassName()} style={this.getPosition()}>
        <a href={this.props.sound.url} target="_blank" rel="noopener noreferrer">
          <div className="sound-info-modal-title">
            <div>{this.props.sound.name}</div>
            <div>by {this.props.sound.username} ({this.props.sound.licenseShort})</div>
          </div>
        </a>
        <div className="sound-info-modal-content">
          <Waveform sound={this.props.sound} />
          {userButtons}
        </div>
      </div>
    );
  }
}

SoundInfo.propTypes = propTypes;
export default SoundInfo;
